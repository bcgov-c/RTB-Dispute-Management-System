import Marionette from 'backbone.marionette';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import template from './AdvancedSearchHearings_template.tpl';

export default Marionette.View.extend({
  template,

  regions: {
    hearingDateRegion: '.search-option-hearing-date',
    hearingTypeRegion: '.search-option-hearing-type',
    hearingOwnerRegion: '.search-option-hearing-owner'
  },

  ui: {
    hearingSearchBtn: '.hearing-btn-search',
  },
  
  events: {
    'click @ui.hearingSearchBtn': 'clickHearingSearch',
  },

  clickHearingSearch() {
    this.getChildView('hearingDateRegion').removeErrorStyles();
    if (!this.getChildView('hearingDateRegion').validateAndShowErrors()) {
      return;
    }

    const hearingType = this.model.get('hearingTypeModel').getData({ parse: true });
    const hearingOwner = this.model.get('hearingOwnerModel').getData({ parse: true });
    const hearingStart = this.model.get('hearingDateModel').getData({ format: 'date' });

    this.searchByRequest(_.extend({
        index: 0,
        count: this.model.getInitialRequestCount(),
        HearingStart: hearingStart,
      },
      hearingType ? { HearingType: hearingType } : {},
      hearingOwner ? { HearingOwner: hearingOwner } : {}
    )).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.HEARING'));
  },
  
  searchByRequest(request) {
    return this.performSearch(request, 'search:hearing', this.handleSearchResponse, null, 'Hearing');
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
    this.setupListeners();
  },
  
  setupListeners() {
    this.listenTo(this.model.get('hearingTypeModel'), 'change:value', this.updateHearingTypeModel, this);
    this.listenTo(this.model.get('hearingOwnerModel'), 'change:value', this.updateHearingOwnerModel, this);
  },

  updateHearingOwnerModel() {
    this.model.get('hearingOwnerModel').set({value: Number(this.model.get('hearingOwnerModel').getData())});
  },

  updateHearingTypeModel() {
    this.model.get('hearingTypeModel').set({value: Number(this.model.get('hearingTypeModel').getData())});
  },

  onRender() {
    const hearingDateRegion = this.showChildView('hearingDateRegion', new InputView({ model: this.model.get('hearingDateModel') }));
    this.showChildView('hearingTypeRegion', new DropdownView({ model: this.model.get('hearingTypeModel') }));
    this.showChildView('hearingOwnerRegion', new DropdownView({ model: this.model.get('hearingOwnerModel') }));

    this.addEnterListener(hearingDateRegion, this.clickHearingSearch);
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  }
});
