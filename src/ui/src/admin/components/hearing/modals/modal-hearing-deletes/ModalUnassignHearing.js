import ModalRemoveHearingDisputesView from './ModalRemoveHearingDisputes';
export default ModalRemoveHearingDisputesView.extend({
  templateContext() {
    return _.extend({}, ModalRemoveHearingDisputesView.prototype.templateContext.call(this), {
      titleText: 'Cancel (unassign)'
    });
  }
});