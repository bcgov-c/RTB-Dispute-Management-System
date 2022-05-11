import Marionette from 'backbone.marionette';
import RenovationUnitView from './RenovationUnit';

const RenovationUnitCollectionView = Marionette.CollectionView.extend({
  childView: RenovationUnitView,

  _getMatchingClaimModel(unitModel) {
    const disputeClaimCollection = this.getOption('disputeClaimCollection');
    const issueId = unitModel.get('issue_id');
    return issueId && disputeClaimCollection && disputeClaimCollection.find(disputeClaim => disputeClaim.claim.get('claim_id') === issueId);
  },

  childViewOptions(unitModel) {
    const disputeClaim = this._getMatchingClaimModel(unitModel);
    return {
      disputeClaim
    };
  }
});

export default Marionette.View.extend({
  template: _.template(`<div class="pfr-units-list"></div><div class="error-block"></div>`),
  
  regions: {
    list: '.pfr-units-list'
  },

  ui: {
    error: '.error-block'
  },

  initialize(options) {
    this.mergeOptions(options, ['disputeClaimCollection']);
    this.options = _.extend({}, this.options, options);
  },
  
  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  hideErrorMessage() {
    this.getUI('error').html('').hide();
  },

  getChildren() {
    const listView = this.getChildView('list');
    return (listView && listView.isRendered() && listView.children) || [];
  },

  getUserDescription(claimId) {
    const matchingClaimUnit = this.getChildren().find(function(childView) {
      return childView.isRendered() && childView.model.get('issue_id') === claimId && claimId;
    });
    return matchingClaimUnit && matchingClaimUnit.textDescriptionModel.getData();
  },

  validateAndShowErrors() {
    let is_valid = true;
    this.getChildren().each(function(childView) {
      if (childView) {
        is_valid = childView.validateAndShowErrors() & is_valid;
      }
    }, this);
    return is_valid;
  },

  onRender() {
    this.showChildView('list', new RenovationUnitCollectionView(this.options));
  },

});