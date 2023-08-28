import Radio from 'backbone.radio';
import React from 'react';
import PageView from '../../../core/components/page/Page';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import RadioView from '../../../core/components/radio/Radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import SearchResultItemCollection from '../../components/search/SearchResultItem_collection';
import DashboardDisputeListView from '../dashboard-disputes/DashboardDisputeList';
import { QUEUE_USER_NAMES } from '../../../core/components/user/UserManager';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './MyActivitiesPage.scss';
import HeaderIcon from '../../static/Icon_Header_RecentActivity.png';

const Formatter = Radio.channel('formatter').request('get');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const searchChannel = Radio.channel('searches');
const configChannel = Radio.channel('config');
const emailsChannel = Radio.channel('emails');

const DATE_RANGE_BEFORE_VALUE = '1';
const DATE_RANGE_AFTER_VALUE = '2';
const DATE_RANGE_BETWEEN_VALUE = '3';

const ACTIVITY_TYPE_DISPUTES = 1;
const ACTIVITY_TYPE_COMMUNICATIONS = 2;
const ACTIVITY_TYPE_NOTES = 3;
const ACTIVITY_TYPE_DOCUMENTS = 4;

const EMAIL_TEMPLATE_GROUP_ALL = '1';

const DISPUTES_SEARCH_HEADER_TEXT = 'Recent disputes that were assigned to the selected staff member but not assigned now';
const COMMUNICATIONS_SEARCH_HEADER_TEXT = 'Recent disputes with communications created by the selected staff member';
const NOTES_SEARCH_HEADER_TEXT = 'Recent disputes that have notes created by the selected staff member';
const DOCUMENTS_SEARCH_HEADER_TEXT = 'Recent disputes that have outcome documents created by the selected staff member';

const DISPUTES_SEARCH_FILTER_LABEL_TEXT = 'Stage of Ownership';
const COMMUNICATIONS_SEARCH_FILTER_LABEL_TEXT = 'Template Group';
const NOTES_SEARCH_FILTER_LABEL_TEXT = 'Note Type';
const DOCUMENTS_SEARCH_FILTER_LABEL_TEXT = 'Document Type';

const MyActivitiesPage = PageView.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    
    this.dashboardGroup = this.model.get('menu')?.activeDashboardGroup;
    this.currentUser = sessionChannel.request('get:user') || null;
    this.users = [];
    this.disputeCollection = new SearchResultItemCollection();
    this.EMAIL_TEMPLATE_GROUP_NODRP = configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_NODRP');
    this.EMAIL_TEMPLATE_GROUP_NEEDS_UPDATE = configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_UPDATE');

    this.setUser()
    this.createSubModels();
    this.setupListeners();

    this.loadActivities();
  },

  setUser() {
    // Dual dashboard users see Arb + IO users in the list, since task page is agnostic to user
    if (this.currentUser && (this.currentUser.isArbitratorLead() || this.currentUser.get('dashboard_access'))) {
      this.users = [...this.users, ...userChannel.request('get:arbs', {queue_users: true})];
    }
    if (this.currentUser && (this.currentUser.isInformationOfficerLead() || this.currentUser.get('dashboard_access'))) {
      this.users = [...this.users, ...userChannel.request('get:ios', {queue_users: true})];
    }
    
    // Ensure queue users are at the top of the list
    const queueUsers = [];
    const nonQueueUsers = [];
    this.users.forEach(user => {
      if ((QUEUE_USER_NAMES || []).includes(user.getUsername())) queueUsers.push(user);
      else nonQueueUsers.push(user);
    });
    this.users = [...queueUsers, ...nonQueueUsers]

    if (!this.users.length && this.currentUser) this.users = [this.currentUser];
  },

  createSubModels() {
    const cachedData = this.model.get('myRecentActivity');
    const taskOwnerOptions = (this.users || []).map(user => ({ value: String(user.get('user_id')), text: user.getDisplayName() }) );
    this.activityOwnerModel = new DropdownModel({
      optionData: taskOwnerOptions,
      labelText: '',
      disabled: this.users.length <= 1,
      defaultBlank: false,
      value: cachedData?.filter_activityOwner && this.users.length > 1 ? cachedData?.filter_activityOwner :
             this.currentUser ? String(this.currentUser.id) : 
             null,
      apiMapping: '',
    });
    const activityOptionData = this.getActivityTypeOptions();
    this.activityTypeModel = new RadioModel({
      optionData: activityOptionData,
      required: true,
      value: cachedData?.filter_activityType && activityOptionData.some(activities => activities.value === cachedData?.filter_activityType) ? cachedData?.filter_activityType : 
             this.dashboardGroup === 'io_dashboard' ? ACTIVITY_TYPE_COMMUNICATIONS : ACTIVITY_TYPE_DOCUMENTS
    });

    this.activityFilterModel = new DropdownModel({
      optionData: this.getActivityFilterOptions(),
      labelText: '',
      defaultBlank: false,
      value: cachedData?.filter_activityFilter || null,
      apiMapping: '',
    });

    this.dateRangeModel = new DropdownModel({
      optionData: [
        { text: 'Before', value: DATE_RANGE_BEFORE_VALUE },
        { text: 'After', value: DATE_RANGE_AFTER_VALUE },
        { text: 'In Between', value: DATE_RANGE_BETWEEN_VALUE }
      ],
      labelText: '',
      defaultBlank: true,
      value: cachedData?.filter_dateRange || null,
      apiMapping: '',
    });

    this.dateFirstModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: cachedData?.filter_dateFirst || null,
      required: false,
      disabled: true
    });

    this.dateSecondModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: cachedData?.filter_dateSecond || null,
      required: false,
      disabled: true
    });

    this.resultsCountModel = new DropdownModel({
      optionData: [
        { text: '40', value: '40' },
        { text: '60', value: '60' },
        { text: '80', value: '80' },
        { text: '100', value: '100' }
      ],
      labelText: '',
      defaultBlank: false,
      value: cachedData?.filter_resultsCount || '40',
      apiMapping: '',
    });
  },

  setupListeners() {
    this.listenTo(this.activityOwnerModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadActivities();
    });
    this.listenTo(this.activityTypeModel, 'change:value', () => {
      this.activityFilterModel.set({ optionData: this.getActivityFilterOptions(), value: '1' });
      this.activityFilterModel.trigger('render');
      this.cacheFilterData();
      this.loadActivities();
    });

    this.listenTo(this.activityFilterModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadActivities();
    });
    this.listenTo(this.dateRangeModel, 'change:value', (model, value) => {
      this.dateFirstModel.set({ disabled: !value });
      this.dateFirstModel.trigger('render');

      this.dateSecondModel.set({ disabled: value !== DATE_RANGE_BETWEEN_VALUE });
      this.dateSecondModel.trigger('render');
      this.dateSearch();
    });
    this.listenTo(this.dateFirstModel, 'change:value', () => this.dateSearch());
    this.listenTo(this.dateSecondModel, 'change:value', () => this.dateSearch());
    this.listenTo(this.resultsCountModel, 'change:value', () => {
      this.cacheFilterData();
      this.loadActivities();
    });
  },

  dateSearch() {
    const dateRange = this.dateRangeModel.getData();
    const isFirstDateValid = this.dateFirstModel.isValid() && !!this.dateFirstModel.getData();
    const isSecondDateValid = this.dateSecondModel.isValid() && !!this.dateSecondModel.getData();
    
    if (isFirstDateValid) {
      this.dateSecondModel.set({ minDate: Moment(this.dateFirstModel.getData()).add(1, 'day') });
      this.dateSecondModel.trigger('render');
    }

    if (isSecondDateValid && dateRange === DATE_RANGE_BETWEEN_VALUE) {
      this.dateFirstModel.set({ maxDate: Moment(this.dateSecondModel.getData()).subtract(1, 'day') });
      this.dateFirstModel.trigger('render');
    } else {
      this.dateFirstModel.set({ maxDate: Moment() });
      this.dateSecondModel.set({ value: null });
      this.dateFirstModel.trigger('render');
      this.dateSecondModel.trigger('render');
    }
    
    if ((dateRange === DATE_RANGE_AFTER_VALUE || dateRange === DATE_RANGE_BEFORE_VALUE) && isFirstDateValid) this.loadActivities();
    else if (dateRange === DATE_RANGE_BETWEEN_VALUE && isFirstDateValid && isSecondDateValid) this.loadActivities();
    else if (!dateRange) {
      this.dateFirstModel.set({ value: null });
      this.dateFirstModel.trigger('render');
      this.loadActivities();
    }
    this.cacheFilterData();
  },

  loadActivities() {
    let options = Object.assign({},
      { count: this.resultsCountModel.getData() },
      this.getDateApiData()
    )

    let searchType = '';
    let errorHandler = '';
    const activitiesValue = this.activityTypeModel.getData();
    const selectedUserId = this.activityOwnerModel.getData() ? this.activityOwnerModel.getData() : null;

    if (!selectedUserId || !activitiesValue) return;

    if (activitiesValue === ACTIVITY_TYPE_DISPUTES) {
      searchType = 'search:dispute:statusOwners';
      errorHandler = 'ADMIN.SEARCH.DISPUTE.STATUS';
      options = Object.assign(options,
        { OwnedBy: selectedUserId },
        (this.activityFilterModel.getSelectedOption() || {}).Stages ? { Stages: this.activityFilterModel.getSelectedOption().Stages } : {},
      );
    } else if (activitiesValue === ACTIVITY_TYPE_COMMUNICATIONS) {
      searchType = 'search:dispute:messageOwners';
      errorHandler = 'ADMIN.SEARCH.DISPUTE.MESSAGES';
      options = Object.assign(options,
        { CreatedBy: selectedUserId },
        (this.activityFilterModel.getSelectedOption() || {}).TemplateIds ? { TemplateIds: this.activityFilterModel.getSelectedOption().TemplateIds } : {},
      );
    } else if (activitiesValue === ACTIVITY_TYPE_NOTES) {
      searchType = 'search:dispute:noteOwners';
      errorHandler = 'ADMIN.SEARCH.DISPUTE.NOTES';
      options = Object.assign(options,
        { OwnedBy: selectedUserId },
        (this.activityFilterModel.getSelectedOption() || {}).NoteLinkedTo ? { NoteLinkedTo: this.activityFilterModel.getSelectedOption().NoteLinkedTo } : {},
      );
    } else if (activitiesValue === ACTIVITY_TYPE_DOCUMENTS) {
      searchType = 'search:dispute:documentOwners';
      errorHandler = 'ADMIN.SEARCH.DISPUTE.DOCUMENTS';
      options = Object.assign(options,
        { OwnedBy: selectedUserId },
        (this.activityFilterModel.getSelectedOption() || {}).FileType ? { FileType: this.activityFilterModel.getSelectedOption().FileType } : {},
      );
    }

    loaderChannel.trigger('page:load');
    searchChannel.request(searchType, options).then((searchResultCollection) => {
      this.disputeCollection = searchResultCollection;
      this.render();
    })
    .catch(generalErrorFactory.createHandler(errorHandler))
    .finally(() => loaderChannel.trigger('page:load:complete'));
  },

  cacheFilterData() {
    this.model.set({
      myRecentActivity: {
        filter_activityOwner: this.activityOwnerModel.getData(),
        filter_activityType: this.activityTypeModel.getData(),
        filter_activityFilter: this.activityFilterModel.getData(),
        filter_dateRange: this.dateRangeModel.getData(),
        filter_dateFirst: this.dateFirstModel.getData(),
        filter_dateSecond: this.dateSecondModel.getData(),
        filter_resultsCount: this.resultsCountModel.getData()
      }
    })
  },

  getDateApiData() {
    const activitiesValue = this.activityTypeModel.getData();
    const dateFirstModel = this.dateFirstModel.getData();
    const dateSecondModel = this.dateSecondModel.getData();

    if (this.dateRangeModel.getData() == DATE_RANGE_BEFORE_VALUE) {
      if (activitiesValue === ACTIVITY_TYPE_DISPUTES) return { StatusStartDateLessThan: dateFirstModel };
      else return { CreatedDateLessThan: dateFirstModel };

    } else if (this.dateRangeModel.getData() == DATE_RANGE_BETWEEN_VALUE) {
      if (activitiesValue === ACTIVITY_TYPE_DISPUTES) return { StatusStartDateGreaterThan: dateFirstModel, StatusStartDateLessThan: dateSecondModel };
      else return { CreatedDateGreaterThan: dateFirstModel, CreatedDateLessThan: dateSecondModel };

    } else if (this.dateRangeModel.getData() == DATE_RANGE_AFTER_VALUE) {
      if (activitiesValue === ACTIVITY_TYPE_DISPUTES) return { StatusStartDateGreaterThan: dateFirstModel };
      else return { CreatedDateGreaterThan: dateFirstModel };
    } else {
      return {};
    }
  },

  getActivityFilterOptions() {
    const EMAIL_TEMPLATES_CONFIG = configChannel.request('get', 'EMAIL_TEMPLATES_CONFIG');
    const loadedTemplates = emailsChannel.request('get:templates');
    const nodrpTemplateIds = loadedTemplates.filter(t => t.get('template_group') === this.EMAIL_TEMPLATE_GROUP_NODRP);
    const needsUpdateTemplateIds = loadedTemplates.filter(t => t.get('template_group') === this.EMAIL_TEMPLATE_GROUP_NEEDS_UPDATE);
    const allTemplateIds = Object.keys(EMAIL_TEMPLATES_CONFIG);

    const NOTE_LINK_DISPUTE = configChannel.request('get', 'NOTE_LINK_DISPUTE');
    const NOTE_LINK_PARTICIPANT = configChannel.request('get', 'NOTE_LINK_PARTICIPANT');
    const NOTE_LINK_CLAIM = configChannel.request('get', 'NOTE_LINK_CLAIM');
    const NOTE_LINK_FILEDESCRIPTION = configChannel.request('get', 'NOTE_LINK_FILEDESCRIPTION');
    const NOTE_LINK_NOTICE = configChannel.request('get', 'NOTE_LINK_NOTICE');
    const NOTE_LINK_HEARING = configChannel.request('get', 'NOTE_LINK_HEARING');
    const NOTE_LINK_EVIDENCE = configChannel.request('get', 'NOTE_LINK_EVIDENCE');
    const NOTE_LINK_DISPUTE_INFO = configChannel.request('get', 'NOTE_LINK_DISPUTE_INFO');
    const NOTE_LINK_EVIDENCE_FILE = configChannel.request('get', 'NOTE_LINK_EVIDENCE_FILE');
    const NOTE_LINK_DECISION_FILE = configChannel.request('get', 'NOTE_LINK_DECISION_FILE');

    const disputeStatusOptions = [
      { text: 'All Stages', value: '1' },
      { text: 'Application Screening', value: '2', Stages: [2] },
      { text: 'Hearing', value: '3', Stages: [8] },
      { text: 'Decisions and Post Support', value: '4', Stages: [10] }
    ];

    const disputeCommunicationsOptions = [
      { text: 'All Templates', value: String(EMAIL_TEMPLATE_GROUP_ALL), TemplateIds: allTemplateIds },
      { text: 'NODRP', value: String(this.EMAIL_TEMPLATE_GROUP_NODRP), TemplateIds: nodrpTemplateIds },
      { text: 'Needs Update', value: String(this.EMAIL_TEMPLATE_GROUP_NEEDS_UPDATE), TemplateIds: needsUpdateTemplateIds },
    ]

    const disputeNotesOptions = [
      { text: 'All Notes', value: '1' },
      { text: 'General', value: '2', NoteLinkedTo: [NOTE_LINK_DISPUTE] },
      { text: 'Dispute', value: '3', NoteLinkedTo: [NOTE_LINK_DISPUTE_INFO] },
      { text: 'Participant', value: '4', NoteLinkedTo: [NOTE_LINK_PARTICIPANT] },
      { text: 'Issue', value: '5', NoteLinkedTo: [NOTE_LINK_CLAIM] },
      { text: 'Notice', value: '6', NoteLinkedTo: [NOTE_LINK_NOTICE] },
      { text: 'Hearing', value: '7', NoteLinkedTo: [NOTE_LINK_HEARING] },
      { text: 'Evidence', value: '8', NoteLinkedTo: [NOTE_LINK_FILEDESCRIPTION, NOTE_LINK_EVIDENCE, NOTE_LINK_EVIDENCE_FILE, NOTE_LINK_DECISION_FILE] }
    ];

    const disputeDocumentsOptions = [
      { text: 'All Documents', value: '1' },
      { text: 'Standard Decisions', value: '2', FileType: configChannel.request('get', 'file_types_standard_decision') },
      { text: 'Monetary Orders', value: '3', FileType: configChannel.request('get', 'file_types_monetary_order') },
      { text: 'Orders of Possession', value: '4', FileType: configChannel.request('get', 'file_types_order_of_possession') },
      { text: 'Corrections Clarifications', value: '5', FileType: configChannel.request('get', 'file_types_corrections_clarifications') },
      { text: 'Review Consideration Requests', value: '6', FileType: configChannel.request('get', 'file_types_review') },
      { text: 'Interim Decisions', value: '7', FileType: configChannel.request('get', 'file_types_interim_decisions') },
      { text: 'Other Documents', value: '8', FileType: configChannel.request('get', 'file_types_other_search_documents') },
    ]

    if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DISPUTES) return disputeStatusOptions;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_COMMUNICATIONS) return disputeCommunicationsOptions;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_NOTES) return disputeNotesOptions;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DOCUMENTS) return disputeDocumentsOptions;
  },

  getActivityTypeOptions() {
    const arbActivityOptions = [
      { text: 'Disputes', value: ACTIVITY_TYPE_DISPUTES },
      ...(this.dashboardGroup === 'io_dashboard' ? [{ text: 'Communications', value: ACTIVITY_TYPE_COMMUNICATIONS }] : []),
      { text: 'Notes', value: ACTIVITY_TYPE_NOTES },
      { text: 'Outcome Documents', value: ACTIVITY_TYPE_DOCUMENTS }
    ];

    return arbActivityOptions;
  },

  getSearchHeaderText() {
    let searchHeaderText = '';
    const totalAvailable = this.disputeCollection.totalAvailable || 0;
    const collectionLength = this.disputeCollection.length || 0;
    if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DISPUTES) searchHeaderText = DISPUTES_SEARCH_HEADER_TEXT
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_COMMUNICATIONS) searchHeaderText = COMMUNICATIONS_SEARCH_HEADER_TEXT;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_NOTES) searchHeaderText = NOTES_SEARCH_HEADER_TEXT;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DOCUMENTS) searchHeaderText = DOCUMENTS_SEARCH_HEADER_TEXT;

    return searchHeaderText.concat(` - Viewing ${collectionLength}/${totalAvailable}`);
  },

  getFilterLabelText() {
    if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DISPUTES) return DISPUTES_SEARCH_FILTER_LABEL_TEXT;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_COMMUNICATIONS) return COMMUNICATIONS_SEARCH_FILTER_LABEL_TEXT;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_NOTES) return NOTES_SEARCH_FILTER_LABEL_TEXT;
    else if (this.activityTypeModel.getData() === ACTIVITY_TYPE_DOCUMENTS) return DOCUMENTS_SEARCH_FILTER_LABEL_TEXT;
  },

  onRender() {
    this.showChildView('activityOwnerRegion', new DropdownView({ model: this.activityOwnerModel }));
    this.showChildView('activityTypeRegion', new RadioView({ model: this.activityTypeModel }));
    this.showChildView('activityFilterRegion', new DropdownView({ model: this.activityFilterModel }));
    this.showChildView('activityDateRangeRegion', new DropdownView({ model: this.dateRangeModel }));
    this.showChildView('activityDateFirstRegion', new InputView({ model: this.dateFirstModel }));
    this.showChildView('activityDateSecondRegion', new InputView({ model: this.dateSecondModel }));
    this.showChildView('activityResultsCountRegion', new DropdownView({ model: this.resultsCountModel }));

    this.showChildView('activityDisputeListRegion', new DashboardDisputeListView({ collection: this.disputeCollection, showReassignButtons: false, showUnassignedOnly: false, hideSearchHeader: true }));
  },

  regions: {
    activityOwnerRegion: '.my-activities__owner',
    activityTypeRegion: '.my-activities__type',
    activityFilterRegion: '.my-activities__filter',
    activityDateRangeRegion: '.my-activities__date-range',
    activityDateFirstRegion: '.my-activities__date-first',
    activityDateSecondRegion: '.my-activities__date-second',
    activityResultsCountRegion: '.my-activities__results-count',
    activityDisputeListRegion: '.my-activities__dispute-list'
  },

  template() {
    return (
      <>
        <div className="header-page-title-container">
          <div className="header-page-title"><img src={HeaderIcon}/>My Recent Activity</div>
          <div className="subpage dispute-overview-header-right-container">
          <div className="dispute-overview-header-right">
            <div className="dispute-overview-refresh-item">
              <span className="dispute-overview-refresh-text">{Formatter.toLastModifiedTimeDisplay(Moment())}</span>
              <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.loadActivities()}></div>
            </div>
          </div>
        </div>
        </div>
        
        <div className="my-activities__filters general-filters-row general-filters-row--dark">
          <div className="my-activities__left-filters">
            <div className="my-activities__owner"></div>
            <div className="my-activities__type"></div>
          </div>
          <div className="my-activities__right-filters">
            <span className="my-activities__filter__label">{this.getFilterLabelText()}</span><div className="my-activities__filter"></div>
          </div>
        </div>

        <div className="my-activities__general-filters general-filters-row">
          <div className="my-activities__date-range"></div>
          <div className="my-activities__date-first"></div>
          <div className="my-activities__date-second"></div>
          <span className="my-activities__results-count__label">Results</span>
          <div className="my-activities__results-count"></div>
        </div>

        <div className="search-header my-activities__search-header">{this.getSearchHeaderText()}</div>
        <div className="my-activities__dispute-list"></div>
      </>
    )
  }
})

_.extend(MyActivitiesPage.prototype, ViewJSXMixin);
export default MyActivitiesPage;