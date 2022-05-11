import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Input_model from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import Dropdown from '../../../../core/components/dropdown/Dropdown';
import Dropdown_model from '../../../../core/components/dropdown/Dropdown_model';

import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const INVALID_FILENUMBER_ERROR_MSG = `File number is not valid`;

const configChannel = Radio.channel('config');

const CeuDmsFileView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['collection']);
    this.template = this.template.bind(this);
    this.CMS_DMS_FILE_STATUS_CLOSED = String(configChannel.request('get', 'CMS_DMS_FILE_STATUS_CLOSED') || '');
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const CEU_DMS_FILE_STATUS_DISPLAYS = configChannel.request('get', 'CEU_DMS_FILE_STATUS_DISPLAYS') || {};
    this.fileNumberModel = new Input_model({
      inputType: 'dispute_number',
      labelText: '8 or 9 digit number',
      maxLength: 9,
      required: true,
      value: this.model.get('c_dms_file_number'),
      apiMapping: 'c_dms_file_number',
    });

    this.statusModel = new Dropdown_model({
      optionData: Object.keys(CEU_DMS_FILE_STATUS_DISPLAYS).map(value => ({ value: String(value), text: CEU_DMS_FILE_STATUS_DISPLAYS[value] })),
      defaultBlank: true,
      labelText: 'Dispute Status',
      required: true,
      value: this.model.get('c_dms_file_status') ? String(this.model.get('c_dms_file_status')) : null,
      apiMapping: 'c_dms_file_status',
    });

    const isDateRequired = this.isClosedStatusSelected();
    this.dateModel = new Input_model({
      inputType: 'date',
      labelText: 'Date Completed',
      cssClass: isDateRequired ? null : 'optional-input',
      required: isDateRequired,
      value: this.model.get('c_dms_file_closed_date'),
      apiMapping: 'c_dms_file_closed_date',
    });

    this.allModels = [
      this.fileNumberModel,
      this.statusModel,
      this.dateModel
    ];
  },

  isClosedStatusSelected() {
    const status = this.statusModel.getData();
    return status && String(status) === this.CMS_DMS_FILE_STATUS_CLOSED;
  },

  setupListeners() {
    this.allModels.forEach(model => {
      this.stopListening(model, 'change:value');
      this.listenTo(model, 'change:value', () => {
        this.saveInternalDataToModel();
        if (model === this.statusModel) this.render();
      });
    });

    this.listenTo(this.model, 'error:filenumber', () => {
      const view = this.getChildView('fileNumberRegion');
      if (view) view.showErrorMessage(INVALID_FILENUMBER_ERROR_MSG);
    });
  },

  saveInternalDataToModel() {
    this.allModels.forEach(uiModel => {
      this.model.set(uiModel.getPageApiDataAttrs());
    });
  },
  
  validateAndShowErrors() {
    let isValid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      if (!childView) {
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        return;
      }
      isValid = childView.validateAndShowErrors() & isValid;
    }, this);

    return isValid;
  },

  removeFile() {
    this.model.collection.remove(this.model);
  },

  className: 'ceu-contravention__dms-file',

  regions: {
    fileNumberRegion: '.ceu-contravention__dms-file__filenumber',
    statusRegion: '.ceu-contravention__dms-file__status',
    dateRegion: '.ceu-contravention__dms-file__date',
  },

  onBeforeRender() {
    const isDateRequired = this.isClosedStatusSelected();
    this.dateModel.set({
      required: isDateRequired,
      cssClass: isDateRequired ? null : 'optional-input',
    });
  },

  onRender() {
    this.showChildView('fileNumberRegion', new InputView({ model: this.fileNumberModel }));
    this.showChildView('statusRegion', new Dropdown({ model: this.statusModel }));
    this.showChildView('dateRegion', new InputView({ model: this.dateModel }));
  },

  template() {
    return <>
      <div className="ceu-contravention__dms-file__filenumber"></div>
      <div className="ceu-contravention__dms-file__status"></div>
      <div className="ceu-contravention__dms-file__date"></div>
      {this.model.collection.length > 1 ? <div className="ceu-contravention__dms-file__delete" onClick={() => this.removeFile()}></div> : null}
    </>
  },
});

const CeuDmsFilesCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CeuDmsFileView,
  validateAndShowErrors() {
    let isValid = true;
    this.children.forEach(child => { isValid = child.validateAndShowErrors() && isValid });
    return isValid;
  },
  saveInternalDataToModel() {
    this.children.forEach(child => child.saveInternalDataToModel());
  },
});

const CeuDmsFilesView = Marionette.View.extend({
  initialize(options) {
    this.mergeOptions(options, ['collection', 'ceuModel']);
    this.template = this.template.bind(this);
    this.setupListeners();
  },
  
  setupListeners() {
    this.listenTo(this.collection, 'update', () => {
      const listView = this.getChildView('listRegion');
      if (listView && listView.saveInternalDataToModel) listView.saveInternalDataToModel();
      this.render();
    });
  },

  validateAndShowErrors() {
    const listView = this.getChildView('listRegion');
    return listView && listView.isRendered() && typeof listView.saveInternalDataToModel === 'function' ?
      listView.validateAndShowErrors() : false;
  },
  
  saveInternalDataToModel() {
    const listView = this.getChildView('listRegion');
    if (listView && listView.isRendered() && typeof listView.saveInternalDataToModel === 'function') {
      listView.saveInternalDataToModel();
    }
  },
  
  addFile() {
    this.ceuModel.addBlankDmsFile();
  },

  regions: {
    listRegion: '.ceu-contravention__dms-files-list'
  },

  onRender() {
    this.showChildView('listRegion', new CeuDmsFilesCollectionView({ collection: this.collection }));
  },

  template() {
    return <>
      <div className="ceu-contravention__dms-files-info">Please list the file number(s) for any Residential Tenancy Branch applications related to this contravention or issue</div>
      <div className="ceu-contravention__dms-files-list"></div>
      <div className="ceu-contravention__dms-files-add general-link" onClick={() => this.addFile()}>Add another dispute file</div>
    </>
  }

});

_.extend(CeuDmsFileView.prototype, ViewJSXMixin);
_.extend(CeuDmsFilesCollectionView.prototype, ViewJSXMixin);
_.extend(CeuDmsFilesView.prototype, ViewJSXMixin);

export default CeuDmsFilesView;
