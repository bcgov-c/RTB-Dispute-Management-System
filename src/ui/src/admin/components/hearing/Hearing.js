import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { routeParse } from '../../routers/mainview_router';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import { HearingParticipation as HearingParticipationView } from './HearingParticipation';
import HearingParticipationHearingToolsView from './HearingParticipationHearingTools';
import ModalEditHearingLinkView from './modals/modal-edit-hearing-link/ModalEditHearingLink';
import ModalHearingReassignView from './modals/modal-reassign-hearing/ModalHearingReassign';
import ModalHearingRescheduleView from './modals/modal-reschedule-hearing/ModalHearingReschedule';
import ModalUnassignHearingView from './modals/modal-hearing-deletes/ModalUnassignHearing';
import FileDisplay from '../../pages/common-files/FileDisplay';
import template from './Hearing_template.tpl';
import hearingDisplayLinkTemplate from '../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../user-level/UserLevel';

const noticeChannel = Radio.channel('notice')
const disputeChannel = Radio.channel('dispute');
const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const hearingChannel = Radio.channel('hearings');
const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'hearing-item-container clearfix',

  regions: {
    hearingNoteRegion: '.hearing-note',
    hearingEndTimeRegion: '.hearing-end-time',
    hearingPriorityRegion: '.hearing-priority-edit',
    hearingParticipationsDisplayRegion: '.hearing-participation-view',
    hearingParticipationsRegion: '.hearing-participations-hearing-tools',
    hearingRecordingRegion: '.hearing-recording-file'
  },

  ui: {
    linkDisplay: '.hearing-link-display',
    ownerDisplay: '.hearing-owner-display',
    priorityWarning: '.hearing-priority-edit-warning',
  },

  _getPriorityOptions() {
    return _.map(['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED', 'DISPUTE_URGENCY_DUTY'],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toUrgencyDisplay(value) };
      });
  },

  initialize(options) {
    this.mergeOptions(options, ['unitCollection', 'hearingRecording']);
    const hearingId = this.model.get('hearing_id');
    this.hasMatchingNotice = noticeChannel.request('get:all').any( (noticeModel) => hearingId && hearingId === noticeModel.get('hearing_id') );

    this.createSubModels();
    this.setupListeners();
    this.setEditGroups();
  },

  reinitialize() {
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.hearingNoteModel = new InputModel({
      inputType: 'text',
      labelText: 'Hearing Note',
      cssClass: 'optional-input',
      required: false,
      value: this.model.get('hearing_note'),
      apiMapping: 'hearing_note'
    });

    this.hearingPriorityModel = new DropdownModel({
      optionData: this._getPriorityOptions(),
      labelText: 'Hearing Priority',
      required: true,
      defaultBlank: true,
      value: this.model.get('hearing_priority') ? String(this.model.get('hearing_priority')) : null,
      apiMapping: 'hearing_priority'
    });

    this.hearingEndTimeModel = new InputModel({
      inputType: 'time',
      labelText: 'End Time',
      errorMessage: 'End time is required',
      minTime: Moment(this.model.get('local_start_datetime')).add(30, 'minutes').format(InputModel.getTimeFormat()),
      maxTime: configChannel.request('get', 'HEARING_MAX_BOOKING_TIME'),
      required: true,
      value: Moment(this.model.get('local_end_datetime')).format(InputModel.getTimeFormat())
    });
  },

  setupListeners() {
    this.listenTo(this.hearingPriorityModel, 'change:value', function(model, value) {
      const uiEle = this.getUI('priorityWarning');
      if (!uiEle) {
        return;
      }
      if (this.model.isPriorityDuty() && value && value !== String(configChannel.request('get', 'DISPUTE_URGENCY_DUTY'))) {
        uiEle.show();
      } else {
        uiEle.hide();
      }
    }, this);
  },
  

  setEditGroups() {
    this.activeEditGroup = ['hearingPriorityRegion', 'hearingEndTimeRegion', 'hearingNoteRegion'];
    this.inactiveEditGroup = ['hearingNoteRegion'];
  },

  resetModelValues() {
    this.model.resetModel();
    this.reinitialize();
  },

  _showHearingActionModal(hearingActionModalClass) {
    if (Moment(this.model.get('hearing_end_datetime')).isBefore(Moment(), 'minutes')) {
      const modalView = modalChannel.request('show:standard', {
        title: 'Hearing Has Passed',
        bodyHtml: `<p>This hearing's end time has passed and the page will now refresh to show the latest hearing information.</p>`,
        hideCancelButton: true,
        primaryButtonText: 'Continue',
        onContinueFn(modalView) { modalView.close(); }
      });
      this.listenTo(modalView, 'removed:modal', () => this.model.trigger('hearings:refresh'));      
      return;
    }

    const showHearingModalFn = () => {
      const hearingActionModalView = new hearingActionModalClass({ model: this.model });
      this.listenTo(hearingActionModalView, 'save:complete', function() {
        modalChannel.request('remove', hearingActionModalView);
        this.model.trigger('hearings:refresh');
      }, this);
      modalChannel.request('add', hearingActionModalView);
    };

    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.checkEditInProgressPromise().then(
        showHearingModalFn,
        () => dispute.showEditInProgressModalPromise()
      );
    } else {
      showHearingModalFn();
    }
    
  },

  onMenuUnassign() {
    this._showHearingActionModal(ModalUnassignHearingView);
  },

  onMenuEditLinked() {
    this._showHearingActionModal(ModalEditHearingLinkView);
  },

  onMenuReschedule() {
    this._showHearingActionModal(ModalHearingRescheduleView);
  },

  onMenuReassign() {
    this._showHearingActionModal(ModalHearingReassignView);
  },

  onMenuEditCurrent() {
    this.switchToEditState(this.activeEditGroup);
  },

  onMenuEditNonCurrent() {
    this.switchToEditState(this.inactiveEditGroup);
  },

  onMenuSaveCurrent() {
    this._onMenuSave(this.activeEditGroup);
  },

  onMenuSaveNonCurrent() {
    this._onMenuSave(this.inactiveEditGroup);
  },

  onMenuViewSchedule() {
    const hearingDate = Moment(this.model.get('local_start_datetime')).format('YYYY-MM-DD');
    Backbone.history.navigate(routeParse('scheduled_hearings_daily_param_item', null, hearingDate), { trigger: true });
  },

  onMenuViewHistory() {
    Backbone.history.navigate(routeParse('scheduled_hearings_history_param_item', null, this.model.id), { trigger: true });
  },

  _onMenuSave(editGroup) {
    if (!this.validateAndShowErrors(editGroup)) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length > 0) {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', { is_page_item: true });
      }
      return false;
    }

    this.saveInternalSaveDataToHearingModel(editGroup);
    this._saveData();
  },

  validateAndShowErrors(editGroup) {
    let is_valid = true;
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = component.validateAndShowErrors() && is_valid;
      }
    }, this);

    const localStartTime = Moment(Moment(this.model.get('local_start_datetime')).format(InputModel.getTimeFormat()), InputModel.getTimeFormat());
    const newLocalEndTime = Moment(this.hearingEndTimeModel.getData(), InputModel.getTimeFormat());

    if (!newLocalEndTime.isAfter(localStartTime, 'minutes')) {
      const endTimeView = this.getChildView('hearingEndTimeRegion');
      if (endTimeView) {
        is_valid = false;
        endTimeView.showErrorMessage('End time cannot be before start time');
      }
    }
    return is_valid;
  },

  saveInternalSaveDataToHearingModel(editGroup) {
    if (!this.validateAndShowErrors(editGroup)) {
      return false;
    }

    // Save all the view data into the hearing model
    const api_changes = {};
    _.each(editGroup, function(component_name) {
      if (component_name === 'hearingEndTimeRegion') {
        // Handle end time changes after this
        return;
      }

      const component = this.getChildView(component_name);
      if (component) {
        if (component instanceof EditableComponentView) {
          _.extend(api_changes, component.getApiData());
        } else {
          _.extend(api_changes, component.model.getPageApiDataAttrs());
        }
      }
    }, this);

    // Handle and date changes
    const localEndTime = this.hearingEndTimeModel.getData();
    const originalLocalEndDatetime = Moment(this.model.get('local_end_datetime'));
    if (localEndTime !== originalLocalEndDatetime.format(InputModel.getTimeFormat())) {
      const newLocalHearingEndDatetime = `${originalLocalEndDatetime.format('YYYY-MM-DDT')}${this.hearingEndTimeModel.getData({ iso: true })}:00`;
      const minutesDiff = Moment(newLocalHearingEndDatetime).diff(originalLocalEndDatetime, 'minutes');
      _.extend(api_changes, {
        local_end_datetime: newLocalHearingEndDatetime,
        hearing_end_datetime: Moment(this.model.get('hearing_end_datetime')).add(minutesDiff, 'minutes').toISOString()
      });
    }

    this.model.set(api_changes);
  },

  _saveData() {
    const dispute = disputeChannel.request('get');
    if (dispute && dispute.checkEditInProgressModel(this.model)) {
      dispute.stopEditInProgress();
    }
    
    loaderChannel.trigger('page:load');
    
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.reinitialize();
        this.render();
      }).fail(err => {
        err = err || {};
        if (err && err[0] && err[0].status === 409) {  
          loaderChannel.trigger('page:load:complete');
          modalChannel.request('show:standard', {
            title: 'Collision detected',
            bodyHtml: '<p>While you were making edits, this hearing was modified by another user.</p><p>Click Continue to refresh the page, and then you can enter your changes and try to save again.</p>',
            hideCancelButton: true,
            onContinueFn: _.bind(function(modal) {
              modal.close();
              this.model.trigger('collision', this.model);
            }, this)
          });
        } else if (hearingChannel.request('check:scheduling:error', err)) {
          const endTimeView = this.getChildView('hearingEndTimeRegion');
          const errorMessage = 'The hearing owner is already booked during the time provided.';
          if (endTimeView) {
            endTimeView.showErrorMessage(errorMessage);
          } else {
            alert(errorMessage);
          }
          return;
        } else {
          const handler = generalErrorFactory.createHandler('ADMIN.HEARING.SAVE', () => this.model.trigger('hearings:refresh'));
          handler(err);
        }
      }).always(() => loaderChannel.trigger('page:load:complete'));
  },

  switchToEditState(editGroup) {
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component && _.isFunction(component.toEditable)) {
        component.toEditable();
      }
    }, this);
  },

  onRender() {
    const primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = this.model.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml() : '-';
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getDisputeLinkHtml();
    }).join(',&nbsp;') : '-';

    this.getUI('linkDisplay').html(hearingDisplayLinkTemplate({
      linkTypeDisplay: this.model.getDisputeHearingLinkDisplay(),
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay
    })); 
    
    this.getUI('ownerDisplay').html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', this.model.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: this.model.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.model.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(this.model.get('hearing_priority')),
      isReserved: this.model.isReserved(),
      isAdjourned: null
    }));


    const hearingNote = this.hearingNoteModel.getData();
    this.showChildView('hearingNoteRegion', new EditableComponentView({
      state: 'view',
      label: 'Hearing Note',
      view_value: $.trim(hearingNote) ? hearingNote : '-',
      subView: new InputView({
        model: this.hearingNoteModel
      })
    }));

    this.showChildView('hearingEndTimeRegion', new InputView({ model: this.hearingEndTimeModel }));
    this.showChildView('hearingPriorityRegion', new DropdownView({ model: this.hearingPriorityModel }));    
    if (!!this.hearingRecording) this.showChildView('hearingRecordingRegion', new FileDisplay({ model: this.hearingRecording }))
    this.renderHearingToolsRegions();
  },

  renderHearingToolsRegions() {
    this.showChildView('hearingParticipationsDisplayRegion', new HearingParticipationView({ viewMode: true, model: this.model, unitCollection: this.unitCollection }));
    this.showChildView('hearingParticipationsRegion', new HearingParticipationHearingToolsView({ mode: 'participation-view', model: this.model, unitCollection: this.unitCollection }));
  },

  templateContext() {
    const dispute = disputeChannel.request('get');
    const isConference = this.model.isConference();
    const conferenceBridge = this.model.getConferenceBridge();

    return {
      Formatter,
      isConference,
      conferenceBridgeData: conferenceBridge ? conferenceBridge.toJSON() : {},
      childApplicationFileNumber: dispute.get('cross_app_file_number'),
      childApplicationDisputeGuid: dispute.get('cross_app_dispute_guid'),
      isActive: this.model.isActive(),
      instructionsDisplay: this.model.getInstructions(),
      noticeGeneratedDisplay: this.hasMatchingNotice ? `<span class="success-green">Yes</span>` : `<span class="error-red">No</span>`,
      hasRecordedHearing: !!this.hearingRecording
    };
  }
});
