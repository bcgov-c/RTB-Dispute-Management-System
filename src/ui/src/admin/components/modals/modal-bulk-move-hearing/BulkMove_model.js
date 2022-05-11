import CMModel from '../../../../core/components/model/CM_model';

export default CMModel.extend({
  idAttribute: 'hearing_id',

  defaults: {
    hearing_id: null,
    hearingModel: null,
    moveOperationResult: null,
    errorMessage: null
  },

  initialize() {
    if (this.getHearingModel()) this.set({ hearing_id: this.getHearingModel().id });
  },

  getHearingModel() {
    return this.get('hearingModel');
  }
});