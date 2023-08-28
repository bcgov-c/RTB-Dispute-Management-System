import Radio from 'backbone.radio';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import EditorView from '../../../../core/components/editor/Editor';
import EditorModel from '../../../../core/components/editor/Editor_model';
import EmailTemplateFormatter from '../../../../core/components/email/EmailTemplateFormatter';
import EmailTemplate from '../../../../core/components/email/BaseEmail_template.tpl';
import EmailCollection from '../../../../core/components/email/Email_collection';
import TaskModel from '../../../../core/components/tasks/Task_model';
import EmailModel from '../../../../core/components/email/Email_model';
import CreateEmail_EmailInputs from './CreateEmail_EmailInputs';
import template from './ModalCreateEmail_template.tpl';
import templateEmailStyles from '../../../../core/components/email/EmailTemplateStyles_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const TASK_YES_CODE = '1';
const TASK_NO_CODE = '2';
const EMAIL_EDITOR_PICKUP_CLASS = `modalEmail-email-content--pickups`;
const EMAIL_CONTENT_ERROR = `This message contains the asterisk characters **. These characters indicate areas where custom message should be inserted, and then these characters should be removed.  Please locate the ** characters in the email and complete any associated text or delete the placeholders from this message before sending.`;

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const emailsChannel = Radio.channel('emails');
const loaderChannel = Radio.channel('loader');

export default ModalBaseView.extend({
  template,
  className: `${ModalBaseView.prototype.className} modalEmail-modal`,
  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      saveAsDraft: '#emailSaveDontSend',
      saveSend: '#saveSend',
      emailContentContainer: '.modalEmail-content-container',
      emailContent: '.modalEmail-email-content',
    });
  },
  regions: {
    emailInputsRegion: '.modalEmail-top-container',
    emailContentRegion: '@ui.emailContent',
    responseDueRegion: '.modalEmail-due-filter',
    responseDueDateRegion: '.modalEmail-response-due-date',
    responseDueTimeRegion: '.modalEmail-response-due-time',
    followUpTaskRegion: '.modalEmail-followup-task',
    assigneeRoleRegion: '.modalEmail-assignee-position',
    assigneeNameRegion: '.modalEmail-assignee-name'
  },
  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.saveAsDraft': () => setTimeout(this.clickSaveAsDraft.bind(this), 0),
      'click @ui.saveSend': () => setTimeout(this.clickSaveSend.bind(this), 0),
      'click @ui.close': 'clickModalClose',
    });
  },

  clickModalClose() {
    if (this.draftEmailModel) {
      this.close();
      return;
    }
    // If closing a new email, make sure the user didn't want to save
    this.$el.hide();
    let showMainModal = true;
    const modalView = modalChannel.request('show:standard', {
      title: 'Exit Email?',
      bodyHtml: `<p>Are you sure you want to exit this email message without sending it? If you continue this email content will not be stored in the system.  To return to the message click 'Cancel'.  To exit and save a draft of this email message click 'Save Draft', to continue and exit the email, click 'Exit'.</p>`,
      modalCssClasses: '',
      primaryButtonText: 'Exit without saving',
      secondaryButtonText: 'Save Draft',
      onSecondaryFn: (_modalView) => {
        showMainModal = false;
        _modalView.close();
        this.$el.show();
        this.clickSaveAsDraft();
      },
      onContinueFn: (_modalView) => {
        showMainModal = false;
        _modalView.close();
        this.close();
      }
    });
    this.listenTo(modalView, 'removed:modal', () => {
      if (showMainModal) this.$el.show();
    });
  },

  clickSaveAsDraft() {
    const childViewsToValidate = [...this.draftViewsToValidate,
      ...(this.responseDueCheckboxModel.getData() ? this.responseDueDateViews : [])
    ];
    
    if (!this.validateAndShowErrors(childViewsToValidate, { skipAttachments: true })) {
      this.scrollToFirstVisibleError();
      return;
    }

    this.createEmailsAndPickupsForSend({ send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT') });

    if (!this.shouldCreatFollowUpTask() && this.emailSendCollection.length === 1) return this.saveEmailsAndPickups(false);

    if (this.emailSendCollection.length > 1) this.emailSendCollection.reset(this.emailSendCollection.at(0), { silent: true });

    // Show DRAFT save warning limitations modal
    this.$el.hide();
    let saveClicked = false;
    const modalView = modalChannel.request('show:standard', {
      title: 'Save DRAFT Limitations',
      bodyHtml: `<p>When a DRAFT email is saved the following information cannot be saved with the email:</p>
      <p><ul>
      <li>Custom recipients</li>
      <li>A follow up task</li>
      </ul></p>
      <p>These elements of this email will need to be added again when the DRAFT email is opened again for sending.</p>`,
      onContinue: (_modalView) => {
        saveClicked = true;
        _modalView.close();
        this.saveEmailsAndPickups(false);
      }
    });
    this.listenTo(modalView, 'removed:modal', () => {
      if (!saveClicked) this.$el.show();
    });
  },

  clickSaveSend() {
    const childViewsToValidate = [...this.fullViewsToValidate,
      ...(this.responseDueCheckboxModel.getData() ? this.responseDueDateViews : []),
      ...(this.shouldCreatFollowUpTask() ? this.taskViews : [])
    ];
    if (!this.validateAndShowErrors(childViewsToValidate)) {
      this.scrollToFirstVisibleError();
      return;
    }

    this.createEmailsAndPickupsForSend();
    this.saveEmailsAndPickups(true);
  },

  scrollToFirstVisibleError() {
    const visibleErrorEles = this.$('.error-block:visible, .modalEmail-recipient-email-list-error:visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (visibleErrorEles.length) {
      animationChannel.request('queue', $(visibleErrorEles[0]) , 'scrollPageTo', {
        is_page_item: true,
        scrollableContainerSelector: this.$el,
        force_scroll: true
      });
    }
  },

  saveEmailsAndPickups(shouldSendEmail=false) {
    const taskModelsToCreate = this.emailSendCollection.map(m => m.get('_taskModel')).filter(t => t);
    const { emailAttachmentFiles } = this.getEmailInputsData();
    const emailAttachmentsToSend = emailAttachmentFiles.map(file => ({
      attachment_type: configChannel.request('get', file.get('common_file_id') ? 'EMAIL_ATTACHMENT_TYPE_COMMONFILE' : 'EMAIL_ATTACHMENT_TYPE_FILE'),
      common_file_id: file.get('common_file_id'),
      file_id: file.get('file_id')
    }));

    loaderChannel.trigger('page:load');
    const checkAndSendEmailsFn = () => {
      if (!shouldSendEmail) return;
      this.emailSendCollection.forEach(email => email.set('is_active', true));
      return this.emailSendCollection.saveAll();
    };

    const createAssociatedPickupTasks = () => {
      if (!shouldSendEmail) return;
      taskModelsToCreate.forEach(t => t.set('task_link_id', t.get('_emailModel').id));
      return Promise.all(taskModelsToCreate.map(t => t.save()));
    };

    const checkAndCreateFollowUpTaskFn = () => {
      if (shouldSendEmail && this.shouldCreatFollowUpTask()) {
        return this.createFollowUpTask(this.emailSendCollection);
      }
    };

    this.emailSendCollection.saveAll()
      .then(() => this.saveEmailCollectionAttachments(this.emailSendCollection, emailAttachmentsToSend))      
      .then(() => checkAndSendEmailsFn())
      .then(() => createAssociatedPickupTasks())
      .then(() => checkAndCreateFollowUpTaskFn())
      .then(() => (new Promise(res => {
        loaderChannel.trigger('page:load:complete');
        if (shouldSendEmail && taskModelsToCreate.length) {
          this.$el.hide();
          const v = modalChannel.request('show:standard', {
            title: 'Pickup Notification Required',
            bodyHtml: `At least one recipient of this message is receiving a pickup and does not have an associated email address on file for the system to send a notification email that the pickup is ready.  A task to notify the recipient(s) without email has been created on this dispute file.  For more information, see the tasks view.`,
            primaryButtonText: 'Close',
            hideCancelButton: true,
            onContinue(modalView) { modalView.close(); }
          });
          this.listenTo(v, 'removed:modal', () => {
            this.$el.show();
            res();
          });
        } else {
          res();
        }
      })))
      .then(() => {
        this.model.trigger('refresh:page');
        this.close();
      })
      .catch(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.EMAILS.SAVE', () => {
          this.close();
        });
        handler(err);
      });
  },

  saveEmailCollectionAttachments(emailCollection, emailAttachmentsToSend) {
    const attachmentsToCreate = [];
    let attachmentsToDelete = [];
    emailCollection.forEach(email => {
      const emailAttachmentCollection = email.getAttachments();
      emailAttachmentsToSend.forEach(attachmentData => {
        const matchingAttachment = emailAttachmentCollection.findWhere({
          common_file_id: attachmentData.common_file_id,
          file_id: attachmentData.file_id
        });
        if (!matchingAttachment) attachmentsToCreate.push(email.createAttachment(attachmentData));
      });

      attachmentsToDelete = emailAttachmentCollection.filter(attachmentModel => (
        !_.findWhere(emailAttachmentsToSend, { file_id: attachmentModel.get('file_id'), common_file_id: attachmentModel.get('common_file_id') })));
    });
    
    return Promise.all([...attachmentsToCreate, ...(attachmentsToDelete.map(attachment => attachment.destroy())) ]);
  },

  getEmailInputsData() {
    if (!this.emailInputsView || !this.emailInputsView.isRendered()) return {};
    return this.emailInputsView.getData();
  },

  createEmailsAndPickupsForSend(emailOptions={}) {
    const { participantsToSendTo, recipientGroup } = this.getEmailInputsData();

    // Participants should already be filtered by this point -
    // Now need to determine which type of email to send based on template rules
    const deliveryRule = this.lastSelectedTemplateModel?.config?.deliveryRule;
    const forceEmail = deliveryRule === configChannel.request('get', 'EMAIL_DELIVERY_RULE_EMAIL_ONLY');
    const allowPickups = this.lastSelectedTemplateModel?.config?.allowPickups;

    (participantsToSendTo || []).forEach(participant => {
      if (participant.get('email')) {
        if (!forceEmail && allowPickups && participant.hasDeliveryByPickup() && recipientGroup) {
          // Add a pickup with confirmation
          this.emailSendCollection.add(this.createPickup(participant, Object.assign({
            message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP_WITH_EMAIL')
          }, emailOptions)));
          this.emailSendCollection.add(this.createPickupConfirmation(participant, emailOptions));
        } else {
          // Send regular email
          this.emailSendCollection.add(this.createEmail(participant, emailOptions));
        }
      } else if (!forceEmail && allowPickups) {
        // Add a pickup with a reminder task
        const pickupEmail = this.createPickup(participant, emailOptions);
        const pickupTask = this.createPickupTask(pickupEmail);
        pickupEmail.set('_taskModel', pickupTask);
        this.emailSendCollection.add(pickupEmail);
      } else {
        alert("NOT ADDED");
        console.log(participant, this.lastSelectedTemplateModel);
      }
    });
  },

  /**
   * Creates notification of pickup - needs to be filled-in with email link once associated model is saved
   */
  createPickupTask(emailModel) {
    const participant = participantsChannel.request('get:participant', emailModel.get('participant_id'));
    const loggedInUser = sessionChannel.request('get:user');
    return new TaskModel({
      dispute_guid: this.dispute.id,
      task_type: configChannel.request('get', 'TASK_TYPE_COMMUNICATION'),
      task_sub_type: configChannel.request('get', loggedInUser.isInformationOfficer() ? 'TASK_SUB_TYPE_IO'
        : loggedInUser.isArbitrator() ? 'TASK_SUB_TYPE_ARB'
        : loggedInUser.isAdminRole() ? 'TASK_SUB_TYPE_ADMIN' : ''
      ),
      task_owner_id: loggedInUser.id,
      task_activity_type: configChannel.request('get', 'TASK_ACTIVITY_TYPE_PICKUP_NOTIFICATION'),
      due_date: Moment().toISOString(),
      task_linked_to: configChannel.request('get', 'TASK_LINK_EMAIL'),
      task_priority: configChannel.request('get', 'TASK_PRIORITY_HIGH'),
      task_status: configChannel.request('get', 'TASK_STATUS_INCOMPLETE'),
      task_text: `The pickup <b>${emailModel.get('subject')}</b> has been created for ${participant.getContactName()} and they need to be notified that it is ready.  As this participant did not have an email address on file, no email notification that this pickup is ready was sent by DMS.   Please contact this participant to notify them that their pickup is ready.`,

      _emailModel: emailModel
    });
  },

  participantToEmailData(participant) {
    return {
      email_to: participant.get('email'),
      participant_id: participant.id,
    };
  },

  createPickup(participant, emailData) {
    return this.createBaseEmailOrPickupMessage(Object.assign({
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP'),
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_READY_FOR_PICKUP'),
    }, this.participantToEmailData(participant), emailData));
  },

  // NOTE / BUG / LIMITATION - Pickup confirmation will use template HTML -
  // - NO USER EDITS
  createPickupConfirmation(participant, emailData) {
    return this.createBaseEmailOrPickupMessage(Object.assign({
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_PICKUP_CONFIRMATION'),
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT'),
    }, emailData, this.participantToEmailData(participant)));
  },

  createEmail(participant, emailData) {
    return this.createBaseEmailOrPickupMessage(Object.assign({
      message_type: configChannel.request('get', 'EMAIL_MESSAGE_TYPE_CUSTOM'),
      send_status: configChannel.request('get', 'EMAIL_SEND_STATUS_UNSENT'),
    }, this.participantToEmailData(participant), emailData));
  },

  createBaseEmailOrPickupMessage(emailMessageData={}) {
    const { subject, emailFrom, recipientGroup } = this.getEmailInputsData();

    const dueDate = this.getMomentResponseDueDate();
    const defaultEmailOptions = {
      // Always create emails with is_active = false so they don't send right away and attachments can be added as necessary
      is_active: false,
      dispute_guid: this.dispute.id,
    };
    const emailModel = new EmailModel(Object.assign(defaultEmailOptions, {
      recipient_group: recipientGroup,
      email_from: emailFrom,
      subject,
      response_due_date: this.responseDueCheckboxModel.getData() && dueDate.isValid() ? dueDate.toISOString() : null,
      assigned_template_id: this.lastSelectedTemplateModel ? this.lastSelectedTemplateModel.get('assigned_template_id') : null,
    }, emailMessageData));
    EmailTemplateFormatter.emailModel = emailModel;
    
    const editorView = this.getChildView('emailContentRegion');
    const messageContent = (editorView && editorView.isRendered() ? editorView.prepareEmailForSend() : this.emailContentModel.getData());
    const fullMessageHtml = this.lastSelectedTemplateModel ? this.lastSelectedTemplateModel.get('template_html') : this.draftEmailModel ? this.draftEmailModel.get('html_body') :
        // NOTE: We should always have either a templateModel or a draft loaded. Add a base EmailTemplate as a fallback only
        EmailTemplate({ emailBody: messageContent, COMMON_IMAGE_ROOT: this.COMMON_IMAGE_ROOT, FONT_SIZE_PX: 16 });
    
    const tempEle = $('<div></div>');
    tempEle.append($(fullMessageHtml));
    const mainContent = tempEle.find(`.${EmailTemplateFormatter.EMAIL_CONTENT_CLASS}`);
    mainContent.html(messageContent);

    if (!emailModel.isPickup()) tempEle.find(`.${EmailTemplateFormatter.EMAIL_ONLY_CLASS}`).css('display' ,'block');
    if (emailModel.isPickupConfirmation()) {
      // Show the pickup confirmation block by removing all styles hiding it
      tempEle.find(`.${EmailTemplateFormatter.PICKUP_NOTICE_ONLY_CLASS}`).css({
        display: 'block',
        overflow: '',
        'max-height': '',
        'mso-hide': '',
      });
    }
    
    let finalHtmlToSave = `<html class="en">${tempEle.html()}</html>`;
    finalHtmlToSave = EmailTemplateFormatter.applyConversionsTo(finalHtmlToSave);
    
    emailModel.set('html_body', finalHtmlToSave);
    return emailModel;
  },

  initialize(options) {
    this.mergeOptions(options, ['draftEmailModel']);
    this.COMMON_IMAGE_ROOT = configChannel.request('get', 'COMMON_IMAGE_ROOT');
    
    const currentUser = sessionChannel.request('get:user');
    this.currentUserRole = currentUser ? currentUser.getRoleId() : null;
    this.dispute = disputeChannel.request('get');
    this.emailSendCollection = new EmailCollection();
    const emailTemplates = emailsChannel.request('get:templates');
    this.lastSelectedTemplateModel = this.draftEmailModel ? emailTemplates.findWhere({ assigned_template_id: this.draftEmailModel.get('assigned_template_id') }) : null;

    this.createSubModels();
    this.setupViewsToValidate();
    this.setupListeners();
  },

  setupViewsToValidate() {
    this.draftViewsToValidate = ['emailInputsRegion', 'emailContentRegion'];
    this.fullViewsToValidate = [...this.draftViewsToValidate, 'followUpTaskRegion'];
    this.responseDueDateViews = ['responseDueDateRegion', 'responseDueTimeRegion'];
    this.taskViews = ['assigneeNameRegion'];
  },

  createSubModels() {
    const emailContent = this.draftEmailModel && this.draftEmailModel.get('html_body') && EmailTemplateFormatter.getEmailContentFromHtml(this.draftEmailModel.get('html_body'));
    this.emailContentModel = new EditorModel({
      required: true,
      withTable: true,
      isEmailable: true,
      // Disabled by default, to be enabled when template loaded
      disabled: !this.draftEmailModel,
      value: emailContent || null
    });

    const hasResponseDue = this.draftEmailModel && this.draftEmailModel.get('response_due_date');
    this.responseDueCheckboxModel = new CheckboxModel({
      html: 'Response due date',
      checked: hasResponseDue,
      required: true
    });

    this.responseDueDateInputModel = new InputModel({
      inputType: 'date',
      disabled: !hasResponseDue,
      labelText: 'Response due date',
      errorMessage: 'Please enter a date',
      required: true,
      allowFutureDate: true,
      customLinkFn() { this.trigger('update:input', Moment().format(InputModel.getDateFormat())) },
      value: hasResponseDue ? Moment(this.draftEmailModel.get('response_due_date')).format(InputModel.getDateFormat()) : null,
    });

    this.responseDueTimeInputModel = new InputModel({
      inputType: 'time',
      disabled: !hasResponseDue,
      labelText: 'Response due time',
      errorMessage: 'Please enter a time',
      required: true,
      value: hasResponseDue ? Moment(this.draftEmailModel.get('response_due_date')).format(InputModel.getTimeFormat()) : '16:00',
    });

    this.followUpTaskDropdownModel = new DropdownModel({
      optionData: [{ text: 'Yes', value: TASK_YES_CODE }, { text: 'No', value: TASK_NO_CODE }],
      labelText: 'Create follow up task?',
      required: true,
      disabled: !hasResponseDue,
      value: TASK_NO_CODE
    });

    const ROLE_GROUP_DISPLAY_MAPPINGS = configChannel.request('get', 'USER_ROLE_GROUP_MAPPINGS')
    this.assigneeRoleDropdownModel = new DropdownModel({
      optionData: _.map(ROLE_GROUP_DISPLAY_MAPPINGS, function(roleDisplay, roleId) {
        return { text: roleDisplay, value: roleId };
      }),
      labelText: ' ',
      defaultBlank: true,
      required: true,
      disabled: true,
      value: this.currentUserRole ? this.currentUserRole : null
    });
    const currentUser = sessionChannel.request('get:user');
    this.assigneeNameDropdownModel = new DropdownModel({
      labelText: ' ',
      defaultBlank: true,
      required: true,
      disabled: true,
      errorMessage: 'Please select a user',
      customLink: _.find(this._getUserOptionsFromAvailableRoleTypes(true), option => String(option.value) === String(currentUser.id)) ? 'Assign to me' : null,
      customLinkFn: () => this.assignToMe()
    });
  },

  assignToMe() {
    if (this.followUpTaskDropdownModel.getData() === TASK_NO_CODE) return;

    const currentUser = sessionChannel.request('get:user');

    this.assigneeNameDropdownModel.set({ value: currentUser.get('user_id') });
    this.assigneeRoleDropdownModel.set({ value: String(currentUser.getRoleId()) });
    this.assigneeRoleDropdownModel.trigger('render');
    this.assigneeNameDropdownModel.trigger('render');
  },

  _getUserOptionsFromAvailableRoleTypes(searchAllRoles=false) {
    const selectedRoleType = this.assigneeRoleDropdownModel.getData();
    const roleTypes = selectedRoleType && !searchAllRoles ? [selectedRoleType] : _.pluck(this.assigneeRoleDropdownModel.get('optionData') || [], 'value');
    
    let userOptions = [];
    (roleTypes || []).forEach(roleType => {
      const options = {queue_users: true};
      const users = userChannel.request('get:users:by:role', roleType, options) || [];
      userOptions = [...userOptions, ...this._toUserOptions(users)];
    });

    return userOptions;
  },

  _toUserOptions(users) {
    return _.sortBy(
      _.map(users, user => ({ value: String(user.get('user_id')), text: user.getDisplayName() })),
      userOption => $.trim(userOption.text).toLowerCase()
    );
  },

  setupListeners() {

    const insertTemplateFn = (templateModel) => {
      EmailTemplateFormatter.load(EmailTemplateFormatter.getEmailContentFromHtml(templateModel.get('template_html')));
      let htmlToUse = '';
      try {
        htmlToUse = EmailTemplateFormatter.getMergedHtml();
      } catch (err) {
        htmlToUse = '';
      }
      
      const { participantsToSendTo } = this.getEmailInputsData();
      this.lastSelectedTemplateModel = templateModel;
      this.emailContentModel.trigger('update:input', htmlToUse);
      this.emailContentModel.set('disabled', !participantsToSendTo?.length);
      this.emailContentModel.trigger('render');
    };

    const responseDueCheckedFn = (model, value) => {
      this.responseDueDateInputModel.set('disabled', !value);
      this.responseDueTimeInputModel.set('disabled', !value);
      this.followUpTaskDropdownModel.set(Object.assign({ disabled: !value }, !value ? { value: TASK_NO_CODE } : {}));
      [this.responseDueDateInputModel, this.responseDueTimeInputModel, this.followUpTaskDropdownModel].forEach(m => m.trigger('render'));
    };

    const followUpTaskChangeFn = (model, value) => {
      const viewNames = ['assigneeRoleRegion', 'assigneeNameRegion'];
      _.each(viewNames, function(viewName) {
        const view = this.getChildView(viewName);
        if (view) {
          view.model.set({ disabled: (value !== TASK_YES_CODE) });
          view.render();
        }
      }, this);
    };

    this.listenTo(this.model, 'insert:template', insertTemplateFn);
    this.listenTo(this.model, 'clear:template', () => {
      this.emailContentModel.trigger('update:input', '');
    });
    this.listenTo(this.model, 'update:recipients', () => {
      const { participantsToSendTo } = this.getEmailInputsData();
      const isDisabled = !participantsToSendTo?.length;
      try {
        if (isDisabled) {
          this.getUI('emailContentContainer').addClass('disabled');
        } else {
          this.getUI('emailContentContainer').removeClass('disabled');
        }
      } catch (err) {

      }
      this.emailContentModel.set('disabled', isDisabled);
      this.emailContentModel.trigger('render');
      this.setPickupClass();
    });
    this.listenTo(this.responseDueCheckboxModel, 'change:checked', responseDueCheckedFn);
    this.listenTo(this.followUpTaskDropdownModel, 'change:value', followUpTaskChangeFn);
    this.listenTo(this.assigneeRoleDropdownModel, 'change:value', (model, value) => $.trim(value) !== '' ? this.updateAssigneeNameDropdown(value) : null);

    this.listenTo(this.model, 'modal:email:hide', () => this.$el.hide());
    this.listenTo(this.model, 'modal:email:show', () => setTimeout(() => this.$el.show()));
  },

  shouldCreatFollowUpTask() {
    return this.followUpTaskDropdownModel.getData() === TASK_YES_CODE;
  },
  
  isFirstEmailAPickup() {
    const { participantsToSendTo } = this.getEmailInputsData();
    return participantsToSendTo && participantsToSendTo.length
      && (!participantsToSendTo[0].get('email') || participantsToSendTo[0].hasDeliveryByPickup())
      && (this.lastSelectedTemplateModel ? this.lastSelectedTemplateModel?.config?.allowPickups : true)
      && (this.lastSelectedTemplateModel ? this.lastSelectedTemplateModel?.config?.deliveryRule !== configChannel.request('get', 'EMAIL_DELIVERY_RULE_EMAIL_ONLY') : true);
  },

  updateAssigneeNameDropdown(role) {
    role = Number(role);
    const userModels = userChannel.request('get:users:by:role', role ? role : this.currentUserRole);
    this.assigneeNameDropdownModel.set({
      optionData: _.map(userModels, function(userModel) {
        return { text: userModel.getDisplayName(), value: userModel.id };
      })
    }, { silent: true });

    const view = this.getChildView('assigneeNameRegion');
    if (view) {
      view.render();
    }
  },

  getMomentResponseDueDate() {
    const timezoneStr = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    const dateStr = `${this.responseDueDateInputModel.getData({ format: 'date' })} ${this.responseDueTimeInputModel.getData({ iso: true })}`
    return Moment.tz(dateStr, timezoneStr);
  },

  createFollowUpTask(emailCollection) {    
    if (!emailCollection && emailCollection.length) return;

    const { subject, participantsToSendTo } = this.getEmailInputsData();
    const disputeFileNumber = this.dispute.get('file_number');
    const dueDate = this.responseDueCheckboxModel.getData() ? this.getMomentResponseDueDate() : null;
    const emailTaskLinkValue = configChannel.request('get', 'TASK_LINK_EMAIL');

    const taskModel = new TaskModel(Object.assign({
      dispute_guid: this.dispute.id,
      file_number: disputeFileNumber,
      task_owner_id: this.assigneeNameDropdownModel.getData({ parse: true }),
      task_text: `Follow up task for email - File Number ${disputeFileNumber}, Subject Line: ${subject}, Emailed Recipients: ${participantsToSendTo.map(p=> p.get('email')).join(', ')}`,
      task_type: configChannel.request('get', 'TASK_TYPE_COMMUNICATION'),
      task_priority: configChannel.request('get', 'TASK_PRIORITY_NORMAL'),
      task_linked_to: emailTaskLinkValue,
      task_link_id: emailCollection.first().id,
      task_sub_type: this.assigneeRoleDropdownModel.getData()
    }, dueDate && dueDate.isValid() ? { task_due_date: dueDate.toISOString() } : {} ));

    return new Promise((res, rej) => taskModel.save().done(res).fail(rej));
  },

  setPickupClass() {
    if (!this.isRendered()) return;
    let emailContent;
    try {
      emailContent = this.getUI('emailContent');
    } catch (err) {
      // If UI is accessed too early, throws an error. Suppress it here
      console.log(`[Warning] Create Email display error`, err);
      return;
    }

    if (this.isFirstEmailAPickup()) emailContent.addClass(EMAIL_EDITOR_PICKUP_CLASS);
    else emailContent.removeClass(EMAIL_EDITOR_PICKUP_CLASS);
  },

  validateAndShowErrors(childViewNames=[], options={}) {
    let isValid = true;

    if (childViewNames.includes('emailInputsRegion')) {
      childViewNames = childViewNames.filter(name => name !== 'emailInputsRegion');
      isValid = this.getChildView('emailInputsRegion')?.validateAndShowErrors();
    }
    const { participantsToSendTo } = this.getEmailInputsData();
    if (!participantsToSendTo?.length || !this.lastSelectedTemplateModel) return false;
    
    _.each(childViewNames, viewName => {
      const view = this.getChildView(viewName);
      if (view && !view.validateAndShowErrors()) isValid = false;
    }, this);

    if (!options.skipAttachments) {
      const isSelectedTemplateNodrp = this.lastSelectedTemplateModel && this.lastSelectedTemplateModel.get('template_group') === configChannel.request('get', 'EMAIL_TEMPLATE_GROUP_NODRP');
      const hasDisputeFileAttachments = ((this.getEmailInputsData() || {}).emailAttachmentFiles || []).filter(file => file.get('file_id')).length;
      if (isSelectedTemplateNodrp && !hasDisputeFileAttachments) {
        if (this.emailInputsView && this.emailInputsView.isRendered()) this.emailInputsView.showErrorMessage('Emails from NODRP templates need at least one Dispute File attached');
        isValid = false;
      }
    }

    if (isValid && childViewNames.includes('emailContentRegion') && String(this.emailContentModel.getData() || '').match(/\*\*/g)) {
      this.getChildView('emailContentRegion')?.showErrorMessage(EMAIL_CONTENT_ERROR);
      isValid = false;
    }

    return isValid;
  },

  onBeforeRender() {
    if (!this.emailInputsView) this.emailInputsView = new CreateEmail_EmailInputs({ draftEmailModel: this.draftEmailModel, model: this.model });
    if (this.emailInputsView && this.emailInputsView.isRendered()) this.detachChildView('emailInputsRegion');
  },

  onRender() {
    this.showChildView('emailInputsRegion', this.emailInputsView);
    this.showChildView('emailContentRegion', new EditorView({ model: this.emailContentModel }));
    this.showChildView('responseDueRegion', new CheckboxView({ model: this.responseDueCheckboxModel }));
    this.showChildView('responseDueDateRegion', new InputView({ model: this.responseDueDateInputModel}));
    this.showChildView('responseDueTimeRegion', new InputView({ model: this.responseDueTimeInputModel}));
    this.showChildView('followUpTaskRegion', new DropdownView({ model: this.followUpTaskDropdownModel}));
    this.showChildView('assigneeRoleRegion', new DropdownView({ model: this.assigneeRoleDropdownModel}));
    this.showChildView('assigneeNameRegion', new DropdownView({ model: this.assigneeNameDropdownModel}));

    // Update the Assignee Dropdown
    const currentRole = this.assigneeRoleDropdownModel.getData();
    this.updateAssigneeNameDropdown(currentRole);

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      // NOTE: Webpack provide variables are only accessible in JS files (or files that had a JS loader used on them in webpack build?)
      // Get the value here and pass it to the template
      COMMON_IMAGE_ROOT: this.COMMON_IMAGE_ROOT,
      emailStyleHtml: templateEmailStyles(),
      editorDisabled: this.emailContentModel.get('disabled'),
    };
  }

});
