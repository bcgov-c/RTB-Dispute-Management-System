import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import NoteModel from '../../components/note/Note_model';
import NoteView from '../../components/note/Note';
import CommunicationNotesListView from './CommunicationNotesList';
import template from './CommunicationNoteSection_template.tpl';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const NOTE_TYPE_CODE_ALL = 1;

const notesChannel = Radio.channel('notes');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');

export default Marionette.View.extend({
  template,

  className: 'comm-note-section',

  regions: {
    noteTypeFilters: '.comm-note-type-filters',
    noteCreatorFilter: '.comm-note-creator-filter',
    notesList: '#comm-notes-list',
    noteAddRegion: '.comm-note-section-add',
  },

  ui: {
    'addNoteContainer': '.comm-note-section-add-container',
    'addNote': '#comm-add-note-btn',
    'notesFilter': '.notes-filter',
    collapse: '.dispute-section-title-add.collapse-icon',
  },

  events: {
    'click @ui.addNote': 'clickAddNote',
    'click @ui.collapse': 'clickCollapse',
  },

  clickAddNote() {
    if (this.noteAddModel) {
      return;
    }
    this.initializeNoteAddModel();
    this.renderNoteAddRegion();
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },

  initializeNoteAddModel() {
    this.noteAddModel = new NoteModel({
      mode: 'edit',
      note_linked_to: configChannel.request('get', 'NOTE_LINK_DISPUTE'),
      note: this.draftText
    });

    this.noteAddModel.set('deleteOnCancel', false);
    this.stopListening(this.noteAddModel, 'hide:edit');
    this.stopListening(this.noteAddModel, 'refresh:notes');
    this.stopListening(this.noteAddModel, 'change:value');
    this.listenTo(this.noteAddModel, 'hide:edit', () => {
      this.resetAddNoteModel();
      this.renderNoteAddRegion();
    });
    this.listenTo(this.noteAddModel, 'refresh:notes', () => {
      this.collection.add(this.noteAddModel, {merge: true});
      this.resetAddNoteModel();
      this.render();
    });
    this.listenTo(this.noteAddModel, 'note:updated', value => notesChannel.request('save:draft', this.dispute.id, value));
  },

  resetAddNoteModel() {
    this.noteAddModel = null;
    notesChannel.request('save:draft', this.dispute.id, null);
  },

  initialize() {
    this.dispute = this.model;
    this.draftText = notesChannel.request('get:draft', this.dispute.id);
    
    this.collapseHandler = SessionCollapse.createHandler(this.dispute, 'Communications', 'Notes');
    this.isCollapsed = this.collapseHandler?.get();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const cacheData = this.model.get('sessionSettings')?.communicationPage;
    this.noteTypeFiltersModel = new RadioModel({
      optionData: this._getTypeFilterOptions(),
      value: cacheData?.filter_noteType ? cacheData.filter_noteType : NOTE_TYPE_CODE_ALL
    });

    this.noteCreatorFilterModel = new DropdownModel({
      optionData: this._getCreatorFilterOptions(),
      labelText: ' ',
      value: cacheData?.filter_noteCreatedBy ? cacheData?.filter_noteCreatedBy : 'all',
      defaultBlank: false
    });

    this.noteAddModel = null;

    if (this.draftText) this.initializeNoteAddModel();
  },

  setupListeners() {
    this.listenTo(this.collection, 'refresh:notes', () => {
      if (!this.collection.any(note => note.get('model') === 'edit')) {
        this.model.stopEditInProgress();
      }
      this.renderNotesListRegion();
    });

    this.listenTo(this.noteTypeFiltersModel, 'change:value', () => {
      this.getUI('notesFilter').html(this.getPrintNoteFilterText());
      this.cacheCommunicationNoteData();
    });
    this.listenTo(this.noteCreatorFilterModel, 'change:value', () => {
      this.getUI('notesFilter').html(this.getPrintNoteFilterText());
      this.cacheCommunicationNoteData();
    });
  },

  cacheCommunicationNoteData() {
    this.model.set({
      sessionSettings: { 
        ...this.model.get('sessionSettings'), 
        communicationPage: {
          ...this.model.get('sessionSettings')?.communicationPage,
          filter_noteType: this.noteTypeFiltersModel.getData(),
          filter_noteCreatedBy: this.noteCreatorFilterModel.getData()
        }
      }
    });
  },

  getPrintNoteFilterText() {
    return `&nbsp;- ${this.noteTypeFiltersModel.getSelectedText() || ''} View - Created By: ${this.noteCreatorFilterModel.getSelectedText() || ''}`;
  },

  _getTypeFilterOptions() {
    const typeOptions = {
      'All (except evidence)': ['NOTE_LINK_DISPUTE', 'NOTE_LINK_DISPUTE_INFO', 'NOTE_LINK_PARTICIPANT',
          'NOTE_LINK_CLAIM', 'NOTE_LINK_NOTICE', 'NOTE_LINK_HEARING'],
      'General': 'NOTE_LINK_DISPUTE',
      'Dispute': 'NOTE_LINK_DISPUTE_INFO',
      'Participant': 'NOTE_LINK_PARTICIPANT',
      'Issue': 'NOTE_LINK_CLAIM',
      'Notice': 'NOTE_LINK_NOTICE',
      'Hearing': 'NOTE_LINK_HEARING',
      'Evidence': ['NOTE_LINK_EVIDENCE', 'NOTE_LINK_EVIDENCE_FILE'],
    };
    return Object.entries(typeOptions).map(([text, configVals], index) => (
      {
        text,
        value: index === 0 ? NOTE_TYPE_CODE_ALL : text,
        typeFilters: (Array.isArray(configVals) ? configVals : [configVals]).map(val => configChannel.request('get', val))
      }
    ));
  },

  _getCreatorFilterOptions() {
    const options = {
      'Information Officer': 'USER_ROLE_GROUP_IO',
      'Arbitrator': 'USER_ROLE_GROUP_ARB'
    };
    return _.union([{ value: 'all', text: 'All Roles' }], _.map(options, function(config_val, text) {
      return { text, value: String(configChannel.request('get', config_val) || '') };
    }));
  },

  onRender() {
    if (this.isCollapsed) return;
    this.showChildView('noteTypeFilters', new RadioView({ model: this.noteTypeFiltersModel }));
    this.showChildView('noteCreatorFilter', new DropdownView({ model: this.noteCreatorFilterModel, displayTitle: 'Created By:' }));

    this.renderNotesListRegion();
    this.renderNoteAddRegion({no_animate: true});
  },

  renderNotesListRegion() {
    this.showChildView('notesList', new CommunicationNotesListView({
      typeFilter: this.noteTypeFiltersModel,
      creatorFilter: this.noteCreatorFilterModel,
      collection: this.collection
    }));
  },

  renderNoteAddRegion(options) {
    options = options || {};
    if (this.noteAddModel) {
      this.showChildView('noteAddRegion', new NoteView({
        model: this.noteAddModel,
        displayRows: 3,
      }));

      if (!options.no_animate) {
        const container_ele = this.getUI('addNoteContainer');
        animationChannel.request('queue', container_ele, 'slideDown', options);
        animationChannel.request('queue', container_ele, 'scrollPageTo', options);
      }
    } else {
      this.detachChildView('noteAddRegion');
    }
  },

  templateContext() {
    return {
      length: this.collection.length,
      selectedNoteFilter: this.getPrintNoteFilterText(),
      enableCollapse: !!this.collapseHandler,
      isCollapsed: this.isCollapsed,
    };
  }
});
