import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeStatusModel from '../../../core/components/dispute/DisputeStatus_model';
import HearingModel from '../../../core/components/hearing/Hearing_model';
import ModalBlankCheckbox from '../../../core/components/modals/modal-blank/ModalBlankCheckbox';
import template from './DisputeListItem_template.tpl';
import hearingDisplayLinkTemplate from '../../../core/components/hearing/hearing-display/HearingDisplayLink_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import DisputeFlagCollection from '../../../core/components/dispute-flags/DisputeFlag_collection';
import ParticipantCollection from '../../../core/components/participant/Participant_collection';

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const applicationChannel = Radio.channel('application');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');
const sessionChannel = Radio.channel('session');

const hearingModalCopiedStyles = `
<style type="text/css" id="hearingStyles">
  .hearing-item .review-label { font-size: 17px; }

  @media (max-width: 767px) { .hearing-info-display-container { width: unset; } }
</style>
`;

const hearingModalV2 = `
<div class="hearing-item">
  <div class="">
    <div class="hearing-info-display-container">
      <div class="hearing-type-title-container">
        <span class="hearing-type-title-display"><%= Formatter.toHearingTypeDisplay(hearingData.hearing_type) %></span>
        <span class="hearing-status-display <%= isActive? 'success-green' : 'inactive' %>">
          <div class="hearing-status-icon <%= isActive? 'active' : 'inactive' %>"></div>
          <span><%= isActive ? 'Active' : 'Inactive' %></span>
        </span>
      </div>

      <div class="hearing-date-display-container">
        <div class="hearing-start-date-icon"></div>
        <span class="hearing-start-date-display">
          <%= Formatter.toWeekdayShortDateYearDisplay(hearingData.local_start_datetime) %>
        </span>
        <div class="hearing-start-time-display-container">
          <div class="hearing-start-time-icon"></div>
          <span class="hearing-start-time-display">
            <%= Formatter.toTimeDisplay(hearingData.local_start_datetime) %>
          </span>
          <span class="hearing-duration-display">
            (<%= Formatter.toDuration(hearingData.local_start_datetime, hearingData.local_end_datetime) %>)
          </span>
        </div>
      </div>

      <div class="spacer-block-10"></div>      
      <div class="<%= isConference ? 'hidden' : '' %>">
        <div class="">
          <label class="general-modal-label">Location:</label>&nbsp;<span><%= hearingData.hearing_location %></span>
        </div>
      </div>

    </div>
  </div>

  <div class="hearing-details-instructions-container">
    <div class="">
      <div class="">
        <%= instructionsDisplay %>
      </div>
    </div>
    <div class="hearing-instructions-text"></div>
  </div>

</div>
`

export default Marionette.View.extend({
  template,

  tagName: 'tr',
  className: 'dispute-list-item',

  ui: {
    'resume': 'button.dispute-list-complete-app',
    'withdraw': 'button.dispute-list-withdraw-app',
    'delete': 'button.dispute-list-delete-app',
    'pay': 'button.dispute-list-pay-app',
    'review': '.dispute-list-review-notification',
    'details': '.dispute-list-details-btn',
    'hearingDetails': '.dispute-list-hearing-details-btn',
    'daEvidenceLink': '.dispute-list-add-evidence-btn',
    'daReinstatementLink': '.dispute-list-request-reinstatement-btn',
    'daServiceLink': '.dispute-list-submit-service-btn'
  },

  events: {
    'click @ui.resume': 'clickResumeDispute',
    'click @ui.withdraw': 'clickWithdrawDispute',
    'click @ui.delete': 'clickDeleteDispute',
    'click @ui.pay': 'clickPay',
    'click @ui.review': 'clickReviewNotification',

    'click @ui.details': 'clickDetails',
    'click @ui.hearingDetails': 'clickHearingDetails',

    'click @ui.daEvidenceLink': function() { this.clickDaLink('EXTERNAL_DA_ACTION_EVIDENCE'); },
    'click @ui.daReinstatementLink': function() { this.clickDaLink('EXTERNAL_DA_ACTION_REINSTATEMENT'); },
    'click @ui.daServiceLink': function() { this.clickDaLink('EXTERNAL_DA_ACTION_NOTICE'); }
  },

  async clickDetails() {
    loaderChannel.trigger('page:load');
    try {
      const disputeGuid = this.model.dispute.id;
      await applicationChannel.request('load:ivd:data', disputeGuid);
      Backbone.history.navigate('view', { trigger: true });
    } catch {
      const errorHandler = generalErrorFactory.createHandler('INTAKE.DVIEW.LOAD.DISPUTE', () => loaderChannel.trigger('page:load:complete'));
      errorHandler();
    }
  },

  showModalHearingDetails() {
    const hearingData = this.model.get('hearing') || {};
    // Create a UI-only backbone models to immitate the displays
    const hearingModel = new HearingModel(hearingData);

    hearingModel.getDisputeHearings().reset([hearingData]);
    console.log(hearingModel);

    // Add override styles to just this page
    $(hearingModalCopiedStyles).appendTo('head');

    const modalView = modalChannel.request('show:standard', {
      title: `Hearing Details${this.model.get('file_number') ? ` -  File ${this.model.get('file_number')}` : ''}`,
      bodyHtml: this.getHearingDetailsTemplateHtml(hearingModel),
      primaryButtonText: 'Close',
      hideCancelButton: true,
      onContinueFn(modalView) {
        modalView.close();
      }
    });

    //  Make sure to remove override styles
    this.listenTo(modalView, 'removed:modal', () => {
      $('#hearingStyles').remove();
    })
  },

  getHearingDetailsTemplateHtml(hearingModel) {
    const linkDisplayUI = '.hearing-link-display';
   
    const isConference = hearingModel.isConference();
    const isActive = hearingModel.isActive();
    const primaryDisputeHearing = hearingModel.getPrimaryDisputeHearing();
    const secondaryDisputeHearings = hearingModel.getSecondaryDisputeHearings();
    const primaryDisputeHearingDisplay = primaryDisputeHearing ? primaryDisputeHearing.getDisputeLinkHtml() : '-';
    const secondaryDisputeHearingsDisplay = secondaryDisputeHearings ? secondaryDisputeHearings.map(function(dispute_hearing_model) {
      return dispute_hearing_model.getDisputeLinkHtml();
    }).join(',&nbsp;') : '-';


    const hearingModelData = hearingModel.toJSON();

    const templateHtml = $(`<div>
        ${hearingModalCopiedStyles}
        ${_.template(hearingModalV2)(_.extend({
          hearingData: hearingModelData,
          conferenceBridgeData: hearingModelData,
          isActive,
          isConference,
          hearingPriorityDisplay: Formatter.toUrgencyDisplay(hearingModel.get('hearing_priority')),
          instructionsDisplay: hearingModel.getInstructions(),
          Formatter,
        }, this.model.toJSON()))}
      </div>`);
    

    templateHtml.find(linkDisplayUI).html(hearingDisplayLinkTemplate({
      linkTypeDisplay: hearingModel.getDisputeHearingLinkDisplay(),
      primaryDisputeHearingDisplay,
      secondaryDisputeHearingsDisplay
    }));
    
    return templateHtml.html();
  },

  clickHearingDetails() {
    this.showModalHearingDetails();
  },

  clickDaLink(daActionConfig) {
    const accessCode = this.model.get('primary_applicant_access_code');
    const daActionId = configChannel.request('get', daActionConfig);
    const extSiteId = configChannel.request('get', 'MAINTENANCE_SYSTEM_ID_INTAKE');
    const submitterName = sessionChannel.request('name');
    sessionChannel.trigger('redirect:disputeAccess', accessCode, daActionId, extSiteId, submitterName);
  },

  clickResumeDispute() {
    loaderChannel.trigger('page:load');
    applicationChannel.request('load:dispute:full', this.model.get('dispute_guid'));
  },

  clickWithdrawDispute() {
    if (this.model.hasHearingWithdrawRestriction()) {
      modalChannel.request('show:standard', {
        title: 'Withdrawn Not Available',
        bodyHtml: `<p>This dispute cannot be withdrawn because its latest hearing is either about to start, is in progress or is now over. If possible, dial into your hearing and notify the arbitrator that you would like to withdraw your file. If your hearing is now ended, you cannot withdraw this dispute file.</p>`,
        hideContinueButton: true,
        modalCssClasses: 'withdrawTenantWarningModal',
        cancelButtonText: 'Close'
      });
      return;
    }
    
    if (!this.model.isTenantApplication()) {
      this._withdrawDispute();
      return;
    }

    // If it is a tenant application, we need to do extra load and check
    loaderChannel.trigger('page:load');
    applicationChannel.request('load:dispute:full:promise', this.model.get('dispute_guid'))
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        const claims = claimsChannel.request('get');
        if (claims.any(claim => _.contains(this.model.tenant_cn_issue_codes, claim.get('claim_code')))) {
          modalChannel.request('show:standard', {
            title: 'Withdrawn Not Available',
            bodyHtml: `<p>The dispute cannot be withdrawn because it either:</p>
            <ul>
              <li>Includes a claim that requires the respondent(s) written consent to withdraw; or</li>
              <li>Your application is in a status that does not allow you to withdraw it</li>
            </ul>
            <p>Special rules apply to some types of applications. <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/withdraw-an-application?keyword=withdraw">Click here</a> to learn more or <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">contact the Residential Tenancy Branch</a>.</p>`,
            hideContinueButton: true,
            modalCssClasses: 'withdrawTenantWarningModal',
            cancelButtonText: 'Close'
          });
        } else {
          this._withdrawDispute();
        }      
      }).fail(
        generalErrorFactory.createHandler('DISPUTE.LOAD.FULL', () => {
          loaderChannel.trigger('page:load:complete');
        })  
      );
  },

  clickPay() {
    loaderChannel.trigger('page:load');
    
    // First load all dispute information
    applicationChannel.request('load:dispute:full:promise', this.model.get('dispute_guid'))
      .done(() => {
        const dispute = disputeChannel.request('get');
        const intakeFee = paymentsChannel.request('get:fee:intake');
        const activePayment = intakeFee && intakeFee.getActivePayment();

        // If payment is not online + pending, then load dispute normally
        if (!activePayment || !activePayment.isOnline() || !activePayment.isPending()) {
          applicationChannel.trigger('dispute:loaded:full', dispute);
          return;
        }

        // Otherwise, perform the bambora check
        activePayment.updateTransactionAfterBeanstream()
          .done(() => {
            if (activePayment.isApproved()) {
              const dispute_changes = _.extend(
                {
                  initial_payment_date: Moment().toISOString(),
                  initial_payment_by: participantsChannel.request('get:primaryApplicant:id')  
                },
                activePayment ? { initial_payment_method: activePayment.get('transaction_method') } : null,
              );
              const dispute_status_changes = {
                dispute_stage: configChannel.request('get', 'STAGE_APPLICATION_SCREENING'),
                dispute_status: configChannel.request('get', 'STATUS_APPLICATION_RECEIVED')
              };
              $.whenAll(dispute.saveStatus(dispute_status_changes), dispute.save(dispute_changes))
                .fail(generalErrorFactory.createHandler('STATUS.SAVE'))
                .always(() => Backbone.history.navigate('#page/9', { replace: true, trigger: true }) );
            } else {
              applicationChannel.trigger('dispute:loaded:full', dispute);
              return;
            }

          }).fail(
            generalErrorFactory.createHandler('PAYMENT.BEANSTREAM_CHECK', () => {
              loaderChannel.trigger('page:load:complete');
            })
          );
      }).fail(
        generalErrorFactory.createHandler('DISPUTE.LOAD.FULL', () => {
          loaderChannel.trigger('page:load:complete');
        })
      );
  },

  clickReviewNotification() {
    const dispute = this.model.dispute;
    const flags = new DisputeFlagCollection(this.model.get('linked_dispute_flags'));
    const disputeParticipants = this.model.get('claim_groups') && this.model.get('claim_groups').length ? new ParticipantCollection(this.model.get('claim_groups')[0].participants) : null;
    const reviewFlags = flags.filter((flag) => flag.isReview() && flag.isActive());
    const hearingLinkType = this.model.get('hearing') ? this.model.get('hearing').shared_hearing_link_type : null;

    flagsChannel.request('show:review:notification', reviewFlags, disputeParticipants, hearingLinkType, dispute);
  },

  clickDeleteDispute() {
    modalChannel.request('show:custom', ModalBlankCheckbox, {
      title: 'Confirm Deletion',
      bodyHtml: `
        <div class="modal-withdraw-title">Read the following carefully</div>
        <div class="modal-withdraw-body">
          <ul class="sublist">
            <li><span>Deleting is permanent and cannot be undone</span></li>
            <li><span>The selected application will no longer be visible in your file list the next time you return</span></li>
          </ul>
        </div>
      `,
      primaryButtonText: 'Delete',
      onContinueFn: (modalView) => {
        this._updateDisputeStageStatus(null, configChannel.request('get', 'STATUS_DELETED'))
          .fail(generalErrorFactory.createHandler('STATUS.SAVE'), () => loaderChannel.trigger('page:load:complete'))
          .always(() => modalView.close());
      },
      checkboxHtml: 'I have read and understand the above'
    });
  },

  _cannotWithdrawDispute() {
    modalChannel.request('show:standard', {
      title: 'Withdraw Not Allowed',
      bodyHtml: `
        <div class="center-text">
          <div class="modal-withdraw-body">
            Applications to dispute a notice to end tenancy from a landlord cannot be withdrawn using this process.  If you would like to withdraw this application, please contact the Residential Tenancy Branch.
          </div>
        </div>`,
      primaryButtonText: 'Close',
      hideCancelButton: true,
      onContinueFn(modalView) {
        modalView.close();
      }
    });
  },

  _withdrawDispute() {
    modalChannel.request('show:custom', ModalBlankCheckbox, {
      title: 'Confirm Withdrawal',
      bodyHtml: `
      <div class="center-text">
        <div class="modal-withdraw-title">Read the following carefully</div>
        <div class="modal-withdraw-body">
          <ul class="sublist">
            <li><span>You must notify all respondents in this dispute in writing prior to withdrawing this dispute.</span></li>
            <li><span>Fees are not refunded for disputes that have been withdrawn.</span></li>
            <li><span>Disputes that are withdrawn cannot be reopened.</span></li>
            <li><span>If you have reached a settlement on this dispute, we recommend that you put any agreement in writing.</span></li>
          </ul>
        </div>`,
      primaryButtonText: 'Withdraw',
      onContinueFn: (modalView) => {
        this._updateDisputeStageStatus(null, configChannel.request('get', 'STATUS_WITHDRAWN'))
          .fail(generalErrorFactory.createHandler('STATUS.SAVE'), () => loaderChannel.trigger('page:load:complete'))
          .always(() => modalView.close());
      },
      checkboxHtml: 'I have read and understand the above'
    });
  },

  _updateDisputeStageStatus(stage, status) {
    const statusModel = new DisputeStatusModel(_.extend({
        dispute_guid: this.model.get('dispute_guid')
      },
      $.trim(stage) !== '' ? { dispute_stage: stage } : {},
      $.trim(status) !== '' ? { dispute_status: status } : {}
    ));
    const dfd = $.Deferred();
    loaderChannel.trigger('page:load', { disable_scroll: false });
    statusModel.save().done(status_response => {
      // Update the modal and trigger updates locally
      this.model.updateStatus(status_response, { silent: true });
      this.render();
      dfd.resolve();
      loaderChannel.trigger('page:load:complete');
    }).fail(dfd.reject);

    return dfd.promise();
  },

  templateContext() {
    return {
      Formatter,
      DISPUTE_ACCESS_URL: this.model.DISPUTE_ACCESS_URL,
      hasStatusTextHighlight: !this.model.get('file_number')
    };
  }
});
