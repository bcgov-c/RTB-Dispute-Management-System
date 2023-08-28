import { HEARING_NOTICE_GENERATE_TYPES } from '../../../core/components/hearing/Hearing_model';
import NoticePreview from './NoticePreview';

export default NoticePreview.extend({

  initialize(options) {
    NoticePreview.prototype.initialize.call(this, options);
    this.mergeOptions(options, ['noticeTitle', 'generationType']);

    this.templateData = _.extend({}, this.templateData, {
        isParticipatoryHearing: true,
        noticeTitleDisplay: this.noticeTitle,
      }
    );
  },

  onRender() {
    if (_.isFunction(NoticePreview.prototype.onRender)) NoticePreview.prototype.onRender.call(this);
    
    const importantInfoText = {
      [HEARING_NOTICE_GENERATE_TYPES.ADJOURNED]: `Your dispute resolution hearing has been adjourned. Here are your new teleconference details.`,
      [HEARING_NOTICE_GENERATE_TYPES.RESCHEDULED]: `Your dispute resolution hearing has been rescheduled. Here are your new teleconference details.`,
      [HEARING_NOTICE_GENERATE_TYPES.FOLLOWUP]: `The pre-hearing has concluded. A hearing has been scheduled, please refer to the new Hearing Information below.`,
    };
    const spacerBlock = `<div class="spacer_med">&nbsp;</div>`;

    this.$('#important-information tr:nth-child(2) .text_content').text(importantInfoText[this.generationType]);
    this.$('#important-information tr:nth-child(3)').remove();
    this.$('#filed-by .sectiontitle_onecol > span:first-child').text(`For the Application for Dispute Resolution Filed By`);
    this.$('#filed-against .sectiontitle_onecol > span:first-child').text(`Having Claim(s) Against`);
  
    // Clear most elements of the notice, and move hearing info up and re-style
    
    const contactHtml = $(this.$('#rtb-contact-information'));
    this.$('#hearing-information').nextAll().remove();
    this.$('#hearing-information').insertBefore(this.$('#filed-by'))
    this.$('#hearing-information').wrap(`<div id="hearing-information__container"></div>`);
    this.$('#hearing-information__container').css({ border: '2px solid #003366', padding: '10px' })
    $(spacerBlock).insertBefore(this.$('#filed-by'));

    this.$('#dispute-address + .spacer_sml').after(contactHtml).remove();
    $(spacerBlock).insertBefore(this.$('#rtb-contact-information'));
  },

});