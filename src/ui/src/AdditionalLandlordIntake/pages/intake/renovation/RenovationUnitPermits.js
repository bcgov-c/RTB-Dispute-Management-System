import Marionette from 'backbone.marionette';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import template from './RenovationUnitPermit_template.tpl';

const PermitView = Marionette.View.extend({
  template,
  className: 'pfr-unit-permit',

  regions: {
    permitDateRegion: '.pfr-unit-permit-date',
    permitIdRegion: '.pfr-unit-permit-id',
    permitIssuedByRegion: '.pfr-unit-permit-issued-by',
    permitDescriptionRegion: '.pfr-unit-permit-description',
  },

  ui: {
    delete: '.pfr-unit-permit-delete'
  },

  events: {
    'click @ui.delete': 'clickDelete'
  },

  clickDelete() {
    this.model.collection.remove(this.model);
  },
  
  initialize() {
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.permitDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Date Permit Issued',
      required: true,
      value: this.model.get('local-issued_date'),
      apiMapping: 'local-issued_date',
      errorMessage: 'Enter date',
    });

    this.permitIdModel = new InputModel({
      inputType: 'text',
      labelText: 'Permit ID or Number',
      errorMessage: 'Enter identifier',
      required: true,
      minLength: 3,
      maxLength: 20,
      value: this.model.get('local-permit_id'),
      apiMapping: 'local-permit_id',
    });

    this.permitIssuedByModel = new InputModel({
      inputType: 'text',
      labelText: 'Permit Issued By',
      errorMessage: 'Enter issued by',
      required: true,
      minLength: 3,
      maxLength: 60,
      value: this.model.get('local-issued_by'),
      apiMapping: 'local-issued_by',
    });

    this.permitDescriptionModel = new InputModel({
      inputType: 'text',
      labelText: 'Short Description of Permit',
      errorMessage: 'Enter description',
      required: true,
      minLength: 3,
      maxLength: 150,
      value: this.model.get('local-permit_description'),
      apiMapping: 'local-permit_description',
    });
  },

  setupListeners() {
    // Sync UI values to permit model right away
    const models = [
      this.permitDateModel,
      this.permitIdModel,
      this.permitIssuedByModel,
      this.permitDescriptionModel
    ];

    models.forEach(model => {
      this.stopListening(model, 'change:value');
      this.listenTo(model, 'change:value', m => this.model.set(m.getPageApiDataAttrs()));
    });
  },

  onRender() {
    this.showChildView('permitDateRegion', new InputView({ model: this.permitDateModel }));
    this.showChildView('permitIdRegion', new InputView({ model: this.permitIdModel }));
    this.showChildView('permitIssuedByRegion', new InputView({ model: this.permitIssuedByModel }));
    this.showChildView('permitDescriptionRegion', new InputView({ model: this.permitDescriptionModel }));
  },

  validateAndShowErrors() {
    let isValid = true;
    _.each(this.regions, (selector, region) => {
      const childView = this.getChildView(region);
      if (childView && childView.isRendered() && childView.validateAndShowErrors) {
        isValid = childView.validateAndShowErrors() && isValid;
      }
    });
    return isValid;
  },
});

const PermitCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: PermitView,
  validateAndShowErrors() {
    let isValid = true;
    this.children.forEach(child => { isValid = child.validateAndShowErrors() && isValid });
    return isValid;
  },
});

export default Marionette.View.extend({
  template: _.template(`
    <div class="pfr-permits-list"></div>
    <div class="pfr-permits-add general-link">Add another permit</div>
    <div class="error-block"></div>
  `),
  className: 'pfr-permits',
  regions: {
    listRegion: '.pfr-permits-list',
  },
  ui: {
    add: '.pfr-permits-add',
    error: '.error-block',
  },
  events: {
    'click @ui.add': 'clickAddPermit',
  },
  clickAddPermit() {
    this.collection.add({});
  },

  initialize(options) {
    this.mergeOptions(options, ['collection']);
    this.options = options;
  },

  validateAndShowErrors() {
    let isValid = true;
    const listView = this.getChildView('listRegion');
    if (listView && listView.isRendered() && listView.validateAndShowErrors) {
      isValid = listView.validateAndShowErrors();
    }

    if (!this.collection || !this.collection.length) {
      isValid = false;
      this.getUI('error').html('Please add at least one permit or change above selection to No');
    }
    
    return isValid;
  },

  onRender() {
    this.showChildView('listRegion', new PermitCollectionView(this.options));
  },
});
