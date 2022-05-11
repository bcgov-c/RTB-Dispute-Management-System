import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from "../../../core/components/input/Input";
import DropdownView from "../../../core/components/dropdown/Dropdown";
import CheckboxView from "../../../core/components/checkbox/Checkbox";
import template from './AdvancedSearchCrossApp_template.tpl';
import { CrossAppSubTypeDropdownCodes } from './SearchInstance_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const CROSS_APP_RESULTS_MAX = 100;
const SEARCH_NAME = 'Cross / Duplicate';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const participantChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'populate-cross-app-search',
  
  regions: {
    populateSearchParams: '.populate-search-params',
    crossAppFileNumberRegion: '.cross-app-file-number',
    subTypeRegion: '.cross-app-dispute-sub-type',
    tenancyAddressRegion: '.search-tenancy-address',
    includeInactiveDisputes: '.toggle-include-inactive-disputes',
    excludeActiveHearings: '.toggle-exclude-active-hearings',
    excludeActiveHearingsAmountRegion: '.exclude-active-hearings-amount',
    minThresholdRegion: '.crossapp-min-threshold'
  },
  
  ui: {
    crossAppSearchTools: '.populate-search-tools',
    crossAppBtnSearch: '.cross-app-btn-search',
    crossAppFileNumberSearchBtn: '.cross-app-file-number-btn-search',
    tenancyAddressGeo: '.tenancy-address-geo'
  },

  events: {
    'click @ui.crossAppFileNumberSearchBtn': 'clickSearchCrossAppFileNumber',
    'click @ui.crossAppBtnSearch': 'clickSearch'
  },

  clickSearchCrossAppFileNumber() {
    const crossAppFileNumberView = this.getChildView('crossAppFileNumberRegion');
    if (crossAppFileNumberView && !crossAppFileNumberView.validateAndShowErrors()) {
      return;
    }
    if (crossAppFileNumberView && !crossAppFileNumberView.model.getData({ parse: true })) {
      crossAppFileNumberView.showErrorMessage('Please enter a file number');
      return;
    }

    // Make sure to clear and set loaded info before a search
    // Clear search results when a new file number is searched
    applicationChannel.request('clear');
    this.model.get('crossAppTenancyAddressModel').set('_crossAppLastSearched', null, { silent: true });
    this.model.set('populatedSearchData', null);
    this.model.get('crossAppSubTypeModel').set('value', CrossAppSubTypeDropdownCodes.DROPDOWN_CODE_ALL);
    this.model.trigger('hide:results');
    this.render();

    this.performSearch(this.model.get('crossAppFileNumberModel').getData(), 'search:dispute',
      (response, searchNameString) => {
        const dfd = $.Deferred();
        if (searchNameString) {
          this.model.set('searchName', searchNameString);
        }
        const file = (response instanceof Array) ? response[0] : null; // There shouldn't be more than one response
        if (file && typeof file.dispute_guid === 'string') {
          $.whenAll(
            disputeChannel.request('load', file.dispute_guid),
            hearingChannel.request('load', file.dispute_guid),
            participantChannel.request('load', file.dispute_guid)
          ).done(() => this.model.set('populatedSearchData', this.model.getCrossAppPopulateSearchResults()) )
          .always(() => {
            loaderChannel.trigger('page:load:complete');
            this.render();
            dfd.resolve();
          });
        } else {
          loaderChannel.trigger('page:load:complete');
          const searchInputView = this.getChildView('crossAppFileNumberRegion');
          searchInputView.showErrorMessage('No matching dispute');  
        }
        return dfd.promise();
      },
      generalErrorFactory.createHandler('ADMIN.SEARCH.CROSS'),
      SEARCH_NAME,
      true);
  },

  clickSearch() {
    const tenancyAddressView = this.getChildView('tenancyAddressRegion');
    const excludeActiveHearingsAmountView = this.getChildView('excludeActiveHearingsAmountRegion');
    const minThresholdView = this.getChildView('minThresholdRegion');
    if (tenancyAddressView && !tenancyAddressView.validateAndShowErrors()) {
      return;
    }
    if (tenancyAddressView && !tenancyAddressView.model.getData({ parse: true })) {
      tenancyAddressView.showErrorMessage('Please enter a tenancy address');
      return;
    }
    const isSearchValid = excludeActiveHearingsAmountView.validateAndShowErrors() && minThresholdView.validateAndShowErrors()
    if (!isSearchValid) return;

    const crossAppTenancyAddressModel = this.model.get('crossAppTenancyAddressModel');
    crossAppTenancyAddressModel.set('_crossAppLastSearched', crossAppTenancyAddressModel.getData(), { silent: true });
    this.searchByRequest(this.buildRequest());
  },

  buildRequest() {
    const populatedSearchData = this.model.get('populatedSearchData');
    const dispute = populatedSearchData.dispute;

    const requestObj = Object.assign({
        index: 0,
        count: CROSS_APP_RESULTS_MAX,
        DisputeGuid: dispute && dispute.id,
        TenancyAddress: $.trim(this.model.get('crossAppTenancyAddressModel').getData()).toLowerCase(),
        IncludeNotActive: !!this.model.get('crossAppIncludeInactiveDisputesModel').getData()
      },
      this.model.get('crossAppExcludeActiveHearingsModel').getData() && this.model.get('crossAppExcludeActiveHearingsAmountModel').getData() ? { HearingAfterDays: this.model.get('crossAppExcludeActiveHearingsAmountModel').getData() } : null,
      this.model.get('minThresholdScoreModel').getData() ? { CrossThreshold: this.model.get('minThresholdScoreModel').getData() } : null
    );

    return requestObj;
  },

  searchByRequest(request) {
    const searchInputView = this.getChildView('crossAppFileNumberRegion');
    this.performSearch(request, 'search:crossApp', (searchResultCollection) => {
      searchResultCollection.totalAvailable = searchResultCollection.length;
      this.handleSearchResponse(searchResultCollection, SEARCH_NAME);
    }, null, SEARCH_NAME)
      .fail(err => {
        if (!err) return;
        if (err && err.status === 404) searchInputView.showErrorMessage('No results found');
        else generalErrorFactory.createHandler('ADMIN.SEARCH.CROSS')(err);
      });
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
    this.SEARCH_CROSS_APP_ACTIVE_HEARING_DAY_OFFSET = configChannel.request('get', 'SEARCH_CROSS_APP_ACTIVE_HEARING_DAY_OFFSET');
  },

  onBeforeRender() {
    const dispute = (this.model.get('populatedSearchData') || {}).dispute;
    const existingCrossApp = this.model.get('crossAppTenancyAddressModel').get('_crossAppLastSearched');
    this.model.get('crossAppTenancyAddressModel').set('value', existingCrossApp ? existingCrossApp : (dispute ? dispute.get('tenancy_address') : null));
  },

  onRender() {
    const crossAppFileNumberRegion = this.showChildView('crossAppFileNumberRegion', new InputView({ model: this.model.get('crossAppFileNumberModel') }));
    this.addEnterListener(crossAppFileNumberRegion, this.clickSearchCrossAppFileNumber);

    const populatedSearchData = this.model.get('populatedSearchData');
    if (populatedSearchData && populatedSearchData.dispute) {
      this.showChildView('subTypeRegion', new DropdownView({ model: this.model.get('crossAppSubTypeModel') }));
      this.showChildView('includeInactiveDisputes', new CheckboxView({ model: this.model.get('crossAppIncludeInactiveDisputesModel') }));
      this.showChildView('excludeActiveHearings', new CheckboxView({ model: this.model.get('crossAppExcludeActiveHearingsModel') }));
      this.showChildView('excludeActiveHearingsAmountRegion', new InputView({ model: this.model.get('crossAppExcludeActiveHearingsAmountModel') }));
      this.showChildView('minThresholdRegion', new InputView({ model: this.model.get('minThresholdScoreModel') }));
      const tenancyAddressRegion = this.showChildView('tenancyAddressRegion', new InputView({ model: this.model.get('crossAppTenancyAddressModel') }));
      this.addEnterListener(tenancyAddressRegion, this.clickSearch);
    }
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  },

  templateContext() {
    const dispute = (this.model.get('populatedSearchData') || {}).dispute;
    return Object.assign({
      Formatter,
      searchPopulated: !!dispute,
      tenancyAddressCityPostal: dispute ? `${dispute.get('tenancy_zip_postal')}${dispute.get('tenancy_zip_postal') ? ', ' : ''}${dispute.get('tenancy_city')}` : '-'
    }, this.model.get('populatedSearchData'));
  }
});