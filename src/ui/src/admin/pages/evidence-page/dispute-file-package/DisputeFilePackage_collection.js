import Backbone from 'backbone';
import DisputeFilePackageModel from './DisputeFilePackage_model';

export default Backbone.Collection.extend({
  model: DisputeFilePackageModel,
  
  toEvidenceListData() {
    return _.filter(this.map(model => {
      return {
        title: model.getPackageTitle(),
        data: _.flatten(_.pluck(model.toEvidenceListData(), 'data')),
        // NOTE: Don't show "removed" styling on intake package, because Needs Update will update it
        isRemoved: model.isPackageCreatorAmendRemoved() && !model.isIntakePackage()
      };
    }), packageData => packageData.data.length);
  }

});