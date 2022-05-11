import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import SearchResultItemCollection from '../../components/search/SearchResultItem_collection';
import template from './AdvancedSearchDisputes_template.tpl';
import AdvancedSearchMixinView from './AdvancedSearch_mixin';

export default AdvancedSearchMixinView.extend({
  template,

  regions: {
    fileNumberRegion: '.file-number',
    tenancyAddressRegion: '.search-tenancy-address',
    postalCode: '.postal-code',
    disputeType: '.dispute-type',
    disputeSubType: '.dispute-sub-type',
  },

  ui: {
    fileNumberSearchBtn: '.file-number-btn-search',
    disputeInfoSearchBtn: '.dispute-info-btn-search',
  },

  events: {
    'click @ui.fileNumberSearchBtn': 'clickSearchFileNumber',
    'click @ui.disputeInfoSearchBtn': 'clickSearchDisputeInfo',
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
    this.setupListeners();
  },

  setupListeners() {
  },

  clickSearchFileNumber() {
    const searchInputView = this.getChildView('fileNumberRegion');
    if (!searchInputView.validateAndShowErrors()) return;

    // Use direct search - we're only expecting a single result
    this.performDirectSearch(this.model.get('fileNumberModel').getData(), 'search:dispute', (response) => {
      response = response || [];
      const searchResultCollection = new SearchResultItemCollection(response);
      searchResultCollection.totalAvailable = response.length;
      this.handleSearchResponse(searchResultCollection, 'File Number');
    })
      .fail(err => {
        if (err && err.status === 404) searchInputView.showErrorMessage('No matching dispute');
        else generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err)
      });
  },
  
  clickSearchDisputeInfo() {
    const searchTenancyAddressView = this.getChildView('tenancyAddressRegion');
    const searchZipPostalCodeView = this.getChildView('postalCode');

    searchTenancyAddressView.removeErrorStyles();
    searchZipPostalCodeView.removeErrorStyles();

    if (!this.model.get('tenancyAddressModel').getData() && !this.model.get('tenancyZipPostalModel').getData()) {
      searchTenancyAddressView.showErrorMessage('Please enter an address or postal code.');
      return;
    }
    if (this.model.get('tenancyAddressModel').getData() && !searchTenancyAddressView.validateAndShowErrors()) {
      return;
    }
    if (this.model.get('tenancyZipPostalModel').getData() && !searchZipPostalCodeView.validateAndShowErrors()) {
      return;
    }

    const request = { index: 0, count: this.model.getInitialRequestCount() };
    if (Number(this.model.get('disputeTypeModel').getData()) !== -1) {
      request.DisputeType = this.model.get('disputeTypeModel').getData();
    }

    if (Number(this.model.get('disputeSubTypeModel').getData()) !== -1) {
      request.DisputeSubType = this.model.get('disputeSubTypeModel').getData();
    }

    if (this.model.get('tenancyAddressModel').getData()) {
      request.TenancyAddress = $.trim(this.model.get('tenancyAddressModel').getData()).toLowerCase();
    }

    if (this.model.get('tenancyZipPostalModel').getData()) {
      request.TenancyZipPostal = $.trim(this.model.get('tenancyZipPostalModel').getData()).replace(/[^0-9a-z]/gi, '').toLowerCase();
    }

    this.searchByRequest(request).fail(generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE.INFO'));
  },

  searchByRequest(request) {
    return this.performSearch(request, 'search:disputeInfo', this.handleSearchResponse, null, 'Dispute Info');
  },

  onRender() {
    const fileNumberRegion = this.showChildView('fileNumberRegion', new InputView({ model: this.model.get('fileNumberModel') }));
    const tenancyAddressRegion = this.showChildView('tenancyAddressRegion', new InputView({ model: this.model.get('tenancyAddressModel') }));
    const postalCodeRegion = this.showChildView('postalCode', new InputView({ model: this.model.get('tenancyZipPostalModel') }));

    this.addRemoveErrorStylesListener(tenancyAddressRegion, postalCodeRegion);
    this.addRemoveErrorStylesListener(postalCodeRegion, tenancyAddressRegion);

    this.showChildView('disputeType', new DropdownView({ model: this.model.get('disputeTypeModel') }));
    this.showChildView('disputeSubType', new DropdownView({ model: this.model.get('disputeSubTypeModel') }));

    this.addEnterListener(fileNumberRegion, this.clickSearchFileNumber);
    this.addEnterListener(tenancyAddressRegion, this.clickSearchDisputeInfo);
    this.addEnterListener(postalCodeRegion, this.clickSearchDisputeInfo);
  }
});
