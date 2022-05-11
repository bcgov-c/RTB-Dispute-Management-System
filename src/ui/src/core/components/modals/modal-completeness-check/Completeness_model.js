import Backbone from 'backbone';
import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';

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