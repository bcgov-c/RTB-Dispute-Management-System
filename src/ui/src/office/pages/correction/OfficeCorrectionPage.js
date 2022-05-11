import OfficeRequestPageView from '../office-request/OfficeRequestPage';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');

const ALLOWED_DAY_OFFSET = 15;
const requestName = 'correction';

export default OfficeRequestPageView.extend({

  initialize() {
    const pageOptions = {
      formCode: 87,
      requestName,
      model: this.model,
      enablePayments: false,    
      taskActivityType: configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_CORRECTION'),
      requestType: configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_CORRECTION'),
      itemTypesConstantVals: [
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_TYPING',
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_MATH',
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_OBVIOUS',
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_OMISSION'
      ],

      submittedDateWarningFn: _.bind(this.warningDateFn, this)
    };
    return OfficeRequestPageView.prototype.initialize.call(this, pageOptions);
  },

  warningDateFn(submittedDate, receivedDate) {
    // if (!submittedDate || !receivedDate) {
    //   console.log(`[Warning] Invalid dates passed to date warning check function.  Not returning errors`);
    //   return;
    // }
    // if (!submittedDate || !receivedDate) {
    //   console.log(`[Warning] Invalid dates passed to date warning check function.  Not returning errors`);
    //   return;
    // }
    // const receivedDateWithOffset = Moment(receivedDate).add(ALLOWED_DAY_OFFSET, 'days');
    // if (Moment(submittedDate).isAfter(receivedDateWithOffset, 'days')) {
    //   return `Warning: a request for a ${requestName} is only allowed within ${ALLOWED_DAY_OFFSET} days of the associated document being received.  This request is likely to be rejected unless there are exceptional circumstances and they are described in the request form.`
    // }
  }

});