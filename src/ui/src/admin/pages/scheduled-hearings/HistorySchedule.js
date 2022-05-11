import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputModel from '../../../core/components/input/Input_model';
import InputView from '../../../core/components/input/Input';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import HistoryScheduleListView from './HistoryScheduleList';
import HearingModel from '../../../core/components/hearing/Hearing_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { routeParse } from '../../routers/mainview_router';
import template from './HistorySchedule_template.tpl';

const HEARING_VIEW_TYPE_HEARING = '1';
const HEARING_VIEW_TYPE_DISPUTE = '2';
const HEARING_VIEW_TYPE_ARB_AND_DAY = '3';
const HEARING_VIEW_TYPE_SCHEDULER_AND_DAY = '4';
const HEARING_VIEW_TYPE_DAILY_REASSIGNMENTS = '5';
const HEARING_VIEW_TYPE_DAILY_SCHEDULE_EDITS = '6';
const HEARING_VIEW_TYPE_DAILY_HEARING_EDITS = '7';
const HEARING_VIEW_TYPE_DAILY_LINKING_EDITS = '8';
const HEARING_VIEW_TYPE_ALL_DAILY = '9';

const parseUserToOptionFn = (user) => ({ value: String(user.id), text: user.getDisplayName() });

const modalChannel = Radio.channel('modals');
const searchChannel = Radio.channel('searches');
const usersChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const auditChannel = Radio.channel('audits');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  className: 'schedule-page-subview history-schedule',

  regions: {
    viewTypeRegion: '.history-schedule-view-type',

    fileNumberRegion: '.history-schedule-sub-dispute',
    arbsRegion: '.history-schedule-sub-arbs',
    schedulersRegion: '.history-schedule-sub-schedulers',
    inactiveRegion: '.history-schedule-sub-inactive-staff',
    dateRegion: '.history-schedule-sub-date',

    listRegion: '.history-schedule-list-region'
  },

  ui: {
    search: '.history-schedule-search-button'
  },

  events: {
    'click @ui.search': 'clickSearch'
  },


  clickSearch: async function() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    this.hasSearched = true;

    const prepareParamsAndPerformSearchFn = (existingParams) => {
      existingParams = existingParams || {};
      
      const selectedDate = Moment(this.dateModel.getData({ format: 'date' }));
      const startDatetimeLocal = selectedDate;
      const endDatetimeLocal = Moment(`${Moment(selectedDate).format('YYYY-MM-DD')}T23:59:59`);
      
      const searchParams = Object.assign(
        {
          SearchType: this.viewTypeModel.getData({ parse: true }),
        },
        this.hearingId ? { HearingId: this.hearingId } : {},
        this.shouldShowArbInput() ? { HearingOwner: this.arbsModel.getData({ parse: true }) } : {},
        this.shouldShowSchedulerInput() ? { CreatedBy: this.schedulersModel.getData({ parse: true }) } : {},
        this.shouldShowDateInput() ? {
          StartDate: Moment.tz(startDatetimeLocal, 'utc').toISOString(),
          EndDate: Moment.tz(endDatetimeLocal, 'utc').toISOString(),
        } : {},
        existingParams
      );
      
      auditChannel.request('load:schedulinghistory', searchParams)
        .done(hearingAuditCollection => {
          this.loaded = true;
          if (hearingAuditCollection) {
            this.hearingAuditCollection = hearingAuditCollection;
          }
          this.render();
        }).fail(err => {
          this.loaded = true;
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.AUDIT.HISTORY.LOAD', this.render.bind(this));
          handler(err);
        });
    };

    this.loaded = false;
    loaderChannel.trigger('page:load');

    if (this.isTypeDisputeSelected()) {
      const disputeGuid = await this.performFileNumberSearch();
      if (!disputeGuid) {
        const childView = this.getChildView('fileNumberRegion');
        if (childView && _.isFunction(childView.showErrorMessage)) {
          childView.showErrorMessage("Invalid DMS File Number");
        }
        loaderChannel.trigger('page:load:complete');
        return;
      }
      
      prepareParamsAndPerformSearchFn({ DisputeGuid: disputeGuid });
    } else {
      prepareParamsAndPerformSearchFn();
    }
  },

  performFileNumberSearch() {
    return new Promise((resolve, reject) => {
      searchChannel.request('search:dispute:direct', this.fileNumberModel.getData())
        .done(disputeGuid => resolve(disputeGuid))
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE', reject);
          handler(err);
        })
      });
  },

  
  validateAndShowErrors() {
    const regionsToValidate = ['viewTypeRegion', 'fileNumberRegion', 'arbsRegion', 'schedulersRegion', 'dateRegion'];
    let isValid = true;

    regionsToValidate.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && _.isFunction(view.validateAndShowErrors)) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });

    return isValid;
  },


  initialize(options) {
    this.mergeOptions(options, ['hearingId', 'fileNumber']);

    this.createSubModels();
    this.setupListeners();

    this.viewTypesWithDisputeInput = [HEARING_VIEW_TYPE_DISPUTE];
    this.viewTypesWithArbInput = [HEARING_VIEW_TYPE_ARB_AND_DAY];
    this.viewTypesWithSchedulerInput = [HEARING_VIEW_TYPE_SCHEDULER_AND_DAY];
    this.viewTypesWithInactiveCheckbox = [HEARING_VIEW_TYPE_ARB_AND_DAY, HEARING_VIEW_TYPE_SCHEDULER_AND_DAY];
    this.viewTypesWithDateInput = [HEARING_VIEW_TYPE_ARB_AND_DAY, HEARING_VIEW_TYPE_SCHEDULER_AND_DAY,
      HEARING_VIEW_TYPE_ALL_DAILY,
      HEARING_VIEW_TYPE_DAILY_HEARING_EDITS,
      HEARING_VIEW_TYPE_DAILY_LINKING_EDITS,
      HEARING_VIEW_TYPE_DAILY_REASSIGNMENTS,
      HEARING_VIEW_TYPE_DAILY_SCHEDULE_EDITS
    ];

    this.loaded = true;
    this.hearingModel = null;
    // If we were primed with a hearing ID, then run the search automatically
    if (this.hearingId) {
      this.loaded = false;
      this.hearingModel = new HearingModel({ hearing_id: this.hearingId });
      this.hearingModel.fetch()
        .then(() => {
          this.clickSearch();
        }, err => {
          err = err || {};
          this.loaded = true;

          if (err && err.status === 404) {
            modalChannel.request('show:standard', {
              title: 'Hearing Not Found',
              bodyHtml: `The hearing with ID ${this.hearingId} cannot not be found.  This is usually an indication that the hearing has been deleted.`,
              hideCancelButton: true,
              primaryButtonText: 'Close',
              onContinueFn(modalView) { modalView.close(); }
            });
          } else {  
            const handler = generalErrorFactory.createHandler('ADMIN.HEARING.LOAD');
            handler(err);
          }
        });
    } else if (this.fileNumber) {
      this.loaded = false;
      this.clickSearch();
    }
  },

  createSubModels() {

    this.viewTypeModel = new DropdownModel({
      optionData: [
        { value: HEARING_VIEW_TYPE_ARB_AND_DAY, text: 'Specific Arbitrator & Day' },
        { value: HEARING_VIEW_TYPE_DISPUTE, text: 'Specific Dispute' },
        { value: HEARING_VIEW_TYPE_HEARING, text: 'Specific Hearing' },
        { value: HEARING_VIEW_TYPE_SCHEDULER_AND_DAY, text: 'Specific Scheduler & Day' },
        { value: HEARING_VIEW_TYPE_ALL_DAILY, text: 'All Daily Changes' },
        { value: HEARING_VIEW_TYPE_DAILY_HEARING_EDITS, text: 'Daily Hearing Edits' },
        { value: HEARING_VIEW_TYPE_DAILY_LINKING_EDITS, text: 'Daily Linking Edits' },
        { value: HEARING_VIEW_TYPE_DAILY_REASSIGNMENTS, text: 'Daily Reassignments' },
        { value: HEARING_VIEW_TYPE_DAILY_SCHEDULE_EDITS, text: 'Daily Schedule Edits' },
      ],
      labelText: 'History View',
      required: true,
      value: this.hearingId ? HEARING_VIEW_TYPE_HEARING : HEARING_VIEW_TYPE_DISPUTE
    });

    this.fileNumberModel = new InputModel({
      labelText: 'File Number',
      inputType: 'dispute_number',
      maxLength: 9,
      required: this.shouldShowDisputeInput(),
      value: this.fileNumber || null
    });

    this.inactiveModel = new CheckboxModel({
      html: 'Include inactive staff',
      checked: false
    });

    this._allArbs = _.sortBy(usersChannel.request('get:arbs', { all: true }), arbModel => (arbModel.getDisplayName() || 'zzzz').toLowerCase());
    this._allSchedulers = _.sortBy(usersChannel.request('get:schedulers', { all: true }), userModel => (userModel.getDisplayName() || 'zzzz').toLowerCase());

    const arbsToUse = this.inactiveModel.getData({ parse: true }) ? this._allArbs : _.filter(this._allArbs, user => user.isActive());
    const schedulersToUse = this.inactiveModel.getData({ parse: true }) ? this._allSchedulers : _.filter(this._allSchedulers, user => user.isActive());

    this.arbsModel = new DropdownModel({
      optionData: _.map(arbsToUse, parseUserToOptionFn),
      labelText: 'Hearings Assigned To',
      defaultBlank: true,
      required: this.shouldShowArbInput()
    });


    this.schedulersModel = new DropdownModel({
      optionData: _.map(schedulersToUse, parseUserToOptionFn),
      labelText: 'Schedule Modifications By',
      defaultBlank: true,
      required: this.shouldShowSchedulerInput()
    });


    this.dateModel = new InputModel({
      inputType: 'date',
      labelText: 'Changes Date',
      required: this.shouldShowDateInput(),
      value: null
    });

  },

  setupListeners() {
    this.listenTo(this.viewTypeModel, 'change:value', function() {
      if (!this.isTypeHearingSelected() || !this.hearingModel) {
        // Always make sure to update the route to remove param when no hearing type
        const defaultHistoryScheduleRoute = routeParse('scheduled_hearings_history_item');
        if (Backbone.history.getFragment() !== defaultHistoryScheduleRoute) {
          Backbone.history.navigate(defaultHistoryScheduleRoute, { trigger: false, replace: true });
        }
        
        this.hearingId = null;
        this.hearingModel = null;
        this.fileNumber = null;
      }

      // Set date to today if none was selected
      if (this.isTypeAllDailySelected() && !this.dateModel.getData()) {
        this.dateModel.set('value', Moment().format(InputModel.getLongDateFormat()), { silent: true });
      }

      if (this.hearingAuditCollection) {
        this.hearingAuditCollection.reset([], { silent: true });
      }
      this.hasSearched = false;
      this.render();
    }, this);

    this.listenTo(this.dateModel, 'change:value', function(model, value) {
      if (!model.isValid() || !$.trim(model.getData())) {
        return;
      }
  
      model.set('value', Moment(value).format(InputModel.getLongDateFormat()));
      this.render();
    }, this);

    this.listenTo(this.inactiveModel, 'change:checked', function(model, value) {
      
      const options = { silent: true };
      if (value) {
        this.arbsModel.set('optionData', _.map(this._allArbs, parseUserToOptionFn), options);
        this.schedulersModel.set('optionData', _.map(this._allSchedulers, parseUserToOptionFn), options);
      } else {
        this.arbsModel.set('optionData', _.map(_.filter(this._allArbs, user => user.isActive()), parseUserToOptionFn), options);
        this.schedulersModel.set('optionData', _.map(_.filter(this._allSchedulers, user => user.isActive()), parseUserToOptionFn), options);
      }

      if (!this.arbsModel.getSelectedText()) {
        this.arbsModel.set('value', null, options);
      }

      if (!this.schedulersModel.getSelectedText()) {
        this.schedulersModel.set('value', null, options);
      }

      this.arbsModel.trigger('render');
      this.schedulersModel.trigger('render');
    }, this);
  },

  _isHearingTypeValueSelected(val) {
    return val && String(this.viewTypeModel.getData()) === val;
  },

  isTypeArbAndDaySelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_ARB_AND_DAY);
  },

  isTypeDisputeSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_DISPUTE);
  },

  isTypeHearingSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_HEARING);
  },

  isTypeSchedulerAndDaySelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_SCHEDULER_AND_DAY);
  },

  isTypeAllDailySelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_ALL_DAILY);
  },

  isTypeDailyHearingSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_DAILY_HEARING_EDITS);
  },

  isTypeDailyLinkingSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_DAILY_LINKING_EDITS);
  },

  isTypeDailyReassignmentsSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_DAILY_REASSIGNMENTS);
  },

  isTypeDailySchedlueEditsSelected() {
    return this._isHearingTypeValueSelected(HEARING_VIEW_TYPE_DAILY_SCHEDULE_EDITS);
  },


  shouldShowDisputeInput() {
    return _.contains(this.viewTypesWithDisputeInput || [], String(this.viewTypeModel.getData()));
  },

  shouldShowArbInput() {
    return _.contains(this.viewTypesWithArbInput || [], String(this.viewTypeModel.getData()));
  },

  shouldShowSchedulerInput() {
    return _.contains(this.viewTypesWithSchedulerInput || [], String(this.viewTypeModel.getData()));
  },

  shouldShowInactiveCheckbox() {
    return _.contains(this.viewTypesWithInactiveCheckbox || [], String(this.viewTypeModel.getData()));
  },

  shouldShowDateInput() {
    return _.contains(this.viewTypesWithDateInput || [], String(this.viewTypeModel.getData()));
  },


  onBeforeRender() {
    const options = { silent: true };

    const setConditionalValuesOnModelFn = function(model, conditionalBool, setValue=true) {
      if (!model) {
        return;
      }

      model.set(Object.assign({
        required: conditionalBool,
      }, !conditionalBool && setValue ? { value: null } : {}), options);
    };

    setConditionalValuesOnModelFn(this.fileNumberModel, this.shouldShowDisputeInput());
    setConditionalValuesOnModelFn(this.arbsModel, this.shouldShowArbInput());
    setConditionalValuesOnModelFn(this.schedulersModel, this.shouldShowSchedulerInput());
    setConditionalValuesOnModelFn(this.dateModel, this.shouldShowDateInput(), false);
  },


  onRender() {
    this.showChildView('viewTypeRegion', new DropdownView({ model: this.viewTypeModel }));
    
    const fileNumberRegion = this.showChildView('fileNumberRegion', new InputView({ model: this.fileNumberModel }));
    this.showChildView('arbsRegion', new DropdownView({ model: this.arbsModel }));
    this.showChildView('schedulersRegion', new DropdownView({ model: this.schedulersModel }));
    this.showChildView('inactiveRegion', new CheckboxView({ model: this.inactiveModel }));
    const dateRegion = this.showChildView('dateRegion', new InputView({ model: this.dateModel }));

    if (!this.loaded) {
      return;
    }

    if (this.hearingAuditCollection && this.hasSearched) {
      this.showChildView('listRegion', new HistoryScheduleListView({
        searchType: this.viewTypeModel.getData({ parse: true }),
        collection: this.hearingAuditCollection
      }));
    }

    loaderChannel.trigger('page:load:complete');

    localStorage.setItem('latestSchedulePageRoute', Backbone.history.getFragment());

    this.addEnterListener(fileNumberRegion, this.clickSearch);
    this.addEnterListener(dateRegion, this.clickSearch);    
  },

  addEnterListener(regionObject, actionFn) {
    if (regionObject && regionObject.currentView) {
      this.stopListening(regionObject.currentView, 'input:enter');
      this.listenTo(regionObject.currentView, 'input:enter', actionFn, this);
    }
  },


  templateContext() {
    const showArbInput = this.arbsModel.get('required');
    const showSchedulerInput = this.schedulersModel.get('required');
    const showInactiveStaffInput = showArbInput || showSchedulerInput;
    return {
      Formatter,
      hearingStart: this.hearingModel ? this.hearingModel.get('local_start_datetime') : null,
      hearingEnd: this.hearingModel ? this.hearingModel.get('local_end_datetime') : null,
      showDisputeInput: this.fileNumberModel.get('required'),
      showHearingInfo: this.isTypeHearingSelected(),
      showArbInput,
      showSchedulerInput,
      showInactiveStaffInput,
      showDateInput: this.dateModel.get('required')
    };
  }

});
