import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import template from './ModalAddCMSNote_template.tpl';

import TextAreaView from '../../../core/components/textarea/Textarea';
import TextAreaModel from '../../../core/components/textarea/Textarea_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const cmsChannel = Radio.channel('cms'),
  sessionChannel = Radio.channel('session');

export default Marionette.View.extend({
  template,

  regions : {
    noteRegion: '.cms-archive-new-note-description'
  },

  ui: {
    'continue': '.btn-add',
    'cancel': '.btn-cancel',
    'close': '.close-x'
  },

  events: {
    'click @ui.cancel': 'close',
    'click @ui.close': 'close',
    'click @ui.continue': 'addNote'
  },

  triggers: {

  },

  addNote() {
    if (!this.getChildView('noteRegion').validateAndShowErrors()) {
      return;
    }

    const self = this;
    cmsChannel.request('create:note', this.model.get('file_number'), this.noteModel.getData(), sessionChannel.request('name'))
      .done(function(response) {
        self.model.get('cms_archive_notes').push(response);
        self.model.trigger('update');
        self.close();
      }).fail(
        generalErrorFactory.createHandler('ADMIN.CMS.NOTE', () => {
          self.model.trigger('update');
          self.close();
        })
      );
  },

  close() {
    Radio.channel('modals').request('remove', this);
  },

  initialize () {
    this.createEditModels();
  },

  createEditModels() {
    this.noteModel = new TextAreaModel({
      labelText: 'Note',
      errorMessage: 'Please enter a description for your note',
      required: true,
      min: 10,
      countdown: true
    });
  },

  onRender() {
    this.showChildView('noteRegion', new TextAreaView({ model: this.noteModel }))
  },

  attachElContent(html) {
    this.setElement(html);
    return this;
  }
});
