import CMModel from '../../model/CM_model';

export default CMModel.extend({
  defaults: {
    disputeGuid: null,
    title: null,
    subTitle: null,
    helpHtml: null,
    value: null,
    showIO: null,
    showOffice: null,
    showAdjudicator: null,
    showArb: null
  },
});