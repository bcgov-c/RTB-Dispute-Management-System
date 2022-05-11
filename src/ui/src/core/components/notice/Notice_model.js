import Radio from 'backbone.radio';
import CMModel from '../../../core/components/model/CM_model';
import FileDescriptionModel from '../files/file-description/FileDescription_model';
import NoticeServiceModel from './NoticeService_model';
import NoticeServiceCollection from './NoticeService_collection';

const api_name = 'notice';

const noticeChannel = Radio.channel('notice');
const filesChannel = Radio.channel('files');
const amendmentsChannel = Radio.channel('amendments');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const Formatter = Radio.channel('formatter').request('get');

export default CMModel.extend({
  idAttribute: 'notice_id',
  defaults: { 
    notice_id: null,
    parent_notice_id: null,
    notice_associated_to: null,
    notice_file_description_id: null,
    notice_file1_id: null,
    notice_file2_id: null,
    notice_file3_id: null,
    notice_file4_id: null,
    notice_file5_id: null,
    notice_title: null,
    notice_type: null,
    is_initial_dispute_notice: null, // Note: This is not used to tag a notice as initial.  Its created_date in relation to other dispute notices is how original notice is distinguished
    respondent_type: null,
    notice_version: null,
    hearing_id: null,
    hearing_type: null,
    notice_special_instructions: null,
    notice_html_for_pdf: null,
    notice_delivery_method: null,
    notice_delivered_to: null,
    notice_delivered_date: null,
    notice_delivered_to_other: null,
    notice_service: null, 
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_SAVE_ATTRS: [
    'notice_associated_to',
    'notice_title',
    'notice_type',
    'notice_file_description_id',
    'notice_file1_id',
    'notice_file2_id',
    'notice_file3_id',
    'notice_file4_id',
    'notice_file5_id',
    'notice_special_instructions',
    'notice_delivery_method',
    'notice_delivered_to',
    'notice_delivered_date',
    'notice_delivered_to_other',
    'hearing_id',
    'hearing_type'
  ],  

  API_POST_ONLY_ATTRS: [
    'parent_notice_id'
  ],

  urlRoot() {
    const dispute_id = disputeChannel.request('get:id');
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${dispute_id}` : '');
  },

  nested_collections_data() {
    return {
      notice_service: NoticeServiceCollection
    };
  },

  isAssociatedToRespondent() {
    return this.get('notice_associated_to') === configChannel.request('get', 'NOTICE_ASSOCIATED_TO_RESPONDENT');
  },

  isProvided() {
    return !!this.get('notice_delivered_to');
  },

  getServices() {
    return this.get('notice_service');
  },

  getUnservedServices() {
    return this.getServices().filter(function(noticeServiceModel) {
      return !noticeServiceModel.get('is_served');
    });
  },

  getServedServices() {
    return this.getServices().filter(function(noticeServiceModel) {
      return noticeServiceModel.get('is_served');
    });
  },

  saveService() {
    const dfd = $.Deferred();
    Promise.all(this.getServices().map(function(model) {
      return model.save(model.getApiChangesOnly());
    })).then(dfd.resolve, dfd.reject);
    return dfd.promise();
  },

  createNoticeService(attrs) {
    return new NoticeServiceModel(_.extend(attrs, {
      notice_id: this.get('notice_id')
    }, attrs));
  },

  resetNoticeService() {
    this.getServices().each(function(service_model) {
      service_model.resetModel();
    });
  },

  _isNoticeTypeInConfigCodes(configCodes) {
    const notice_type = this.get('notice_type');
    return _.any(configCodes, function(configCode) {
      const value = configChannel.request('get', configCode);
      return notice_type === value;
    });
  },

  isGenerated() {
    return this._isNoticeTypeInConfigCodes(['NOTICE_TYPE_GENERATED', 'NOTICE_TYPE_GENERATED_AMENDMENT']);
  },
  
  isDisputeNotice() {
    return this._isNoticeTypeInConfigCodes(['NOTICE_TYPE_GENERATED', 'NOTICE_TYPE_UPLOADED']);
  },

  isOriginalNotice() {
    return noticeChannel.request('check:is:original', this); 
  },

  isAmendmentNotice() {
    return this._isNoticeTypeInConfigCodes(['NOTICE_TYPE_GENERATED_AMENDMENT', 'NOTICE_TYPE_UPLOADED_AMENDMENT']);
  },

  isOtherNotice() {
    return this._isNoticeTypeInConfigCodes(['NOTICE_TYPE_UPLOADED_OTHER']);
  },

  isDeliveryMethodUser() {
    return this.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_USER');
  },

  isServedByRTB() {
    return this.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_EMAIL_AND_MAIL') 
    || this.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_OTHER');
  },

  createNoticeFileDescription(fileDescriptionAttrs) {
    fileDescriptionAttrs = fileDescriptionAttrs || {};
    const NOTICE_TYPE_DISPLAY = configChannel.request('get', 'NOTICE_TYPE_DISPLAY');
    const noticeTypeDisplay = $.trim(`${
      _.has(NOTICE_TYPE_DISPLAY, this.get('notice_type')) ? NOTICE_TYPE_DISPLAY[this.get('notice_type')] : ''
    } Notice`);
    const generatedOrUploadedWord = this.isGenerated() ? 'Generated' : 'Uploaded';
    
    return new FileDescriptionModel(
      Object.assign({
          title: `${noticeTypeDisplay} - ${generatedOrUploadedWord} ${Formatter.toDateDisplay(Moment())}`,
          description: `Dispute ${this.isAmendmentNotice() ? 'Amendment' : 'Notice'} Files`,
          description_category: configChannel.request('get', 'EVIDENCE_CATEGORY_NOTICE')
        },
        fileDescriptionAttrs
      )
    );
  },

  getNoticeFileDescription() {
    return filesChannel.request('get:filedescription', this.get('notice_file_description_id'));
  },

  getNoticeFileModels() {
    const fileModels = [];
    const fileDescription = this.getNoticeFileDescription();
    if (!fileDescription) {
      return fileModels;
    }
    return filesChannel.request('get:filedescription:files', fileDescription).models;
  },

  getTitleDisplay() {
    let titleDisplay = this.get('notice_title') || 'Other Notice';
    if (this.isAmendmentNotice()) {
      titleDisplay = 'Amendment';
    } else if (this.isDisputeNotice() || this.isOtherNotice()) {
      titleDisplay = `${this.isDisputeNotice() ? 'Notice' : this.get('notice_title')}${this.isOriginalNotice() ? ' - <b>Initial</b>' : ''}`;
    }
    return titleDisplay;
  },


  // Returns any amendment objects associated to this notice.
  // Note: does not return "Amendment Notice" NoticeModels linked to this notice using "parent_notice_id"
  getAssociatedAmendments() {
    return amendmentsChannel.request('get:all').filter(amendmentModel => amendmentModel.isAssociatedToNoticeId(this.id));
  },

  // Un-links amendment notices pointing to the notice, any then deletes self+service records
  // Does not delete any associated file descriptions
  fullDelete() {
    const dfd = $.Deferred();
    const associatedAmendments = this.getAssociatedAmendments();

    // Un-link amendments
    Promise.all(associatedAmendments.map(amendment => amendment.save({ notice_id: null })))
      .then(() => {
        this.destroy()
          .done(function(response) { dfd.resolve(response); })
          .fail(function() { dfd.reject(); });
      }, () => {
        alert("[Error] There was a problem deleting one or more files or services associated to this notice record");
        dfd.reject();
      });
      return dfd.promise();
  }
  
});
