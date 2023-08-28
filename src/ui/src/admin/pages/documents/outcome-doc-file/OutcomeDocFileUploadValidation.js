import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';

const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');

const OutcomeDocFileUploadValidation = Marionette.Object.extend({
  initialize(options) {
    this.mergeOptions(options, ['outcomeGroupModel', 'outcomeDocFile', 'isPublic']);
    this.isPublic = this.outcomeDocFile?.isPublic() || this.isPublic;
    this.dispute = disputeChannel.request('get');
  },

  hasDup(fileObj) {
    const fileObjSize = _.isNumber(fileObj.size) ? fileObj.size : 0;
    const uploadedDocGroupFileIds = this.outcomeGroupModel.getOutcomeFiles().filter(doc => (
        // Look in the current doc group for duplicate files, so ensure current doc is excluded
        (this.outcomeDocFile ? doc.id !== this.outcomeDocFile.id : true)
        && !doc.isExternal() && doc.hasUploadedFile()
    )).map(doc => doc.get('file_id'));

    return uploadedDocGroupFileIds.some(fileId => {
      const fileModel = filesChannel.request('get:file', fileId);
      return fileModel && fileModel.get('original_file_name') === fileObj.name && fileModel.get('file_size') === fileObjSize;
    });
  },
  customFileValidationErrorMsg(fileObj) {
    const defaultDisplay = 'Invalid file selected';
    if (!fileObj._dmsFileValidationError) return defaultDisplay;
    return (fileObj._dmsFileValidationError === OutcomeDocFileUploadValidation?.ERROR_CODES?.DUP) ? `<b>Duplicate File</b>:&nbsp;File ${fileObj.name || ''} has already been added to this document group.`
      : (this.isPublic && fileObj._dmsFileValidationError === OutcomeDocFileUploadValidation?.ERROR_CODES?.NAME) ? `<b>Invalid Filename</b>:&nbsp;To ensure that only anonymized decisions are added to the public search, anonymized public documents must have the text "ANON" in the name of the uploaded file.`
      : (!this.isPublic && fileObj._dmsFileValidationError === OutcomeDocFileUploadValidation?.ERROR_CODES?.NAME) ? `<b>Invalid Filename</b>:&nbsp;To ensure that only anonymized decisions are added to the public search, regular final documents cannot have the text "ANON" in the name of the uploaded file.`
      : (fileObj._dmsFileValidationError === OutcomeDocFileUploadValidation?.ERROR_CODES?.FILE_NUMBER) ? `<b>Invalid Dispute File Number</b>:&nbsp;To ensure that the correct documents are added to the correct files, outcome documents must have a file number in the name of the uploaded file that matches this dispute.`
      : defaultDisplay;
  },
  customFileValidationFn(fileObj) {
    let isValid = true;
    if (this.hasDup(fileObj)) {
      fileObj._dmsFileValidationError = OutcomeDocFileUploadValidation?.ERROR_CODES?.DUP;
      isValid = false;
    } else if (this.isPublic && !/anon/i.test(`${fileObj.name}`)) {
      fileObj._dmsFileValidationError = OutcomeDocFileUploadValidation?.ERROR_CODES?.NAME;
      isValid = false;
    } else if (!this.isPublic && /anon/i.test(`${fileObj.name}`)) {
      fileObj._dmsFileValidationError = OutcomeDocFileUploadValidation?.ERROR_CODES?.NAME;
      isValid = false;
    } else if (!(new RegExp(this.dispute.get('file_number')).test(`${fileObj.name}`))) {
      fileObj._dmsFileValidationError = OutcomeDocFileUploadValidation?.ERROR_CODES?.FILE_NUMBER;
      isValid = false;
    }
    return isValid;
  }
}, {
  // Class attributes
  ERROR_CODES: {
    DUP: 1,
    NAME: 2,
    FILE_NUMBER: 3,
  }
});

export default OutcomeDocFileUploadValidation;