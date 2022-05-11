import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { routeParse } from '../../routers/mainview_router';
import { renderToString } from 'react-dom/server';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import CeuReceiptRendererMixin from '../../../core/components/custom-data-objs/ceu/CeuReceiptRendererMixin';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import { ReceiptContainer } from '../../../core/components/receipt-container/ReceiptContainer';
import IntakeCeuDataParser from '../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import ExternalFile_collection from '../../../core/components/custom-data-objs/external/ExternalFile_collection';
import FileDisplayView from '../common-files/FileDisplay';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import './CEUComplaintDetailsPage.scss';
import wordTemplate from '../../../core/components/custom-data-objs/ceu/CeuReceiptWord_template.tpl';

const RECEIPT_TITLE = `CEU Complaint Submission`;

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const userChannel = Radio.channel('users');
const filesChannel = Radio.channel('files');
const searchChannel = Radio.channel('searches');
const Formatter = Radio.channel('formatter').request('get');

const CEUComplaint = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.ceuEditGroup = ['statusRegion', 'urgencyRegion', 'ownerRegion', 'descriptionRegion'];
    
    this.prepareReceiptVariablesForRender();

    this.extFilesCollection = this.model.extFilesCollection;
    
    // Update the internal files collections if uploaded
    if (this.extFilesCollection) {
      this.units.forEach(unit => {
        if (unit.get('r_tenancy_agreement_extfile_ids') && Array.isArray(unit.get('r_tenancy_agreement_extfile_ids'))) {
          const matchingFiles = unit.get('r_tenancy_agreement_extfile_ids').map(fileId => {
            const matchingFile = this.extFilesCollection && this.extFilesCollection.find(extFile => extFile.id === fileId);
            return matchingFile ? matchingFile : null;
          }).filter(f => f);
          const ev = unit.get('tenancyAgreementEvidence');
          ev.set('files', new ExternalFile_collection(matchingFiles));
        }
      });
      this.contraventions.forEach(c => {
        c.getEvidenceCollection().forEach(ev => {
          if (ev.get('e_evidence_extfile_ids') && Array.isArray(ev.get('e_evidence_extfile_ids'))) {
            const matchingFiles = ev.get('e_evidence_extfile_ids').map(fileId => {
              const matchingFile = this.extFilesCollection && this.extFilesCollection.find(extFile => extFile.id === fileId);
              return matchingFile ? matchingFile : null;
            }).filter(f => f);
            ev.set('files', new ExternalFile_collection(matchingFiles));
          }
        });
      });
    }

    const snapshotFileId = this.currentSubmissionData.g_pdf_application_snapshot_extfile_id;
    this.snapshotFileModel = snapshotFileId && this.extFilesCollection && this.extFilesCollection.find(file => file.id === snapshotFileId);
    
    this.createSubModels();
  },

  createSubModels() {
    const CEU_STATUS_SUBMITTED = configChannel.request('get', 'CEU_STATUS_SUBMITTED');
    const CEU_STATUS_PROCESSED = configChannel.request('get', 'CEU_STATUS_PROCESSED');
    const CEU_STATUS_COMPLETED = configChannel.request('get', 'CEU_STATUS_COMPLETED');
    const CEU_STATUS_DISPLAY = configChannel.request('get', 'CEU_STATUS_DISPLAY') || {};
    const CEU_URGENCY_EMERGENCY = configChannel.request('get', 'CEU_URGENCY_EMERGENCY');
    const CEU_URGENCY_STANDARD = configChannel.request('get', 'CEU_URGENCY_STANDARD');
    const CEU_URGENCY_DEFERRED = configChannel.request('get', 'CEU_URGENCY_DEFERRED');
    const CEU_URGENCY_DISPLAY = configChannel.request('get', 'CEU_URGENCY_DISPLAY') || {};
    const ceuUsers = userChannel.request('get:all:users').filter();

    this.fileStatusModel = new DropdownModel({
      optionData: [
        { text: CEU_STATUS_DISPLAY[CEU_STATUS_SUBMITTED], value: CEU_STATUS_SUBMITTED },
        { text: CEU_STATUS_DISPLAY[CEU_STATUS_PROCESSED], value: CEU_STATUS_PROCESSED },
        { text: CEU_STATUS_DISPLAY[CEU_STATUS_COMPLETED], value: CEU_STATUS_COMPLETED },
      ],
      labelText: 'File Status',
      defaultBlank: false,
      value: this.model.get('object_status') || null,
      apiMapping: 'object_status',
    });

    this.urgencyModel = new DropdownModel({
      optionData: [
        { text: CEU_URGENCY_DISPLAY[CEU_URGENCY_EMERGENCY], value: CEU_URGENCY_EMERGENCY },
        { text: CEU_URGENCY_DISPLAY[CEU_URGENCY_STANDARD], value: CEU_URGENCY_STANDARD },
        { text: CEU_URGENCY_DISPLAY[CEU_URGENCY_DEFERRED], value: CEU_URGENCY_DEFERRED },
      ],
      labelText: 'Urgency',
      defaultBlank: true,
      required: true,
      value: this.model.get('object_sub_status'),
      apiMapping: 'object_sub_status',
    });


    this.ceuOwnerModel = new DropdownModel({
      optionData: ceuUsers.map(user => (
        { value: user.id, text: user.getDisplayName() }
      )),
      labelText: 'CEU Owner',
      defaultBlank: true,
      value: this.model.get('owner_id'),
      apiMapping: 'owner_id',
    });

    this.internalDescriptionModel = new TextareaModel({
      labelText: 'Internal Description',
      required: false,
      max: 240,
      min: 10,
      countdown: true,
      value: this.model.get('object_description'),
      apiMapping: 'object_description'
    });
  },

  resetModelValues() {
    // Pass
  },

  onMenuEdit() {
    this.ceuEditGroup.forEach((componentName) => {
      const component = this.getChildView(componentName);
      if (component) component.toEditable();
    });
  },

  onMenuSave() {
    this.ceuEditGroup.forEach((componentName) => {
      const component = this.getChildView(componentName);
      if (component) this.model.set(component.getApiData());
    });

    loaderChannel.trigger('page:load');
    this.model.save(this.model.getApiChangesOnly())
      .fail(generalErrorFactory.createHandler('EXTERNAL.CUSTOM.SAVE', () => {
        Backbone.history.loadUrl(Backbone.history.fragment);
      }))
      .always(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      })
  },

  onMenuCancel() {
    this.ceuEditGroup.forEach((componentName) => {
      const component = this.getChildView(componentName);
      if (component) {
        component.toView();
      }
    });
  },

  onMenuDownloadAll() {
    if (!this.extFilesCollection || !this.extFilesCollection.length) return;
    filesChannel.request('download:files', this.extFilesCollection.models);
  },

  clickDownloadExtFile(ev) {
    const ele = $(ev.currentTarget);
    const fileId = ele.data('id');
    if (!fileId) return;
    const fileModel = this.extFilesCollection && this.extFilesCollection.find(file => file.id === fileId);
    if (!fileModel) return;

    filesChannel.request('click:filename:preview', ev, fileModel, { fallback_download: true });
  },

  clickDmsLink(ev) {
    const ele = $(ev.currentTarget);
    const dmsFileNum = ele.data('id');
    if (!dmsFileNum) return;
    
    loaderChannel.trigger('page:load');
  
    searchChannel.request('search:dispute:direct', dmsFileNum)
      .done(disputeGuid => {
        if (!disputeGuid) {
          loaderChannel.trigger('page:load:complete');
          modalChannel.request('show:standard', {
            title: `No matching DMS dispute found`,
            bodyHtml: `Unable to find a DMS dispute for file number <b>${dmsFileNum}</b> . Try using the DMS Advanced Search.`,
            hideContinueButton: true,
          });
          return;
        }
        Backbone.history.navigate(routeParse('overview_item', disputeGuid), { trigger: true });
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
      });
  },

  clickDownloadEditable() {
    const receiptHtml = wordTemplate({
      title: this.model.get('reference_id'),
      bodyHtmlString: renderToString(this.receiptRenderPdfHtml({ renderAsStaffDoc: true })),
    });
    filesChannel.request('download:html', receiptHtml, `${this.model.get('reference_id')}.doc`);
  },

  onRender() {
    this.showChildView('statusRegion', new EditableComponentView({
      state: 'view',
      label: this.fileStatusModel.get('labelText'),
      view_value: this.fileStatusModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.fileStatusModel
      })
    }));

    this.showChildView('urgencyRegion', new EditableComponentView({
      state: 'view',
      label: this.urgencyModel.get('labelText'),
      view_value: this.urgencyModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.urgencyModel
      })
    }));

    this.showChildView('ownerRegion', new EditableComponentView({
      state: 'view',
      label: this.ceuOwnerModel.get('labelText'),
      view_value: this.ceuOwnerModel.getSelectedText() || '-',
      subView: new DropdownView({
        model: this.ceuOwnerModel
      })
    }));

    this.showChildView('descriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.internalDescriptionModel.get('labelText'),
      view_value: this.model.get('object_description') ? this.model.get('object_description') : '-',
      subView: new TextareaView({
        model: this.internalDescriptionModel
      })
    }));

    if (this.snapshotFileModel) {
      this.showChildView('snapshotRegion', new FileDisplayView(Object.assign({
        model: this.snapshotFileModel,
        enableFilePreview: true,
        showDelete: false,
        showModelType: false,
        showInfo: false,
        showThumbnails: false,
      })));
    }

    this.showChildView('receiptContainerRegion', new ReceiptContainer({
      emailSubject: `File number ${this.model.get('reference_id')}: ${RECEIPT_TITLE} Receipt`,
      containerTitle: RECEIPT_TITLE,
      displayHtml: this.receiptRenderPageHtml(),
      hideSubmissionText: true,
      enableLogout: false,
      disableEmail: true,
      customButtonText: 'Download Editable',
      customButtonFn: () => this.clickDownloadEditable(),
    }));
  },

  ui: {
    fileDownload: '.ceu-receipt-file .general-link',
    dmsFileDownload: '.ceu-receipt-dms-file .general-link',
  },

  events: {
    'click @ui.fileDownload': 'clickDownloadExtFile',
    'click @ui.dmsFileDownload': 'clickDmsLink',
  },

  regions: {
    statusRegion: '.ceu-complaint__file-status',
    urgencyRegion: '.ceu-complaint__urgency',
    ownerRegion: '.ceu-complaint__owner',
    descriptionRegion: '.ceu-complaint__description',
    snapshotRegion: '.ceu-complaint__snapshot',
    receiptContainerRegion: '.ceu-complaint__receipt'
  },

  template() {
    const isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    const primaryApplicant = this.applicants.find(p => p.get('p_is_primary_applicant'));
    
    const submitterName = primaryApplicant ? `${isRespondentLandlord ? 'Tenant' : 'Landlord'}: ${primaryApplicant.getContactName()}` : null;
    const submittedDateDisplay = this.currentSubmissionData.g_submitted_date ? Formatter.toDateAndTimeDisplay(Moment(this.currentSubmissionData.g_submitted_date)) : 'Not submitted';
    const submittedByDisplay = `${submitterName ? `${submitterName} - ` : ''}${submittedDateDisplay}`;

    return <div className="ceu-complaint">
        <div className="ceu-complaint__edit-section">
          <div className="dispute-party-column left-column">
            <div>
              <label className="review-label">Submitted By:</label>&nbsp;<span>{submittedByDisplay}</span>
            </div>
            <div className="ceu-complaint__file-status"></div>
            <div className="ceu-complaint__urgency"></div>
            <div className="ceu-complaint__owner"></div>
          </div>
          
          <div className="dispute-party-column right-column">
            <div>
              <label className="review-label">Modified:</label>&nbsp;<span>{userChannel.request('get:user:name', this.model.get('modified_by'))} - {Formatter.toDateAndTimeDisplay(this.model.get('modified_date'))}</span>
            </div>
            <div className="ceu-complaint__description"></div>
          </div>
          
          <div className="ceu-complaint__snapshot-container">
            <label className="review-label">Complaint Snapshot:</label>&nbsp;<span className="ceu-complaint__snapshot">-</span>
          </div>
        </div>
        <div className="ceu-complaint__receipt"></div>
      </div>;
  },


})

_.extend(CEUComplaint.prototype, CeuReceiptRendererMixin, ViewJSXMixin);
export default CEUComplaint;