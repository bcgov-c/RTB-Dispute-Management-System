import Radio from 'backbone.radio';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownCollectionView from '../../../core/components/dropdown/DropdownCollectionView';
import template from './AdvancedSearchClaims_template.tpl';
import AdvancedSearchMixinView from './AdvancedSearch_mixin';

const claimsChannel = Radio.channel('claims');
export default AdvancedSearchMixinView.extend({
  template,

  regions: {
    disputeType: '.search-claims-dispute-type',
    disputeSubType: '.search-claims-dispute-sub-type',
    tenancyStatus: '.search-claims-tenancy-status',
    claimsDropdownRegion: '.search-claims-dropdown'
  },

  ui: {
    filterBtn: '.search-claims-filter-btn',
    addClaimBtn: '.search-claims-add',
    claimsSearchBtn: '.search-claims-btn-search'
  },

  events: {
    'click @ui.filterBtn': 'clickFilterBtn',
    'click @ui.addClaimBtn': 'clickAddClaim',
    'click @ui.claimsSearchBtn': 'clickSearchDisputeInfo'
  },

  clickFilterBtn() {
    // We have already populated, so un-populate now
    const newclaimFilterState = !this.model.get('claimFilterState');
    this.model.set('claimFilterState', newclaimFilterState);

    // Disable or un-disable all filters
    _.each(this.filterRegions, region => {
      const view = this.getChildView(region);
      if (view && view.model) {
        view.model.set('disabled', newclaimFilterState, { silent: true });
      }
    });

    if (newclaimFilterState) {
      if (!this.issueDropdownCollection.length) {
        this.issueDropdownCollection.add(this.getBlankClaimDropdown());
      }
      this.updateIssueFilterDataAndRender();
    } else {
      this.issueDropdownCollection.reset([], { silent: true });
      const disputeCollection = this.model.get('disputeCollection');
      if (disputeCollection && _.isFunction(disputeCollection.reset)) {
        disputeCollection.reset([], { silent: true });
      }
      this.model.trigger('hide:results');
      this.render();
    }
    
  },

  clickAddClaim() {
    this.issueDropdownCollection.add(this.getBlankClaimDropdown(), { silent: true });
    this.updateIssueFilterDataAndRender();
  },
  
  clickSearchDisputeInfo() {
    const dropdownView = this.getChildView('claimsDropdownRegion');
    if (dropdownView && dropdownView.isRendered() && dropdownView.validateAndShowErrors()) {
      const ClaimCodes = [];
      const displayCodes = [];
      const dropdownsWithValues = this.issueDropdownCollection.filter(m => parseInt(m.getData({ parse: true })));
      _.each(dropdownsWithValues, function(dropdown) {
        const parsedVal = dropdown.getData({ parse: true });
        const matchingOption = _.findWhere(dropdown.get('optionData') || [], { value: dropdown.get('value') });
        const code = (matchingOption || {})._code;
        displayCodes.push(code || `ID:${parsedVal}`);
        ClaimCodes.push(parsedVal);
      });

      // Pass displayCodes in request so we have it for "show more" pagination.  It will be removed before API request
      const request = { ClaimCodes, _displayCodes: displayCodes, index: 0, count: this.model.getInitialRequestCount() };
      this.searchByRequest(request).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.CLAIMS'));
    }
  },
    
  validateAndShowErrors() {
    
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
    
    this.filterRegions = ['disputeType', 'disputeSubType', 'tenancyStatus'];
    this.issueDropdownCollection = this.model.get('searchClaimsDropdownCollection');
    
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.issueDropdownCollection, 'change:value', this.updateIssueFilterDataAndRender, this);
    this.listenTo(this.issueDropdownCollection, 'remove', this.updateIssueFilterDataAndRender, this);
  },

  getBlankClaimDropdown() {
    return {
      optionData: claimsChannel.request('get:claim:options', this.issueDropdownCollection, this.model.isClaimFilterRTA(), this.model.isClaimFilterLandlord(), this.model.isClaimFilterCurrent()),
      defaultBlank: true,
      required: true,
      showRemovalButton: this.issueDropdownCollection.length,
      cssClass: 'clearfix'
    };
  },
  
  updateIssueFilterData() {
    // Now apply filters to dropdown list
    const issuesLength = this.issueDropdownCollection.length;
    this.issueDropdownCollection.each((model, index) => {
      const val = $.trim(model.get('value'));
      const optionData = claimsChannel.request('get:claim:options', this.issueDropdownCollection, this.model.isClaimFilterRTA(), this.model.isClaimFilterLandlord(), this.model.isClaimFilterCurrent(), val);
      model.set({
        optionData,
        displayTitle: `Issue ${index+1}`,
        showRemovalButton: issuesLength < 2 && index === 0 ? false : true
      });
    });
  },

  updateIssueFilterDataAndRender() {
    this.updateIssueFilterData();
    this.render();
  },

  searchByRequest(request) {
    const displayCodes = request._displayCodes || request.ClaimCodes;
    return this.performSearch(request, 'search:claim', this.handleSearchResponse, null, `${_.isArray(displayCodes) && displayCodes.length ? `${displayCodes.join(', ')} ` : ''}Issue${_.isArray(displayCodes) && displayCodes.length===1?'':'s'}`);
  },

  onRender() {
    this.showChildView('disputeType', new DropdownView({ model: this.model.get('searchClaimsDisputeTypeModel') }));
    this.showChildView('disputeSubType', new DropdownView({ model: this.model.get('searchClaimsDisputeSubTypeModel') }));
    this.showChildView('tenancyStatus', new DropdownView({ model: this.model.get('searchClaimsTenancyStatusModel') }));

    if (this.model.get('claimFilterState')) {
      this.showChildView('claimsDropdownRegion', new DropdownCollectionView({ collection: this.issueDropdownCollection }));
    }
  },

  templateContext() {
    return {
      issueDropdownCollection: this.issueDropdownCollection,
      filtersBtnText: this.model.get('claimFilterState') ? 'Change Dispute Type' : 'Apply Filters'
    };
  }
});
