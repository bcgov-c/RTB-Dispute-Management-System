import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import ModalDeleteNote from '../modals/modal-delete-note/ModalDeleteNote';
import template from './Note_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const DEFAULT_NOTE_ROWS = 4;

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'note-item',

  regions: {
    textareaRegion: '.note-input-container'
  },

  ui: {
    save: '.note-save-button',
    cancel: '.note-cancel-button',
    clickContext: '.note-click-context',

    edit: '.note-edit-delete-controls .general-link',
    delete: '.note-delete-icon'
  },

  events: {
    'click @ui.save': 'clickSave',
    'click @ui.cancel': 'clickCancel',
    'click @ui.clickContext': 'clickContextFn',

    'click @ui.edit': 'clickEdit',
    'click @ui.delete': 'clickDelete'
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    

    // Save internal data back into the model
    this.model.set(this.textareaModel.getPageApiDataAttrs());

    this.model.set('mode', 'view');
    loaderChannel.trigger('page:load');
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.model.trigger('refresh:notes');
        loaderChannel.trigger('page:load:complete');
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.NOTE.SAVE', () => {
          this.model.trigger('refresh:notes');
        });
        handler(err);
      });
  },

  clickCancel() {
    this.model.trigger('hide:edit');
    if (this.model.get('deleteOnCancel')) {
      this.removeFromCollection();
      this.model.destroy();
    }
  },

  clickEdit() {
    this.model.set('mode', 'edit');
    this.model.trigger('show:edit', this.model);
    this.render();
  },

  clickDelete() {
    const modalDeleteNote = new ModalDeleteNote({ model: this.model });
    modalChannel.request('add', modalDeleteNote);
  },

  clickContextFn(ev) {
    ev.preventDefault();
    if (this.clickedContextFn) {
      return;
    }
    this.clickedContextFn = true;
    // Always turnn off the context after a reasonable short time
    setTimeout(() => this.clickedContextFn = false, 50);
    
    if (_.isFunction(this.contextClickFn)) {
      this.contextClickFn(this);
    }
  },

  removeFromCollection() {
    if (this.model.collection) {
      this.model.collection.remove(this.model);
    }
  },

  initialize(options) {
    this.mergeOptions(options, ['autofocus', 'displayRows', 'hideSaveControls', 'enableEditDeleteControls', 'contextClickText', 'contextClickFn']);

    // Enable autofocus by default
    if (!_.isBoolean(this.autofocus)) this.autofocus = true;

    // Will be used along with blur to allow newlines in the textarea then the context click
    this.clickedContextFn = false;

    this.textareaModel = new TextareaModel({
      labelText: null,
      required: true,
      errorMessage: 'Enter note content',
      countdown: true,
      showInputEntry: true,
      disabled: this.model.get('editDisabled'),
      max: configChannel.request('get', 'ADMIN_NOTE_MAX_LENGTH'),
      min: configChannel.request('get', 'ADMIN_NOTE_MIN_LENGTH'),
      value: this.model.get('note'),
      apiMapping: 'note',
      displayRows: this.displayRows || DEFAULT_NOTE_ROWS
    });

    this.listenTo(this.model, 'focus', () => this.focusNote());
    this.listenTo(this.textareaModel, 'change:value', (m, value) => this.model.trigger('note:updated', value));
  },

  insertNoteAt(newContent, insertAt) {
    newContent = newContent || '';
    insertAt = insertAt || 0;
    
    const currentContent = this.textareaModel.get('value') || '';
    const noteContentArray = Array.from(currentContent);
    this.textareaModel.set('value', [
        ...noteContentArray.slice(0, insertAt),
        newContent,
        ...noteContentArray.slice(insertAt)
      ].join('')
    );
    
    this.render();
  },

  getCursorSelection() {
    const textareaView = this.getChildView('textareaRegion');
    return textareaView && textareaView.getUI('input') && textareaView.getUI('input').prop('selectionEnd') || 0;
  },

  focusNote() {
    const textareaView = this.getChildView('textareaRegion');
    if (textareaView && textareaView.isRendered() && this.model.get('mode') === 'edit') {
      setTimeout(() => textareaView.focus(), 0);
    }
  },

  onRender() {
    if (this.model.get('mode') === 'edit') {
      this.showChildView('textareaRegion', new TextareaView({
        model: this.textareaModel,
        disableOnBlurAction: true,
      }));

      if (this.autofocus) this.focusNote();
    }
  },

  validateAndShowErrors() {
    const textareaView = this.getChildView('textareaRegion');
    return textareaView && textareaView.$el.is(':visible') ? textareaView.validateAndShowErrors() : true;
  },

  templateContext() {
    const note_creator_role_display = userChannel.request('get:role:display', this.model.get('creator_group_role_id'));
    return {
      Formatter,
      hideSaveControls: this.hideSaveControls,
      enableEditDeleteControls: this.enableEditDeleteControls,
      noteCreatorRoleDisplay: note_creator_role_display ? note_creator_role_display : 'N/A',
      contextClickText: this.contextClickText,
      contextClickFn: this.contextClickFn
    };
  }
});
