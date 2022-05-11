import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Input_model from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import Dropdown_model from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';

import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const configChannel = Radio.channel('config');

const CeuWitnessView = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.APPLICANT_FIELD_MAX = configChannel.request('get', 'APPLICANT_FIELD_MAX') || 50;
    this.PHONE_FIELD_MAX = configChannel.request('get', 'PHONE_FIELD_MAX');
    
    this.CMS_WITNESS_TYPE_DISPLAYS = configChannel.request('get', 'CMS_WITNESS_TYPE_DISPLAYS') || {};
    this.CMS_WITNESS_TYPES_WITH_BUSINESS_NAME = configChannel.request('get', 'CMS_WITNESS_TYPES_WITH_BUSINESS_NAME') || [];
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.typeModel = new Dropdown_model({
      optionData: Object.keys(this.CMS_WITNESS_TYPE_DISPLAYS).map(val => (
        { value: val, text: this.CMS_WITNESS_TYPE_DISPLAYS[val] }
      )),
      defaultBlank: false,
      labelText: 'Role',
      required: true,
      value: this.model.get('c_witness_type') ? String(this.model.get('c_witness_type')) : String(configChannel.request('get', 'CEU_WITNESS_TYPE_INDIVIDUAL')||''),
      apiMapping: 'c_witness_type',
    });

    this.firstNameModel = new Input_model({
      labelText: 'First Name',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('c_witness_first_name'),
      apiMapping: 'c_witness_first_name',
    });

    this.lastNameModel = new Input_model({
      labelText: 'Last Name',
      required: true,
      maxLength: this.APPLICANT_FIELD_MAX,
      value: this.model.get('c_witness_last_name'),
      apiMapping: 'c_witness_last_name',
    });

    this.phoneModel = new Input_model({
      inputType: 'phone',
      labelText: 'Phone',
      required: true,
      maxLength: this.PHONE_FIELD_MAX,
      value: this.model.get('c_witness_phone'),
      apiMapping: 'c_witness_phone',
    });

    this.emailModel = new Input_model({
      inputType: 'email',
      labelText: 'Email Address',
      required: false,
      maxLength: this.APPLICANT_FIELD_MAX,
      cssClass: 'optional-input',
      value: this.model.get('c_witness_email'),
      apiMapping: 'c_witness_email',
    });

    this.allModels = [
      this.typeModel,
      this.firstNameModel,
      this.lastNameModel,
      this.phoneModel,
      this.emailModel
    ];
  },

  shouldShowBusinessName() {
    return this.CMS_WITNESS_TYPES_WITH_BUSINESS_NAME?.includes(this.typeModel.getData({ parse: true }));
  },

  setupListeners() {
    this.allModels.forEach(model => {
      this.stopListening(model, 'change:value');
      this.listenTo(model, 'change:value', () => {
        this.saveInternalDataToModel();

        if (model === this.typeModel) {
          this.firstNameModel.set('value', null, { silent: true });
          this.lastNameModel.set('value', null, { silent: true });
          this.render();
        }
      })
    });
  },

  saveInternalDataToModel() {
    this.allModels.forEach(uiModel => {
      this.model.set(uiModel.getPageApiDataAttrs());
    });

    if (this.shouldShowBusinessName()) {
      this.model.set({
        c_witness_first_name: null,
        c_witness_last_name: null,
      });
    } else {
      this.model.set({
        c_witness_business_name: null,
        c_witness_business_contact_name: null,
      });
    }
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

  removeWitness() {
    this.model.collection.remove(this.model);
  },

  className: 'ceu-contravention-witness',

  regions: {
    typeRegion: '.ceu-contravention-witness__type',
    firstNameRegion: '.ceu-contravention-witness__first',
    lastNameRegion: '.ceu-contravention-witness__last',
    phoneRegion: '.ceu-contravention-witness__phone',
    emailRegion: '.ceu-contravention-witness__email'
  },

  onBeforeRender() {
    const shouldShowBusinessName = this.shouldShowBusinessName();

    this.firstNameModel.set({
      labelText: shouldShowBusinessName ? 'Name of Business / Company / Agency' : 'First Name',
      apiMapping: shouldShowBusinessName ? 'c_witness_business_name' : 'c_witness_first_name',
      value: this.model.get(shouldShowBusinessName ? 'c_witness_business_name' : 'c_witness_first_name',),
    });

    this.lastNameModel.set({
      labelText: shouldShowBusinessName ? 'Contact Full Name' : 'Last Name',
      apiMapping: shouldShowBusinessName ? 'c_witness_business_contact_name' : 'c_witness_last_name',
      value: this.model.get(shouldShowBusinessName ? 'c_witness_business_contact_name' : 'c_witness_last_name',),
    });
  },

  onRender() {
    this.showChildView('typeRegion', new DropdownView({ model: this.typeModel }));
    this.showChildView('firstNameRegion', new InputView({ model: this.firstNameModel }));
    this.showChildView('lastNameRegion', new InputView({ model: this.lastNameModel }));
    this.showChildView('phoneRegion', new InputView({ model: this.phoneModel }));
    this.showChildView('emailRegion', new InputView({ model: this.emailModel }));
  },

  template() {
    return <>
      <div className="ceu-contravention-witness__type"></div>
      <div className="ceu-contravention-witness__first"></div>
      <div className="ceu-contravention-witness__last"></div>
      <div className="ceu-contravention-witness__phone"></div>
      <div className="ceu-contravention-witness__email"></div>
      {this.model.collection.length > 1 ? <div className="ceu-contravention-witness__delete" onClick={() => this.removeWitness()}></div> : null}
    </>
  },
});

const CeuWitnessCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CeuWitnessView,
  validateAndShowErrors() {
    let isValid = true;
    this.children.forEach(child => { isValid = child.validateAndShowErrors() && isValid });
    return isValid;
  },
  saveInternalDataToModel() {
    this.children.forEach(child => child.saveInternalDataToModel());
  },
});

const CeuWitnessesView = Marionette.View.extend({
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

    this.listenTo(this.fir, 'change:value', (model) => {
      if (model.isValid()) this.saveInternalDataToModel();
    });
    this.listenTo(this.statusModel, 'change:value', (model) => {
      if (model.isValid()) this.saveInternalDataToModel();
      this.render();
    });
    this.listenTo(this.dateModel, 'change:value', (model) => {
      if (model.isValid()) this.saveInternalDataToModel();
    });
  },

  validateAndShowErrors() {
    const listView = this.getChildView('listRegion');
    return listView && listView.isRendered() && typeof listView.validateAndShowErrors === 'function' ?
      listView.validateAndShowErrors() : false;
  },

  saveInternalDataToModel() {
    const listView = this.getChildView('listRegion');
    if (listView && listView.isRendered() && typeof listView.saveInternalDataToModel === 'function') {
      listView.saveInternalDataToModel();
    }
  },

  addWitness() {
    this.ceuModel.addBlankWitness();
  },

  regions: {
    listRegion: '.ceu-contravention__witnesses-list'
  },

  onRender() {
    this.showChildView('listRegion', new CeuWitnessCollectionView({ collection: this.collection }));
  },

  template() {
    return <>
      <div className="ceu-contravention__witnesses-info">Please provide the names and contact information for anyone that can provide statements or evidence about this contravention or issue</div>
      <div className="ceu-contravention__witnesses-list"></div>
      <div className="ceu-contravention__witnesses-add general-link" onClick={() => this.addWitness()}>Add another contact</div>
    </>
      
  },

});

_.extend(CeuWitnessView.prototype, ViewJSXMixin);
_.extend(CeuWitnessCollectionView.prototype, ViewJSXMixin);
_.extend(CeuWitnessesView.prototype, ViewJSXMixin);

export default CeuWitnessesView;
