/**
 * @fileoverview - Contains UI and logic binding for ModalDeleteHearing
 */
import Radio from 'backbone.radio';
import template from './ModalBaseDeleteHearing_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

/* Provide re-usable base modal View for both "Remove Hearing" and "Remove Dispute Hearings" use cases */
export default {
  template,

  className: 'modal fade modal-rtb-default modalBaseDeleteHearing',

  attributes: {
    'data-backdrop': 'static',
    'data-keyboard': 'false'
  },

  ui: {
    dateDisplay: '.modalBaseDeleteHearing-date-info',
    linkDisplay: '.modalBaseDeleteHearing-link-info',
    ownerDisplay: '.modalBaseDeleteHearing-owner-info',
    continue: '.btn-continue',
    cancel: '.btn-cancel',
    close: '.close-x'
  },

  events: {
    'click @ui.continue': 'clickContinue',
    'click @ui.close': 'close',
    'click @ui.cancel': 'close',
  },

  close() {
    modalChannel.request('remove', this);
  },
  
  mixin_onRender(isAdjourned) {
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
      hearingStartTimeDisplay: Formatter.toTimeDisplay(this.model.get('local_start_datetime'))   ,
      durationDisplay: Formatter.toDuration(this.model.get('local_start_datetime'), this.model.get('local_end_datetime'))
    }));
    
    this.getUI('ownerDisplay').html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', this.model.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: this.model.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.model.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(this.model.get('hearing_priority')),
      isReserved: this.model.isReserved(),
      isAdjourned
    }));
  }
}