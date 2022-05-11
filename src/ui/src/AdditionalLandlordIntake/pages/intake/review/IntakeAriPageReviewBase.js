import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import template from './IntakeAriPageReview_template.tpl';

const BASE_APPLICATION_FEE_AMOUNT = 300;
const MAX_PER_UNIT_AMOUNT = 300;
const BASE_PER_UNIT_AMOUNT = 10;

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const paymentsChannel = Radio.channel('payments');
const animationChannel = Radio.channel('animations');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} review-page`,

  regions: {
    checkboxRegion: '.review-consent-checkbox'
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

  getCurrentStep() {
    return 9;
  },

  getRoutingFragment() {
    return `page/${this.getCurrentStep()}`;
  },

  getRoutingPreviousRoute() {
    return `page/${this.getCurrentStep()-1}`;
  },

  getRoutingNextRoute() {
    return `page/${this.getCurrentStep()+1}`;
  },

  getCustomObjectType() {
    return configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C');
  },

  getClaimCode() {
    return configChannel.request('get', 'ARI_C_ISSUE_CODE');
  },

  filterUnitsForApplication(units) {
    return units;
  },

  cleanupPageInProgress() {
    // Nothing to do here, no page actions done here
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    const customDataObj = customDataObjsChannel.request('get:type', this.getCustomObjectType());
    
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }

    this.units = IntakeAriDataParser.toUnitCollection();
    this.applicationUnits = this.filterUnitsForApplication(this.units);
    this.perUnitAmount = Math.min(Number(BASE_PER_UNIT_AMOUNT) * this.applicationUnits.length, Number(MAX_PER_UNIT_AMOUNT));
    this.calculatedFeeAmount = Number(BASE_APPLICATION_FEE_AMOUNT) + this.perUnitAmount;
    
    this.existingFee = paymentsChannel.request('get:fee:intake');
    this.hasApprovedPayment = this.existingFee && this.existingFee.getActivePayment() && this.existingFee.getActivePayment().isApproved();

    this.checkboxModel = new CheckboxModel({
      html: 'I have reviewed the information above carefully and understand that the above information cannot be modified once submitted. If I have errors in my application I will have to file a new application.',
      errorMessage: 'You must indicate all information is correct to continue.',
      checked: false,
      required: true,
      disabled: false,
    });

    this.listenTo(this.checkboxModel, 'change:checked', (checkboxModel, value) => {
      if (value) {
        checkboxModel.set('disabled', true);
        this.render();
      };
    });

    this.initializeReviewData();
  },

  initializeReviewData() {
    //
  },

  onRender() {
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.checkboxModel }));
  },


  templateContext() {
    const dispute = disputeChannel.request('get');
    const isLandlordApplication = dispute.isLandlord();
    const isPastTenancy = dispute.isPastTenancy();

    return _.extend({
      Formatter,
      units: this.units,
      hasConsented: !!this.checkboxModel.getData(),
      existingFee: this.existingFee,
      hasApprovedPayment: this.hasApprovedPayment,
      participantsChannel,

      BASE_APPLICATION_FEE_AMOUNT,
      perUnitAmount: this.perUnitAmount,
      calculatedFeeAmount: this.calculatedFeeAmount,

      isLandlordApplication,
      isPastTenancy,
      applicantTypeDisplay: isLandlordApplication ? 'Landlord' : 'Tenant',
      actTypeDisplay: dispute.isMHPTA() ? 'MHPTA (Manufactured home or trailer)' : 'RTA (Residential)',
      tenancyStatusDisplay: isPastTenancy ? 'Tenant has moved out' : 'Tenant is still living in or renting the unit or site',

      // Applicant / Respondent info:
      PARTICIPANT_TYPE_DISPLAY: configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY'),
      HEARING_OPTIONS_BY_DISPLAY: configChannel.request('get', 'HEARING_OPTIONS_BY_DISPLAY'),
      applicants: participantsChannel.request('get:applicants'),
      primaryApplicantId: participantsChannel.request('get:primaryApplicant:id')
    }, dispute.toJSON());
  },

  previousPage() {
    Backbone.history.navigate(this.getRoutingPreviousRoute(), {trigger: true});
  },


  getPageApiUpdates() {
    // Review page has no items in progress
    return [];
  },

  validatePage() {
    const checkboxView = this.getChildView('checkboxRegion');
    return checkboxView && checkboxView.isRendered() && _.isFunction(checkboxView.validateAndShowErrors) ? checkboxView.validateAndShowErrors() : true;
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const dispute = disputeChannel.request('get');
    const primary_applicant_id = participantsChannel.request('get:primaryApplicant:id');
    const disputeChanges = {
      dispute_urgency: configChannel.request('get', 'DISPUTE_URGENCY_REGULAR'),
      dispute_complexity: disputeChannel.request('check:complexity', dispute),
      submitted_date: Moment().toISOString(),
      submitted_by: primary_applicant_id
    };
    const disputeStatusChanges = {
      dispute_stage: configChannel.request('get', this.hasApprovedPayment ? 'STAGE_APPLICATION_SCREENING' : 'STAGE_APPLICATION_IN_PROGRESS'),
      dispute_status: configChannel.request('get', this.hasApprovedPayment ? 'STATUS_APPLICATION_RECEIVED' : 'STATUS_PAYMENT_REQUIRED'),
      process: this.getSubmitProcess()
    };
    const feeChanges = {
      amount_due: Number(this.calculatedFeeAmount)
    };
    const saveFeeFn = () => !this.hasApprovedPayment ? paymentsChannel.request('create:fee:intake', feeChanges) : null;
    const saveFilePackageFn = () => {
      // Now check if the intake file package needs to be updated
      const filePackage = filesChannel.request('get:filepackage:intake');
      filePackage.set('package_date', Moment().toISOString());
      return filePackage.save(filePackage.getApiChangesOnly());
    };
    const onNextSuccessFn = () => Backbone.history.navigate(this.getRoutingNextRoute(), { trigger: true });

    loaderChannel.trigger('page:load');
    Promise.all([
      dispute.save(disputeChanges),
      saveFilePackageFn(),
      saveFeeFn(),
    ])
    .then(() => Promise.all([dispute.saveStatus(disputeStatusChanges)]))
    // As a last step, clean up any data associated to deleted applicants. This is mostly for display in Admin.
    .then(() => participantsChannel.request('save:primaryApplicant:intakeData'))
    .then(() => {
      loaderChannel.trigger('page:load:complete');
      onNextSuccessFn();
    })
    .catch(this.createPageApiErrorHandler(this));
  }
});