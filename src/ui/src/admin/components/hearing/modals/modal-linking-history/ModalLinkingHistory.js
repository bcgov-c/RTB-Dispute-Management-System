import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import template from './ModalLinkingHistory_template.tpl';
import hearingDisplayLinkTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import hearingDisplayDateTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayDate_template.tpl';
import hearingDisplayOwnerTemplate from '../../../../../core/components/hearing/hearing-display/HearingDisplayOwner_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const hearingChannel = Radio.channel('hearings');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,

  id: 'linkingHistory_modal',

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dateDisplay: '.modalBaseDeleteHearing-date-info',
      linkDisplay: '.modalBaseDeleteHearing-link-info',
      ownerDisplay: '.modalBaseDeleteHearing-owner-info',
    });
  },

  initialize() {
    this.loading = false;
    this.linkingResults = null;
    this.loadLinkingHistory();
  },

  loadLinkingHistory() {
    loaderChannel.trigger('page:load');
    hearingChannel.request('load:linkinghistory:hearing', this.model)
      .done(disputeHearingCollection => {
        this.linkingResults = disputeHearingCollection;
        this.render();
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.HEARING.HISTORY.LOAD', () => this.render())
      )
      .always(() => {
        this.loading = false;
        loaderChannel.trigger('page:load:complete');
      });
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
      hearingStartTimeDisplay: Formatter.toTimeDisplay(this.model.get('local_start_datetime'))   ,
      durationDisplay: Formatter.toDuration(this.model.get('local_start_datetime'), this.model.get('local_end_datetime'))
    }));
    
    this.getUI('ownerDisplay').html(hearingDisplayOwnerTemplate({
      ownerNameDisplay: toUserLevelAndNameDisplay(userChannel.request('get:user', this.model.get('hearing_owner')), { displaySchedulerType: true, displayUserLevelIcon: true }),
      dialCodeDisplay: this.model.getModeratorCodeDisplay(),
      webPortalLoginDisplay: this.model.getWebPortalLoginDisplay(),
      hearingPriorityDisplay: Formatter.toUrgencyDisplay(this.model.get('hearing_priority')),
      isReserved: this.model.isReserved(),
      isAdjourned: null
    }));
  },

  templateContext() {
    return {
      Formatter,
      hasResults: this.linkingResults && this.linkingResults.length,
      disputeHearingModels: this.linkingResults ? this.linkingResults.models : []
    };
  }

});
