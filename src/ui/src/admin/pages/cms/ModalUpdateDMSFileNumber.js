import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import template from './ModalUpdateDMSFileNumber_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');
const cmsChannel = Radio.channel('cms');
const searchChannel = Radio.channel('searches');

export default Marionette.View.extend({
  template,

  regions : {
    fileNumberRegion: '.cms-archive-new-dms-file-number'
  },

  ui: {
    'updateLink': '.btn-add',
    'cancel': '.btn-cancel',
    'close': '.close-x'
  },

  events: {
    'click @ui.cancel': 'close',
    'click @ui.close': 'close',
    'click @ui.updateLink': 'updateFileNumber'
  },

  updateFileNumber() {
    if (!this.getChildView('fileNumberRegion').validateAndShowErrors()) {
      return;
    }

    loaderChannel.trigger('page:load');

    const file_number = this.fileNumberModel.getData();
    const patch_data = { dms_file_number: file_number ? Number(file_number) : null };

    if (!file_number) {
      _.extend(patch_data, { dms_file_guid: null });
      this.saveFileNumber(patch_data);
      return;
    }

    // Else, perform a search for the file number first
    searchChannel.request('search:dispute:direct', file_number)
      .done(disputeGuid => {
        // If we could not find dispute for provided file number, don't set the dms_file_guid
        if (disputeGuid) {
          _.extend(patch_data, { dms_file_guid: disputeGuid });
        }
        this.saveFileNumber(patch_data);
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE');
        handler(err);
      });
  },

  saveFileNumber(patch_data) {
    cmsChannel.request('add:dms:filenumber', this.model.get('file_number'), patch_data)
      .done(response => {
        loaderChannel.trigger('page:load:complete');
        this.model.set(response);
        this.model.trigger('update');
        this.close();
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.CMS.SAVE', () => {
          this.model.trigger('update');
          this.close();
        });
        handler(err);
      });
  },

  close() {
    Radio.channel('modals').request('remove', this);
  },

  initialize () {
    this.createEditModels();
  },

  createEditModels() {
    this.fileNumberModel = new InputModel({
      labelText: "File Number (DMS or CMS)",
      required: false,
      inputType: 'string',
      minLength: 6,
      maxLength: 9
    });
  },

  onRender() {
    this.showChildView('fileNumberRegion', new InputView({ model: this.fileNumberModel }));
  },

  attachElContent(html) {
    this.setElement(html);
    return this;
  }
});
