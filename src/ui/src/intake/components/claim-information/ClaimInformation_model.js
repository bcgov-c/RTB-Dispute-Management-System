import Backbone from 'backbone';
import Radio from 'backbone.radio';
import InputModel from '../../../core/components/input/Input_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import UtilityMixin from '../../../core/utilities/UtilityMixin';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default Backbone.Model.extend({
  defaults: {
    issueId: null,
    name: 'claim',
    claim_title: null,
    useAmount: false,
    amountTitle: null,
    useNoticeDueDate: false,    
    noticeDueDateTitle: null,
    noticeDueDateHelp: null,
    useNoticeMethod: false,
    noticeMethodTitle: null,
    allowedNoticeMethodCodes: null,
    useTextDescription: false,
    textDescriptionTitle: null,
    claimCode: null,
    cssClass: null,
    hidden: false,
    stepComplete: false,
    json: null,

    helpHtml: null,
    disputeClaim: null,
    disputeEvidenceCollection: null
  },

  initialize() {
    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX') || 15;
    this.CLAIM_AMOUNT_MAX_NUM = configChannel.request('get', 'CLAIM_AMOUNT_MAX_NUM');
    this.ALL_SERVICE_METHODS_INVERTED = _.invert(configChannel.request('get', 'ALL_SERVICE_METHODS') || {});
    this.SERVICE_METHOD_DEEMED_DAY_OFFSETS = configChannel.request('get', 'SERVICE_METHOD_DEEMED_DAY_OFFSETS') || {};

    this.createSubModels();
    
    this.listenTo(this.get('amountModel'), 'change:value', function() { this.trigger('amountChanged'); this.trigger('change'); }, this);
    this.listenTo(this.get('noticeDueDateModel'), 'change:value', function(model, value) { this.trigger('ruleDateChanged'); this.trigger('change', model, value); }, this);
    this.listenTo(this.get('noticeMethodModel'), 'change:value', function(model, value) { this.trigger('ruleDateChanged'); this.trigger('change', model, value); }, this);
    this.listenTo(this.get('textDescriptionModel'), 'change:value', function(model, value) { this.trigger('change', model, value); }, this);
  },

  createSubModels() {
    const disputeClaim = this.get('disputeClaim');
    const claimDetail = disputeClaim.getApplicantsClaimDetail();
    const remedyDetail = disputeClaim.getApplicantsRemedyDetail();
    const useNoticeDueDate = this.get('useNoticeDueDate');
    const useAmount = this.get('useAmount');
    const useNoticeMethod = this.get('useNoticeMethod');
    const useTextDescription = this.get('useTextDescription');
    const name = this.get('name');

    this.set('amountModel', new InputModel({
        name: name + '-unit',
        inputType: 'currency',
        labelText: this.get('amountTitle') || 'Amount requested',
        errorMessage: 'Amount is required',
        cssClass: useAmount? 'max-width-200' : 'hidden',
        maxLength: this.AMOUNT_FIELD_MAX,
        maxNum: this.CLAIM_AMOUNT_MAX_NUM,
        required: useAmount,
        value: remedyDetail && remedyDetail.get('amount') !== 0 ? remedyDetail.get('amount') : null
    }));

    this.set('noticeDueDateModel', new InputModel({
        name: name + '-notice-due-date',
        inputType: 'date',
        labelText: this.get('noticeDueDateTitle') || 'Date notice was served',
        errorMessage: 'Date is required',
        cssClass: useNoticeDueDate? null : 'hidden',
        required: useNoticeDueDate,
        minDate: Moment().subtract( configChannel.request('get', 'DATE_MIN_YEAR_OFFSET'), 'years' ),
        value: claimDetail ? claimDetail.get('notice_date') : null,
        helpHtml: this.get('noticeDueDateHelp') || 'If you are the landlord, enter the date the Notice to End tenancy was served to the tenant. If you are a tenant, enter the date the Notice to End tenancy was received.'
    }));

    this.set('noticeMethodModel', new DropdownModel({
        optionData: Formatter.getNoticeDeliveryMethodsFromCodeList(this.get('allowedNoticeMethodCodes')) || Formatter.getClaimDeliveryMethods(),
        defaultBlank: true,
        labelText: this.get('noticeMethodTitle') || 'Method of notice to tenant',
        errorMessage: 'Method is required',
        cssClass: useNoticeMethod? null : 'hidden',
        required: useNoticeMethod,
        value: claimDetail ? String(claimDetail.get('notice_method')) : null,
    }));

    this.set('textDescriptionModel', new TextareaModel({
        labelText: this.get('textDescriptionTitle') || 'Describe why this is being requested',
        errorMessage: 'Description is required',
        max: configChannel.request('get', 'CLAIM_DESCRIPTION_MAX'),
        countdown: true,
        cssClass: useTextDescription? 'no-max-width' : 'hidden',
        required: useTextDescription,
        value: claimDetail ? claimDetail.get('description') : null,
    }));

    const skip_evidence_codes = [
      configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE'),
      configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')
    ];
    // Sync the DisputeEvidence collection that was provided with any config values
    this.get('disputeEvidenceCollection').syncModelDataWithDisputeClaim(disputeClaim, { skip_evidence_codes });
  },

  hasMissingRequired() {
    const fields_to_validate = ['amountModel', 'noticeDueDateModel', 'noticeMethodModel', 'textDescriptionModel'];
    return _.any(fields_to_validate, function(modelName) {
      return this.get(modelName).get('required') && !$.trim(this.get(modelName).getData());
    }, this);
  },

  validate() {
    const error_obj = {};

    if (!this.get('hidden')) {
      _.each(['amountModel', 'noticeDueDateModel', 'noticeMethodModel', 'textDescriptionModel', 'disputeEvidenceCollection'], function(modelName) {
        if (!this.get(modelName).isValid()) {
          error_obj[modelName] = this.get(modelName).validationError;
        }
      }, this);

      if (!_.isEmpty(error_obj)) {
        return error_obj;
      }
    }
    this.set('stepComplete', true);
  },

  updateLocalModels() {
    const disputeClaim = this.get('disputeClaim'),
      data = this.getData({full: true});
    console.log(data);
    // Get claim detail for primary applicant
    disputeClaim.updateApplicantClaimDetail(data);
    disputeClaim.updateApplicantRemedy(_.extend({}, data));// Don't add rememdy_title for now, until we add it initially, { remedy_title: data.claim_title }));
    disputeClaim.updateApplicantRemedyDetail(data);
  },

  _model_mappings: [
      ['textDescriptionModel', 'description'],
      ['noticeDueDateModel', 'notice_date'],
      ['noticeMethodModel', 'notice_method'],
      ['amountModel', 'amount']
  ],

  getAmount() {
    const amount = this.get('amountModel').getData();
    if (_.isNaN(amount) || $.trim(amount) === '') {
      return null;
    } else {
      return amount;
    }
  },

  isDirectRequest() {
    const disputeClaim = this.get('disputeClaim');
    return disputeClaim ? disputeClaim.isDirectRequest() : false;
  },

  hasConfigTenancyAgreementEvidence() {
    const disputeClaim = this.get('disputeClaim');
    return disputeClaim ? disputeClaim.hasConfigTenancyAgreementEvidence() : false;
  },

  hasAllOptionalConfigTenancyAgreementEvidence() {
    const disputeClaim = this.get('disputeClaim');
    return disputeClaim ? disputeClaim.hasAllOptionalConfigTenancyAgreementEvidence() : false;
  },

  hasConfigMonetaryOrderWorksheetEvidence() {
    const disputeClaim = this.get('disputeClaim');
    return disputeClaim ? disputeClaim.hasConfigMonetaryOrderWorksheetEvidence() : false;
  },

  hasAllOptionalConfigMonetaryOrderWorksheetEvidence() {
    const disputeClaim = this.get('disputeClaim');
    return disputeClaim ? disputeClaim.hasAllOptionalConfigMonetaryOrderWorksheetEvidence() : false;
  },

  getData(options) {
    options = options || {};
    const return_obj = {};

    _.each(this._model_mappings, function(mapping) {
      var new_name = (mapping.length === 2)? mapping[1] : mapping[0];
      var data = this.get(mapping[0]).getData();
      // Don't show attributes that aren't filled in (frontend validation will make sure of this)
      // Allow an option to skip this behaviour
      if (options.full || (data !== null && data !== "")) {
          return_obj[new_name] = data;
      }
    }, this);

    if (_.has(return_obj, 'notice_method')) {
      return_obj.notice_method = parseInt(return_obj.notice_method);
      if (_.isNaN(return_obj.notice_method)) {
        return_obj.notice_method = 0;
      }
    }

    return_obj.claim_title = this.get('claim_title');
    return return_obj;
  },

  getRuleDate() {
    const servedWaitDays = (this.get('disputeClaim').claimConfig || {}).servedWaitDays;
    const selectedDueDate = Moment(this.get('noticeDueDateModel').getData());
    const selectedMethod = this.get('noticeMethodModel').getData();

    if (!servedWaitDays || !selectedDueDate || !selectedMethod) return null;

    const dispute = disputeChannel.request('get');
    const initialMomentToUse = dispute.isTenant() ? Moment.max(selectedDueDate, Moment(dispute.get('tenancy_end_date'))) : selectedDueDate;
    const serviceMethodCode = this.ALL_SERVICE_METHODS_INVERTED[selectedMethod];
    const deemedDays = _.has(this.SERVICE_METHOD_DEEMED_DAY_OFFSETS, serviceMethodCode) ? this.SERVICE_METHOD_DEEMED_DAY_OFFSETS[serviceMethodCode] : null;
    const daysToAdd = Number(servedWaitDays) + (Number(deemedDays) || 0);
    const newMomentValue = _.isNumber(daysToAdd) ? initialMomentToUse.add(daysToAdd, 'days') : null;
    const correctedRuleDate = newMomentValue && newMomentValue.isValid() ? UtilityMixin.util_getFirstBusinessDay(newMomentValue) : null;

    // Add one extra day as you can only file the day after the rules-based deadline date - and then correct for weekends/holidays again
    return correctedRuleDate && correctedRuleDate.isValid() ? UtilityMixin.util_getFirstBusinessDay(correctedRuleDate.add(1, 'day')) : null;
  },

});
