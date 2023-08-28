/**
 * @fileoverview - Modal for generating a notice of hearing
 */
import Radio from 'backbone.radio';
import React from 'react';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Input from '../../../core/components/input/Input';
import Input_model from '../../../core/components/input/Input_model';
import Radio_model from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import HearingNoticePreview from '../../components/notice/HearingNoticePreview';
import Formatter from '../../../core/components/formatter/Formatter';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { HEARING_NOTICE_GENERATE_TYPES } from '../../../core/components/hearing/Hearing_model';
import './ModalAddHearingNotice.scss';

const FILE_DESCRIPTION_TITLE = {
  [HEARING_NOTICE_GENERATE_TYPES.ADJOURNED]: `Adjourned Hearing`,
  [HEARING_NOTICE_GENERATE_TYPES.RESCHEDULED]: `Rescheduled Hearing`,
  [HEARING_NOTICE_GENERATE_TYPES.FOLLOWUP]: `Follow-up to Prehearing`,
};
const FILE_TITLE_ROOT = {
  [HEARING_NOTICE_GENERATE_TYPES.ADJOURNED]: `Adjourned Hearing`,
  [HEARING_NOTICE_GENERATE_TYPES.RESCHEDULED]: `Rescheduled Hearing`,
  [HEARING_NOTICE_GENERATE_TYPES.FOLLOWUP]: `Dispute Hearing`,
};

const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');

/**
 * @param {Number} generationType - Type of hearing to be generated. ADJOURNED|RESCHEDULED|FOLLOWUP
 */
const ModalAddHearingNotice = ModalBaseView.extend({
  initialize(options) {
    ModalBaseView.prototype.initialize.call(this, ...arguments);
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['generationType']);

    this.dispute = disputeChannel.request('get');
    this.hearing = hearingChannel.request('get:active');
    if (!this.hearing) {
      alert("A future hearing is required to generate a hearing notice");
      return this.close();
    }

    if (!this.generationType) {
      return alert("Error getting valid hearing generation type");
    }
    
    this.noticeTitle = `Hearing Notice - ${FILE_DESCRIPTION_TITLE[this.generationType]}`;
    this.createSubModels();
  },

  createSubModels() {
    this.typeModel = new Radio_model({
      optionData: [{ value: 1, text: 'Generate', }],
      value: 1,
    });
    this.titleModel = new Input_model({
      labelText: 'Notice Title',
      disabled: true,
      value: FILE_DESCRIPTION_TITLE[this.generationType],
    });
  },

  async clickGenerate() {
    loaderChannel.trigger('page:load');
    const existingFileDescription = this.hearing?.getHearingNoticeFileDescription();
    if (existingFileDescription) {
      existingFileDescription.markAsDeficient(`This hearing notice was regenerated from the hearing by a staff user`);
      await existingFileDescription.save();
    }
    
    await this.generateHearingNotice(this.getChildView('preview').$el.html());
    this.close();
  },

  async generateHearingNotice(html) {
    loaderChannel.trigger('page:load');
    const pdfData = {
      html_for_pdf: html,
      file_title: FILE_TITLE_ROOT[this.generationType],
    };

    let pdfFileModel;
    await Promise.all([
      this.hearing?.createHearingNotice({ title: this.noticeTitle }).catch(generalErrorFactory.createHandler('ADMIN.FILEDESCRIPTION.SAVE')),
      pdfFileModel = await filesChannel.request('upload:pdf', this.dispute.id, pdfData).catch(generalErrorFactory.createHandler('ADMIN.PDF.GENERATE'))
    ]).catch(() => {
      return this.close(); 
    });

    await filesChannel.request('create:linkfile', pdfFileModel, this.hearing?.getHearingNoticeFileDescription())
      .catch(generalErrorFactory.createHandler('ADMIN.LINKFILE.CREATE'));
    
    this.hearing?.trigger('hearings:refresh');
    loaderChannel.trigger('page:load:complete');
    this.close();
  },

  onRender() {
    this.showChildView('typeRadio', new RadioView({ model: this.typeModel, displayTitle: 'Hearing Notice' }));
    this.showChildView('titleInput', new Input({ model: this.titleModel }));
    this.showChildView('preview', new HearingNoticePreview({
      noticeTitle: this.noticeTitle,
      generationType: this.generationType,
    }));
  },

  className() { return `${ModalBaseView.prototype.className} generate-notice`; },

  regions: {
    'typeRadio': '.generate-notice__type',
    'titleInput': '.generate-notice__title',
    'preview': '.generate-notice__preview'
  },

  template() {
    return <div className="modal-dialog">
    <div className="modal-content clearfix">
      <div className="modal-header">
        <h4 className="modal-title">Add Notice of Hearing</h4>
        <div className="modal-close-icon-lg close-x"></div>
      </div>
      <div className="modal-body clearfix">
        <div className="generate-notice__top-section">
          <div className="generate-notice__type"></div>
        </div>
        <div className="modal-body-inner">
          <div className="generate-notice__info-section">
            <div className="generate-notice__title"></div>
            <div className="generate-notice__process general-modal-label">Dispute Process:&nbsp;<span className="general-modal-value">{Formatter.toProcessDisplay(this.dispute.getProcess())}</span></div>
          </div>
          <div className="generate-notice__buttons">
            <div className="float-right">
              <div className="btn btn-lg btn-default btn-cancel">Cancel</div>
              <div className="btn btn-lg btn-default btn-primary" onClick={()=>this.clickGenerate()}>Generate</div>
            </div>
          </div>
          <div className="previewableContainer">
            <div className="generate-notice__preview"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  },

});


_.extend(ModalAddHearingNotice.prototype, ViewJSXMixin);

export default ModalAddHearingNotice;
