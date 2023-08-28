import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server'
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import CeuPage from '../../../components/page/CeuPage';
import PageItemView from '../../../../core/components/page/PageItem';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import Checkbox from '../../../../core/components/checkbox/Checkbox';
import Checkbox_model from '../../../../core/components/checkbox/Checkbox_model';
import Input_model from '../../../../core/components/input/Input_model';
import Input from '../../../../core/components/input/Input';
import UploadViewMixin from '../../../../core/components/upload/UploadViewMixin';
import UploadMixin_model from '../../../../core/components/upload/UploadMixin_model';
import FeeWaiverEvidence from '../../../../core/components/payments/fee-waiver/FeeWaiverEvidence';
import DisputeEvidence_collection from '../../../../core/components/claim/DisputeEvidence_collection';
import DisputeEvidence_model from '../../../../core/components/claim/DisputeEvidence_model';
import File_collection from '../../../../core/components/files/File_collection';
import '../../../../evidence/pages/upload/Upload.scss';
import '../../../../core/components/receipt-container/ReceiptContainer.scss';
import './IntakeCeuPageReview.scss';
import CeuReceiptRendererMixin from '../../../../core/components/custom-data-objs/ceu/CeuReceiptRendererMixin';
import wordTemplate from '../../../../core/components/custom-data-objs/ceu/CeuReceiptWord_template.tpl';

const animationChannel = Radio.channel('animations');
const applicationChannel = Radio.channel('application');
const filesChannel = Radio.channel('files');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');

const IntakeCeuPageReview = CeuPage.extend({

  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    this.prepareReceiptVariablesForRender();

    // Upload variables
    this.fileUploader = null;
    this.isCancel = false;
    this.isUpload = false;
    this.uploadModel = new UploadMixin_model();

    const ceuFilesLookup = filesChannel.request('get:pending:ceu'); 
    const disputeEvidencesLookup = {};

    this.activeEvidenceIds = [
      ...this.units.map(unit => (unit.getTenancyAgreementEvidence() || {}).e_evidence_guid),
      ...this.contraventions.map(c => c.getAllSavedEvidence().map(ev => ev.e_evidence_guid))
    ].flat();

    // Create DisputeEvidence holders for the file uploads
    Object.keys(ceuFilesLookup).map(fileId => {
      const fileData = ceuFilesLookup[fileId] || {};
      const evidenceData = fileData.evidenceData || {};
      const evidenceGuid = evidenceData.e_evidence_guid;
      
      // Don't upload files no longer associated to a unit or contravention
      if (this.activeEvidenceIds.indexOf(evidenceGuid) === -1) return;
      
      const fileModel = fileData.fileModel;
      // Prepare file for upload
      fileModel.set({ display_mode: true });
      
      if (disputeEvidencesLookup[evidenceGuid]) {
        disputeEvidencesLookup[evidenceGuid].get('files').add(fileModel, { silent: true });
      } else {
        disputeEvidencesLookup[evidenceGuid] = new DisputeEvidence_model({
          title: evidenceData.e_evidence_title,
          _skipFileDescriptionCreation: true,
          files: new File_collection([fileModel]),
          evidence_id: null,
          description_by: null,
          category: null,
          mustProvideNowOrLater: true,
          required: true,
          helpHtml: ' ',
          file_description: null
        });
      }
    });

    this.evidenceUploadCollection = new DisputeEvidence_collection(Object.values(disputeEvidencesLookup));
    this.evidenceUploadCollection.forEach(ev => this.uploadModel.addPendingUpload(ev));

    this.showExtraEmail = !this.applicants.find(p => p.get('p_is_primary_applicant') && p.get('p_email'));

    this.createPageItems();
    this.setupListeners();

    applicationChannel.trigger('progress:step', 8);

    this.getUrgency({ toConsole: true });
  },

  getRoutingFragment() {
    return 'page/8';
  },

  createPageItems() {
    this.emailModel = new Input_model({
      labelText: null,
      inputType: 'email',
      required: true,
      errorMessage: 'Enter email address'
    });

    if (this.showExtraEmail) {
      this.addPageItem('emailRegion', new PageItemView({
        stepText: `Please enter your email address. The CEU will send a confirmation email when they have received your complaint. The CEU may use this email for communication if they are unable to reach the primary complainant by phone.`,
        helpHtml: `The CEU requires a valid email address from one of the complainants to send a confirmation email with your file number. The CEU may also use this email if numerous attempts to call the primary complainant have gone unanswered. You cannot submit a complaint without an email address at this time.`,
        subView: new Input({ model: this.emailModel }),
        stepComplete: this.emailModel.isValid(),
        forceVisible: true,
      }));
    }

    this.touCheckboxModel = new Checkbox_model({
      html: `I confirm that I have reviewed the information above, and it is correct. I understand I will not be able to return to this intake form and change any information.`,
      checked: false,
      required: true,
    });
    this.addPageItem('touRegion', new PageItemView({
      stepText: null,
      subView: new Checkbox({ model: this.touCheckboxModel }),
      stepComplete: this.touCheckboxModel.isValid(),
      forceVisible: true,
    }));

    this.first_view_id = 'touRegion';
  },

  setupListeners() {
    this.listenTo(this.touCheckboxModel, 'change:checked', (model) => {
      model.set('disabled', true, { silent: true }).trigger('render');
      this.showNextButton();
    });
  },

  previousPage() {
    Backbone.history.navigate('#page/7', {trigger: true});
  },

  getUrgency(options={}) {
    const CEU_ISSUE_SEVERITY_HIGH = configChannel.request('get', 'CEU_ISSUE_SEVERITY_HIGH');
    const CEU_ISSUE_SEVERITY_LOW = configChannel.request('get', 'CEU_ISSUE_SEVERITY_LOW');
    const CEU_URGENCY_EMERGENCY = configChannel.request('get', 'CEU_URGENCY_EMERGENCY');
    const CEU_URGENCY_STANDARD = configChannel.request('get', 'CEU_URGENCY_STANDARD');
    const CEU_URGENCY_DEFERRED = configChannel.request('get', 'CEU_URGENCY_DEFERRED');
    let urgency;

    if (options.toConsole) console.log(`***********************************\n      COMPLEXITY CALCULATION      \n***********************************\n`);
    
    if (this.currentSubmissionData.g_complaint_is_emergency)  {
      if (options.toConsole) console.log(`* Rule matched: Application was determined to be type "emergency" in Step 1 based on user answers.\n\n* Setting urgency to to Emergency.`);
      urgency = CEU_URGENCY_EMERGENCY;
    } else if (this.contraventions.find(c => c.config.severity === CEU_ISSUE_SEVERITY_HIGH)) {
      if (options.toConsole) console.log(`* Rule matched: Application contains at least one High severity contravention.\n\n* Setting urgency to to Emergency.`);
      urgency = CEU_URGENCY_EMERGENCY;
    } else if (this.contraventions.all(c => c.config.severity === CEU_ISSUE_SEVERITY_LOW)) {
      if (options.toConsole) console.log(`* Rule matched: All contraventions in application are Low severity.\n\n* Setting urgency to Deferred.`);
      urgency = CEU_URGENCY_DEFERRED;
    } else {
      if (options.toConsole) console.log(`* No rules matched.\n\n* Setting urgency to Standard as a default.`);
      urgency = CEU_URGENCY_STANDARD;
    }

    if (options.toConsole) console.log(`***********************************`);
    return urgency;
  },

  nextPage() {
    if (!this.validatePage()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {force_scroll: true, is_page_item: true});
      }
      return;
    }
    
    const urgency = this.getUrgency();
    const reference_id = `CEU_${Moment().format('YYYY')}_${this.model.id}`;
    const saveData = {
      g_complaint_urgency_rating: urgency,
      g_contact_email: this.showExtraEmail ? this.emailModel.getData() : null,
      g_submitted_date: Moment().toISOString(),
      reference_id,
    };

    IntakeCeuDataParser.setJSON(Object.assign({}, this.currentSubmissionData, saveData));
    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.set({
      object_sub_status: urgency,
      is_active: true,
      reference_id
    });
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      this.startUploadAndReRender();
    }).fail(this.createPageApiErrorHandler(this));
  },

  startUploadAndReRender() {
    // Set correct URL on the uploader now that external ID has for sure been saved
    this.fileUploaderOptions = { url: filesChannel.request('get:fileupload:url:ceu') };
    const hasUploads = this.evidenceUploadCollection.filter(ev => ev.getReadyToUploadFiles()).length;
    
    // Check for files to upload
    if (hasUploads) {
      this.mixin_upload_transitionToUploadStep().always(() => {
        setTimeout(() => {
          if (this.isCancel) return;
          this.mixin_upload_startUploads();
        }, 1000);
      });
    } else {
      this.onUploadComplete();
    }
  },

  // Upload support functions
  onUploadComplete() {
    loaderChannel.trigger('page:load');
    const uploads = filesChannel.request('get:pending:ceu');
    
    // Remove the last section from the reference id to remove the file number -
    // the PDF generator auto-adds the file number and date to the PDF title
    const pdfTitle = `${this.model.get('reference_id')}`.split('_').slice(0,-1).join('_');
    
    // Add uploaded files back to the JSON and save -
    Object.keys(uploads).forEach(key => {
      const uploadData = uploads[key];
      const evidenceGuid = (uploadData.evidenceData||{}).e_evidence_guid;
      
      // Find which contravention/unit the file belongs to
      if (uploadData.fileModel && uploadData.fileModel.isUploaded()) {
        this.units.forEach(unit => {
          const evidence = unit.get('tenancyAgreementEvidence');
          if (evidence && evidence.get('e_evidence_guid') === evidenceGuid) {
            if (!Array.isArray(unit.get('r_tenancy_agreement_extfile_ids'))) unit.set('r_tenancy_agreement_extfile_ids', []);
            unit.get('r_tenancy_agreement_extfile_ids').push(uploadData.fileModel.get('external_file_id'));
          }
        });
        this.contraventions.forEach(c => {
          c.getEvidenceCollection().forEach(evidence => {
            if (evidence && evidence.get('e_evidence_guid') === evidenceGuid) {
              if (!Array.isArray(evidence.get('e_evidence_extfile_ids'))) evidence.set('e_evidence_extfile_ids', []);
              evidence.get('e_evidence_extfile_ids').push(uploadData.fileModel.get('external_file_id'));
            }
          });
        });
      }
    });

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    IntakeCeuDataParser.setContraventionCollection(this.contraventions);
    IntakeCeuDataParser.setUnitCollection(this.units);
    this.model.updateJSON(IntakeCeuDataParser.toJSON());

    const receiptHtml = wordTemplate({
      title: this.model.get('reference_id'),
      bodyHtmlString: renderToString(this.receiptRenderPdfHtml({ showIntakeMode: true })),
    });

    filesChannel.request('upload:pdf:ceu', this.model, {
      html_for_pdf: receiptHtml,
      file_title: pdfTitle,
    })
    .then(fileModel => {
      IntakeCeuDataParser.parseFromCustomDataObj(this.model);
      // Save PDF file onto model, update status to submitted
      IntakeCeuDataParser.setJSON(Object.assign({}, IntakeCeuDataParser.toJSON(), {
        g_pdf_application_snapshot_extfile_id: fileModel.get('external_file_id')
      }));
      this.model.updateJSON(IntakeCeuDataParser.toJSON());
      this.model.set({ object_status: configChannel.request('get', 'CEU_STATUS_SUBMITTED'), });
      return new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).done(res).fail(rej));
    })
    .then(() => {
      applicationChannel.trigger('progress:step:complete', 8);
      Backbone.history.navigate('page/9', { trigger: true });
    })
    .catch(this.createPageApiErrorHandler(this, { forceLogout: true }));
  },

  onCancelButtonNoUpload() {
    
  },

  prepareFileDescriptionForUpload(fileDescriptionModel) {
    return;
  },

  prepareFilesForUpload(fileCollection) {
    return;
  },
  
  createFilePackageCreationPromise() {
    return $.Deferred().resolve().promise();
  },
  //

  onRender() {
    if (this.isUpload) {
      this.mixin_upload_updateReadyToUploadCount({ force: true });
      this.mixin_upload_updateUploadProgress();
      // Use a fee waiver evidence holder for evidence uploads
      this.showChildView('filesRegion', new FeeWaiverEvidence({
        mode: 'upload',
        model: new Backbone.Model({
          evidenceCollection: this.evidenceUploadCollection
        }),
        uploadModel: this.uploadModel
      }));
    } else {
      _.each(this.page_items, function(itemView, regionName) {
        this.showChildView(regionName, itemView);
      }, this);
      // Unhide first page item in order to start user flow
      this.showPageItem(this.first_view_id, {no_animate: true});
    }
  },

  className: `${CeuPage.prototype.className} intake-ceu-review`,

  ui() {
    return Object.assign({}, CeuPage.prototype.ui, {
      fileCounter: '.file-upload-counter',
      uploadingFilesProgress: '.da-upload-overall-file-progress',
    });
  },

  regions: {
    emailRegion: '.intake-ceu-review__email',
    touRegion: '.intake-ceu-review__tou',
    filesRegion: '.intake-ceu-review__upload__files'
  },

  template() {
    return this.isUpload ? this.renderJsxPageAsUpload() : <div className="">
      
      <div className="step-description evidence-info-heading">
        <p>Ensure your information is complete and accurate. <b>Submitted complaints cannot be changed.</b> To make changes now, use the 'Back' button at the bottom of the page.</p>
        <p>The Residential Tenancy Branch Compliance and Enforcement Unit will review your submitted complaint and contact you if more information is required.</p>
        <div className="intake-ceu-review__email"></div>
      </div>

      {this.receiptRenderPageHtml({ showIntakeMode: true, showIntakeNav: true })}

      <div className="intake-ceu-review__tou"></div>

      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="submit">BACK</button>
        <button className="navigation option-button step-next hidden-item" type="submit">SUBMIT COMPLAINT</button>
      </div>
    </div>
  },

  renderJsxPageAsUpload() {
    const ceuComplaintNumber = this.model.get('reference_id');
    return <div className="intake-ceu-review__upload da-upload-page-wrapper upload">
      <div className="da-upload-instructions">
        <div className="hidden file-upload-counter"></div>
        File&nbsp;<b className="da-upload-overall-file-progress"></b>&nbsp;is being uploaded to CEU complaint number&nbsp;<b>{ceuComplaintNumber}</b>. You will receive a receipt for your records once all your files have been processed.
      </div>
      <div className="intake-ceu-review__upload__files"></div>
    </div>;
  },
});

_.extend(IntakeCeuPageReview.prototype, CeuReceiptRendererMixin, ViewJSXMixin, UploadViewMixin);
export default IntakeCeuPageReview;
