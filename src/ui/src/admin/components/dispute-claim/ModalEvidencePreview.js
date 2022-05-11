import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import DisputeClaimEvidenceView from './DisputeClaimEvidence';
import NotesView from '../note/Notes';
import FileCollection from '../../../core/components/files/File_collection';
import NoteCollection from '../note/Note_collection';
import RadioIconView from '../../../core/components/radio/RadioIcon';
import RadioModel from '../../../core/components/radio/Radio_model';
import EvidencePreviewList from '../dispute-claim/EvidencePreviewList';
import template from './ModalEvidencePreview_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

import { FilePreviewContent } from '../../../core/components/file-viewer/FilePreviewContent';

const SHOW_LIST_CLASS = 'evidencePreview-show-list';
const EVIDENCE_CODE_LIST = 1;
const EVIDENCE_CODE_NOTES = 2;

const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const claimsChannel = Radio.channel('claims');
const Formatter = Radio.channel('formatter').request('get');
const modalChannel = Radio.channel('modals');

export default ModalBaseView.extend({
  template,
  id: 'evidencePreview-modal',

  className: `${ModalBaseView.prototype.className} modal-fullsize`,

  regions: {
    contentRegion: '.evidencePreview-content-region',
    listNotesToggleRegion: '.evidencePreview-note-list-toggle',
    evidenceRegion: '.evidencePreview-claim-evidence',
    listRegion: '.evidencePreview-list-container',
    evidenceNotesRegion: '.evidencePreview-evidence-notes .evidencePreview-notes',
    decisionNotesRegion: '.evidencePreview-decision-notes .evidencePreview-notes',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      contentContainer: '.evidencePreview-content-container',
      evidenceContainer: '.evidencePreview-claim-evidence-container',
      infoContainer: '.evidencePreview-info-column',
      notes: '.evidencePreview-notes-column',
      list: '.evidencePreview-list-column',

      prev: '.evidencePreview-prev',
      next: '.evidencePreview-next',

      addEvidenceNote: '.evidencePreview-notes-add',
      evidenceNotePrev: '.evidencePreview-evidence-notes .evidencePreview-notes-nav-prev',
      evidenceNoteNext: '.evidencePreview-evidence-notes .evidencePreview-notes-nav-next',

      decisionNotePrev: '.evidencePreview-decision-notes .evidencePreview-notes-nav-prev',
      decisionNoteNext: '.evidencePreview-decision-notes .evidencePreview-notes-nav-next'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {

      'click @ui.addEvidenceNote': 'clickAddEvidenceNote',  

      'click @ui.prev': function(ev) {
        ev.preventDefault();
        this.clickNavButtonPrev(this.navFileModels);
      },

      'click @ui.next': function(ev) {
        ev.preventDefault();
        this.clickNavButtonNext(this.navFileModels);
      },

      'click @ui.evidenceNotePrev': function(ev) {
        ev.preventDefault();
        const fileId = this.fileModel.id;
        const navFileModelsWithNotes = this.navFileModels.filter(fileModel => fileModel.id === fileId || fileModel.getEvidenceNotes().any(note => !note.isNew()));
        this.clickNavButtonPrev(navFileModelsWithNotes);
      },

      'click @ui.evidenceNoteNext': function(ev) {
        ev.preventDefault();
        const fileId = this.fileModel.id;
        const navFileModelsWithNotes = this.navFileModels.filter(fileModel => fileModel.id === fileId || fileModel.getEvidenceNotes().any(note => !note.isNew()));
        this.clickNavButtonNext(navFileModelsWithNotes);
      },

      'click @ui.decisionNotePrev': function(ev) {
        ev.preventDefault();
        //isReferenced
        //this.navFileModels.filter(fileModel => fileModel.getDecisionNotes().any(note => !note.isNew()));
        const navFileModelsWithDecision = this.navFileModels.filter(fileModel => fileModel.isReferenced());
        this.clickNavButtonPrev(navFileModelsWithDecision);
      },

      'click @ui.decisionNoteNext': function(ev) {
        ev.preventDefault();
        //isReferenced
        //this.navFileModels.filter(fileModel => fileModel.getDecisionNotes().any(note => !note.isNew()));
        const navFileModelsWithDecision = this.navFileModels.filter(fileModel => fileModel.isReferenced());
        this.clickNavButtonNext(navFileModelsWithDecision);
      }
    });
  },

  clickAddEvidenceNote(ev) {
    ev.preventDefault();

    this.evidenceNotes.each(note => {
      if (!note.isNew()) {
        note.set('mode', 'view');
      }
    });

    if (!this.evidenceNotes.find(note => note.isNew())) {
      this.evidenceNotes.add({
        mode: 'edit',
        note_linked_to: 8,
        note_link_id: this.fileModel.id
      }, {at: 0});
    }
  },

  clickNavButton(navFileModelsToUse, getNextModelIndexFn) {
    const index = navFileModelsToUse.indexOf(this.fileModel);
    if (index === -1 || !_.isArray(navFileModelsToUse) || navFileModelsToUse.length < 2 || !_.isFunction(getNextModelIndexFn)) {
      return;
    }

    const nextModelIndex = getNextModelIndexFn(index);
    const nextModel = !_.isNaN(parseInt(nextModelIndex)) && nextModelIndex < navFileModelsToUse.length ? navFileModelsToUse[nextModelIndex] : null;
    if (!nextModel) {
      return;
    }
    this.reinitializeModal(this.fileIdToEvidenceLookup[nextModel.id], nextModel);
  },

  clickNavButtonPrev(navFileModelsToUse) {
    navFileModelsToUse = navFileModelsToUse || [];
    return this.clickNavButton(navFileModelsToUse, (index) => index === 0  ? (navFileModelsToUse.length - 1) : ((index - 1) % navFileModelsToUse.length));
  },

  clickNavButtonNext(navFileModelsToUse) {
    navFileModelsToUse = navFileModelsToUse || [];
    return this.clickNavButton(navFileModelsToUse, (index) => (index + 1) % navFileModelsToUse.length);
  },

  /**
   * @param {FileModel} fileModel
   * @param {Object} navListData
   * @param {DisputeClaimCollection} claimCollection
   * @param {Object} fileDupTranslations
   * @param {Boolean} hideDups
   * @param {Boolean} openToNotes
   */
  initialize(options) {
    this.mergeOptions(options, ['fileModel', 'navListData', 'claimCollection', 'fileDupTranslations', 'hideDups', 'openToNotes']);
    this.loaded = false;
    // Allow a claim collection to be passed in, otherwise use the default claims on the dispute
    if (!this.claimCollection) {
      this.claimCollection = claimsChannel.request('get');
    }

    this.once('shown:modal', this.setDynamicContentHeightInRender, this);

    const currentUser = sessionChannel.request('get:user');
    this.hasArbPermissions = currentUser && currentUser.isArbitrator();

    // Initialize the list notes toggle model once
    this.listNotesToggleModel = new RadioModel({
      optionData: [
        { iconClass: 'evidencePreview-list', value: EVIDENCE_CODE_LIST },
        { iconClass: 'evidencePreview-note', value: EVIDENCE_CODE_NOTES }
      ],
      value: this.openToNotes ? EVIDENCE_CODE_NOTES : EVIDENCE_CODE_LIST
    });
    
    this.createSubModels();
    this.setupListeners();
  },
  
  createSubModels() {
    this.parseNavListData();
    
    this.showNotes = this.listNotesToggleModel.getData({ parse: true }) === EVIDENCE_CODE_NOTES;
    this.showDecisionNotes = this.fileModel.isReferenced();
    this.evidenceNotes = this.fileModel.getEvidenceNotes({ force_refresh: true }) || new NoteCollection();
    this.decisionNotes = this.fileModel.getDecisionNotes({ force_refresh: true }) || new NoteCollection();

    if (!this.decisionNotes.length) {
      this.decisionNotes.add({
        mode: 'edit',
        note_linked_to: 9,
        note_link_id: this.fileModel.id,
        deleteOnCancel: false,

      }, {at: 0});
    } else {
      const existingDecisionNote = this.decisionNotes.at(0);
      existingDecisionNote.set({
        mode: existingDecisionNote.isNew() ? 'edit' : 'view',
        deleteOnCancel: false 
      });
    }

    this.totalEvidenceNoteCount = 0;
    this.evidenceNotesBeforeMe = 0;

    this.totalDecisionNoteCount = 0;
    this.decisionNotesBeforeMe = 0;
    
    let traversePassed = false;
    _.each(this.navFileModels, fileModel => {
      if (fileModel.id === this.fileModel.id) {
        traversePassed = true;
      }

      // Force a refresh of the decision notes, even though we won't use them here
      fileModel.getDecisionNotes({ force_refresh: true });

      if (fileModel.isReferenced()) {
        this.totalDecisionNoteCount++;
        if (!traversePassed) {
          this.decisionNotesBeforeMe++;
        }
      }

      if (fileModel.getEvidenceNotes({ force_refresh: true }).length) {
        this.totalEvidenceNoteCount++;
        if (!traversePassed) {
          this.evidenceNotesBeforeMe++;
        }
      }
    });


    this.evidenceNotes.each(note => note.set('deleteOnCancel', false));
    this.decisionNotes.each(note => note.set({ deleteOnCancel: false, editDisabled: !this.hasArbPermissions }));
  },

  parseNavListData() {
    this.navEvidenceModels = [];
    this.navFileModels = [];
    this.fileIdToEvidenceLookup = {};

    _.each(this.navListData, listDataItem => {
      _.each(listDataItem.data, evidenceData => {
        if (evidenceData.evidenceModel) {
          this.navEvidenceModels.push(evidenceData.evidenceModel);
        }
        _.each(evidenceData.files, fileModel => {
          this.navFileModels.push(fileModel);

          this.fileIdToEvidenceLookup[fileModel.id] = evidenceData.evidenceModel;
        });
      });
    });
  },

  setupListeners() {
    // If FileContent is opened in a modal, have to make sure to init draggable functionality after modal opens
    this.stopListening(this, 'shown:modal');
    this.listenTo(this, 'shown:modal', () => {
      if (this.contentView && this.contentView.isRendered()) this.contentView.initDraggableImage();
    });

    this.listenTo(this.listNotesToggleModel, 'change:value', function(model, value) {
      const notesEle = this.getUI('notes');
      const listEle = this.getUI('list');
      if (value === EVIDENCE_CODE_NOTES) {
        this.showNotes = true;
        listEle.hide();
        notesEle.show();
        this.getUI('infoContainer').removeClass(SHOW_LIST_CLASS);
      } else {
        this.showNotes = false;
        notesEle.hide();
        listEle.show();
        this.getUI('infoContainer').addClass(SHOW_LIST_CLASS);
      }
    }, this);

    this.listenTo(this.evidenceNotes, 'refresh:notes destroy', () => this.reinitializeModal(this.model, this.fileModel));

    this.listenTo(this.evidenceNotes, 'show:edit', (model) => {
      this.evidenceNotes.remove( this.evidenceNotes.filter(note => note.isNew()) );
      this.evidenceNotes.each(noteModel => {
        noteModel.set('mode', noteModel.id === model.id ? 'edit' : 'view');
      });
      this.render();
    });

    this.listenTo(this.evidenceNotes, 'hide:edit', () => {
      this.evidenceNotes.each(noteModel => {
        noteModel.set('mode', 'view');
      });
      this.render();
    });

    this.listenTo(this.decisionNotes, 'hide:edit', () => {
      this.decisionNotes.each(noteModel => {
        if (!noteModel.isNew()) noteModel.set('mode', 'view');
      });
      this.render();
    });

    this.listenTo(this.decisionNotes, 'refresh:notes', () => {
      this.decisionNotes.each(noteModel => {
        noteModel.set('mode', 'view');
      });
      this.render();
    });
  },

  reinitializeModal(evidenceModel, fileModel) {
    this.listVerticalScrollPosition = !this.showNotes ? this.getUI('infoContainer').scrollTop() : 0;
    this.model = evidenceModel;
    this.fileModel = fileModel;

    this.createSubModels();
    this.setupListeners();
    this.render();

  },

  onRender() {
    try{
    const clonedModel = this.model.clone();
    clonedModel.set('files', new FileCollection([this.fileModel]));
    
    this.showChildView('evidenceRegion', new DisputeClaimEvidenceView({
      model: clonedModel,
      showArrows: true,
      showDetailedNames: true,
      showSubmitterInfo: true,
      showArbControls: true,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
      clickReferencedFn: (fileModel, fileReferenced) => {
        const existingDecisionNote = this.decisionNotes.at(0)
        const saveFileFn = () => {
          loaderChannel.trigger('page:load');
          fileModel.save({ file_referenced: fileReferenced })
            .always(() => {
              this.createSubModels();
              this.setupListeners();
              this.render();
              loaderChannel.trigger('page:load:complete');
            });
        };

        if (this.listNotesToggleModel.getData() !== EVIDENCE_CODE_NOTES ) {
          this.listNotesToggleModel.set({ value: EVIDENCE_CODE_NOTES });
          this.listNotesToggleModel.trigger('render');
        }

        if (!fileReferenced && existingDecisionNote && !existingDecisionNote.isNew()) {
          modalChannel.request('show:standard', {
            title: 'Delete Associated Decision Note(s)?',
            bodyHtml: `<p>This reference has at least one associated note. By clearing the reference, the note will be deleted. Do you wish to continue?</p>`,
            primaryButtonText: 'Continue',
            onContinueFn(modalView) {
              modalView.close();
              existingDecisionNote.destroy()
                .then(saveFileFn, generalErrorFactory.createHandler('ADMIN.NOTE.REMOVE', () => loaderChannel.trigger('page:load:complete')))
            }
          });
        } else {
          saveFileFn();
        }
      }
    }));

    let actionFn;
    let actionText;

    if (this.fileModel.isViewableVideo()) {
      actionFn = (noteView) => {
        if (!noteView) {
          return;
        }
        const videoEle = this.getUI('video');
        const videoTime = videoEle && videoEle.prop('currentTime') || 0;
        const videoMessage = `video time: ${Formatter.toLeftPad(parseInt(videoTime / 60))}:${Formatter.toLeftPad(parseInt(videoTime % 60))}`;
        noteView.insertNoteAt(videoMessage, noteView.getCursorSelection());
      };
      actionText = '<span class="evidencePreview-note-context-time"></span>Insert Video Time';
    } else if (this.fileModel.isAudio()) {
      actionFn = (noteView) => {
        if (!noteView) {
          return;
        }
        const audioEle = this.getUI('audio');
        const audioTime = audioEle && audioEle.prop('currentTime') || 0;
        const audioMessage = `audio time: ${Formatter.toLeftPad(parseInt(audioTime / 60))}:${Formatter.toLeftPad(parseInt(audioTime % 60))}`;
        noteView.insertNoteAt(audioMessage, noteView.getCursorSelection());
      };
      actionText = '<span class="evidencePreview-note-context-time"></span>Insert Audio Time';
    }

    const notesChildViewOptions = Object.assign(
      { displayRows: 6 },
      actionFn ? { contextClickFn: actionFn } : {},
      actionText ? { contextClickText: actionText } : {},
    );

    this.showChildView('evidenceNotesRegion', new NotesView({
      collection: this.evidenceNotes,
      childViewOptions: Object.assign({}, notesChildViewOptions, { enableEditDeleteControls: true })
    }));

    this.showChildView('decisionNotesRegion', new NotesView({
      collection: this.decisionNotes,
      childViewOptions: Object.assign({}, notesChildViewOptions, { hideSaveControls: !this.hasArbPermissions, enableEditDeleteControls: true },
        // Hide any context action when the input is disabled
        !this.hasArbPermissions ? { contextClickFn: null, contextClickText: null } : {})
    }));

    this.showChildView('listNotesToggleRegion', new RadioIconView({
      deselectEnabled: false,
      model: this.listNotesToggleModel
    }));

    const region = this.showChildView('listRegion', new EvidencePreviewList({
      highlightedFileId: this.fileModel.id,
      listData: this.navListData,
      evidenceModels: this.navEvidenceModels,
      fileModels: this.navFileModels
    }));

    this.stopListening(region.currentView, 'update:preview');
    this.listenTo(region.currentView, 'update:preview', this.reinitializeModal, this);

    if (!this.contentView || !this.contentView.isRendered()) {
      this.contentView = new FilePreviewContent({ fileModel: this.fileModel, evidenceViewerMode: true }).render();
    } else {
      const oldFileModel = this.contentView.getFileModel();
      if (this.fileModel && oldFileModel && this.fileModel.id !== oldFileModel.id) {
        this.contentView.setFileModel(this.fileModel);
        this.contentView.render();
      }
    }

    this.showChildView('contentRegion', this.contentView);

    } catch (err) {
      console.log(err);
    }

    this.setDynamicContentHeightInRender();

    if (!this.showNotes && this.listVerticalScrollPosition) {
      this.getUI('infoContainer').scrollTop(this.listVerticalScrollPosition);
    }
  },

  setDynamicContentHeightInRender() {
    // Apply dynamic height sizing
    const heightGuttersPx = 70;
    const calcOffset = this.getUI('evidenceContainer').height() + heightGuttersPx;
    this.getUI('contentContainer').css('height', `calc(100% - ${calcOffset}px)`);
  },
  
  templateContext() {
    const matchingClaim = this.claimCollection.findWhere({ claim_id: this.model.get('claim_id') });

    return {
      Formatter,
      SHOW_LIST_CLASS,
      RELATIVE_PDF_VIEWER_PATH: '../Common/pdfjs/web/viewer.html',
      isRemoved: (matchingClaim && matchingClaim.isAmendRemoved()) || this.model.isParticipantRemoved(),
      claimTitle: matchingClaim ? matchingClaim.getClaimTitleWithCode() : 'Other supporting information',
      showNotes: this.showNotes,
      showDecisionNotes: this.showDecisionNotes,
      
      selfEvidencePlacement: (this.navFileModels.indexOf(this.fileModel) + 1) || '-',
      totalEvidenceCount: (this.navFileModels || []).length,
      
      evidenceNoteCount: this.evidenceNotes.filter(note => !note.isNew()).length,
      evidenceNotesBeforeMe: this.evidenceNotesBeforeMe,
      totalEvidenceNoteCount: this.totalEvidenceNoteCount,

      decisionNotesBeforeMe: this.decisionNotesBeforeMe,
      totalDecisionNoteCount: this.totalDecisionNoteCount,
    };
  }

});