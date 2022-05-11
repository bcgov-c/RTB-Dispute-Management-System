import Backbone from 'backbone';
import Radio from 'backbone.radio';
import AriRemedyInformationCollection from './AriRemedyInformation_collection';

const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  defaults: {
    issueId: null,
    name: 'claim',
    claim_title: null,
    useAriRemedy: false,
    
    useNoticeDueDate: null,
    noticeDueDateTitle: null,
    noticeDueDateHelp: null,
    useNoticeMethod: null,
    noticeMethodTitle: null,
    allowedNoticeMethodCodes: null,
    useAmount: null,
    amountTitle: null,
    useTextDescription: null,
    textDescriptionTitle: null,

    remedyUseAmount: null,
    remedyUseTextDescription: null,
    remedyUseAssociatedDate: null,
    
    claimCode: null,
    cssClass: null,
    hidden: false,
    stepComplete: false,
    json: null,

    helpHtml: null,
    disputeClaim: null,
    disputeEvidenceCollection: null,
    remedyInformationCollection: null
  },

  initialize() {
    this.createSubModels();
  },

  createSubModels() {
    const ownData = this.toJSON();
    this.set('remedyInformationCollection', new AriRemedyInformationCollection(this.get('disputeClaim').getAllRemedies().map(remedyModel => _.extend({}, ownData, { remedyModel }))));

    const skip_evidence_codes = [
      configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE'),
      configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')
    ];
    // Sync the DisputeEvidence collection that was provided with any config values
    this.get('disputeEvidenceCollection').syncModelDataWithDisputeClaim(this.get('disputeClaim'), { skip_evidence_codes, skip_remedy_id: true });
  },

  hasMissingRequired() {
    return this.get('remedyInformationCollection').any(remedyInfoModel => remedyInfoModel.hasMissingRequired());
  },

  validate() {
    const error_obj = {};

    if (!this.get('hidden')) {
      _.each(['disputeEvidenceCollection'], function(modelName) {
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

  addRemedyModel() {
    const disputeClaim = this.get('disputeClaim');
    const claims = claimsChannel.request('get')
    
    const addedRemedy = disputeClaim.addRemedy(claims.getEmptyRemedyData());

    console.log(addedRemedy);
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    addedRemedy.addDetail({ description_by: primaryApplicant.id });

    this.get('remedyInformationCollection').push(_.extend({}, this.toJSON(), { remedyModel: addedRemedy }));

    // Return the added remedyInfo model
    return this.get('remedyInformationCollection').at(-1);
  },

  save() {
    this.saveInternalDataToModel();
    const dfd = $.Deferred();
    Promise.all(this.get('remedyInformationCollection').map(remedyInfo => remedyInfo.fullSave()))
      .then(dfd.resolve, dfd.reject)
    return dfd.promise();
  },

  saveInternalDataToModel() {
    this.get('remedyInformationCollection').forEach(remedyInfo => remedyInfo.saveInternalDataToModel());
  },

  getData() {
    const return_obj = {};
    return_obj.claim_title = this.get('claim_title');
    return return_obj;
  }

});
