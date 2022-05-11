import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import template from './ModalHearingReassignConfirm_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const OWNER_SUB_SELECTOR = '.hearing-owner-info';
const LINK_SUB_SELECTOR = '.hearing-link-info';

const hearingChannel = Radio.channel('hearings');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'modalHearingReassignConfirm',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dateDisplay: '.modalHearingReassignConfirm-date',
      hearing1Before: '.modalHearingReassignConfirm-hearing1-before',
      hearing2Before: '.modalHearingReassignConfirm-hearing2-before',
      hearing1After: '.modalHearingReassignConfirm-hearing1-after',
      hearing2After: '.modalHearingReassignConfirm-hearing2-after',
      continue: '.btn-continue'
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.continue': 'clickContinue'
    });
  },
  
  clickContinue() {
    loaderChannel.trigger('page:load');
    const dfdHearingModel = $.Deferred();
    const dfdReassignModel = $.Deferred();

    let warningModalBeingShown = false;
    const showInvalidHearingStateModal = () => {
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.model.trigger('hearings:refresh');
        this.close();
      });
    };

    this.model.withStateCheck(
      dfdHearingModel.resolve,
      () => {
        if (warningModalBeingShown) return;
        warningModalBeingShown = true;
        showInvalidHearingStateModal();
      },
      dfdHearingModel.reject
    );

    this.reassignHearingModel.withStateCheck(
      dfdReassignModel.resolve,
      () => {
        if (warningModalBeingShown) return;
        warningModalBeingShown = true;
        showInvalidHearingStateModal();
      },
      dfdReassignModel.reject
    );

    $.whenAll(dfdHearingModel.promise(), dfdReassignModel.promise())
      .done(this.performReassign.bind(this))
      .fail(() => this.model.trigger('hearings:refresh'));
  },

  performReassign() {
    const onCompleteFn = () => {
      this.model.trigger('hearings:refresh');
      this.close();
    };
    hearingChannel.request('reassign', this.model.id, this.reassignHearingModel.id)
    .then(
      onCompleteFn.bind(this),
      err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.HEARING.REASSIGN', () => {
          loaderChannel.trigger('page:load:complete');
          onCompleteFn();
        }, 'There was an error during hearing reassignment.');
        handler(err);
    });
  },

  checkAdjourned(hearingModel) {
    loaderChannel.trigger('page:load');
    return hearingChannel.request('check:adjourned', hearingModel)
    .then(isAdjourned => {
      hearingModel.set({ _isAdjourned: isAdjourned });
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    })
  },

  initialize(options) {
    this.mergeOptions(options, ['reassignHearingModel']);
    
    this.reassignHearingModel.set({ _isAdjourned: null });
    this.model.set({ _isAdjourned: null });
    this.HEARING_PRIORITY_STANDARD = configChannel.request('get', 'HEARING_PRIORITY_STANDARD');

    // If a Duty hearing is being re-assigned, the hearing being re-assigned to it should always become Duty as well if it wasn't already
    // When a Duty hearing is being re-assigned with a non-duty, the Duty hearing should become Standard priority
    
    this.checkAdjourned(this.reassignHearingModel).then(() => this.checkAdjourned(this.model));
  },

  onRender() {
    this.getUI('dateDisplay').html(hearingDisplayDateTemplate({
      hearingStartDateDisplay: Formatter.toWeekdayShortDateYearDisplay(this.model.get('local_start_datetime')),
      hearingStartTimeDisplay: Formatter.toTimeDisplay(this.model.get('local_start_datetime')),
      durationDisplay: Formatter.toDuration(this.model.get('local_start_datetime'), this.model.get('local_end_datetime'))
    }));

    this.originalHearingAfterModel = this.model.clone().set(
      Object.assign({
        hearing_owner: this.reassignHearingModel.get('hearing_owner'),
        _originalData: null
      }, this.model.isPriorityDuty() && !this.reassignHearingModel.isPriorityDuty() ? {
        hearing_priority: this.HEARING_PRIORITY_STANDARD,
        _needsPriorityUpdate: true
      } : this.reassignHearingModel.isPriorityDuty() ? {
        hearing_priority: this.reassignHearingModel.get('hearing_priority'),
        _needsPriorityUpdate: true
      } : {})
    );

    this.reassignHearingAfterModel = this.reassignHearingModel.clone().set(
      Object.assign({
        hearing_owner: this.model.get('hearing_owner'),
        _originalData: null
      }, this.model.isPriorityDuty() ? {
        hearing_priority: this.model.get('hearing_priority'),
        _needsPriorityUpdate: true
      } : !this.model.isPriorityDuty() && this.reassignHearingModel.isPriorityDuty() ? {
        hearing_priority: this.HEARING_PRIORITY_STANDARD,
        _needsPriorityUpdate: true
      } : {})
    );

    this.renderHearing(this.model, 'hearing1Before');
    this.renderHearing(this.reassignHearingModel, 'hearing2Before');
    this.renderHearing(this.originalHearingAfterModel, 'hearing1After');
    this.renderHearing(this.reassignHearingAfterModel, 'hearing2After');
  },

  renderHearing(hearingModel, uiTarget) {
    const uiElement = this.getUI(uiTarget);
    if (!uiElement || !uiElement.length) {
      console.log(`[Error] Couldn't find a UI element to place the hearing`, hearingModel);
      return;
    }

    const linkElement = uiElement.find(LINK_SUB_SELECTOR);
    const ownerElement = uiElement.find(OWNER_SUB_SELECTOR);

    const primaryDisputeHearing = hearingModel.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = hearingModel.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml({ clearModalsOnNav: true }) : '-';
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getDisputeLinkHtml({ clearModalsOnNav: true });
    }).join(',&nbsp;') : '-';

    linkElement.html(hearingDisplayLinkTemplate({
      linkTypeDisplay: hearingModel.getDisputeHearingLinkDisplay(),
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay
    }));

    ownerElement.html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', hearingModel.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: hearingModel.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.model.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(hearingModel.get('hearing_priority')),
      isReserved: hearingModel.isReserved(),
      isAdjourned: hearingModel.get('_isAdjourned')
    }));
  }

});