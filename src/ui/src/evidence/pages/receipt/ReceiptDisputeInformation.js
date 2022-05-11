import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import template from './ReceiptDisputeInformation_template.tpl';

const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'da-receipt-dispute-info',

  templateContext() {
    const dispute = disputeChannel.request('get'),
      participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    return {
      RECEIPT_FONT_SIZE_PX: this.model.getReceiptFontSizePx(),
      Formatter,
      Moment,
      dispute,
      isLandlord: !participant || participant.isLandlord(),
      isApplicant: participant && participant.isApplicant(),
      participantInitials: participant && participant.getInitialsDisplay() ? participant.getInitialsDisplay()  : '-',
    };
  }
});
