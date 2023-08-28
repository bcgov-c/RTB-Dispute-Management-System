/**
 * @fileoverview - Modal that displays hearing information, and allows for editing of some fields
 */
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import EditableComponentView from '../../../../../core/components/editable-component/EditableComponent';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import template from './ModalEditHearing_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';
import Checkbox_model from '../../../../../core/components/checkbox/Checkbox_model';
import Checkbox from '../../../../../core/components/checkbox/Checkbox';

const noticeChannel = Radio.channel('notice');
const userChannel = Radio.channel('users');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'editHearing_modal',

  regions: {
    hearingNoteRegion: '.hearing-note',
    hearingEndTimeRegion: '.hearing-end-time',
    hearingPriorityRegion: '.hearing-priority-edit',
    hearingOnHoldRegion: '.hearing-on-hold-edit',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      linkDisplay: '.hearing-link-display',
      ownerDisplay: '.hearing-owner-display',
      priorityWarning: '.hearing-priority-edit-warning',
      save: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSaveWithStateCheck'
    });
  },

  clickSaveWithStateCheck() {
    const editGroup = this.model.isActive() ? this.activeEditGroup : this.inactiveEditGroup;
    if (!this.validateAndShowErrors(editGroup)) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length > 0) {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', { is_page_item: true });
      }
      return false;
    }

    const showInvalidHearingStateModal = () => {
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.model.trigger('hearings:refresh')
        this.close();
      });
    };
    const onStateCheckError = () => {
      this.model.trigger('hearings:refresh')
      this.close();
    };
    this.model.withStateCheck(
      () => this.clickSave(editGroup),
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  clickSave(editGroup) {
    this.saveInternalSaveDataToHearingModel(editGroup);
    this._saveData().then(() => {
      let nowOnHold, nowOffHold;
      const selectedOnHold = this.hearingOnHoldModel.getData();
      if (this.model.isReserved()) nowOffHold = !selectedOnHold;
      else nowOnHold = selectedOnHold;

      const hearingEvent = nowOnHold ? 'reserve:hearing' : nowOffHold ? 'cancel:reserved' : null;
      const hearingErrorEvent = nowOnHold ? 'HEARING.RESERVATION' : nowOffHold ? 'HEARING.CANCEL.RESERVATION' : '';
      const onComplete = () => {
        this.trigger('save:complete');
        this.close();
      };
      (hearingEvent ? hearingChannel.request(hearingEvent, this.model.id) : Promise.resolve())
        .then(onComplete, generalErrorFactory.createHandler(hearingErrorEvent, onComplete));
    });
  },

  _getPriorityOptions() {
    return _.map(['DISPUTE_URGENCY_EMERGENCY', 'DISPUTE_URGENCY_REGULAR', 'DISPUTE_URGENCY_DEFERRED', 'DISPUTE_URGENCY_DUTY'],
      function(code) {
        const value = configChannel.request('get', code);
        return { value: String(value), text: Formatter.toUrgencyDisplay(value) };
      });
  },
  /**
   * @param {Boolean} viewOnly - disables edit mode 
   */
  initialize(options) {
    this.mergeOptions(options, ['viewOnly']);
    
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
      labelText: 'Schedule Note',
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

    this.hearingOnHoldModel = new Checkbox_model({
      html: 'On Hold',
      required: false,
      checked: !!this.model.isReserved(),
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
    this.activeEditGroup = this.viewOnly ? [] : ['hearingPriorityRegion', 'hearingEndTimeRegion', 'hearingNoteRegion'];
    this.inactiveEditGroup = this.viewOnly ? [] : ['hearingNoteRegion'];
  },

  resetModelValues() {
    this.model.resetModel();
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
    loaderChannel.trigger('page:load');
    
    return new Promise((res, rej) => {
      this.model.save(this.model.getApiChangesOnly())
        .done(() => res())
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          err = err || {};
          if (err && err[0] && err[0].status === 409) {  
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
          rej();
        });
    });
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
      state: this.viewOnly ? 'view' : 'edit',
      label: 'Hearing Note',
      view_value: $.trim(hearingNote) ? hearingNote : '-',
      subView: new InputView({
        model: this.hearingNoteModel
      })
    }));

    if (!this.viewOnly) {
      this.showChildView('hearingEndTimeRegion', new InputView({ model: this.hearingEndTimeModel }));
      this.showChildView('hearingPriorityRegion', new DropdownView({ model: this.hearingPriorityModel }));
      this.showChildView('hearingOnHoldRegion', new Checkbox({ model: this.hearingOnHoldModel }));
    }
  },

  templateContext() {
    const isConference = this.model.isConference();
    const conferenceBridge = this.model.getConferenceBridge();
    const isActive = this.model.isActive();

    return {
      editTypeClass: this.viewOnly ? '' : (isActive ? 'active-edit' : 'inactive-edit'),
      Formatter,
      isActive,
      isViewOnly: this.viewOnly,
      isConference,
      conferenceBridgeData: conferenceBridge ? conferenceBridge.toJSON() : {},
      instructionsDisplay: this.model.getInstructions(),
      noticeGeneratedDisplay: this.hasMatchingNotice ? `<span class="success-green">Yes</span>` : `<span class="error-red">No</span>`,
      hearingNoticeDisplay: this.model.get('notification_file_description_id') ? `Yes` : `-`,
      isReserved: this.model.isReserved(),
    };
  }
});
