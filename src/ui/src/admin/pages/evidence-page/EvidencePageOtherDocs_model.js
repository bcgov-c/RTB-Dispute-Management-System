import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DisputeEvidence_collection from '../../../core/components/claim/DisputeEvidence_collection';
import DisputeEvidence_model from '../../../core/components/claim/DisputeEvidence_model';

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');

export default Backbone.Model.extend({

  defaults: {
    generalTitle: 'General Documents',
    paymentTitle: 'Payment Documents',
    legacyTitle: 'Legacy Documents',
  },

  initialize() {
    this.set({
      generalCollection: new DisputeEvidence_collection(),
      paymentCollection: new DisputeEvidence_collection(),
      legacyCollection: new DisputeEvidence_collection(),
    });
    this.EVIDENCE_CATEGORY_GENERAL = configChannel.request('get', 'EVIDENCE_CATEGORY_GENERAL');
    this.EVIDENCE_CATEGORY_PAYMENT = configChannel.request('get', 'EVIDENCE_CATEGORY_PAYMENT');
    this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL = configChannel.request('get', 'EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL');

    filesChannel.request('get:filedescriptions')?.forEach(fileDescription => {
      if (fileDescription.get('is_deficient')) return;
      const category = fileDescription.get('description_category');
      let targetCollection;
      if (category === this.EVIDENCE_CATEGORY_GENERAL) targetCollection = this.get('generalCollection');
      else if (category === this.EVIDENCE_CATEGORY_PAYMENT) targetCollection = this.get('paymentCollection');
      else if (category === this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL) targetCollection = this.get('legacyCollection');
      if (!targetCollection) return;
      targetCollection.push(new DisputeEvidence_model({ file_description: fileDescription }));
    });
  },

  getTitle(disputeEvidence) {
    const category = disputeEvidence.getDescriptionCategory();
    return (category === this.EVIDENCE_CATEGORY_GENERAL) ? this.get('generalTitle')
      : (category === this.EVIDENCE_CATEGORY_PAYMENT) ? this.get('paymentTitle')
      : (category === this.EVIDENCE_CATEGORY_LEGACY_SERVICE_PORTAL) ? this.get('legacyTitle')
      : null;
  },

  toEvidenceListData() {
    return [{
        title: this.get('generalTitle'),
        data: this.collectionToEvidenceListData(this.get('generalCollection')),
      },
      {
        title: this.get('paymentTitle'),
        data: this.collectionToEvidenceListData(this.get('paymentCollection')),
      },
      {
        title: this.get('legacyTitle'),
        data: this.collectionToEvidenceListData(this.get('legacyCollection')),
      }
    ].filter(d => d.data?.length);
  },

  collectionToEvidenceListData(collection=[]) {
    return collection.map(disputeEvidence => {
      return {
        title: disputeEvidence.getTitle(),
        evidenceModel: disputeEvidence,
        files: disputeEvidence.get('files').filter(fileModel => fileModel.isUploaded()),
        isRemoved: disputeEvidence.isParticipantRemoved()
      };
    }).filter(data => data.files.length);
  },

});