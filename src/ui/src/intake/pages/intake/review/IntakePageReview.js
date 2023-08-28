import React from 'react';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import ModalBlankCheckbox from '../../../../core/components/modals/modal-blank/ModalBlankCheckbox'
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import IntakeReviewReceipt from './IntakeReviewReceipt';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import ApplicantRequiredService from '../../../../core/components/service/ApplicantRequiredService';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const paymentsChannel = Radio.channel('payments');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const IntakePageReview = PageView.extend({
  regions: {
    intakeReviewReceiptRegion: '.intake-review-receipt',
    intakeReviewARSCheckboxRegion: '.intake-review-ars-tos'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      exit: '.step-list'
    });
  },

  events() {
    return _.extend({}, PageView.prototype.events, {
      'click @ui.exit': 'clickExit'
    });
  },

  clickExit() {
    Backbone.history.navigate('list', {trigger: true});
  },

  getRoutingFragment() {
    return 'page/7';
  },

  cleanupPageInProgress() {
    // Nothing to do here, no page actions done here
  },

  initialize() {
    this.template = this.template.bind(this);
    PageView.prototype.initialize.call(this, ...arguments);
    this.respondents = participantsChannel.request('get:respondents');
    const dispute = disputeChannel.request('get');
    this.isARSDispute = ApplicantRequiredService.onlineIntake_isAvailableForARS(dispute, claimsChannel.request('get'));

    this.arsCheckboxModel = new CheckboxModel({
      html: `<p>
        <b>Proof of Service:</b> You will be required to declare service to the Residential Tenancy Branch that you served the Notice of Dispute Resolution Proceeding Package.
        Visit the Residential Tenancy Branch <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution'>website</a> to learn more about service.
      </p>
      <p>If you do not declare service, your hearing and application will be deemed withdrawn.</p>
      <p>Mark this checkbox to confirm that you understand and agree to the rules for serving respondents.</p>
      `,
      required: this.isARSDispute,
      checked: false
    });
  },

  onRender() {
    this.showChildView('intakeReviewReceiptRegion', new IntakeReviewReceipt({ showEdit: true }));
    if (this.isARSDispute) this.showChildView('intakeReviewARSCheckboxRegion', new CheckboxView({ model: this.arsCheckboxModel }))
  },

  previousPage() {
    Backbone.history.navigate('page/6', {trigger: true});
  },

  getPageApiUpdates() {
    // Review page has no items in progress
    return [];
  },

  showRespondentContactWarningModal() {
    const dispute = disputeChannel.request('get');
    const isLandlordApplication = dispute.isLandlord();
    const respondentsWithoutAddr = this.respondents.filter(p => !p.hasContactAddress() && p.get('known_contact_fields'));
    
    return new Promise(res => {
      if (!respondentsWithoutAddr.length) return res();
      modalChannel.request('show:custom', ModalBlankCheckbox, {
        modalCssClasses: 'modalIntakeContactWarning',
        title: 'Service Reminder',
        bodyHtml: `
          <p class="">You have indicated that you do not have the addresses for the following respondent(s)</p>
          <div class="">
            <ul class="">
            ${respondentsWithoutAddr.map(p => `<li><b>${p.getDisplayName()}</b> - ${Formatter.toKnownContactReviewDisplay(p.get('known_contact_fields'))}</li>`).join('')}
            </ul>
            <div class="spacer-block-10"></div>
            <p>
              <span class="warning-label--with-icon">IMPORTANT:</span> You <b>must</b> be able to serve documents and evidence to each ${isLandlordApplication ? 'tenant' : 'landlord'} in a <a class='static-external-link' href='javascript:;' url='https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/serving-notices-for-dispute-resolution'>method allowed by BC tenancy laws</a>. If you cannot serve documents in person, do not have the service address of each ${isLandlordApplication ? 'tenant' : 'landlord'} or do not have a written agreement with the ${isLandlordApplication ? 'tenant' : 'landlord'} to serve documents by email, you can apply for substituted service.
            </p>
            <p>If you are unable to serve documents, your dispute may not proceed and your filing fee will not be refunded.</p>
            <div class="spacer-block-10"></div>
          </div>
        `,
        primaryButtonText: 'Continue',
        onContinueFn: (modalView) => {
          modalView.close();
          res();
        },
        checkboxHtml: 'I read and understand the above and would like to continue.'
      });  
    });
  },

  validateAndShowErrors() {
    if (this.isARSDispute) {
      return this.getChildView('intakeReviewARSCheckboxRegion')?.validateAndShowErrors();
    }

    return true;
  },

  nextPage() {
    if (!this.validateAndShowErrors()) return
    this.showRespondentContactWarningModal().then(() => this.submitReceipt());
  },

  submitReceipt() {
    const dispute = disputeChannel.request('get');
    const processName = claimsChannel.request('is:directRequest') ? 'PROCESS_WRITTEN_OR_DR' : 'PROCESS_ORAL_HEARING';
    const primaryApplicantId = participantsChannel.request('get:primaryApplicant:id');
    const activeIntakePayment = paymentsChannel.request('get:payment:intake');
    const hasCompletedPayment = !!(activeIntakePayment && activeIntakePayment.isApproved());
    const onNextSuccessFn = () => {
      Backbone.history.navigate(`#/page/8`, { trigger: true });
    };
    const saveFilePackageFn = () => {
      // Now check if the intake file package needs to be updated
      const filePackage = filesChannel.request('get:filepackage:intake');
      filePackage.set('package_date', Moment().toISOString());
      return filePackage.save(filePackage.getApiChangesOnly());
    };
    
    const disputeChanges = {
      submitted_date: Moment().toISOString(),
      submitted_by: primaryApplicantId,
      dispute_urgency: claimsChannel.request('get:dispute:urgency'),
      dispute_complexity: disputeChannel.request('check:complexity', dispute)
    };
    const disputeStatusChanges = {
      dispute_stage: configChannel.request('get', hasCompletedPayment ? 'STAGE_APPLICATION_SCREENING' : 'STAGE_APPLICATION_IN_PROGRESS'),
      dispute_status: configChannel.request('get', hasCompletedPayment ? 'STATUS_APPLICATION_RECEIVED' : 'STATUS_PAYMENT_REQUIRED'),
      process: configChannel.request('get', processName)
    };

    loaderChannel.trigger('page:load');
    Promise.all([
      dispute.save(disputeChanges),
      saveFilePackageFn()
    ])
    .then(() => Promise.all([dispute.saveStatus(disputeStatusChanges)]))
    // As a last step, clean up any data associated to deleted applicants. This is mostly for display in Admin.
    .then(() => participantsChannel.request('save:primaryApplicant:intakeData'))
    .then(() => {
      loaderChannel.trigger('page:load:complete');
      onNextSuccessFn();
    })
    .catch(this.createPageApiErrorHandler(this));
  },

  template() {
    const dispute = disputeChannel.request('get');
    const disputeIsReview = dispute.isReviewOnlyState();

    const renderJsxPageHeader = () => {
      return (
        <div className="step evidence-info-heading">
          <p>Please review your information carefully to ensure it is accurate and complete.  If you need to, go back and make changes.</p>
          <p>This information will be submitted to the Residential Tenancy Branch and will be included in the Notice of Dispute Resolution Proceeding package.</p>
        </div>
      )
    }

    const renderJsxARSCheckbox = () => {
      if (!this.isARSDispute) return;
      return <div className="intake-review-ars-tos"></div>
    }
    
    const renderJsxPageNav = () => {
      return (
        <div>
          { disputeIsReview ?
            <div className="page-navigation-button-container">
              <button className="navigation option-button step-list" type="submit">BACK TO LIST</button>
            </div>
            :
            <div className="page-navigation-button-container">
              <button className="navigation option-button step-previous" type="button">BACK</button>
              <button className="navigation option-button step-next" type="submit">SUBMIT</button>
            </div>
          }
        </div>
      )
    }

    return (
      <>
        { renderJsxPageHeader() }
        <div className="intake-review-receipt"></div>
        { renderJsxARSCheckbox() }
        { renderJsxPageNav() }
      </>
    )
  }
});

_.extend(IntakePageReview.prototype, ViewJSXMixin);
export default IntakePageReview;