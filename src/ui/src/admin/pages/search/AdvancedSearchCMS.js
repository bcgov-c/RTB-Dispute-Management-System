import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import SearchResultsListView from '../cms/AdvancedSearchCMSList';
import SearchResultItemCollection from '../../components/cms/SearchResultItemCMS_collection';
import template from './AdvancedSearchCMS_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const cmsChannel = Radio.channel('cms');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,

  regions: {
    searchResultsRegion: '.cms-search-results',
    fileNumberRegion: '.cms-file-number-search-container',
    referenceNumberRegion: '.cms-reference-number-search-container',
    disputeAddressRegion: '.cms-search-dispute-address',
    disputeCityRegion: '.cms-search-dispute-city',
    disputeApplicantRegion: '.cms-search-applicant-type',
    firstNameRegion: '.cms-search-first-name',
    lastNameRegion: '.cms-search-last-name',
    phoneRegion: '.cms-search-phone',
    emailRegion: '.cms-search-email',
    participantTypeRegion: '.cms-search-participant-type'
  },

  ui: {
    fileNumberSearch: '.cms-file-number-btn-search',
    referenceNumberSearch: '.cms-reference-number-btn-search',
    disputeSearch: '.cms-dispute-address-btn-search',
    participantSearch: '.cms-dispute-participant-btn-search'
  },

  events: {
    'click @ui.fileNumberSearch': 'clickSearchFileNumber',
    'click @ui.referenceNumberSearch': 'clickReferenceNumberSearch',
    'click @ui.disputeSearch': 'clickDisputeAddressSearch',
    'click @ui.participantSearch': 'clickSearchParticipant'
  },

  initialize(options) {
    this.mergeOptions(options, ['performSearch', 'performDirectSearch', 'handleSearchResponse', 'handleDateRestrictions', 'handleSortByRestrictions', 'handleStatusRestrictions']);
  },

  clickSearchFileNumber() {
    if (!this.getChildView('fileNumberRegion').validateAndShowErrors()) {
      return;
    }

    this.searchByRequest(_.extend(
      this._createBaseRequest(),
      {
        SearchType: 1,
        File_Number: this.model.get('cmsFileNumberModel').getData()
      }
    ));
  },

  clickReferenceNumberSearch() {
    if (!this.getChildView('referenceNumberRegion').validateAndShowErrors()) {
      return;
    }

    this.searchByRequest(_.extend(
      this._createBaseRequest(),
      {
        SearchType: 2,
        Reference_Number: this.model.get('cmsReferenceNumberModel').getData()
      }
    ));
  },

  clickDisputeAddressSearch() {
    if (!this.model.get('cmsDisputeAddressModel').getData() && !this.model.get('cmsDisputeCityModel').getData()) {
      this.getChildView('disputeAddressRegion').showErrorMessage('Please enter a city or street.');
      return;
    }

    let is_valid = true;

    const views_to_validate = ['disputeAddressRegion', 'disputeCityRegion'],
      self = this;
    _.each(views_to_validate, function(view) {
      is_valid = self.getChildView(view).validateAndShowErrors() && is_valid;
    })

    if (!is_valid) {
      return;
    }

    this.searchByRequest(_.extend(
      this._createBaseRequest(),
      { SearchType: 3 },
      this.model.get('cmsDisputeAddressModel').getData() ? { Dispute_Address: $.trim(this.model.get('cmsDisputeAddressModel').getData()).toLowerCase() } : {},
      this.model.get('cmsDisputeCityModel').getData() ? { Dispute_City: $.trim(this.model.get('cmsDisputeCityModel').getData()).toLowerCase() } : {},
      this.model.get('cmsApplicantTypeModel').getData() ? { Applicant_Type : Number(this.model.get('cmsApplicantTypeModel').getData()) } : {}
    ));
  },

  clickSearchParticipant() {
    if (!this.model.get('cmsFirstNameModel').getData() && !this.model.get('cmsLastNameModel').getData()
      && !this.model.get('cmsPhoneModel').getData() && !this.model.get('cmsEmailModel').getData()) {
        this.getChildView('firstNameRegion').showErrorMessage('Please enter a name, phone, or email.');
        return;
    }

    let is_valid = true;

    const views_to_validate = ['firstNameRegion', 'lastNameRegion', 'phoneRegion', 'emailRegion', 'participantTypeRegion'],
      self = this;
    _.each(views_to_validate, function(view) {
      is_valid = self.getChildView(view).validateAndShowErrors() && is_valid;
    });

    if (!is_valid) {
      return;
    }

    this.searchByRequest(_.extend(
      this._createBaseRequest(),
      { SearchType: 4 },
      this.model.get('cmsFirstNameModel').getData() ? { First_Name: $.trim(this.model.get('cmsFirstNameModel').getData()).toLowerCase() } : {},
      this.model.get('cmsLastNameModel').getData() ? { Last_Name: $.trim(this.model.get('cmsLastNameModel').getData()).toLowerCase() } : {},
      this.model.get('cmsPhoneModel').getData() ? { DayTime_Phone: $.trim(this.model.get('cmsPhoneModel').getData()).replace(/[^\d]/g, '').slice(-10) } : {},
      this.model.get('cmsEmailModel').getData() ? { Email_Address: $.trim(this.model.get('cmsEmailModel').getData()).toLowerCase() } : {},
      this.model.get('cmsParticipantTypeModel').getData() ? { Participant_Type : Number(this.model.get('cmsParticipantTypeModel').getData()) } : {}
    ));
  },

  _createBaseRequest() {
    return {
      index: 0,
      count: this.model.getInitialRequestCount(),
    };
  },

  searchByRequest(request) {
    loaderChannel.trigger('page:load');

    const areFiltersValid = this.handleDateRestrictions(request);
    if (!areFiltersValid) {
      loaderChannel.trigger('page:load:complete');
      return;
    }
    this.handleSortByRestrictions(request);
    this.handleStatusRestrictions(request);

    delete (request || {}).IncludeNotActive;
    cmsChannel.request('search', request).done(response => {
      loaderChannel.trigger('page:load:complete');
      this.model.set('cmsSearchIndex', 1);
      this.model.set('cmsArchiveCollection', new SearchResultItemCollection(response));
      this.model.set('cmsArchiveDisplayedCollection', this.model.get('cmsArchiveCollection'));
      this.renderSearchResults();
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.CMS.SEARCH', () => this.renderSearchResults());
      handler(err);
    });
  },

  renderSearchResults() {
    this.showChildView('searchResultsRegion', new SearchResultsListView({
      collection: this.model.get('cmsArchiveDisplayedCollection'),
      searchType: `CMS Archive Search Results - Viewing ${this.model.get('cmsArchiveDisplayedCollection').length}/${this.model.get('cmsArchiveCollection').length}`
    }));
  },

  onRender() {
    const fileNumberRegion = this.showChildView('fileNumberRegion', new InputView({ model: this.model.get('cmsFileNumberModel') }));
    const referenceNumberRegion = this.showChildView('referenceNumberRegion', new InputView({ model: this.model.get('cmsReferenceNumberModel') }));
    const disputeAddressRegion = this.showChildView('disputeAddressRegion', new InputView({ model: this.model.get('cmsDisputeAddressModel') }));
    const disputeCityRegion = this.showChildView('disputeCityRegion', new InputView({ model: this.model.get('cmsDisputeCityModel') }));
    const firstNameRegion = this.showChildView('firstNameRegion', new InputView({ model: this.model.get('cmsFirstNameModel') }));
    const lastNameRegion = this.showChildView('lastNameRegion', new InputView({ model: this.model.get('cmsLastNameModel') }));
    const phoneRegion = this.showChildView('phoneRegion', new InputView({ model: this.model.get('cmsPhoneModel') }));
    const emailRegion = this.showChildView('emailRegion', new InputView({ model: this.model.get('cmsEmailModel') }));

    this.showChildView('disputeApplicantRegion', new DropdownView({ model: this.model.get('cmsApplicantTypeModel') }));
    this.showChildView('participantTypeRegion', new DropdownView({ model: this.model.get('cmsParticipantTypeModel') }));

    this.addEnterListener(fileNumberRegion, this.clickSearchFileNumber);
    this.addEnterListener(referenceNumberRegion, this.clickReferenceNumberSearch);
    this.addEnterListener(disputeAddressRegion, this.clickDisputeAddressSearch);
    this.addEnterListener(disputeCityRegion, this.clickDisputeAddressSearch);
    this.addEnterListener(firstNameRegion, this.clickSearchParticipant);
    this.addEnterListener(lastNameRegion, this.clickSearchParticipant);
    this.addEnterListener(phoneRegion, this.clickSearchParticipant);
    this.addEnterListener(emailRegion, this.clickSearchParticipant);

    this.addRemoveErrorStylesListener(disputeAddressRegion, disputeCityRegion);
    this.addRemoveErrorStylesListener(disputeCityRegion, disputeAddressRegion);
    this.addRemoveErrorStylesListener(firstNameRegion, [lastNameRegion, phoneRegion, emailRegion]);
    this.addRemoveErrorStylesListener(lastNameRegion, [firstNameRegion, phoneRegion, emailRegion]);
    this.addRemoveErrorStylesListener(phoneRegion, [firstNameRegion, lastNameRegion, emailRegion]);
    this.addRemoveErrorStylesListener(emailRegion, [firstNameRegion, lastNameRegion, phoneRegion]);

    if (this.model.get('cmsArchiveDisplayedCollection') && this.model.get('cmsArchiveDisplayedCollection').length) {
      this.renderSearchResults();
    }
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  },

  addRemoveErrorStylesListener(regionObject, linkedRegionsToClear) {
    if (!_.isArray(linkedRegionsToClear)) {
      linkedRegionsToClear = linkedRegionsToClear ? [linkedRegionsToClear] : [];
    }

    if (regionObject && regionObject.currentView && regionObject.currentView.model) {
      this.stopListening(regionObject.currentView, 'change:value');
      this.listenTo(regionObject.currentView.model, 'change:value', function() {
        _.each(linkedRegionsToClear, function(linkedRegion) {
          if (linkedRegion && linkedRegion.currentView && _.isFunction(linkedRegion.currentView.removeErrorStyles)) {
            linkedRegion.currentView.removeErrorStyles();
          }
        });
      }, this);
    }
  }
});
