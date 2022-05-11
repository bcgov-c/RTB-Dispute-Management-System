import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import pdf_template from './NoticePdf_template.tpl';

const disputeChannel = Radio.channel('dispute');
const participantChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const hearingChannel = Radio.channel('hearings');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template(data) {
    const templateToUse = data.templateToUse || pdf_template;
    delete data.templateToUse;
    return templateToUse(data);
  },

  ui: {
    specialInstructionsContainer: '#special-instructions-container',
    specialInstructionsContent: '#special-instructions-html',
  },

  initialize(options) {
    this.mergeOptions(options, ['templateToUse', 'templateData']);

    this.dispute = disputeChannel.request('get');
    // Always remove claims/evidence that were removed by party
    this.disputeClaims = claimsChannel.request('get:full').removeAllRemovedClaimsAndEvidence();
  },

  updateSpecialInstructions(new_special_instructions) {
    this.getUI('specialInstructionsContent').html(new_special_instructions);
  },

  showSpecialInstructions() {
    this.getUI('specialInstructionsContainer').show();
  },

  hideSpecialInstructions(removeDOM) {
    const ui = this.getUI('specialInstructionsContainer');
    if (removeDOM) {
      ui.remove();
    } else {
      ui.hide();
    }
  },

  templateContext() {
    const isApplicantAndHasUploaded = function(evidence) {
      const participantModel = participantChannel.request('get:participant', evidence.get('description_by'));
      return participantModel && participantModel.isApplicant() && evidence.get('files').hasUploaded();
    };

    const fillFileInfo = function(fileDescription) {
      fileDescription.set('files', filesChannel.request('get:filedescription:files', fileDescription));
    };

    const intakeFilePackage = filesChannel.request('get:filepackage:intake');

    const taFileDescriptionModels = filesChannel.request('get:filedescriptions:code', configChannel.request('get', 'STANDALONE_TENANCY_AGREEMENT_CODE')) || [];
    taFileDescriptionModels.forEach(fillFileInfo);

    const mowFileDescriptionModels = filesChannel.request('get:filedescriptions:code', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE')) || [];
    mowFileDescriptionModels.forEach(fillFileInfo);

    const bulkFileDescriptionModels = filesChannel.request('get:filedescriptions:category', configChannel.request('get', 'EVIDENCE_CATEGORY_BULK')) || [];
    bulkFileDescriptionModels.forEach(fillFileInfo);
    
    const hearing = hearingChannel.request('get:active');
    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const hearingTimeDisplay = hearing ? Formatter.toTimeDisplay(hearing.get('local_start_datetime'), RTB_OFFICE_TIMEZONE_STRING) : null;
    const conferenceBridge = hearing ? hearing.getConferenceBridge() : null;
    const fileNumber = this.dispute.get('file_number');

    const intakeFileDescriptionTA = _.findWhere(taFileDescriptionModels, model => intakeFilePackage && model.get('files').any(file => file.get('file_package_id') === intakeFilePackage.id));
    const intakeFileDescriptionMOW = _.findWhere(mowFileDescriptionModels, model => intakeFilePackage && model.get('files').any(file => file.get('file_package_id') === intakeFilePackage.id));
    const applicantBulkEvidences = _.sortBy(_.filter(bulkFileDescriptionModels, isApplicantAndHasUploaded), model => model.get('created_date'));
    const participatoryNoticeProcessCodes = ['PROCESS_ORAL_HEARING', 'PROCESS_REVIEW_HEARING', 'PROCESS_JOINER_HEARING'];
    const isParticipatoryHearing = participatoryNoticeProcessCodes.map(c => configChannel.request('get', c)).includes(this.dispute.getProcess());
    const unitTypeDisplay = this.dispute.getDisputeUnitTypeDisplay();

    const supportingFilesTA = intakeFileDescriptionTA && filesChannel.request('get:filedescription:files', intakeFileDescriptionTA);
    const supportingFilesMOW = intakeFileDescriptionMOW && filesChannel.request('get:filedescription:files', intakeFileDescriptionMOW);

    const supportingFilesCountBulk = applicantBulkEvidences.reduce(function(memo, evidence) {
      const files = filesChannel.request('get:filedescription:files', evidence);
      return memo + (files && files.getUploadedIntake().length);
    }, 0);

    return _.extend({
      templateToUse: this.templateToUse || pdf_template,
      Formatter,
      RTB_OFFICE_TIMEZONE_STRING: configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING') || 'America/Los_Angeles',
      dispute: this.dispute,
      disputeClaims: this.disputeClaims,
      hearing,
      noticeTitleDisplay: `Notice of Dispute Resolution Proceeding${!isParticipatoryHearing ? ' - Direct Request' : '' }`,
      isLandlord: this.dispute.isLandlord(),
      isTenant: this.dispute.isTenant(),
      otherLinkedFileNumbers: hearing ?
        hearing.getDisputeHearings()
          .filter(disputeHearing => !fileNumber || disputeHearing.get('file_number') !== fileNumber)
          .map(dh => dh.getFileNumber()) : [],
      conferenceBridgeData: conferenceBridge ? conferenceBridge.toJSON() : {},
      hearingTimeDisplay,

      tenancyUnitDisplay: unitTypeDisplay ? `(${unitTypeDisplay})` : null,
      tenancyAddressDisplay: this.dispute.get('tenancy_address'),
      tenancyCityDisplay: this.dispute.get('tenancy_city'),
      tenancyPostalDisplay: this.dispute.get('tenancy_zip_postal'),

      applicants: participantChannel.request('get:applicants'),
      respondents: participantChannel.request('get:respondents'),
      primaryApplicant: participantChannel.request('get:primaryApplicant'),
      
      hasSupportingTA: _.filter(taFileDescriptionModels, isApplicantAndHasUploaded).length,
      supportingTitleTA: intakeFileDescriptionTA ? intakeFileDescriptionTA.get('title') : '',
      supportingDescriptionTA: intakeFileDescriptionTA ? intakeFileDescriptionTA.get('description') : '',
      supportingFilesCountTA: supportingFilesTA && supportingFilesTA.getUploadedIntake().length,
      
      hasSupportingMOW: _.filter(mowFileDescriptionModels, isApplicantAndHasUploaded).length,
      intakeFileDescriptionMOW,
      supportingTitleMOW: intakeFileDescriptionMOW ? intakeFileDescriptionMOW.get('title') : '',
      supportingDescriptionMOW: intakeFileDescriptionMOW ? intakeFileDescriptionMOW.get('description') : '',
      supportingFilesCountMOW: supportingFilesMOW && supportingFilesMOW.getUploadedIntake().length,

      hasSupportingBulk: applicantBulkEvidences.length,
      supportingTitleBulk: applicantBulkEvidences.length ? applicantBulkEvidences[0].get('title') : '',
      supportingDescriptionBulk: applicantBulkEvidences.length ? applicantBulkEvidences[0].get('description') : '',
      supportingFilesCountBulk,

      isParticipatoryHearing,

      INTAKE_LOGIN_URL: configChannel.request('get', 'INTAKE_URL')
    }, this.templateData);
  }
});