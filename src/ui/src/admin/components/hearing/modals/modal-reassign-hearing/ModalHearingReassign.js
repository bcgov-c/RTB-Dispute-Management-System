import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import HearingCollection from '../../../../../core/components/hearing/Hearing_collection';
import RadioModel from '../../../../../core/components/radio/Radio_model';
import RadioView from '../../../../../core/components/radio/Radio';
import ReassignHearingListView from './ReassignHearingList';
import template from './ModalHearingReassign_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components//hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';

import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const OPEN_HEARINGS_CODE = '1';
const ASSIGNED_HEARINGS_CODE = '2';

const userChannel = Radio.channel('users');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
export default ModalBaseView.extend({
  template,

  id: 'reassignHearing_modal',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dateDisplay: '.modalBaseDeleteHearing-date-info',
      linkDisplay: '.modalBaseDeleteHearing-link-info',
      ownerDisplay: '.modalBaseDeleteHearing-owner-info'
    });
  },

  regions: {
    filterRegion: '.modalReassign-filters',
    resultsRegion: '.modalReassign-results'
  },

  initialize() {
    this.availableHearings = null;
    this.allAvailableHearings = null;
    this.loading = false;
    this.isAdjourned = false;

    this.loadPageData();
  },

  loadPageData() {
    this.checkAdjourned().finally(() => this.loadDailyHearingData());
  },

  loadDailyHearingData() {
    const hearingDate = Moment(this.model.get('local_start_datetime')).format('YYYY-MM-DD');
    return hearingChannel.request('get:by:day', hearingDate).done(hearings => {
      this.loading = false;
      hearings = hearings || {};
      this.dailyHearingData = hearings.owner_hearings || [];
      this.createSubModels();
      this.setupListeners();
      this.render();
    }).fail(
      generalErrorFactory.createHandler('ADMIN.SCHEDULE.DAILY', () => {
        loaderChannel.trigger('page:load:complete');
        this.close();
      })
    );
  },

  checkAdjourned() {
    this.loading = true;
    return hearingChannel.request('check:adjourned', this.model)
    .then(isAdjourned => {
      this.isAdjourned = isAdjourned;
    });
  },

  createSubModels() {
    this.filterModel = new RadioModel({
      optionData: [{ text: 'Show open hearings', value: OPEN_HEARINGS_CODE },
        { text: 'Show assigned hearings', value: ASSIGNED_HEARINGS_CODE }],
      value: OPEN_HEARINGS_CODE
    });

    const hearingModelId = this.model.get('hearing_id');
    const parsedHearingData = [];
    const timezoneFormat = 'YYYY-MM-DDTHH:mm:ss';
    _.each(this.dailyHearingData, function(ownerHearingData) {
      _.each(ownerHearingData.hearings, function(hearingData) {
        hearingData.local_start_datetime = Moment(`${hearingData.local_start_datetime}`).format(timezoneFormat);
        hearingData.local_end_datetime = Moment(`${hearingData.local_end_datetime}`).format(timezoneFormat);
        hearingData.hearing_owner = ownerHearingData.user_id;
        if (hearingData.hearing_id !== hearingModelId) {
          parsedHearingData.push(hearingData);
        }
      });
    });
    this.allAvailableHearings = new HearingCollection(parsedHearingData);
    this.availableHearings = new HearingCollection(_.where(parsedHearingData, {
      local_start_datetime: Moment(this.model.get('local_start_datetime')).format(timezoneFormat),
      local_end_datetime: Moment(this.model.get('local_end_datetime')).format(timezoneFormat)
    }));
    this.availableHearings.reset(this.availableHearings.filter(hearing => !hearing.isReserved()));
  },

  setupListeners() {
    this.listenTo(this.filterModel, 'change:value', this.renderAvailableHearings, this);
    this.listenTo(this.availableHearings, 'close:modal', this.close, this);
  },

  
  onRender() {
    if (this.loading) {
      return;
    }

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
      isAdjourned: this.isAdjourned,
    }));

    this.showChildView('filterRegion', new RadioView({ model: this.filterModel }));
    this.renderAvailableHearings();
    loaderChannel.trigger('page:load:complete');
  },

  renderAvailableHearings() {
    const filterValue = String(this.filterModel.getData());
    const hearingModel = this.model;
    this.showChildView('resultsRegion', new ReassignHearingListView({
      filterFn: _.bind(function(model) {
        const isAssigned = model.isAssigned();
        return model.get('hearing_id') !== hearingModel.get('hearing_id') && (filterValue === ASSIGNED_HEARINGS_CODE ? isAssigned : !isAssigned);
      }, this),
      collection: this.availableHearings,
      allAvailableHearings: this.allAvailableHearings,
      hearingModel: this.model,
    }));
  }
});