import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import template from './AdvancedSearchStatus_template.tpl';

const DROPDOWN_CODE_YES = '1';
const DROPDOWN_CODE_NO = '2';

const statusChannel = Radio.channel('status');
const userChannel = Radio.channel('users');

export default Marionette.View.extend({
  template,

  regions: {
    stageRegion: '.search-option-stage',
    statusRegion: '.search-option-status',
    processRegion: '.search-option-process',
    includeOwnerRegion: '.include-owner',
    ownerGroupRegion: '.search-option-owner-group',
    ownerRegion: '.search-option-owner',
  },
  ui: {
    statusSearchBtn: '.status-btn-search',
  },
  events: {
    'click @ui.statusSearchBtn': 'clickStatusSearch',
  },

  clickStatusSearch() {
    // Validate inputs
    this.getChildView('ownerRegion').removeErrorStyles();
    if (this.model.get('includeOwnerModel').getData() === DROPDOWN_CODE_YES) {
      if (!this.getChildView('ownerRegion').validateAndShowErrors()) {
        this.getChildView('ownerRegion').showErrorMessage('Please select an owner.');
        return;
      }
    }

    // Build API request
    const request = Object.assign({
        index: 0,
        count: this.model.getInitialRequestCount(),
        Status: this.model.get('statusEditModel').getData(),
        Stage: this.model.get('stageEditModel').getData(),
        Process: this.model.get('processEditModel').getData(),
        IncludeHistory: false,
        IncludeNotActive: true
      },
      this.model.get('includeOwnerModel').getData() === DROPDOWN_CODE_YES ? { Owner: this.model.get('ownerEditModel').getData() } : {}
    );

    this.searchByRequest(request).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.STATUS'));
  },

  searchByRequest(request) {
    return this.performSearch(request, 'search:status', this.handleSearchResponse, null, 'Status');
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
    this.setupListeners();
  },
  setupListeners() {
    this.listenTo(this.model.get('stageEditModel'), 'change:value', this.handleStageChange, this);
    this.listenTo(this.model.get('statusEditModel'), 'change:value', this.updateAvailableOwners, this);
    this.listenTo(this.model.get('includeOwnerModel'), 'change:value', this.handleIncludeOwnerChange, this);
    this.listenTo(this.model.get('ownerTypeModel'), 'change:value', this.handleOwnerTypeChange, this);
    this.listenTo(this.model.get('ownerEditModel'), 'change:value', this.updateOwnerEditModel, this);
  },

  updateOwnerEditModel() {
    this.model.get('ownerEditModel').set({ value: Number(this.model.get('ownerEditModel').getData()) }, { silent: true });
  },

  updateAvailableOwners() {
    const roleTypeOptions = this._getRoleTypeOptions();
    this.model.get('ownerTypeModel').set({ optionData: roleTypeOptions, value: null });
    this.handleOwnerTypeChange(this.model.get('ownerTypeModel'), this.model.get('ownerTypeModel').getData());

    if (!roleTypeOptions.length) {
      this.model.get('ownerTypeModel').set({ disabled: true });
      this.model.get('ownerEditModel').set({ disabled: true })
      this.model.get('includeOwnerModel').set({ value: DROPDOWN_CODE_NO, disabled: true }, { silent: true });
    } else {
      if (this.model.get('includeOwnerModel').getData() === DROPDOWN_CODE_YES) {
        this.model.get('ownerTypeModel').set({ disabled: false });
        this.model.get('ownerEditModel').set({ disabled: false });
      }
      this.model.get('includeOwnerModel').set({ disabled: false }, { silent: true });
    }

    this.showChildView('ownerGroupRegion', new DropdownView({ model: this.model.get('ownerTypeModel') }));
    this.showChildView('ownerRegion', new DropdownView({ model: this.model.get('ownerEditModel') }));
    this.showChildView('includeOwnerRegion', new DropdownView({ model: this.model.get('includeOwnerModel') }));
  },

  handleStageChange() {
    const optionData = this.model.statusesToPicklistFromStageWithoutStatusNotSubmitted(this.model.get('stageEditModel').getData());
    const value = optionData.length ? (optionData[0] || {}).value : null;

    this.model.get('statusEditModel').set({ optionData, value });
    this.showChildView('statusRegion', new DropdownView({ model: this.model.get('statusEditModel') }));
    this.model.get('statusEditModel').trigger('change:value');

    this.updateAvailableOwners();
  },

  _getRoleTypeOptions() {
    const stage = this.model.get('stageEditModel').getData({ parse: true }),
      status = this.model.get('statusEditModel').getData({ parse: true }),
      stage_status_rules = statusChannel.request('get:rules:stagestatus', stage, status);

    let allowed_owner_types = [];
    if (stage_status_rules && stage_status_rules.ownerTypes) {
      allowed_owner_types = stage_status_rules.ownerTypes;
    }

    return _.map(allowed_owner_types, function(owner_type) {
      return { value: owner_type, text: userChannel.request('get:role:display', owner_type) };
    });
  },

  handleOwnerTypeChange(model, value) {
    this.model.get('ownerTypeModel').set({ value: Number(this.model.get('ownerTypeModel').getData()) });

    const ownerTypeOptions = model.get('optionData');
    let filteredUsers = [];
    if (value) {
      filteredUsers = userChannel.request('get:users:by:role', value);
    } else {
      filteredUsers = _.flatten( (ownerTypeOptions || []).map(option => userChannel.request('get:users:by:role', option.value) || []) );
    }

    filteredUsers = _.sortBy(filteredUsers, user => user.getDisplayName());

    this.model.get('ownerEditModel').set(Object.assign({
        optionData: filteredUsers && filteredUsers.length ? filteredUsers.map(user => ({ text: user.getDisplayName(), value: user.id })) : [{value:-1, text: ''}] // List is disabled, this shouldn't be visible
      },
      _.contains(ownerTypeOptions, this.model.get('ownerEditModel').getData({ parse: true })) && this.model.get('includeOwnerModel').getData() === DROPDOWN_CODE_YES ?
        { value: (filteredUsers && filteredUsers.length === 1) ? filteredUsers[0].get('user_id') : null } : {}
    ));

    if (this.model.get('includeOwnerModel').getData() !== DROPDOWN_CODE_YES) {
      this.model.get('ownerEditModel').set('value', null);
    }

    this.showChildView('ownerRegion', new DropdownView({ model: this.model.get('ownerEditModel') }));
  },

  handleIncludeOwnerChange(model, value) {
    if (value === DROPDOWN_CODE_YES) {
      this.model.get('ownerTypeModel').set({ disabled: false });
      this.model.get('ownerEditModel').set({ disabled: false });
      this.updateAvailableOwners();
    } else {
      // Disable
      this.model.get('ownerTypeModel').set({ disabled: true, value: null });
      this.model.get('ownerEditModel').set({ disabled: true, value: null });
    }

    this.showChildView('ownerGroupRegion', new DropdownView({ model: this.model.get('ownerTypeModel') }));
    this.showChildView('ownerRegion', new DropdownView({ model: this.model.get('ownerEditModel') }));
  },

  onRender() {
    this.showChildView('stageRegion', new DropdownView({ model: this.model.get('stageEditModel') }));
    this.showChildView('statusRegion', new DropdownView({ model: this.model.get('statusEditModel') }));
    this.showChildView('processRegion', new DropdownView({ model: this.model.get('processEditModel') }));
    this.showChildView('includeOwnerRegion', new DropdownView({ model: this.model.get('includeOwnerModel') }));
    this.showChildView('ownerGroupRegion', new DropdownView({ model: this.model.get('ownerTypeModel') }));
    this.showChildView('ownerRegion', new DropdownView({ model: this.model.get('ownerEditModel') }));
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  }
});
