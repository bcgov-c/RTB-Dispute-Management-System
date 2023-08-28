/**
 * @fileoverview - Modal that has functionality for rescheduling a booked hearing to another empty hearing
 */
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import HearingCollection from '../../../../../core/components/hearing/Hearing_collection';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import CheckboxesView from '../../../../../core/components/checkbox/Checkboxes';
import CheckboxCollection from '../../../../../core/components/checkbox/Checkbox_collection';
import RescheduleHearingListView from './RescheduleHearingList';
import template from './ModalHearingReschedule_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components//hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const HEARING_RETURN_SIZE = 10;

const modalChannel = Radio.channel('modals');
const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,

  id: 'rescheduleHearingDisputes_modal',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dateDisplay: '.modalBaseDeleteHearing-date-info',
      linkDisplay: '.modalBaseDeleteHearing-link-info',
      ownerDisplay: '.modalBaseDeleteHearing-owner-info',
      loadMore: '.addHearing-search-results-load-more',
      search: '.addHearing-search-btn'
    });
  },

  regions: {
    prioritiesRegion: '.addHearing-filter-priority',
    arbLevelsRegion: '.addHearing-filter-arbLevels',
    startDateRegion: '.addHearing-filter-min-date',
    endDateRegion: '.addHearing-filter-max-date',
    staffRegion: '.addHearing-filter-staff',

    searchResultsRegion: '.addHearing-search-results',
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.search': 'clickSearch',
      'click @ui.loadMore': 'clickLoadMore'
    });
  },

  clickSearch() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    this.forceHideLoadMore = false;
    this.count = HEARING_RETURN_SIZE;
    this.loadAvailableHearings().always(() => {
      this.render();
      this.renderHearingResults();
    });
  },

  clickLoadMore() {
    this.count += HEARING_RETURN_SIZE;
    this.loadAvailableHearings().always(() => {
      this.render();
      this.renderHearingResults();
    });
  },

  getArbLevels() {
    const ownerRoleSubType = (userChannel.request('get:user', this.model.get('hearing_owner')) || {}).getRoleSubtypeId();

    const isLevelPreSelected = (value) => {
      return (ownerRoleSubType === configChannel.request('get', 'USER_SUBGROUP_LVL1')) ||
      (ownerRoleSubType === configChannel.request('get', 'USER_SUBGROUP_LVL2') && (value === configChannel.request('get', 'USER_SUBGROUP_LVL2') || value === configChannel.request('get', 'USER_SUBGROUP_LVL3'))) ||
      (ownerRoleSubType === configChannel.request('get', 'USER_SUBGROUP_LVL3')) && value === configChannel.request('get', 'USER_SUBGROUP_LVL3')
    };

    const arbLevels = ['USER_SUBGROUP_LVL1', 'USER_SUBGROUP_LVL2'];
    const USER_ROLE_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY');
    
    return arbLevels.map(configName => {
      const value = configChannel.request('get', configName);
      return { html: USER_ROLE_TYPE_DISPLAY[value], value, checked: isLevelPreSelected(value) }
    });
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(['prioritiesRegion', 'startDateRegion', 'endDateRegion',  'staffRegion'], function(view_name) {
      const view = this.getChildView(view_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },

  initialize(options) {
    this.mergeOptions(options, ['title', 'deleteHearing', 'deleteAfterReschedule']);
    this.hearingResultsCollection = null;
    this.forceHideLoadMore = false;
    this.isAdjourned = false;
    this.count = HEARING_RETURN_SIZE;
    this.checkAdjourned();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const DISPUTE_URGENCY_DISPLAY = configChannel.request('get', 'DISPUTE_URGENCY_DISPLAY');
    const dispute_urgency = this.model.get('hearing_priority') ? this.model.get('hearing_priority') : -1;
    this.prioritiesCollection = new CheckboxCollection(_.map([
      'DISPUTE_URGENCY_EMERGENCY',
      'DISPUTE_URGENCY_REGULAR',
      'DISPUTE_URGENCY_DEFERRED',
      'DISPUTE_URGENCY_DUTY'
    ], function(config_name) {
      const value = configChannel.request('get', config_name);
      return { html: DISPUTE_URGENCY_DISPLAY[value], value, checked: dispute_urgency === value };
    }));

    this.arbLevelsCollection = new CheckboxCollection(this.getArbLevels());

    this.minDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Min Start Date',
      errorMessage: 'Enter start date',
      required: true,
      allowFutureDate: true,
      customLink: 'Today + 23 days',
      customLinkFn() {
        this.trigger('update:input', Moment().add(23, 'days').format(InputModel.getDateFormat()));
      },
      minDate: Moment(),
      value: null
    });

    this.maxDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Max End Date',
      required: false,
      cssClass: 'optional-input',
      allowFutureDate: true,
      minDate: this.minDateModel.getData() ? this.minDateModel.getData() : this.minDateModel.get('minDate'),
      value: null
    });

    this.staffModel = new DropdownModel({
      optionData: _.map(userChannel.request('get:arbs'), function(arb) { return {value: String(arb.get('user_id')), text: arb.getDisplayName() }; }),
      defaultBlank: true,
      labelText: 'Staff Member',
      required: false,
      cssClass: 'optional-input',
      value: null
    });
  },

  setupListeners() {
    this.listenTo(this.model, 'close:modal', this.close, this);
    this.listenTo(this.minDateModel, 'change:value', this.onMinDateChange, this);
  },

  checkAdjourned() {
    loaderChannel.trigger('page:load');
    hearingChannel.request('check:adjourned', this.model)
    .then(isAdjourned => {
      this.isAdjourned = isAdjourned;
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    })
  },

  onMinDateChange(minDateModel, minDateValue) {
    // Set the value on the model here initially because ".isValid()" check can't be used in change handlers as "value" is still previous
    minDateModel.set('value', minDateValue, { silent: true });

    const minDateMoment = Moment(minDateModel.getData());
    if (minDateModel.isValid()) {
      this.maxDateModel.set(_.extend({
          minDate: minDateMoment
        },
        Moment(minDateModel.getData()).isAfter(Moment(this.maxDateModel.getData()), 'days') ? { value: null } : {}
      ));

      // Always refresh the End Time view, to update the minDate
      const endDateView = this.getChildView('endDateRegion');
      if (endDateView) {
        endDateView.render();
      }
    }
  },

  loadAvailableHearings() {
    const dfd = $.Deferred();
    const originalHearingResultsLength = this.hearingResultsCollection ? this.hearingResultsCollection.length : 0;
    const dateFormat = 'YYYY-MM-DD';
    const parsedMinDate = this.minDateModel.getData({ format: 'date' });
    const isToday = this.minDateModel.get('value') && parsedMinDate === Moment().format(dateFormat);
    const MinStartDate = !this.minDateModel.get('value') ? null : `${parsedMinDate}${isToday ? `T${Moment().format('HH:mm')}` : ''}`
    loaderChannel.trigger('page:load');
    hearingChannel.request('get:available', _.extend({
        index: 0,
        count: this.count,
        IncludedPriorities: _.map(this.prioritiesCollection.getData(), function(checkbox) { return checkbox.get('value'); }),
        IncludedOwnerRoleSubtypeId: _.map(this.arbLevelsCollection.getData(), function(checkbox) { return checkbox.get('value'); })
      },
      // R1 Note: This relies on the Admin site being in the same time zone as server time - this is expected for RTB R1
      this.minDateModel.get('value') ? { MinStartDate } : {},
      this.maxDateModel.get('value') ? { MaxStartDate: Moment(this.maxDateModel.getData()).add(1, 'day').format(dateFormat) } : {},
      this.staffModel.get('value') ? { IncludedOwnerId: this.staffModel.getData({ parse: true }) } : {},
    )).done(response => {
      response = response || {};
      response.available_hearings = response.available_hearings || [];
      
      const hearingId = this.model.get('hearing_id');
      this.hearingResultsCollection = new HearingCollection(_.filter(response.available_hearings, function(hearing) {
        return hearing.hearing_id !== hearingId;
      }));

      if (this.hearingResultsCollection.length && this.hearingResultsCollection.length === originalHearingResultsLength) {
        this.forceHideLoadMore = true;
      }

      dfd.resolve(this.hearingResultsCollection);
    }).fail(dfd.reject)
    .always(() => loaderChannel.trigger('page:load:complete'));

    return dfd.promise();
  },

  checkIsHearingUnassignedAndShowWarning() {
    if (!this.model.getDisputeHearings().length) {
      this.$el.hide();
      const modalView = modalChannel.request('show:standard', {
        title: `Hearing Unassigned`,
        bodyHtml: `<p>Warning - Someone has unassigned all disputes from the hearing being rescheduled.  The system will now re-load the new information.  Your current changes have not been saved.</p>`,
        primaryButtonText: 'OK',
        hideCancelButton: true,
        onContinueFn: _modalView => _modalView.close()
      });
  
      this.listenTo(modalView, 'removed:modal', () => {
        this.model.trigger('hearings:refresh');
        this.close();
      });
    } else {
      return true;
    }
  },
 
  onRender() {
    const primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = this.model.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml({ clearModalsOnNav: true }) : '-';
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getDisputeLinkHtml({ clearModalsOnNav: true });
    }).join(',&nbsp;') : '-';

    this.getUI('linkDisplay').html(hearingDisplayLinkTemplate({
      linkTypeDisplay: this.model.getDisputeHearingLinkDisplay(),
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay
    }));

    this.getUI('dateDisplay').html(hearingDisplayDateTemplate({
      hearingStartDateDisplay: Formatter.toWeekdayShortDateYearDisplay(this.model.get('local_start_datetime')),
      hearingStartTimeDisplay: Formatter.toTimeDisplay(this.model.get('local_start_datetime')),
      durationDisplay: Formatter.toDuration(this.model.get('local_start_datetime'), this.model.get('local_end_datetime'))
    }));

    this.getUI('ownerDisplay').html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', this.model.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: this.model.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.model.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(this.model.get('hearing_priority')),
      isReserved: this.model.isReserved(),
      isAdjourned: this.isAdjourned
    }));

    this.showChildView('prioritiesRegion', new CheckboxesView({ collection: this.prioritiesCollection }));
    this.showChildView('arbLevelsRegion', new CheckboxesView({ collection: this.arbLevelsCollection }))
    this.showChildView('startDateRegion', new InputView({ model: this.minDateModel }));
    this.showChildView('endDateRegion', new InputView({ model: this.maxDateModel }));

    this.showChildView('staffRegion', new DropdownView({ model: this.staffModel }));
  },

  renderHearingResults() {
    if (!this.checkIsHearingUnassignedAndShowWarning()) {
      return;
    }

    this.showChildView('searchResultsRegion', new RescheduleHearingListView({
      parentModalView: this,
      hearingModel: this.model,
      deleteAfterReschedule: this.deleteAfterReschedule,
      collection: this.hearingResultsCollection,
    }));
  },

  templateContext() {
    return {
      showLoadMore: this.hearingResultsCollection && this.hearingResultsCollection.length &&
        this.count && this.hearingResultsCollection.length === this.count && !this.forceHideLoadMore,
      title: this.title || 'Reschedule Hearing'
    };
  }

});
