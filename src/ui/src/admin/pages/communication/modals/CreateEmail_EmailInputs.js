import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import CreateEmailAttachmentsView from './CreateEmailAttachments';
import ModalAddEmailAttachments from './ModalAddEmailAttachments';
import ModalSelectEmailRecipients from './ModalSelectEmailRecipients';
import FileCollection from '../../../../core/components/files/File_collection';
import EmailTemplateFormatter from '../../../../core/components/email/EmailTemplateFormatter';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import IconAlert from '../../../../core/static/Icon_AlertLrg.png';

const hearingChannel = Radio.channel('hearings');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');
const emailsChannel = Radio.channel('emails');
const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');
const loaderChannel = Radio.channel('loader');

const CreateEmail_EmailInputs = Marionette.View.extend({

  // External access APIs
  getData() {
    const participantsToSendTo = this.getParticipantsToSendToFromRecipientSelection();
    const emailFrom = this.emailFromDropdownModel.getData();
    const subject = this.emailSubjectModel.getData();
    const isFromNoReplyEmailAddress = this.isFromNoReplyEmailAddress();
    let recipientGroup = this.recipientDropdownModel.getData();
    if (recipientGroup && recipientGroup.startsWith(`${this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT}:`)) recipientGroup = this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT;

    return { participantsToSendTo, emailFrom, subject, isFromNoReplyEmailAddress, emailAttachmentFiles: this.emailAttachmentFiles, recipientGroup };
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['draftEmailModel']);

    // Only include attachments where the file can be found in DMS
    this.emailAttachmentFiles = new FileCollection(this.draftEmailModel ? this.draftEmailModel.getAttachments().map(attachment => attachment.getFileModel()).filter(a => a) : []);
    this.maxFileSizeBytes = configChannel.request('get', 'INTERNAL_ATTACHMENT_MAX_FILESIZE_BYTES');
    this.allParticipants = participantsChannel.request('get:all:participants', { include_removed: false });
    this.customRecipientList = [];
    this.insertedTemplateId = this.draftEmailModel ? this.draftEmailModel?.get('assigned_template_id') : null;

    this.FILE_TYPE_NOTICE = configChannel.request('get', 'FILE_TYPE_NOTICE');
    this.EMAIL_TEMPLATE_RECIPIENTS_PRIMARY = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_PRIMARY') || '');
    this.EMAIL_TEMPLATE_RECIPIENTS_APPLICANTS = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_APPLICANTS') || '');
    this.EMAIL_TEMPLATE_RECIPIENTS_RESPONDENTS = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_RESPONDENTS') || '');
    this.EMAIL_TEMPLATE_RECIPIENTS_ALL = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_ALL') || '');
    this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT') || '');
    this.EMAIL_TEMPLATE_RECIPIENTS_CUSTOM = String(configChannel.request('get', 'EMAIL_TEMPLATE_RECIPIENTS_CUSTOM') || '');

    this.EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY = configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY') || {};
    this.EMAIL_TEMPLATE_GROUP_CUSTOM = String(configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_CUSTOM') || '');   
    this.EMAIL_TEMPLATE_GROUP_NODRP = String(configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_NODRP') || '');    
    this.EMAIL_TEMPLATE_SELECTION_GROUPS = configChannel.request('get', 'EMAIL_TEMPLATE_SELECTION_GROUPS');
    this.CUSTOM_EMAIL_TEMPLATE_ASSIGNED_IDS = configChannel.request('get', 'CUSTOM_EMAIL_TEMPLATE_ASSIGNED_IDS') || [];
    this.EMAIL_TEMPLATES_CONFIG = configChannel.request('get', 'EMAIL_TEMPLATES_CONFIG') || {};

    const currentUser = sessionChannel.request('get:user');
    this.currentUserRole = currentUser ? currentUser.getRoleId() : null;
    this.allTemplatesMode = !!this.draftEmailModel;

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const loadedTemplateModel = this.getLoadedTemplateModel();

    this.templateCategoryModel = new DropdownModel({
      optionData: [],
      defaultBlank: true,
      labelText: 'Template Category',
      required: true,
      value: this.TEMPLATE_CATEGORY_CUSTOM
    });

    this.templateTypeModel = new DropdownModel({
      optionData: [],
      defaultBlank: true,
      labelText: 'Template',
      required: true,
      value: null,
      customLink: this.allTemplatesMode ? 'Show rules-based templates' : 'Show all available templates',
      customLinkFn: () => {
        this.allTemplatesMode = !this.allTemplatesMode;
        this.templateTypeModel.set('customLink', this.allTemplatesMode ? 'Show rules-based templates' : 'Show all available templates');
        this.setTemplateSelectionOptions();
        this.templateTypeModel.trigger('render'); 
        this.templateCategoryModel.trigger('render');
      }
    });

    this.setTemplateSelectionOptions();
    if (this.draftEmailModel && loadedTemplateModel) {
      const templateGroup = loadedTemplateModel.config?.templateGroup;
      if (templateGroup) this.templateCategoryModel.set('value', String(templateGroup), { silent: true });
      this.templateTypeModel.set({
        optionData: this.getTemplateTypeDropdownOptions(),
        value: String(loadedTemplateModel.config?.templateId),
      }, { silent: true });
    }

    const emailFromConfigKeys = ['EMAIL_FROM_DEFAULT', 'EMAIL_FROM_HSRTO'];
    const emailFromOptionData = _.map(emailFromConfigKeys, function(configKey) {
      const configVal = configChannel.request('get', configKey);
      return { text: configVal, value: configVal };
    });
    const matchingDraftEmailFromOpt = this.draftEmailModel && emailFromOptionData.find(opt => opt.text === this.draftEmailModel.get('email_from'));
    const emailFromValue = matchingDraftEmailFromOpt ? matchingDraftEmailFromOpt.value : null;
    
    this.emailFromDropdownModel = new DropdownModel({
      optionData: emailFromOptionData,
      defaultBlank: true,
      labelText: 'From',
      required: true,
      disabled: !this.draftEmailModel,
      value: emailFromValue
    });

    let recipientDropdownValue = this.draftEmailModel && String(this.draftEmailModel.get('recipient_group'));
    if (recipientDropdownValue === this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT) {
      recipientDropdownValue = `${recipientDropdownValue}:${this.draftEmailModel.get('participant_id')}`
    }

    this.recipientDropdownModel = new DropdownModel({
      optionData: this.getRecipientOptions(),
      labelText: 'Recipient(s)',
      required: true,
      disabled: !this.draftEmailModel,
      defaultBlank: true,
      value: recipientDropdownValue || null
    });

    const draftSubjectLine = this.draftEmailModel && this.draftEmailModel.get('subject');
    this.emailSubjectModel = new InputModel({
      labelText: 'Subject Line',
      errorMessage: 'Please enter a subject',
      required: true,
      disabled: !this.draftEmailModel,
      minLength: configChannel.request('get', 'EMAIL_SUBJECT_MIN_LENGTH'),
      maxLength: configChannel.request('get' , 'EMAIL_SUBJECT_MAX_LENGTH'),
      value: draftSubjectLine ? draftSubjectLine : this.getInitialSubjectValue()
    });

    if (loadedTemplateModel) this.setInputValuesFromTemplateModel(loadedTemplateModel);
  },

  setTemplateSelectionOptions() {
    const templateOptionData = [];
    this.EMAIL_TEMPLATE_SELECTION_GROUPS.forEach(group => {
      const validTemplateIds = emailsChannel.request('get:email:templates:for:group', group, { all: this.allTemplatesMode });
      if (!validTemplateIds.length) return;
      templateOptionData.push({ value: String(group), text: this.EMAIL_TEMPLATE_GROUP_SELECTION_DISPLAY[group], _templateIds: validTemplateIds })
    });

    const selectedCategory = this.templateCategoryModel.getData();
    const selectedCategoryIsAvail = selectedCategory && templateOptionData.find(opt => opt.value === selectedCategory);
    this.templateCategoryModel.set(Object.assign({
        optionData: templateOptionData,
      }, !selectedCategoryIsAvail ? { value: null } : {}
    ), { silent: true });

    // Always trigger a value change
    this.templateCategoryModel.trigger('change:value', this.templateCategoryModel, this.templateCategoryModel.get('value'));
  },

  getInitialSubjectValue() {
    return `File Number ${disputeChannel.request('get:filenumber')}: `;
  },

  getTemplateTypeDropdownOptions() {
    const activeTemplateIds = (this.templateCategoryModel.getSelectedOption() || {})._templateIds || [];
    const loadedTemplates = emailsChannel.request('get:templates').filter(t => activeTemplateIds.includes(t.get('assigned_template_id')));

    loadedTemplates.sort((a, b) => (
      this.CUSTOM_EMAIL_TEMPLATE_ASSIGNED_IDS.includes(a.get('assigned_template_id')) ? 1 :
      this.CUSTOM_EMAIL_TEMPLATE_ASSIGNED_IDS.includes(b.get('assigned_template_id')) ? -1 :

      a?.config?.sortOrder !== b?.config?.sortOrder ? Number(a?.config?.sortOrder||0) - Number(b?.config?.sortOrder||0) :
      Number(a) - Number(b)
    ));
    return loadedTemplates.map(t => ({ text: `${t.get('template_title')}`, value: String(t.get('assigned_template_id')), _emailTemplate: t }));
  },

  setupListeners() {
    const notice = noticeChannel.request('get:active');
    const dispute = disputeChannel.request('get');

    const templateCategoryChangeFn = (model, value) => {
      if (value === this.EMAIL_TEMPLATE_GROUP_NODRP && !(dispute && dispute.get('dispute_urgency') && notice)) {
        modalChannel.request('show:standard', {
          title: 'Missing Critical Information',
          bodyHtml: 'You cannot use NODRP templates until the dispute file has an urgency set and contains at least one dispute notice.',
          hideCancelButton: true,
          hideContinueButton: true,
        });
        model.set('value', null);
        return;
      }
      
      const optionData = this.getTemplateTypeDropdownOptions();
      const selectedType = this.templateTypeModel.getData();
      const selectedTypeIsAvail = selectedType && optionData.find(opt => opt.value === selectedType);
      this.templateTypeModel.set(Object.assign({
          optionData,
        }, !selectedTypeIsAvail ? { value: null } : {}
      ), { silent: true });
      this.render();
    };

    const recipientDropdownChangeFn = (model, value) => {
      this.getUI('recipientSelectBtn').addClass('hidden');
      this.clearEmailList();
      if (!value) return;
      if (value === this.EMAIL_TEMPLATE_RECIPIENTS_CUSTOM) {
        this.getUI('recipientSelectBtn').removeClass('hidden');
      } else {
        this.customRecipientList = [];
      }
      this.getAndShowEmailListParticipants();
    };

    const fileModelDeleteFn = (fileModel) => {
      this.emailAttachmentFiles.remove(fileModel, { silent: true });
      const childView = this.getChildView('attachmentsRegion');
      if (childView) childView.render();
    };

    this.listenTo(this.templateCategoryModel, 'change:value', templateCategoryChangeFn);
    this.listenTo(this.templateTypeModel, 'change:value', this.render, this);
    this.listenTo(this.recipientDropdownModel, 'change:value', recipientDropdownChangeFn);

    this.listenTo(this.model, 'update:recipients', (participantsToSend=[]) => {
      const view = this.getChildView('attachmentsRegion');
      if (view?.isRendered()) {
        view.disabled = !participantsToSend?.length;
        this.model.trigger('render:attachments');
      }
    });

    this.stopListening(this.model, 'click:add:attachment');
    this.listenTo(this.model, 'click:add:attachment', () => {
      loaderChannel.trigger('page:load');
      const activeTemplate = this.getSelectedEmailTemplateModel();
      (activeTemplate?.config?.allowLinkedNoticeAttachments ? this.loadFilesFromLinkedDisputes() : Promise.resolve())
        .then(linkedNoticeFileModels => {
          const modalView = new ModalAddEmailAttachments({
            maxFileSizeBytes: this.maxFileSizeBytes,
            files: this.emailAttachmentFiles,
            model: this.model,
            linkedNoticeFileModels,
          });
          this.model.trigger('modal:email:hide');
          modalChannel.request('add', modalView);
          this.listenTo(modalView, 'removed:modal', () => {
            this.clearErrorMessage();
            this.model.trigger('modal:email:show');
            const childView = this.getChildView('attachmentsRegion');
            if (childView) childView.render();
          });
        });
    });

    this.stopListening(this.emailAttachmentFiles, 'click:delete');
    this.listenTo(this.emailAttachmentFiles, 'click:delete', fileModelDeleteFn);
  },

  loadFilesFromLinkedDisputes() {
    const currentDisputeGuid = disputeChannel.request('get:id');
    const hearing = hearingChannel.request('get:latest');
    const linkedDisputeGuids = hearing ? hearing.getDisputeHearings().map(dh => dh.get('dispute_guid')).filter(a => a && a !== currentDisputeGuid) : [];
    const linkedNoticeFileModels = [];
    const loadFilePromise = (disputeGuid) => new Promise(_res => {
      this.loadAllLinkingFileDataForDispute(disputeGuid)
        .then(files => {
          linkedNoticeFileModels.push(...files);
          _res();
        }, () => _res())
    });
    return new Promise(res => {
      Promise.all(
        linkedDisputeGuids.map(disputeGuid => loadFilePromise(disputeGuid))
      ).finally(() => res(linkedNoticeFileModels));
    });
  },

  loadAllLinkingFileDataForDispute(disputeGuid) {
    const validNoticeFileModels = [];
    return new Promise(res => {
      // Perform a (fairly heavy) load on a linked dispute for all data necessary to determine valid notice files
      // i.e. associated to a Dispute Notice, and not marked as deficient
      return Promise.all([
        filesChannel.request('load:files', disputeGuid, { FileTypes: [this.FILE_TYPE_NOTICE], no_cache: true }),
        filesChannel.request('load:linkfiles', disputeGuid, { no_cache: true }),
        filesChannel.request('load:filedescriptions', disputeGuid, { no_cache: true }),
        noticeChannel.request('load', disputeGuid, { no_cache: true })
      ]).then(([fileCollection, linkedFileCollection, fileDescriptionCollection, noticeCollection]) => {
        noticeCollection?.forEach(notice => {
          if (!notice.get('notice_file_description_id') || !notice.isDisputeNotice()) return;
          const fileDescription = fileDescriptionCollection?.find(fd => fd.id === notice.get('notice_file_description_id'));
          if (!fileDescription || fileDescription.get('is_deficient')) return;

          validNoticeFileModels.push(
            ...fileCollection.filter(f => linkedFileCollection.find(linkF => linkF.areLinked(f, fileDescription)))
          );
        });
        return res(validNoticeFileModels);
      })
      .catch(err => {
        console.log(err);
        res();
      });
    });
  },

  getRecipientOptions() {
    const primary = participantsChannel.request('get:primaryApplicant');

    return [
      { text: 'Primary Applicant', value: this.EMAIL_TEMPLATE_RECIPIENTS_PRIMARY, _participantModel: primary },
      { text: 'All Applicants', value: this.EMAIL_TEMPLATE_RECIPIENTS_APPLICANTS },
      { text: 'All Respondents', value: this.EMAIL_TEMPLATE_RECIPIENTS_RESPONDENTS },
      { text: 'Everyone', value: this.EMAIL_TEMPLATE_RECIPIENTS_ALL },
      
      ...this.allParticipants.map(p => ({
        text: `${p.isLandlord() ? 'Landlord - ' : p.isTenant() ? 'Tenant - ' : ''}${p.getContactName()}`,
        value: `${this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT}:${p.id}`,
        _participantModel: p
      })),
      
      { text: 'Custom (select recipients)', value: this.EMAIL_TEMPLATE_RECIPIENTS_CUSTOM }
    ];
  },

  getSelectedEmailTemplateModel() {
    const templateId = Number(this.templateTypeModel.getData());
    return emailsChannel.request('get:templates').findWhere({ assigned_template_id: templateId });
  },

  getLoadedTemplateModel() {
    return this.insertedTemplateId && emailsChannel.request('get:templates').findWhere({ assigned_template_id: this.insertedTemplateId });
  },

  getParticipantsToSendToFromRecipientSelection() {
    const option = this.recipientDropdownModel.getSelectedOption();
    if (_.isEmpty(option)) return [];

    const templateModel = this.getSelectedEmailTemplateModel();
    const applicantModels = participantsChannel.request('get:applicants').models;
    const respondentModels = participantsChannel.request('get:respondents').models;
    let sendParticipants = [];
    if (option.value === this.EMAIL_TEMPLATE_RECIPIENTS_PRIMARY) sendParticipants.push(option._participantModel);
    else if (option.value === this.EMAIL_TEMPLATE_RECIPIENTS_APPLICANTS) sendParticipants.push(...applicantModels);
    else if (option.value === this.EMAIL_TEMPLATE_RECIPIENTS_RESPONDENTS) sendParticipants.push(...respondentModels);
    else if (option.value === this.EMAIL_TEMPLATE_RECIPIENTS_ALL) sendParticipants.push(...applicantModels, ...respondentModels);
    else if (option.value.startsWith(`${this.EMAIL_TEMPLATE_RECIPIENTS_PARTICIPANT}:`)) sendParticipants.push(option._participantModel);
    else if (option.value === this.EMAIL_TEMPLATE_RECIPIENTS_CUSTOM) sendParticipants.push(...this.customRecipientList);

    // Now filter based on template criteria
    const deliveryRule = templateModel?.config?.deliveryRule;
    const allowPickups = templateModel?.config?.allowPickups;
    
    if (deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_EMAIL_ONLY')) {
      sendParticipants = sendParticipants.filter(p => p.get('email'));
    } else if (deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_DOC_DELIVERY_PREF')) {
      sendParticipants = sendParticipants.filter(p => {
        if (!p.get('email') && (p.hasDecisionDeliveryByEmail() || !allowPickups)) return false;
        else if (!p.hasDecisionDeliveryByEmail() && !allowPickups) return false;
        return true;
      });
    } else if (deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_PRIMARY_CONTACT_PREF')) {
      sendParticipants = sendParticipants.filter(p => {
        if (!p.get('email') && (p.hasPrimaryContactEmail() || !allowPickups)) return false;
        else if (!p.hasPrimaryContactEmail() && !allowPickups) return false;
        return true;
      });
    } else if (deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_SECONDARY_CONTACT_PREF')) {
      sendParticipants = sendParticipants.filter(p => {
        if (!p.get('email') && (p.hasSecondaryContactEmail() || !allowPickups)) return false;
        else if (!p.hasSecondaryContactEmail() && !allowPickups) return false;
        return true;
      });
    } else {
      // NOTE: deliveryRule EMAIL_DELIVERY_RULE_NOTICE_PACKAGE_PREF is applied by default if no value provided
      sendParticipants = sendParticipants.filter(p => {
        if (!p.get('email') && (p.hasDeliveryByEmail() || !allowPickups)) return false;
        else if (!p.hasDeliveryByEmail() && !allowPickups) return false;
        return true;
      });
    }

    return sendParticipants;
  },

  isCustomTemplateSelected() {
    return this.templateCategoryModel.getData() === this.EMAIL_TEMPLATE_GROUP_CUSTOM;
  },

  isResetTemplateMode() {
    return !!this.insertedTemplateId && !this.draftEmailModel;
  },

  isFromNoReplyEmailAddress() {
    return this.emailFromDropdownModel.getData({ parse: true }) === configChannel.request('get', 'EMAIL_FROM_DEFAULT');
  },

  clearEmailList() {
    this.getUI('emailList').html('');
    this.getUI('emailListError').hide();
  },

  showEmailListParticipants(participantsToSend=[]) {
    if (this.insertedTemplateId && !participantsToSend?.length) this.getUI('emailListError').show();
    else this.getUI('emailListError').hide();
    
    const templateModel = this.getSelectedEmailTemplateModel();
    const allowPickups = templateModel?.config?.allowPickups;
    const deliveryRule = templateModel?.config?.deliveryRule;
    const forceEmail = deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_EMAIL_ONLY');
    const options = forceEmail || !allowPickups ? { no_pickup: true } : {}

    if (!this.insertedTemplateId) {
      // Ignore updates to participants to send to until we load the template
      participantsToSend = [];
    }

    this.getUI('emailList').html(`<span class="modalEmail-list-text">${participantsToSend.map(p => (
      p.getMessageRecipientDisplayHtml(options))).join(', ')}</span>`);
    this.model.trigger('update:recipients', participantsToSend);
  },

  getAndShowEmailListParticipants() {
    const participantsToSend = this.getParticipantsToSendToFromRecipientSelection();
    this.showEmailListParticipants(participantsToSend);
  },

  validateAndShowErrors() {
    let isValid = true;

    if (!this.draftEmailModel && !this.insertedTemplateId) {
      const templateView = this.getChildView('templateTypeRegion');
      if (templateView && templateView.isRendered()) templateView.showErrorMessage('Select and load a template to create an email');
      isValid = false;
      return false;
    }
    if (!this.getParticipantsToSendToFromRecipientSelection()?.length || (
        this.recipientDropdownModel.getData() === this.EMAIL_TEMPLATE_RECIPIENTS_CUSTOM && !this.customRecipientList.length)) {
      this.getUI('emailListError').show();
      isValid = false;
      return false;
    }

    const viewsToValidate = ['emailFromRegion', 'subjectRegion', 'recipientRegion'];
    (viewsToValidate || []).forEach(viewName => {
      const view = this.getChildView(viewName);
      if (view && !view.validateAndShowErrors()) isValid = false;
    });
    
    return isValid;
  },
  
  showModalTemplateUpdateWarningPromise() {
    return new Promise(res => {
      modalChannel.request('show:standard', {
        title: 'Reset Email/Pickup?',
        bodyHtml: `<p>This action will remove any email settings, email attachments and the email body of the currently-loaded template, and will allow you to select another template to load.</p>
          <p>This action cannot be undone. Are you sure?</p>`,
        onContinueFn(_modalView) {
          _modalView.close();
          res();
        }
      });
    });
  },

  clickTemplateInsertUpdate() {
    const templateModel = this.getSelectedEmailTemplateModel();
    this.validateAndInsertTemplateModel(templateModel);
  },

  validateAndInsertTemplateModel(templateModel) {
    if (!templateModel) return;
    if (!this.validateSelectedTemplateAndShowErrors(templateModel)) return;
    
    loaderChannel.trigger('page:load');
    
    // Always clear existing email attachment files when loading from a template:
    this.emailAttachmentFiles.reset([], { silent: true });

    // Update the files if any files are built-in to
    const commonFileIds = templateModel.getAttachmentCommonFileIds();
    commonFileIds.forEach(commonFileId => {
      if (this.emailAttachmentFiles.findWhere({ common_file_id: commonFileId })) return;
      const commonFileModel = filesChannel.request('get:commonfile', commonFileId);
      if (commonFileModel) this.emailAttachmentFiles.push(commonFileModel, { silent: true });
    });
    
    this.insertedTemplateId = templateModel.id;
    this.setInputValuesFromTemplateModel(templateModel);
    this.render();
    this.model.trigger('insert:template', templateModel);
  },

  validateSelectedTemplateAndShowErrors(templateModel) {
    const mergeFieldErrors = [];
    const validateTemplateMergeFieldsFn = () => {
      const result = EmailTemplateFormatter.validateMergeFields(templateModel.get('template_html'));
      if (result && result.length) {
        mergeFieldErrors.push(...result);
        return false;
      } else {
        return true;
      }
    };

    const validateEmailFromFn = () => {
      // Validates that reply_email_address in the template is one of the available dropdown options hard-coded in the email from list
      const reply_email_address = String(templateModel.get('reply_email_address') || '');
      return reply_email_address && this.emailFromDropdownModel.get('optionData').find(opt => opt.text === reply_email_address);
    };
    const validateCommonFilesFn = () => {
      const commonFileIds = templateModel.getAttachmentCommonFileIds();
      const missingFiles = commonFileIds.filter(commonFileId => !filesChannel.request('get:commonfile', commonFileId));
      return !missingFiles.length;
    };

    const encodeHtmlStr = (str) => str.replace(/[\u00A0-\u9999<>\&]/g, i => '&#'+i.charCodeAt(0)+';')
    const validateFnAndErrorMsgPairs = [
      [ validateEmailFromFn, `The template's "Email From" address is not an allowed sender from DMS Admin` ],
      [ validateCommonFilesFn, `Required file attachments are missing from DMS` ],
      [ validateTemplateMergeFieldsFn, () => `The following invalid merge fields were detected in the template:\n${mergeFieldErrors.map(e => `&nbsp;&nbsp;${encodeHtmlStr(e)}`).join('<br/>')}` ],
    ];

    const errorMessages = [];
    validateFnAndErrorMsgPairs.forEach( ([validateFn, errorMsg]) => {
      if (!validateFn()) {
        errorMessages.push(_.isFunction(errorMsg) ? errorMsg() : errorMsg);
      }
    });
    const isValid = !errorMessages.length;

    if (!isValid) {
      modalChannel.request('show:standard', {
        title: 'Cannot Load Template',
        bodyHtml: `<p>The dispute file does not have the right criteria to load this template.</p>
          <p><ul>${errorMessages.map(msg => `<li>${msg}</li>`).join('')}</ul></p>
          <p>For more information on the required information for specific email templates see the process documentation.</p>`,
        hideContinueButton: true
      });
    }

    return isValid;
  },

  setTemplateSelectionDisabled(isDisabled=true) {
    this.templateCategoryModel.set({
      disabled: isDisabled,
    });
    this.templateTypeModel.set({
      disabled: isDisabled,
      customLink: isDisabled ? null : (this.allTemplatesMode ? 'Show rules-based templates' : 'Show all available templates'),
    });
  },

  setInputValuesFromTemplateModel(templateModel) {
    this.setTemplateSelectionDisabled(!!templateModel);
    if (!templateModel) return;

    const reply_email_address = templateModel.get('reply_email_address');
    const default_recipient_group = templateModel.get('default_recipient_group');
    const subject_line = templateModel.get('subject_line');

    if (reply_email_address) {
      const matchingFromOpt = this.emailFromDropdownModel.get('optionData').find(opt => opt.text === reply_email_address);
      if (matchingFromOpt) {
        this.emailFromDropdownModel.set({
          value: matchingFromOpt.value,
          disabled: true
        });
      }
    } else {
      this.emailFromDropdownModel.set('disabled', false);
    }

    if (default_recipient_group) {
      const matchingRecipientOpt = this.recipientDropdownModel.get('optionData').find(opt => opt.value === String(default_recipient_group));
      if (matchingRecipientOpt) {
        this.recipientDropdownModel.set({
          value: matchingRecipientOpt.value,
        });
      }
      this.recipientDropdownModel.set('disabled', !templateModel?.config?.allowRecipientEdit);
    } else {
      this.recipientDropdownModel.set({
        disabled: false,
        value: null,
      });
    }

    if (subject_line) {
      this.emailSubjectModel.set({
        value: EmailTemplateFormatter.applyConversionsTo(subject_line),
        disabled: true
      });
    } else {
      this.emailSubjectModel.set({
        disabled: false,
        value: this.getInitialSubjectValue(),
      });
    }
  },

  clickSelectBtn() {
    // Hide any error on recipient input
    this.recipientDropdownModel.trigger('render');

    const modalView = new ModalSelectEmailRecipients({ customRecipientList: this.customRecipientList, templateModel: this.getSelectedEmailTemplateModel() });
    this.listenTo(modalView, 'save:complete', (participantModels) => {
      this.customRecipientList = participantModels;
      this.getAndShowEmailListParticipants();
      modalView.close();
    });
    this.listenTo(modalView, 'removed:modal', function() {
      this.model.trigger('modal:email:show');
    }, this);
    this.model.trigger('modal:email:hide')
    modalChannel.request('add', modalView);
  },

  clickTemplateReset() {
    const promise = this.insertedTemplateId ? this.showModalTemplateUpdateWarningPromise() : Promise.resolve();
    promise.then(() => {
      this.insertedTemplateId = null;
      this.setTemplateSelectionDisabled(false);
      const modelsToClear = [this.emailFromDropdownModel, this.recipientDropdownModel, this.emailSubjectModel, this.templateTypeModel];
      modelsToClear.forEach(m => m.set('value', null, { silent: true }));
      this.emailAttachmentFiles.reset([], { silent: true });
      this.model.trigger('clear:template');
      this.render();
    });
  },

  showErrorMessage(msg) {
    this.getUI('error').html(msg);
  },

  clearErrorMessage() {
    this.getUI('error').html('');
  },

  onBeforeRender() {
    if (this.isRendered()) this.clearErrorMessage();
  },

  onRender() {
    this.showChildView('templateCategoryRegion', new DropdownView({ model: this.templateCategoryModel }));
    this.showChildView('templateTypeRegion', new DropdownView({ model: this.templateTypeModel }));
    this.showChildView('emailFromRegion', new DropdownView({ model: this.emailFromDropdownModel }));
    this.showChildView('subjectRegion', new InputView({ model: this.emailSubjectModel }));
    this.showChildView('recipientRegion', new DropdownView({ model: this.recipientDropdownModel }));

    const participantsToSend = this.getParticipantsToSendToFromRecipientSelection();
    this.showChildView('attachmentsRegion', new CreateEmailAttachmentsView({
      showAddAttachment: true,
      maxFileSizeBytes: this.maxFileSizeBytes,
      files: this.emailAttachmentFiles,
      model: this.model,
      disabled: !participantsToSend?.length
    }));
    
    this.showEmailListParticipants(participantsToSend);
    loaderChannel.trigger('page:load:complete');
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      recipientSelectBtn: '.btn-select-recipients',
      emailList: '.modalEmail-recipient-email-list',
      emailListError: '.modalEmail-recipient-email-list-error',
      error: '.modalEmail-input-error'
    });
  },
  regions: {
    templateCategoryRegion: '.modalEmail-template-category',
    templateTypeRegion: '.modalEmail-template-type',
    emailFromRegion: '.modalEmail-from',
    subjectRegion: '.modalEmail-subject',
    recipientRegion: '.modalEmail-recipient',
    attachmentsRegion: '.modalEmail-attachments-container'
  },

  template() {
    const templateModel = this.getSelectedEmailTemplateModel();
    return (
      <>
        <div className="modalEmail-template-inputs-container">
          <div className="modalEmail-template-category"></div>
          {this.renderJsxTemplateType({ templateModel })}

          <div className="modalEmail-emailpickup-icons">
            <div>Indicator:</div>
            <div className="modalEmail-emailpickup-icons--email">Email</div>
            <div className="modalEmail-emailpickup-icons--pickup">Pickup</div>
          </div>
        </div>

        <div className="modalEmail-from-subject-container">
          <div className="modalEmail-from"></div>
          <div className="modalEmail-subject"></div>
        </div>

        <div className="modalEmail-recipient-email-container">
          <div className="modalEmail-recipient-container">
            <div className="modalEmail-recipient"></div>
          </div>
          <button className="btn btn-standard btn-select-recipients hidden" onClick={this.clickSelectBtn.bind(this)}>Select</button>
          <div className="modalEmail-recipient-email-list"></div>
          <div className="modalEmail-recipient-email-list-error hidden-item">
            <img src={IconAlert} />
            No recipient(s) match the criteria for sending this template
          </div>
        </div>

        <div className="modalEmail-attachments-container"></div>
        <div className="modalEmail-input-error error-block"></div>
      </>
    );
  },

  renderJsxTemplateType({ templateModel }) {
    const showReset = this.isResetTemplateMode();
    const loadTemplateDisabled = this.draftEmailModel || showReset || !templateModel;
    return (
      <div className={`modalEmail-template-type-container`}>
        <div className="modalEmail-template-type"></div>
        {!loadTemplateDisabled ?
          <button className={`btn btn-standard modalEmail-template-insert-btn`}
            onClick={this.clickTemplateInsertUpdate.bind(this)}>Load Template</button>
          : null}

        {showReset ?
          <button className="btn btn-standard modalEmail-template-reset-btn" onClick={this.clickTemplateReset.bind(this)}>Reset</button>
        : null}
      </div>
    );
  },

  renderJsxEmail() {
    return (
      <div className="modalEmail-message-container">
        <span className="modalEmail-content-label">Message</span>
        <div className="modalEmail-content-container"></div>
      </div>
    );
  }
});


_.extend(CreateEmail_EmailInputs.prototype, ViewJSXMixin);
export default CreateEmail_EmailInputs;
