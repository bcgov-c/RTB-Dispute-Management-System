import Radio from 'backbone.radio';
import DisputeEvidenceCollection from '../../claim/DisputeEvidence_collection';
import UploadModel from '../../upload/UploadMixin_model';

const filesChannel = Radio.channel('files');
const paymentsChannel = Radio.channel('payments');
const participantsChannel = Radio.channel('participants');

export default UploadModel.extend({
  initialize(options={}) {
    UploadModel.prototype.initialize.call(this);
    const evidenceData = this.getFeeWaiverEvidenceData(options);
    this.set('evidenceCollection', new DisputeEvidenceCollection(evidenceData));
  },

  getFeeWaiverEvidenceData(options={}) {
    const fee_waiver_evidence_config = paymentsChannel.request('get:payment:evidence:config');
    const filteredFeeWaiverConfig = _.filter(fee_waiver_evidence_config, config => $.trim(config.title).toLowerCase().indexOf('fee waiver,') !== -1)

    return _.map(filteredFeeWaiverConfig, function(config) {
      const matching_file_description = !options?.resetEvidence ? filesChannel.request('get:filedescription:code', config.id) : null;
      return {
        evidence_id: config.id,        
        description_by: !matching_file_description ? participantsChannel.request('get:primaryApplicant:id') : null,
        category: config.category,
        title: config.title,
        mustProvideNowOrLater: true,
        required: true,
        file_description: matching_file_description ? matching_file_description : null,
      }
    }, this);
  }
});