import OfficeRequestPageView from '../office-request/OfficeRequestPage';
import DisputeFeeModel from '../../../core/components/payments/DisputeFee_model';
import Radio from 'backbone.radio';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const paymentsChannel = Radio.channel('payments');

export default OfficeRequestPageView.extend({

  initialize() {
    const dispute = disputeChannel.request('get');
    const loggedInParticipantId = dispute && dispute.get('tokenParticipantId');
    const paidReviewFees = paymentsChannel.request('get:fees').filter(f => f.isPaid() && f.isReviewFee() && f.get('payor_id') === loggedInParticipantId && loggedInParticipantId);
    const latestPaidReviewFee = paidReviewFees.slice(-1)?.[0];
    this.disputeFeeModel = latestPaidReviewFee ? latestPaidReviewFee : new DisputeFeeModel({
      fee_type: configChannel.request('get', 'PAYMENT_FEE_TYPE_REVIEW'),
      due_date: Moment().toISOString(),
      is_active: true,
      fee_description: configChannel.request('get', 'PAYMENT_FEE_DESCRIPTION_REVIEW'),
      amount_due: configChannel.request('get', 'PAYMENT_FEE_AMOUNT_REVIEW'),
      payor_id: loggedInParticipantId || null,
    });

    const pageOptions = {
      formCode: 88,
      requestName: 'review',
      requestTitle: 'Submit Application for Review Consideration',
      model: this.model,
      enablePayments: true,
      taskActivityType: configChannel.request('get', 'TASK_ACTIVITY_TYPE_OS_REV_REQUEST'),
      submittedDateWarningFn: () => {},
      dateContinueMsg: `Confirm that the person submitting the Application for Review understands the above information. Would they like to continue?`,
      disputeFeeModel: this.disputeFeeModel,
      requestType: configChannel.request('get', 'OUTCOME_DOC_REQUEST_TYPE_REVIEW'),
      itemTypesConstantVals: [
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND',
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE',
        'OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD'
      ],
    };
    return OfficeRequestPageView.prototype.initialize.call(this, pageOptions);
  }

});