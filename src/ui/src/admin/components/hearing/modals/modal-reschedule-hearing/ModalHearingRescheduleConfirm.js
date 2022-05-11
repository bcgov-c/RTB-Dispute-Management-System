import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import template from './ModalHearingRescheduleConfirm_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const DATE_SUB_SELECTOR = '.hearing-date-info';
const OWNER_SUB_SELECTOR = '.hearing-owner-info';
const LINK_SUB_SELECTOR = '.hearing-link-info';

const hearingChannel = Radio.channel('hearings');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'modalHearingRescheduleConfirm',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      currentHearing: '.modalHearingRescheduleConfirm-current-hearing',
      newHearing: '.modalHearingRescheduleConfirm-new-hearing',
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
    const dfdRescheduleModel = $.Deferred();

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
    this.rescheduleHearingModel.withStateCheck(
      dfdRescheduleModel.resolve,
      () => {
        if (warningModalBeingShown) return;
        warningModalBeingShown = true;
        showInvalidHearingStateModal();
      },
      dfdRescheduleModel.reject
    );

    $.whenAll(dfdHearingModel.promise(), dfdRescheduleModel.promise())
      .done(this._performReschedule.bind(this))
      .fail(() => this.model.trigger('hearings:refresh'));
  },


  _performReschedule() {
    const onCompleteFn = () => {
      this.model.trigger('hearings:refresh');
      this.close();
    }

    hearingChannel.request('reschedule', this.model.id, this.rescheduleHearingModel.id)
      .then(
        onCompleteFn.bind(this),
        err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.HEARING.RESCHEDULE', () => {
            loaderChannel.trigger('page:load:complete');
            onCompleteFn();
          }, 'There was an error during hearing reschedule.');
          handler(err);
      });
  },

  checkAdjourned(hearingModel) {
    loaderChannel.trigger('page:load');
    hearingChannel.request('check:adjourned', hearingModel)
    .then(isAdjourned => {
      hearingModel.set({ _isAdjourned: isAdjourned });
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    })
  },

  initialize(options) {
    this.mergeOptions(options, ['rescheduleHearingModel']);
    this.model.set({ _isAdjourned: null });
    this.rescheduleHearingModel.set({ _isAdjourned: null });
    this.checkAdjourned(this.model);
    this.checkAdjourned(this.rescheduleHearingModel);
  },

  onRender() {
    this.renderHearing(this.model, 'currentHearing');
    this.renderHearing(this.rescheduleHearingModel, 'newHearing');
  },

  renderHearing(hearingModel, uiTarget) {

    const uiElement = this.getUI(uiTarget);
    if (!uiElement || !uiElement.length) {
      console.log(`[Error] Couldn't find a UI element to place the hearing`, hearingModel);
      return;
    }

    const dateElement = uiElement.find(DATE_SUB_SELECTOR);
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

    dateElement.html(hearingDisplayDateTemplate({
      hearingStartDateDisplay: Formatter.toWeekdayShortDateYearDisplay(hearingModel.get('local_start_datetime')),
      hearingStartTimeDisplay: Formatter.toTimeDisplay(hearingModel.get('local_start_datetime'))   ,
      durationDisplay: Formatter.toDuration(hearingModel.get('local_start_datetime'), hearingModel.get('local_end_datetime'))
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