import Backbone from 'backbone';
import EvidencePagePartyModel from './EvidencePageParty_model';

export default Backbone.Collection.extend({
  model: EvidencePagePartyModel,

  toEvidenceListData() {
    return _.filter(this.map(model => {
      const arrowIconHtml = `<div class="file-package-title-arrow ${model.isApplicant() ? 'applicant-upload' : (model.isRespondent() ? 'respondent-upload' : '')}"></div>`;
      return {
        title: `${arrowIconHtml}&nbsp;${model.getContactName()}`,
        data: _.flatten(_.pluck(model.toEvidenceListData(), 'data')),
        isRemoved: model.isRemoved()
      };
    }), partyData => partyData.data.length);
  }
});