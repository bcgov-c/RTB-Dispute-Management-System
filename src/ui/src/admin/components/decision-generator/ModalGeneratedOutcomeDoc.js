import React from 'react';
import ReactDOM from 'react-dom';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import GeneratedDocOptionOne from './GeneratedDocOptionOne';
import GeneratedDocOptionTwoView from './GeneratedDocOptionTwo';
import GeneratedDocOptionThreeView from './GeneratedDocOptionThree';
import GeneratedOutcomeDocPreview from './GeneratedOutcomeDocPreview';
import DocRequestCollection from '../../../core/components/documents/doc-requests/DocRequest_collection';
import DecGenData from './DecGenData';
import SubstitutedServiceCollection from '../../../core/components/substituted-service/SubstitutedService_collection';
import DecGenIssueConfig from './DecGenIssueConfig';
import Formatter from '../../../core/components/formatter/Formatter';
import './ModalGeneratedOutcomeDoc.scss';
import BaseDecision_template from './decision-templates/BaseDecision_template.tpl';
import { renderToString } from 'react-dom/server';
import { MHPTA_ACT_CONFIG, RTA_ACT_CONFIG } from './DecGenActTextConfig';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const documentsChannel = Radio.channel('documents');
const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');

const ModalGeneratedOutcomeDoc = ModalBaseView.extend({

  initialize(options) {
    this.mergeOptions(options, []);
    this.template = this.template.bind(this);

    this.showPreview = false;
    this.inputsView = null;
    this.monetaryOrderIds = configChannel.request('get', 'file_types_monetary_order');
    this.orderOfPossessionIds = configChannel.request('get', 'file_types_order_of_possession');
    this.subServiceDocId = configChannel.request('get', 'file_types_sub_service');
    this.correctionsDocId = configChannel.request('get', 'file_types_corrections');
    this.clarificationsDocId = configChannel.request('get', 'file_types_clarifications');
    this.reviewDocId = configChannel.request('get', 'file_types_review');
    this.ccrSubServIds = [...this.subServiceDocId, ...this.correctionsDocId, ...this.clarificationsDocId, ...this.reviewDocId];
    this.docTitle = $.trim(`${this.model.config?.code} ${this.model.config?.title}`);
    this.templateData = {};
    this.generationOptions = {};

    this.listenTo(this.model, 'close:modal', () => this.close());
  },

  getCCRSubServRequestData() {
    const docRequestCollection = documentsChannel.request('get:requests')?.filter(request => !request.isStatusWithdrawn()
      && !request.isStatusAbandoned()
      && !request.isStatusCancelledOrDeficient());
    const subServices = new SubstitutedServiceCollection(noticeChannel.request('get:subservices')?.filter(request => !request.isStatusDenied() && !request.isStatusWithdrawn()));

    let instructionTitle = '';
    
    if (this.subServiceDocId.includes(this.model.config.id)) {
      this.requestCollection = subServices;
      instructionTitle = 'Select the substituted service request you are writing the decision for';
    } else if (this.correctionsDocId.includes(this.model.config.id)) {
      this.requestCollection = new DocRequestCollection(docRequestCollection.filter(request => request.isCorrection()));
      instructionTitle = 'Select the correction request you are writing the decision for';
    } else if (this.clarificationsDocId.includes(this.model.config.id)) {
      this.requestCollection = new DocRequestCollection(docRequestCollection.filter(request => request.isClarification()));
      instructionTitle = 'Select the clarification request you are writing the decision for';
    } else if (this.reviewDocId.includes(this.model.config.id)) {
      this.requestCollection = new DocRequestCollection(docRequestCollection.filter(request => request.isReview()));
      instructionTitle = 'Select the review consideration request you are writing the decision for';
    }

    const requestCollection = this.requestCollection;

    return { requestCollection, instructionTitle }
  },

  async clickDownloadAndClose() {
    const decisionHtml = this.getChildView('previewRegion')?.$el?.html();
    let decisionTitle;
    if (this.model.config.code === configChannel.request('get', 'OUTCOME_DOC_DECISION_CODE')) {
      decisionTitle = `DEC`;
    } else if (this.monetaryOrderIds?.includes(this.model.config.id)) {
      decisionTitle = `ORD_MN`;
    } else if (this.orderOfPossessionIds?.includes(this.model.config.id)) {
      decisionTitle = `ORD_OP`;
    } else if (this.subServiceDocId?.includes(this.model.config.id)) {
      decisionTitle = `SS`;
    } else if (this.correctionsDocId?.includes(this.model.config.id)) {
      decisionTitle = `COR`;
    } else if (this.clarificationsDocId?.includes(this.model.config.id)) {
      decisionTitle = `CLAR`;
    } else if (this.reviewDocId?.includes(this.model.config.id)) {
      decisionTitle = `REV`;
    } else if (configChannel.request('get', 'file_types_interim_decisions')?.includes(this.model.config.id)) {
      decisionTitle = `INT`;
    } else {
      decisionTitle = `DOCGEN`;
    }

    decisionTitle = `${decisionTitle}_${disputeChannel.request('get').get('file_number')}_${Moment().format('YYYYMMDD')}`;
    const result = await filesChannel.request('download:html', `<html>${decisionHtml}</html>`, `${decisionTitle}.doc`, { forceDialog: true });
    if (result) this.close();
  },

  onBeforeRender() {
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);

    // Reset templateData on render - will be added in "prepare" functions below
    this.templateData = {};
    if (this.monetaryOrderIds.includes(this.model.config.id) || this.orderOfPossessionIds.includes(this.model.config.id)) {
      this.prepareOrderRender();
    } else if (this.ccrSubServIds.includes(this.model.config.id)) {
      this.prepareSubServeOrCcrRender();
    } else {
      this.prepareStandardDecisionRender();
    }
  },

  prepareStandardDecisionRender() {
    this.inputsView = new GeneratedDocOptionOne({ model: this.model, selectedGenerationOptionsCode: this.model.get('selectedGenerationOptionsCode') });
    this.showPreview = true;
    this.generationOptions = Object.assign({}, this.inputsView.getSelectedGenerationOptions());

    this.stopListening(this.model, 'select:generationOptions');
    this.listenTo(this.model, 'select:generationOptions', (selectedGenerationOptionsCode) => {
      this.model.set({ selectedGenerationOptionsCode });
      this.generationOptions = Object.assign({}, this.inputsView.getSelectedGenerationOptions());
      this.render();
    });
  },

  prepareOrderRender() {
    this.inputsView = new GeneratedDocOptionThreeView();
    this.showPreview = true;
    this.templateData = {
      [DecGenData['DecisionHeader:hidePartyInitials']]: true,
    };
  },

  prepareSubServeOrCcrRender() {
    const isSubService = this.subServiceDocId.includes(this.model.config.id);

    this.templateData = {
      [DecGenData['DecisionHeader:hideLinkedFileNumbers']]: isSubService,
    };
   
    this.inputsView = new GeneratedDocOptionTwoView({ requestData: this.getCCRSubServRequestData(), isSubService, selectedCCRSubServId: this.model.get('selectedCCRSubServId') });
    
    this.stopListening(this.requestCollection, 'select:request');
    this.listenTo(this.requestCollection, 'select:request', (selectedId) => {
      this.model.set({ selectedCCRSubServId: selectedId });
      this.showPreview = true;
      this.render();
    });
  },

  onRender() {
    this.showChildView('inputsRegion', this.inputsView);
    if (this.showPreview) this.showChildView('previewRegion', new GeneratedOutcomeDocPreview({ model: this.model, templateData: this.templateData, generationOptions: this.generationOptions }));
  },

  clickDownloadConfigs() {
    const issues_config = configChannel.request('get', 'issues_config');   
    
    // Setup csv content
    const header = ['Issue Id', 'Issue Code', 'Process', 'Act', 'Act Title', 'Decided Title', 'Conversational Act',
        'Strict Act Custom HTML', 'Conversational Granted', 'Conversational Granted Conclusion', 'Section Numbers'];
    const lines = []
    lines.push(header);

    const fullIssuesConfig = {};

    Object.keys(DecGenIssueConfig || {}).sort().forEach(issueId => {
      if (!fullIssuesConfig[issueId]) {
        fullIssuesConfig[issueId] = Object.assign({},
          DecGenIssueConfig?.[issueId], issues_config[issueId]);
      }
      const issueConfig = fullIssuesConfig[issueId];
      
      const defaultLine = [
        issueId,
        issueConfig.code
      ];

      const parseIssueConfig = (actText) => {
        Object.keys(issueConfig?.[actText] || {}).sort().forEach(process => {
          const config = issueConfig?.[actText]?.[process];
          const newLine = [...defaultLine];
          newLine.push(process || '');
          newLine.push(actText || '');
          newLine.push(config?.actTitle || '');
          newLine.push(config?.decidedTitle || '');
          newLine.push(config?.conversationalAct || '');
          newLine.push(config?.strictAct?.replace(/\n/g, '\\n') || '');
          newLine.push(config?.conversationalGranted || '');
          newLine.push(config?.conversationalGrantedConclusion || '');
          newLine.push(config?.sectionNumbers?.join(', ') || '');
          
          lines.push(newLine);
        });
      };

      parseIssueConfig('RTA');
      parseIssueConfig('MHPTA');
    });

    const fileName = `DecisionGenerator_IssueConfigs_${Formatter.toDateDisplay(Moment())}`;
    filesChannel.request('download:csv', lines, fileName);

    // Pass all .csv lines except header to be formatted, in same order as .csv
    this.downloadDoc(lines.slice(1), fileName, fullIssuesConfig);
  },

  downloadDoc(lines, fileName, fullIssuesConfig) {
    const baseDecisionHtml = BaseDecision_template({
      title: this.model.get('DecisionGenerator IssueConfigs Doc'),
    });

    let htmlBody = '';
    htmlBody += `<h1>DMS Decision Generator - Issue Layouts ${Formatter.toDateDisplay(Moment())}</h1>`;

    lines.forEach(line => {
      const issueId = line[0];
      const issueCode = line[1];
      const process = line[2];
      const actText = line[3];
      const config = fullIssuesConfig?.[issueId]?.[actText]?.[process];
      const ACT_CONFIG = actText === "RTA" ? RTA_ACT_CONFIG : actText === "MHPTA" ? MHPTA_ACT_CONFIG : {};
      const strictActHtml = config?.strictAct ? config.strictAct : config?.sectionNumbers?.map(num => ACT_CONFIG[String(num)]);
      const html = renderToString(
        <>
          <div className="services_subtitle_sm">{issueId}/{issueCode}/{actText}/{process}</div>
          <div className="section_subtitle2">{config?.decidedTitle}</div>
          <br/>
          <div dangerouslySetInnerHTML={{ __html: strictActHtml }}></div>
          <br/>
          <div className="services_subtitle_sm">Conversational:</div>
          <div dangerouslySetInnerHTML={{ __html: config?.conversationalAct }}></div>
          <br/>
        </>
      );
      
      htmlBody += html;
    });
    
    // Concatenate the new content into the decision
    const updatedBaseDecisionHtml = baseDecisionHtml.replace(/\<body\>.*\<\/body\>/im, `<body><div class="decision_content_container">${htmlBody}</div></body>`);
    filesChannel.request('download:html', updatedBaseDecisionHtml, `${fileName}.doc`);
  },

  className: `${ModalBaseView.prototype.className} generate-outcome-doc`,

  regions: {
    previewRegion: '#decision-preview',
    inputsRegion: '.generate-outcome-doc__user-inputs',
  },

  ui() {
    return Object.assign({}, ModalBaseView.prototype.ui, {
      downloadConfigs: '.general-link'
    });
  },

  events() {
    return Object.assign({}, ModalBaseView.prototype.events, {
      'click @ui.downloadConfigs': 'clickDownloadConfigs'
    });
  },

  template() {
    const modalTitle = `Generate ${this.docTitle}`;
    
    const SHOW_DECISION_GENERATOR_CONFIGS = configChannel.request('get', 'UAT_TOGGLING')?.SHOW_DECISION_GENERATOR_CONFIGS;
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{modalTitle}</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="generate-outcome-doc__user-inputs"></div>

            <div className="modal-body-inner">
              <div className="upload-button-container clearfix">
                {SHOW_DECISION_GENERATOR_CONFIGS ? (
                  <span className="general-link">Download issue language (.csv and .doc)</span>
                ) : null}

                <div className="float-right">
                  <button type="button" className="btn btn-lg btn-default btn-cancel">
                    <span>Cancel</span>
                  </button>
                  {this.showPreview ?  <button type="button" className="btn btn-lg btn-default btn-primary btn-upload" onClick={()=> this.clickDownloadAndClose()}>
                    <span>Download and Close</span>
                  </button> : null}
                </div>
              </div>
              {this.showPreview ? <div id="decision-preview" className="previewableContainer"></div> : null}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

_.extend(ModalGeneratedOutcomeDoc.prototype, ViewJSXMixin);
export default  ModalGeneratedOutcomeDoc;