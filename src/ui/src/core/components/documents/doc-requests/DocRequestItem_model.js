import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';

const apiName = 'outcomedocrequests/outcomedocrequestitem';

const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');

export default CMModel.extend({
  idAttribute: 'outcome_doc_req_item_id',
  defaults: {
    outcome_doc_req_item_id: null,
    outcome_doc_request_id: null,
    item_type: null,
    item_sub_type: null,
    item_status: null,
    item_title: null,
    item_description: null,
    file_description_id: null,
    item_note: null,
    
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_POST_ONLY_ATTRS: [
    'item_type',
  ],
  
  API_SAVE_ATTRS: [
    'item_sub_type',
    'item_status',
    'item_title',
    'item_description',
    'file_description_id',
    'item_note',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}${this.isNew() ? `/${this.get('outcome_doc_request_id')}` : ''}`;
  },
  
  save(attrs={}, options) {
    if (attrs && attrs.item_status === null) attrs.item_status = 0;
    return CMModel.prototype.save.call(this, attrs, options);
  },

  getTypeDisplay() {
    const OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY') || {};
    return OUTCOME_DOC_REQUEST_ITEM_TYPE_DISPLAY[this.get('item_type')] || null;
  },

  getTypeHelpHtml() {
    const helpHtmlLookups = {
      OUTCOME_DOC_REQUEST_ITEM_TYPE_TYPING: `Please describe the detail of the request such as: the error(s) that occurred, the corresponding page numbers and what the corrected text should be`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_MATH: `Please describe the detail of the request such as: the error(s) that occurred, the corresponding page number(s) and what the corrected calculation should be`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_OBVIOUS: `Please describe the detail of the request such as: the obvious error(s) that occurred, the corresponding page number(s) and what the correction should be`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_OMISSION: `Please describe the detail of the request such as: the omission(s) that occurred, the corresponding page number(s) and what the correction should be`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_CLARIFICATION: `Please provide the information on the clarification you are seeking, a clear description, and why it is needed`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_LATE_FILING: `Describe why you were unable to submit the Application for Review Consideration before the deadline. Upload supporting evidence below.`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_UNABLE_ATTEND: `Were you unable to attend the hearing due to circumstances that could not be anticipated and were not in your control (e.g., a medical emergency, an earthquake)? Please describe:
        <ol>
          <li>What happened that was beyond your control and could not have been anticipated which prevented you from attending the hearing; and
          <li>What testimony or evidence you would have provided if you were at the hearing.</li>
        </ol>`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_NEW_EVIDENCE: `Do you have new and relevant evidence that was not available at the time of the hearing? List each item of new and relevant evidence, why it was not available at the hearing, and how it is relevant`,
      OUTCOME_DOC_REQUEST_ITEM_TYPE_DECISION_FRAUD: `Do you have evidence that the decision was obtained by fraud? Which information submitted for the initial hearing was false and what information would have been true? How did the person who submitted the information know it was false? How do you think the false information was used to get the desired outcome?`,
    };
    const matchingHelpCodes = Object.keys(helpHtmlLookups).filter(key => this.get('item_type') === configChannel.request('get', key));
    return matchingHelpCodes.length ? helpHtmlLookups[matchingHelpCodes[0]] : null;
  },

  getUploadedFiles() {
    const fileDescription = filesChannel.request('get:filedescription', this.get('file_description_id'));
    return fileDescription ? fileDescription.getUploadedFiles() : [];
  },

  isMathOrTypingError() {
    return [
      configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_TYPING'),
      configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_TYPE_MATH'),
    ].includes(this.get('item_type'));
  },

  isStatusGranted() {
    return this.get('item_status') && this.get('item_status') === configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_GRANTED');
  },

});