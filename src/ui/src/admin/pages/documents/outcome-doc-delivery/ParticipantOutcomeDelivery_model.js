import Backbone from 'backbone';
import CheckboxCollection from '../../../../core/components/checkbox/Checkbox_collection';

export default Backbone.Model.extend({
  defaults: {
    outcome_doc_group_model: null,
    participant_model: null,// Not used for type Other
    outcome_doc_file_model: null, // Only used for type Other
    outcome_doc_delivery_model: null,
    // Store this collection here so that it can be retrieved externally.
    // Not used for type Other
    inclusionCheckboxCollection: null,

    // UI only attrs
    _isSentChecked: false,
    _participantSaveData: null,
    _isEditMode: false,
    _isEditSentMode: false,
    _bulkSelectEnabled: false,
  },

  initialize() {
    const outcomeDocGroupModel = this.get('outcome_doc_group_model');
    outcomeDocGroupModel.createAssociatedOutcomeDeliveries();
    
    const participant_id = this.isOther() ? null : this.get('participant_model').get('participant_id');
    
    // Always set the inclusion checkbox at time of model creation, and the other view models later
    this.set('inclusionCheckboxCollection', new CheckboxCollection(
      _.map(outcomeDocGroupModel.getDeliverableOutcomeFiles(), outcomeDocFileModel => {
        const deliveryModel = outcomeDocFileModel.getParticipantDelivery(participant_id);
        return {
          html: outcomeDocFileModel.get('file_acronym'),
          checked: deliveryModel && !deliveryModel.isNew(),
          _associated_delivery_model: deliveryModel
        };
      })
    ));
  },

  resetModel() {
    this.set({
      _isEditMode: false,
      _isEditSentMode: false,
    });
    this.get('inclusionCheckboxCollection').each(function(checkboxModel) {
      const deliveryModel = checkboxModel.get('_associated_delivery_model');
      checkboxModel.set({
        checked: (deliveryModel && !deliveryModel.isNew()),
        disabled: false,
      }, { silent: true });
    }, this);
    this.trigger('render');
  },

  getIncludedDeliveries() {
    return this.get('inclusionCheckboxCollection').filter(model => model.get('checked')).map(model => model.get('_associated_delivery_model'));
  },

  isOther() {
    return !this.get('participant_model');
  },

  getFirstSavedDelivery() {
    const participantId = this.isOther() ? null : this.get('participant_model').get('participant_id');
    return this.isOther() ? this.get('outcome_doc_delivery_model') :
        this.get('outcome_doc_group_model').getFirstSavedDeliveryForParticipant(participantId);
  }
});