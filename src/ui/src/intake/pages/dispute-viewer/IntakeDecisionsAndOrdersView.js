import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import PrintIcon from '../../../core/static/Icon_Print.png';
import RefreshIcon from '../../static/Icon_AdminBar_Refresh_Grey.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputePrintHeaderJsx from '../../../core/components/print-header/DisputePrintHeaderJsx';

const Formatter = Radio.channel('formatter').request('get');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');

const IntakeDecisionsAndOrdersView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['refreshDataAndRenderView']);
    this.decisionDocs = documentsChannel.request('get:all')?.filter(doc => {
      const deliveredDocs = doc.getDeliverableOutcomeFiles()?.filter(file => file.get('outcome_doc_deliveries')?.find(doc => doc.get('is_delivered') && Moment(doc.get('delivery_date')).isBefore(Moment())))

      return doc.isCompleted() && deliveredDocs?.length;
    })
  },

  print() {
    window.print();
  },

  refresh() {
    this.refreshDataAndRenderView();
  },

  clickFilename(fileModel) {
    fileModel.download();
  },

  template() {
    return (
      <div className="intake-dispute">
        <div className="intake-dispute__page-title hidden-print">
          <span>Decisions and Orders</span>
          <div className="intake-dispute__header-actions">
            <span onClick={() => this.refresh()} className="intake-dispute__page-title__refresh"><img src={RefreshIcon}/></span>
            <span onClick={() => this.print()} className="intake-dispute__page-title__print hidden-xs"><img src={PrintIcon}/></span>
          </div>
        </div>

        {DisputePrintHeaderJsx(`File Number: ${disputeChannel.request('get')?.get('file_number')} Decisions and Orders`)}

        <p className="intake-dispute__description">This is a record of all Decisions and Orders that are available to you on this dispute file. Click on the document file to view or download.</p>

        {this.renderJsxDecisionDocs()}
      </div>
    );
  },

  getOutcomeDocDeliveryParticipants(doc) {
    const deliveryParticipantsArray = doc.getOutcomeFiles().map(outcomeFile => outcomeFile.getDeliveries().filter(delivery => delivery.get('is_delivered') && 
      participantsChannel.request('get:participant', delivery.get('participant_id'))).map(delivery => ({ participantId: delivery.get('participant_id'), deliveryMethod: delivery.get('delivery_method') })))?.flat();
    const uniqueParticipants  = deliveryParticipantsArray.filter((value, index, self) => index === self.findIndex((t) => ( t.place === value.place && t.participantId === value.participantId)));
  
    return uniqueParticipants;
  },

  renderJsxDecisionDocs() {
    const deliveryMethods = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_METHOD_DISPLAY');

    return this.decisionDocs.map(doc => {
      const deliveryParticipants = this.getOutcomeDocDeliveryParticipants(doc);
      return (
        <>
        <div key={doc.id}>
          <div className="intake-dispute__label">
            <span className="review-label">Decision Date:</span>
            <span><b>{doc.get('doc_completed_date') ? Formatter.toDateDisplay(doc.get('doc_completed_date')) : 'date not available'}</b></span>
          </div>
          <div className="intake-dispute__label">
            <span className="review-label">Documents:</span>
            <span>{this.renderDocuments(doc)}</span>
          </div>
          <div className="intake-dispute__label--break-word">
            <span className="review-label">Delivered to:</span>
            <span>{deliveryParticipants.map((participant, index) => {return `${participantsChannel.request('get:participant:name', participant.participantId)}${deliveryParticipants.deliveryMethod ? ` (${deliveryMethods[deliveryParticipants.deliveryMethod]})` : ''}${index !== deliveryParticipants.length -1 ? ', ' : ''}`})}</span>
          </div>
        </div>
        <div className="intake-dispute__seperator"></div>
        </>
      )
    })
  },

  renderDocuments(doc) {
    const docFiles = doc.getOutcomeFiles();
    return <>
      { (!docFiles?.length) ? '-' :
          docFiles.map((docFile, index) => {
            const file = filesChannel.request('get:file', docFile.get('file_id'));
            if (!file) return;
            const groupTitle = docFile.isOther() ? 'Documents' : docFile.config.group_title;
            return (
              <>
                <a href="javascript:;" data-file-id={file.get('file_id')} className="file-list__file-download filename-download" onClick={() => this.clickFilename(file)}>{file.get('file_name')}</a>&nbsp;
                <span>- {groupTitle}&nbsp;
                <span className="dispute-issue-evidence-filesize">({Formatter.toFileSizeDisplay(file.get('file_size'))}, {Formatter.toDateDisplay(file.get('file_date'))}){ (index !== docFiles.length - 1) ? <span className="list-comma">, </span> : null }</span></span>
              </>
            )
          })
        }
    </>
  }

});

_.extend(IntakeDecisionsAndOrdersView.prototype, ViewJSXMixin);
export default IntakeDecisionsAndOrdersView;