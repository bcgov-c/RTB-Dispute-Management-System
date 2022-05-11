import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioView from '../../../core/components/radio/Radio';
import SearchResultsListView from './AdvancedSearchDisputeList';
import AdvancedSearchFilters from './AdvancedSearchFilters';
import AdvancedSearchDisputes from './AdvancedSearchDisputes';
import AdvancedSearchHearings from './AdvancedSearchHearings';
import AdvancedSearchParticipants from './AdvancedSearchParticipants';
import AdvancedSearchStatus from './AdvancedSearchStatus';
import AdvancedSearchClaims from './AdvancedSearchClaims';
import AdvancedSearchCrossApp from './AdvancedSearchCrossApp';
import AdvancedSearchCMS from './AdvancedSearchCMS';
import template from './AdvancedSearch_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const searchChannel = Radio.channel('searches');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');

export default Marionette.View.extend({
  template,

  regions: {
    searchTypeFilters: '#search-type-filters',
    searchFilters: '.search-filters',
    disputeSearch: '.dispute-search',
    participantSearch: '.participant-search',
    statusSearch: '.status-search',
    hearingSearch: '.hearing-search',
    crossAppSearch: '.cross-app-search',
    cmsSearch: '.cms-search',
    searchResults: '.search-results',

    generalSearchRegion: '.general-search-region'
  },

  ui: {
    searchGeneralCriteria: '#search-general-criteria',
    searchResultsContainer: '.search-results-container',
    showMore: '.show-more-disputes',
    allDisputes: '.all-disputes',
    maxDisputes: '.max-disputes'
  },

  events: {
    'click @ui.fileNumberSearchBtn': 'clickSearchFileNumber',
    'click @ui.disputeInfoSearchBtn': 'clickSearchDisputeInfo',
    'click @ui.participantsSearchBtn': 'clickSearchAccessNumber',
    'click @ui.participantNameSearchBtn': 'clickParticipantNameSearch',
    'click @ui.contactInfoSearchBtn': 'clickContactInfoSearch',
    'click @ui.statusSearchBtn': 'clickStatusSearch',
    'click @ui.hearingSearchBtn': 'clickHearingSearch',
    'click @ui.showMore': 'clickShowMore'
  },

  clickShowMore() {
    const collection = this.model.get('disputeCollection');
    const existingCount = collection && collection.length;
    
    const searchResultView = this.getChildView('generalSearchRegion');
    if (searchResultView && _.isFunction(searchResultView.searchByRequest)) {
      const res = searchResultView.searchByRequest(
        _.extend(
          collection.lastUsedRequest, {
            index: 0,
            count: collection.lastUsedFetchCount + existingCount
          }
        )
      );
      if (res && _.isFunction(res.fail)) res.fail(generalErrorFactory.createHandler('ADMIN.SEARCH.MORE.RESULTS'))
    }
  },

  initialize() {
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.get('searchTypeFiltersModel'), 'change:value', () => {
     // Always clear underlying results when changing search types
      const searchResultCollection = this.model.get('disputeCollection');
      if (searchResultCollection) {
        searchResultCollection.reset([]);
      }
      
      this.render();
    });

    this.listenTo(this.model.get('crossAppExcludeActiveHearingsModel'), 'change:checked', (model, isChecked) => {
      this.model.get('crossAppExcludeActiveHearingsAmountModel').set({ disabled: !isChecked, required: isChecked });
      this.model.get('crossAppExcludeActiveHearingsAmountModel').trigger('render');
    })

    this.listenTo(this.model, 'hide:results', () => this.getUI('searchResultsContainer').hide());
  },

  validateSearchFilters() {
    const searchFilters = this.getChildView('searchFilters');
    if (searchFilters && searchFilters.isRendered() && _.isFunction(searchFilters.validateAndShowErrors)) {
      return searchFilters.validateAndShowErrors();
    }
    return true;
  },

  _performDirectSearch(request, channelRadioRequest, onSuccess, onError, searchNameString=null) {
    // Performs a search expecting 1 result only
    return _.bind(this._performSearch, this)(request, channelRadioRequest, onSuccess, onError, searchNameString, true);
  },

  _performSearch(request, channelRadioRequest, onSuccess, onError, searchNameString=null, isDirect=false) {
    if (!isDirect) {

      if (!this.validateSearchFilters()) {
        return;
      }

      // Apply updates to the request based on generic sorting options if we are expecting a list
      this.handleDateRestrictions(request);
      this.handleSortByRestrictions(request);
      this.handleStatusRestrictions(request);
    }

    const dfd = $.Deferred();
    const onSuccessFn = (typeof onSuccess === 'function') ? onSuccess.bind(this) : () => {};
    const onErrorFn = (typeof onError === 'function') ? onError.bind(this) : () => {};

    loaderChannel.trigger('page:load');
    searchChannel.request(channelRadioRequest, request).done(response => {
      const successResult = onSuccessFn(response, searchNameString);
      const onCompleteFn = () => {
        loaderChannel.trigger('page:load:complete');
        dfd.resolve();
      }
      if (successResult && typeof successResult.always === 'function') {
        successResult.always(onCompleteFn);
      } else {
        onCompleteFn();
      }
    }).fail(err => {
      const errorResult = onErrorFn(searchNameString, err);
      const onCompleteFn = () => {
        loaderChannel.trigger('page:load:complete');
        dfd.reject();
      }
      if (errorResult && typeof errorResult.always === 'function') {
        errorResult.always(onCompleteFn);
      } else {
        onCompleteFn();
      }
    });
    return dfd.promise();
  },

  /**
   * Default hander for _performSearch and related methods. This was previously part of _performSearch,
   * but it's been pulled out so we can render search results in different ways, especially in the context
   * of the Cross App search.
   */
  _handleSearchResponse(responseCollection, searchNameString) {
    if (searchNameString) {
      this.model.set('searchName', searchNameString);
    }
    this.model.set('disputeCollection', responseCollection);
    this.renderSearchResults();
  },

  handleDateRestrictions(request) {
    if (this.model.get('restrictDatesCheckBoxModel').getData()) {
      if (Number(this.model.get('restrictDateFieldModel').getData()) === 0) {
        // submitted
        if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 0) {
          // submitted before
          request.SubmittedDateLessThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 1) {
          // submitted after
          request.SubmittedDateGreaterThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && this.model.get('endingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 2) {
          // submitted between
          request.SubmittedDateGreaterThan = this.model.get('startingDateModel').getData();
          request.SubmittedDateLessThan = this.model.get('endingDateModel').getData();
        }

      } else if (Number(this.model.get('restrictDateFieldModel').getData()) === 1) {
        // modified
        if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 0) {
          // modified before
          request.ModifiedDateLessThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 1) {
          // modified after
          request.ModifiedDateGreaterThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && this.model.get('endingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 2) {
          // modified between
          request.ModifiedDateGreaterThan = this.model.get('startingDateModel').getData();
          request.ModifiedDateLessThan = this.model.get('endingDateModel').getData();
        }

      } else if (Number(this.model.get('restrictDateFieldModel').getData()) === 2) {
        // created
        if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 0) {
          // created before
          request.CreatedDateLessThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 1) {
          // created after
          request.CreatedDateGreaterThan = this.model.get('startingDateModel').getData();
        } else if (this.model.get('startingDateModel').getData() && this.model.get('endingDateModel').getData() && Number(this.model.get('restrictDateTypeModel').getData()) === 2) {
          // created between
          request.CreatedDateGreaterThan = this.model.get('startingDateModel').getData();
          request.CreatedDateLessThan = this.model.get('endingDateModel').getData();
        }
      }
    }

    if (this.model.get('restrictMethodModel').getData()) {
      request.CreationMethod = this.model.get('creationMethodsModel').getData();
    }
  },

  handleSortByRestrictions(request) {
    if (this.model.get('sortResultsCheckBoxModel').getData()) {
      if (Number(this.model.get('sortByModel').getData()) === 0) {
        // date created
        request.SortByField = 2;
        if (Number(this.model.get('sortTypeModel').getData()) === 0) {
          // oldest first
          request.SortDirection = 0;
        } else if (Number(this.model.get('sortTypeModel').getData()) === 1) {
          // newest first
          request.SortDirection = 1;
        }
      } else if (Number(this.model.get('sortByModel').getData()) === 1) {
        // date submitted
        request.SortByField = 1;
        if (Number(this.model.get('sortTypeModel').getData()) === 0) {
          // oldest first
          request.SortDirection = 0;
        } else if (Number(this.model.get('sortTypeModel').getData()) === 1) {
          // newest first
          request.SortDirection = 1;
        }
      } else if (Number(this.model.get('sortByModel').getData()) === 2) {
        // date modified
        request.SortByField = 3;
        if (Number(this.model.get('sortTypeModel').getData()) === 0) {
          // oldest first
          request.SortDirection = 0;
        } else if (Number(this.model.get('sortTypeModel').getData()) === 1) {
          // newest first
          request.SortDirection = 1;
        }
      }
    }

    if (this.model.get('includeActiveDisputesCheckBox').getData() && !request.hasOwnProperty('IncludeNotActive')) {
      request.IncludeNotActive = true;
    }
  },

  handleStatusRestrictions(request) {
    if (this.model.get('restrictStatusCheckBoxModel').getData() && this.model.get('searchStatusModel').getData()) {
      request.DisputeStatusEquals = Number(this.model.get('searchStatusModel').getData());
    }
  },

  /**
   * For CMS Archive Search ONLY!
   * @param request
   */
  handleCmsStatusRestrictions(request) {
    if (this.model.get('restrictCmsStatusCheckBoxModel').getData()) {
      if (!isNaN(Number(this.model.get('searchCmsStatusModel').getData()))) {
        request.DisputeStatusEquals = Number(this.model.get('searchCmsStatusModel').getData());
      }
    }
  },

  handleCmsDateRestrictions(request) {
    if (!this.validateSearchFilters()) {
      return false;
    }
    this.handleDateRestrictions(request);
    return true;
  },

  renderSearchResults() {
    this.prepareSearchResultCounter();

    const collection = this.model.get('disputeCollection');
    this.showChildView('searchResults', new SearchResultsListView({
      collection,
      searchType: this.model.get('searchType')
    }));

    const hasMoreAvailable = collection.hasMoreAvailable();

    this.getUI('searchResultsContainer').show();
    this.getUI('maxDisputes').hide();
    this.getUI('allDisputes').hide();
    this.getUI('showMore').hide();

    if (hasMoreAvailable) {
      this.getUI('showMore').show();
    } else if (collection.length === collection.totalAvailable) {
      this.getUI('allDisputes').show();
    }
  },

  prepareSearchResultCounter() {
    const total_length = this.model.get('disputeCollection').totalAvailable;
    const displayed_length = this.model.get('disputeCollection').length;

    let searchTypeVal = '';
    if (!total_length) {
      searchTypeVal = 'No Results - Please Try Another Search';
    } else {
      searchTypeVal = `${this.model.get('searchName')} Search Results - Viewing ${displayed_length}/${total_length}`;
    }
    this.model.set('searchType', searchTypeVal);
  },

  onBeforeRender() {
    const isCms = this.model.isSearchTypeCMS();
    const cmsOptions = [
      { value: 20, text: '20' },
      { value: 50, text: '50' },
      { value: 100, text: '100 (max)' }
    ];
    const nonCmsOptions = [
      { value: 20, text: '20' },
      { value: 100, text: '100' }
    ];
    const optionsToUse = isCms ? cmsOptions : nonCmsOptions;
    const resultsCountModel = this.model.get('resultsCountModel');
    const resultsCountValue = resultsCountModel.getData();
    resultsCountModel.set({
      optionData: isCms ? cmsOptions : nonCmsOptions,
      value: _.find(optionsToUse, opt => opt.value && String(opt.value) === String(resultsCountValue)) ? resultsCountValue : null
    });
  },

  onRender() {
    this.showChildView('searchTypeFilters', new RadioView({ model: this.model.get('searchTypeFiltersModel') }));
    
    let displaySort = true;
    let displayActiveDisputes = true;
    let displayResultsCount = true;
    let displayStatuses = false;
    let displayCmsStatuses = false;
    let resultsCountCss = null;
    let displayedResultsTitle = 'Initial Results';

    if (this.model.isSearchTypeStatus()) {
      displayActiveDisputes = false;
    }

    if (this.model.isSearchTypeCrossApp()) {
      // If Cross App Search is active
      displaySort = false;
      displayActiveDisputes = false;
      displayResultsCount = false;
    }

    if (this.model.isSearchTypeCMS()) {
      // If CMS Archive Search is active
      displayStatuses = false;
      displayCmsStatuses = true;
      displayActiveDisputes = false;
      displaySort = false;
      resultsCountCss = 'sort-results-row-active-count--next-row';
      displayedResultsTitle = 'Total Results';
    }

    this.getUI('searchGeneralCriteria').show();
    this.showChildView('searchFilters', new AdvancedSearchFilters({
      model: this.model,
      displayRestrictFilters: true,
      displayActiveDisputes,
      displayResultsCount,
      displaySort,
      displayStatuses,
      displayCmsStatuses,
      resultsCountCss,
      displayedResultsTitle
    }));
    // -----


    if (this.model.isSearchTypeDisputes()) {
      this.renderSearchRegion('Search - Disputes', AdvancedSearchDisputes);
    } else if (this.model.isSearchTypeParticipants()) {
      this.renderSearchRegion('Search - Participants', AdvancedSearchParticipants);
    } else if (this.model.isSearchTypeStatus()) {
      this.renderSearchRegion('Search - Status', AdvancedSearchStatus);
    } else if (this.model.isSearchTypeHearings()) {
      this.renderSearchRegion('Search - Hearings', AdvancedSearchHearings, {
        /*
        handleSortByRestrictionsFn: (request) => {
          // For hearings, ignore the sort row for showing/hiding inactive disputes.
          // Instead, there is an option in the hearing search view for including inactive hearings - use that value here.
          const includeNotActiveHearings = request.IncludeNotActive;
          request = this.handleSortByRestrictions(request);
          request.IncludeNotActive = includeNotActiveHearings;
          return request;
        }
        */
      });
    } else if (this.model.isSearchTypeClaims()) {
      this.renderSearchRegion('Search - Issues', AdvancedSearchClaims);
    } else if (this.model.isSearchTypeFiles()) {
      // NOTE: Files search is not implemented for R1
      // this.renderSearchRegion('Search - Files');
    } else if (this.model.isSearchTypeCrossApp()) {
      this.renderSearchRegion('Search - Cross/Rep', AdvancedSearchCrossApp);
    } else if (this.model.isSearchTypeCMS()) {
      this.renderSearchRegion('Search - CMS', AdvancedSearchCMS, {
        handleDateRestrictionsFn: this.handleCmsDateRestrictions,
        handleStatusRestrictionsFn: this.handleCmsStatusRestrictions
      });
    }
  },

  onDomRefresh() {
    // If there is a previously-searched results, display them after main page renders
    if ((this.model.get('disputeCollection') || []).length) {
      this.renderSearchResults();
    }
  },

  renderSearchRegion(title, viewClass, handlingFunctions) {
    handlingFunctions = handlingFunctions || {};

    this.showChildView('generalSearchRegion', new viewClass({
      model: this.model,
      performSearch: (_.isFunction(handlingFunctions.performSearchFn) ? handlingFunctions.performSearchFn : this._performSearch).bind(this),
      performDirectSearch: (_.isFunction(handlingFunctions.performDirectSearchFn) ? handlingFunctions.performDirectSearchFn : this._performDirectSearch).bind(this),
      handleSearchResponse: (_.isFunction(handlingFunctions.handleSearchResponseFn) ? handlingFunctions.handleSearchResponseFn : this._handleSearchResponse).bind(this),
      handleDateRestrictions: (_.isFunction(handlingFunctions.handleDateRestrictionsFn) ? handlingFunctions.handleDateRestrictionsFn : this.handleDateRestrictions).bind(this),
      handleSortByRestrictions: (_.isFunction(handlingFunctions.handleSortByRestrictionsFn) ? handlingFunctions.handleSortByRestrictionsFn : this.handleSortByRestrictions).bind(this),
      handleStatusRestrictions: (_.isFunction(handlingFunctions.handleStatusRestrictionsFn) ? handlingFunctions.handleStatusRestrictionsFn : this.handleStatusRestrictions).bind(this),
    }));

    menuChannel.trigger('update:menu:item', { item_id: String(this.model.id), title });
  }

});
