import Backbone from 'backbone';
import Radio from 'backbone.radio';
import InputModel from '../../../core/components/input/Input_model';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import IntakeAriDataParser from '../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  defaults: {
    issueId: null,
    name: 'remedy',
    remedyUseAmount: false,
    remedyUseAssociatedDate: false,
    remedyUseTextDescription: false,
    claimCode: null,
    cssClass: null,
    hidden: false,
    stepComplete: false,
    json: null,

    remedyModel: null
  },

  initialize() {
    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX') || 15;
    this.CLAIM_AMOUNT_MAX_NUM = configChannel.request('get', 'CLAIM_AMOUNT_MAX_NUM');
    this.EXPENSE_WARNING_MONTHS_OFFSET = configChannel.request('get', 'EXPENSE_WARNING_MONTHS_OFFSET');
    this.createSubModels();

    this.warningDate = Moment().subtract(this.EXPENSE_WARNING_MONTHS_OFFSET, 'months');
    
    this.listenTo(this.get('amountModel'), 'change:value', function() { this.trigger('amountChanged'); this.trigger('change'); }, this);
    this.listenTo(this.get('completedDateModel'), 'change:value', (model, value) => {
      this.trigger('show:warning', this.validateAndGetExpenseWarningMsg());
      this.trigger('change', model, value);
    });
    this.listenTo(this.get('textDescriptionModel'), 'change:value', function(model, value) { this.trigger('change', model, value); }, this);
  },

  createSubModels() {
    const remedyDetailModel = this.getAssociatedRemedyDetailModel();

    // Keep the name for consistency with issue/evidence config, but this date is not notice due date
    const remedyUseAssociatedDate = this.get('remedyUseAssociatedDate');
    const remedyUseAmount = this.get('remedyUseAmount');
    const remedyUseTextDescription = this.get('remedyUseTextDescription');
    const name = this.get('name');

    this.set('amountModel', new InputModel({
        name: `${name}-unit-${this.cid}`,
        inputType: 'currency',
        labelText: 'Capital Expenditure Amount',
        errorMessage: 'Amount is required',
        cssClass: remedyUseAmount? 'max-width-200' : 'hidden',
        maxLength: this.AMOUNT_FIELD_MAX,
        maxNum: this.CLAIM_AMOUNT_MAX_NUM,
        required: remedyUseAmount,
        value: remedyDetailModel && remedyDetailModel.get('amount') !== 0 ? remedyDetailModel.get('amount') : null,
        apiMapping: 'amount',
    }));

    this.set('completedDateModel', new InputModel({
        name: `${name}-notice-due-date-${this.cid}`,
        inputType: 'date',
        labelText: 'Date Capital Expenditure was Incurred',
        errorMessage: 'Date is required',
        cssClass: remedyUseAssociatedDate? null : 'hidden',
        required: remedyUseAssociatedDate,
        minDate: Moment().subtract( configChannel.request('get', 'DATE_MIN_YEAR_OFFSET'), 'years' ),
        value: remedyDetailModel ? remedyDetailModel.get('associated_date') : null,
        helpHtml: null,
        apiMapping: 'associated_date',
    }));

    this.set('textDescriptionModel', new TextareaModel({
        labelText: 'Description of Capital Expenditure',
        errorMessage: 'Description is required',
        max: configChannel.request('get', 'CLAIM_DESCRIPTION_MAX'),
        countdown: true,
        cssClass: remedyUseTextDescription? 'no-max-width' : 'hidden',
        required: remedyUseTextDescription,
        value: remedyDetailModel ? remedyDetailModel.get('description') : null,
        apiMapping: 'description',
    }));

    this.modelAttrsToValidate = ['amountModel', 'completedDateModel', 'textDescriptionModel'];
  },

  validateAndGetExpenseWarningMsg() {
    const dateModel = this.get('completedDateModel');
    if (dateModel.isValid() && this.warningDate && Moment(dateModel.getData()).isBefore(this.warningDate)) {
      return `Capital Expenditures incurred more than ${this.EXPENSE_WARNING_MONTHS_OFFSET} months ago may not be eligible for an Additional Rent Increase.`;
    }
  },

  getAssociatedRemedyDetailModel() {
    const remedyModel = this.get('remedyModel');
    const remedyDetails = remedyModel && remedyModel.getRemedyDetails();
    return remedyDetails && remedyDetails.length ? remedyDetails.at(0) : null;
  },

  hasAssociatedUnitData() {
    const remedyModel = this.get('remedyModel');
    if (!remedyModel || remedyModel.isNew()) {
      return false;
    }

    // Get updated data and check for data associations
    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'));    
    IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    return IntakeAriDataParser.toCostCollection().filter(cost => cost.getRemedyId() === remedyModel.id && cost.getUnitIds().length).length;
  },

  hasMissingRequired() {
    return _.any(this.modelAttrsToValidate, function(modelName) {
      return this.get(modelName).get('required') && !$.trim(this.get(modelName).getData());
    }, this);
  },

  validate() {
    const error_obj = {};

    if (!this.get('hidden')) {
      _.each(this.modelAttrsToValidate, function(modelName) {
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

  fullSave() {
    const remedyModel = this.get('remedyModel');
    const remedyDetailModel = this.getAssociatedRemedyDetailModel();
    if (!remedyDetailModel) {
      return $.Deferred().resolve().promise();
    }

    // Save remedy and remedyDetails will be saved with it as needed, with correct remedy_id set after remedy model save, if needed
    return remedyModel.save(remedyModel.getApiChangesOnly(), { full: true });
  },

  // Saves the UI dropdown / input values into backbone models
  saveInternalDataToModel() {
    const remedyDetailModel = this.getAssociatedRemedyDetailModel();

    if (!remedyDetailModel) {
      console.log(`[Error] No matching remedy detail found to update.`);
      return;
    }

    const remedyDetailsData = {};
    _.each(this.modelAttrsToValidate, (modelAttr) => _.extend(remedyDetailsData, this.get(modelAttr).getPageApiDataAttrs()));

    console.log(remedyDetailsData);
    remedyDetailModel.set(remedyDetailsData);
  },


  // Save the local model values into the associated Claim/Details/Remedy objects
  updateLocalModels() {
    const disputeClaim = this.get('disputeClaim'),
      data = this.getData({full: true});
    console.log(data);
    // Get claim detail for primary applicant
    disputeClaim.updateApplicantClaimDetail(data);
    disputeClaim.updateApplicantRemedy(_.extend({}, data));
    disputeClaim.updateApplicantRemedyDetail(data);
  },

  _model_mappings: [
      ['textDescriptionModel', 'description'],
      ['completedDateModel', 'notice_date'],
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

    return return_obj;
  }

});
