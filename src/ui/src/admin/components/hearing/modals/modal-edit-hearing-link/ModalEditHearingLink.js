/**
 * @fileoverview - Modal for adding or removing a linked dispute via the dispute file number
 */
import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import LinkedHearingsListView from './LinkedHearingsList';
import template from './ModalEditHearingLink_template.tpl';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const DMS_TYPE_CODE = '1';
const EXTERNAL_TYPE_CODE = '2';

const configChannel = Radio.channel('config');
const searchChannel = Radio.channel('searches');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const emailsChannel = Radio.channel('emails');
const modalChannel = Radio.channel('modals');
const noticeChannel = Radio.channel('notice');
const disputeChannel = Radio.channel('dispute');
const apiChannel = Radio.channel('api');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,

  id: 'editHearingLink_modal',

  regions: {
    linkTypeRegion: '.editHearingLink-link-type',
    fileTypeRegion: '.editHearingLink-type-dropdown',
    dmsInputRegion: '.editHearingLink-add-dms',
    externalInputRegion: '.editHearingLink-add-external',

    linkedApplicationsRegion: '.editHearingLink-linked-applications'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      dmsInputContainer: '.editHearingLink-add-dms-container',
      dmsInputBtn: '.editHearingLink-add-dms-btn',
      externalInputContainer: '.editHearingLink-add-external-container',
      externalInputBtn: '.editHearingLink-add-external-btn',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.dmsInputBtn': 'clickAddDmsWithStateCheck',
      'click @ui.externalInputBtn': 'clickAddExternalWithStateCheck'
    });
  },

  // When the modal is closed, always refresh the calendar underneath
  close() {
    this.trigger('save:complete');
    ModalBaseView.prototype.close.call(this);
  },

  clickAddDmsWithStateCheck: async function() {
    const dmsInputView = this.getChildView('dmsInputRegion');
    if (!dmsInputView || !dmsInputView.validateAndShowErrors()) {
      loaderChannel.trigger('page:load:complete');
      return;
    }

    return this.model.withStateCheck(
      this.clickAddDms.bind(this, ...arguments),
      this.showInvalidStateModal.bind(this),
      this.onStateCheckError.bind(this)
    );
  },

  clickAddExternalWithStateCheck: async function() {
    const externalInputView = this.getChildView('externalInputRegion');
    if (!externalInputView || !externalInputView.validateAndShowErrors()) {
      loaderChannel.trigger('page:load:complete');
      return;
    }

    return this.model.withStateCheck(
      this.clickAddExternal.bind(this, ...arguments),
      this.showInvalidStateModal.bind(this),
      this.onStateCheckError.bind(this)
    );
  },

  async clickAddDms() {
    const dmsInputView = this.getChildView('dmsInputRegion');
    const inputValue = this.dmsInputModel.getData({ parse: true });
    if (!dmsInputView || !dmsInputView.validateAndShowErrors()) {
      return;
    }

    if (this.model.getDisputeHearings().findWhere({ file_number: inputValue })) {
      dmsInputView.showErrorMessage("File already linked");
      return;
    }

    loaderChannel.trigger('page:load');
    searchChannel.request('search:dispute:direct', inputValue)
      .done(disputeGuid => {
        if (!disputeGuid) {
          dmsInputView.showErrorMessage("Invalid DMS File Number");
          loaderChannel.trigger('page:load:complete');
          return;
        }

        if (this.model.getDisputeHearings().findWhere({ dispute_guid: disputeGuid })) {
          dmsInputView.showErrorMessage("File already linked");
          loaderChannel.trigger('page:load:complete');
          return;
        }

        this.addDmsValidLink(disputeGuid);
        
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('ADMIN.SEARCH.DISPUTE')(err);
      });
  },

  async addDmsValidLink(disputeGuid) {
    // Load latest common file templates asynchronously
    emailsChannel.request('load:templates');

    const disputesWithArs = await this.checkLinkedDisputesForArs(disputeGuid);
    const saveValidLink = () => {
      this.model.createDisputeHearing({
        dispute_guid: disputeGuid,
        dispute_hearing_role: configChannel.request('get', 'DISPUTE_HEARING_ROLE_SECONDARY'),
        shared_hearing_link_type: null
      }, { silent: true });
      return this.saveModelDisputeHearings();
    };

    if (disputesWithArs.length) {
      loaderChannel.trigger('page:load:complete');
      this.$el.hide();
      let isContinue = false;
      const v = modalChannel.request('show:standard', {
        modalCssClasses: `modal-ars-cleanup`,
        title: `ARS Deadlines Will be Removed`,
        bodyHtml: `<p>These file(s) have Applicant Required Service (ARS) deadlines. Once these disputes are linked, these declaration deadlines will be disabled:</p>
          <ul>
            ${disputesWithArs.map(data => {
              const date = Moment(data.notice.get('service_deadline_date')).isAfter(Moment()) ? data.notice.get('service_deadline_date') : data.notice.get('second_service_deadline_date');
              return `<li><b>${data.dispute.get('file_number')}</b> (${Formatter.toStatusDisplay(data.dispute.getStatus())}) - ${Formatter.toDateAndTimeDisplay(date)}</li>`;
            })?.join('')}
          </ul>
          <p>Are you sure you want to continue to link these files?</p>
        `,
        primaryButtonText: 'Yes, Continue',
        cancelButtonText: "No, Cancel",
        onContinueFn(modalView) {
          isContinue = true;
          modalView.close();
        }
      });
      this.listenTo(v, 'removed:modal', () => {
        this.$el.show();
        if (isContinue) {
          loaderChannel.trigger('page:load');
          saveValidLink()
            .then(() => this.cleanUpArsNoticesAndSendEmail(disputesWithArs)
            .catch((message, source, lineno, colno, error) => {
              apiChannel.request('create:error', {
                error_site: configChannel.request('get', 'ERROR_SITE_ADMIN'),
                error_details: `${message}|||${source}|||${lineno}|||${colno}|||${error}`.substring(0, 2450),
                error_type: configChannel.request('get', 'ERROR_TYPE_MANUAL')
              });
              generalErrorFactory.createHandler('', null, `There was an unexpected error when cleaning up ARS files. Please manually validate each file: ${disputesWithArs.map(d => d?.dispute?.get('file_number')).join(', ')}`);
            })
            .finally(() => this.close()))
        }
      });
    } else {
      saveValidLink().then(() => this.close());
    }
  },

  async checkLinkedDisputesForArs(newLinkedDisputeGuid) {
    const disputeGuidsToCheck = [
      ...this.model.getDisputeHearings().filter(dh => !dh.isExternal()).map(dh => dh.get('dispute_guid')),
      newLinkedDisputeGuid
    ];
    const disputesWithArs = [];
    const loadAndCheck = async (disputeGuid) => {
      const { notice, dispute, primary } = await this.loadDisputeData(disputeGuid);
      if (notice?.isArsActive?.() && dispute?.checkStageStatus?.(4, [41, 93])) {
        disputesWithArs.push({ notice, dispute, primary });
      }
    };
    await Promise.all(disputeGuidsToCheck.map(disputeGuid => loadAndCheck(disputeGuid)))
    return disputesWithArs;
  },

  async loadDisputeData(disputeGuid) {
    const options = { no_cache: true };
    const notices = await noticeChannel.request('load', disputeGuid, options);
    const dispute = await disputeChannel.request('load', disputeGuid, options);
    const applicants = await participantsChannel.request('load', disputeGuid, options)
      .then(([a, applicants]) => applicants);
    const notice = notices?.getCurrentNotice();
    const primary = applicants?.length && applicants.every(a => a.get('group_primary_contact_id') === applicants.at(0).get('group_primary_contact_id')) ?
      applicants.get(applicants.at(0).get('group_primary_contact_id')) : null;

    return { dispute, notice, primary };
  },

  async cleanUpArsNoticesAndSendEmail(disputesWithArs=[]) {
    return Promise.all(disputesWithArs.map(data => {
      return Promise.all([
        data.notice.save({ has_service_deadline: false }, { headers: { DisputeGuid: data.dispute.get('dispute_guid') } }),
        data.dispute.saveStatus({ dispute_stage: 6, dispute_status: 60 })
      ]);
    }));
  },

  // ARS unlinking does not require an email to be sent to the primary
  async sendEmailToPrimary(disputeModel, primaryApplicant) {
    const templateId = configChannel.request('get', 'EMAIL_TEMPLATE_ARS_LINKING');
    if (!primaryApplicant || !templateId) return;
    
    const emailModel = emailsChannel.request('create:custom', templateId, {
      participant_id: primaryApplicant.id,
      email_to: primaryApplicant.get('email'),
      dispute_guid: disputeModel.id,
    }, {
      hearing: this.model,
      dispute: disputeModel,
      primary: primaryApplicant
    });
    const createEmailAttachmentsPromise = () => {
      const attachmentsToCreate = emailsChannel.request('get:template:attachments', templateId);
      return Promise.all(attachmentsToCreate.map(attachment => emailModel.createAttachment(attachment)));
    };
    return new Promise((res, rej) => {
      return !emailModel ? rej('No email could be created') :
        emailModel?.save()
          .then(() => createEmailAttachmentsPromise, rej)
          .then(() => emailModel.saveAsSent(), rej)
          .then(() => res(), rej);
    });
  },

  clickAddExternal() {
    const externalInputView = this.getChildView('externalInputRegion');
    const inputValue = this.externalInputModel.getData({ parse: true });
    if (!externalInputView || !externalInputView.validateAndShowErrors()) {
      loaderChannel.trigger('page:load:complete');
      return;
    }

    if (this.model.getDisputeHearings().findWhere({ external_file_id: inputValue })) {
      externalInputView.showErrorMessage("File already linked");
      loaderChannel.trigger('page:load:complete');
      return;
    }

    const linkTypeToUse = this.model.isCrossApp() ? 'DISPUTE_HEARING_LINK_TYPE_CROSS' :
      this.model.isJoinerApp() ? 'DISPUTE_HEARING_LINK_TYPE_JOINER' :
      this.model.isCrossRepeatApp() ? 'DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT' :
      this.model.isRepeatedApp() ? 'DISPUTE_HEARING_LINK_TYPE_REPEATED' : 'DISPUTE_HEARING_LINK_TYPE_SINGLE';
    
    this.model.createDisputeHearing({
      dispute_hearing_role: configChannel.request('get', 'DISPUTE_HEARING_ROLE_SECONDARY'),
      external_file_id: inputValue,
      shared_hearing_link_type: configChannel.request('get', linkTypeToUse)
    });
    this.saveModelDisputeHearings();
  },
  /**
   * @param {HearingModel} model
   */
  initialize() {
    this.isLoading = false;
    this.deletesInProgress = false;
    this.createSubModels();
    this.setupListeners();
  },

  _codesToLinkTypeOptions(linkCodes) {
    const HEARING_LINK_TYPE_DISPLAY = configChannel.request('get', 'HEARING_LINK_TYPE_DISPLAY');
    return _.map(linkCodes, function(linkCode) {
      const value = configChannel.request('get', linkCode);
      return { value: String(value), text: HEARING_LINK_TYPE_DISPLAY[value] };
    });
  },

  createSubModels() {
    this.linkTypeModel = new DropdownModel({
      labelText: 'Link Type',
      required: true
    });

    this.fileTypeDropdownModel = new DropdownModel({
      optionData: [{ value: DMS_TYPE_CODE, text: 'DMS File' }, { value: EXTERNAL_TYPE_CODE, text: 'External File' }],
      labelText: 'File Type',
      value: DMS_TYPE_CODE
    });

    this.dmsInputModel = new InputModel({
      inputType: 'dispute_number',
      labelText: 'DMS File Number',
      errorMessage: 'Enter a DMS File Number',
      maxLength: 9,
      required: true
    });

    this.externalInputModel = new InputModel({
      inputType: 'legacy_dispute_number',
      labelText: 'External File Number',
      errorMessage: 'Enter a File Number',
      minLength: 5,
      maxLength: 8,
      required: true
    });

  },

  setupListeners() {
    const disputeHearings = this.model.getDisputeHearings()

    this.listenTo(this.linkTypeModel, 'change:value', this.onChangeLinkTypeWithStateCheck, this);

    this.listenTo(disputeHearings, 'delete:edithearinglinks', this.deleteDisputeHearingWithStateCheck, this);
    this.listenTo(disputeHearings, 'make:primary', this.makePrimaryWithStateCheck, this);

    this.listenTo(this.fileTypeDropdownModel, 'change:value', function() {
      this.dmsInputModel.set('value', null);
      this.externalInputModel.set('value', null);
      this.render();
    }, this);
  },
  

  makePrimaryWithStateCheck: async function() {
    return this.model.withStateCheck(
      this.makePrimary.bind(this, ...arguments),
      this.showInvalidStateModal.bind(this),
      this.onStateCheckError.bind(this)
    );
  },

  makePrimary(newPrimaryModel) {
    this.deletesInProgress = true;

    // Remove all, then create them again
    const toAdd = [];
    this.model.getDisputeHearings().each(disputeHearingModel => {
      const isPrimary = newPrimaryModel.id === disputeHearingModel.id;
      const clonedModel = disputeHearingModel.clone();
      clonedModel.set({
        _originalData: null,
        dispute_hearing_id: null,
        dispute_hearing_role: configChannel.request('get', isPrimary ? 'DISPUTE_HEARING_ROLE_PRIMARY' : 'DISPUTE_HEARING_ROLE_SECONDARY')
      });
      toAdd.push(clonedModel);
    });

    this.model.deleteAllDisputeHearings().done(() => {
      this.deletesInProgress = false;
      this.model.getDisputeHearings().reset(toAdd);
      this.saveModelDisputeHearings();
    }).fail(
      generalErrorFactory.createHandler('ADMIN.DISPUTEHEARINGS.DELETE', () => loaderChannel.trigger('page:load:complete'))
    );
  },

  onChangeLinkTypeWithStateCheck: async function() {
    return this.model.withStateCheck(
      this.onChangeLinkType.bind(this, ...arguments),
      this.showInvalidStateModal.bind(this),
      this.onStateCheckError.bind(this)
    );
  },

  onChangeLinkType(model, newValue) {
    newValue = Number(newValue) || null;
    this.model.updateDisputeHearingsLinkType(newValue);
    this._updateLinkTypeAndRender();
  },

  deleteDisputeHearingWithStateCheck: async function(disputeHearingModelToDelete) {
    if (!disputeHearingModelToDelete) {
      return;
    }
    return this.model.withStateCheck(
      () => {
        $.when(disputeHearingModelToDelete.destroy())
          .done(() => {
            this.deletesInProgress = false;
            if (disputeHearingModelToDelete) {
              this.model.getDisputeHearings().remove(disputeHearingModelToDelete);
            }
            this._updateLinkTypeAndRender();
          })
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.DISPUTEHEARING.DELETE');
            handler(err);
          }).always(() => this.deletesInProgress = false);
      },
      this.showInvalidStateModal.bind(this),
      this.onStateCheckError.bind(this)
    );
  },

  saveModelDisputeHearings() {
    loaderChannel.trigger('page:load');  
    return new Promise((res, rej) => this.model.saveDisputeHearings()
      .done(() => {
        this.dmsInputModel.set('value', null);
        this.externalInputModel.set('value', null);
        this._updateLinkTypeAndRender().done(() => res());
      }).fail(err => {
        loaderChannel.trigger('page:load:complete')
        err = err || {};
        if (hearingChannel.request('check:scheduling:error', err)) {
          const dmsInputView = this.getChildView('dmsInputRegion');
          const errorMessage = 'File is already associated to a hearing.';
          if (dmsInputView) {
            dmsInputView.showErrorMessage(errorMessage);
          } else {
            alert(errorMessage);
          }
          this.model.resetDisputeHearings();
        } else {
          generalErrorFactory.createHandler('ADMIN.DISPUTEHEARINGS.SAVE', () => {
            this.model.resetDisputeHearings();
          })(err);
        }
        rej(err);
      })
    );
  },

  updateLinkTypeOptions() {
    const disputeHearings = this.model.getDisputeHearings();
    const linkCodesToUse = [];
    let codeToUse;
    if (disputeHearings.length < 2) {
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_SINGLE');
      codeToUse = 'DISPUTE_HEARING_LINK_TYPE_SINGLE';
    } else if (disputeHearings.length === 2) {
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_CROSS');
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_REPEATED');
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_JOINER');
    } else if (disputeHearings.length > 2) {
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT');
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_REPEATED');
      linkCodesToUse.push('DISPUTE_HEARING_LINK_TYPE_JOINER');
    }

    if (this.model.isCrossApp()) {
      codeToUse = 'DISPUTE_HEARING_LINK_TYPE_CROSS';
    } else if (this.model.isJoinerApp()) {
      codeToUse = 'DISPUTE_HEARING_LINK_TYPE_JOINER';
    } else if (this.model.isCrossRepeatApp()) {
      codeToUse = 'DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT';
    } else if (this.model.isRepeatedApp()) {
      codeToUse = 'DISPUTE_HEARING_LINK_TYPE_REPEATED';
    }

    const linkTypeOptions = this._codesToLinkTypeOptions(linkCodesToUse);
    const disabled = linkCodesToUse.length < 2;
    this.linkTypeModel.set({
      disabled,
      optionData: linkTypeOptions,
      value: codeToUse ? String(configChannel.request('get', codeToUse)) : linkTypeOptions[0].value
    }, { silent: true });
  },

  _updateLinkTypeAndRender() {
    if (this.deletesInProgress) {
      return;
    }

    loaderChannel.trigger('page:load');
    return this.model.checkAndUpdateLinkType()
      .done(() => {
        // Always make sure full complex hearing integrity on these changes
        return hearingChannel.request('update:participations:save', this.model)
        .always(() => {
          this.isLoading = false;
          this.render();
          loaderChannel.trigger('page:load:complete');
        });
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.DISPUTEHEARINGS.SAVE', () => this.render());
        handler(err);
      });
  },


  showInvalidStateModal() {
    this.$el.hide();
    hearingChannel.request('show:invalid:modal').finally(() => {
      // No need to refresh again, we already should have fetched the model by this point
      this.render();
      this.$el.show();
    });
  },

  onStateCheckError() {
    // There was an API error, stop loading and close this modal
    this.trigger('save:complete');
    this.close();
    loaderChannel.trigger('page:load:complete');
  },

  
  onRender() {
    // Update link type dropdown but without render
    this.updateLinkTypeOptions();

    this.showChildView('linkTypeRegion', new DropdownView({ model: this.linkTypeModel }));
    this.showChildView('fileTypeRegion', new DropdownView({ model: this.fileTypeDropdownModel }));
    this.showChildView('dmsInputRegion', new InputView({ model: this.dmsInputModel }));
    this.showChildView('externalInputRegion', new InputView({ model: this.externalInputModel }));
    this.showChildView('linkedApplicationsRegion', new LinkedHearingsListView({ parent: this.model, collection: this.model.getDisputeHearings() }));

    const dmsInputView = this.getChildView('dmsInputRegion');
    const externalInputView = this.getChildView('externalInputRegion');

    this.stopListening(dmsInputView, 'input:enter');
    this.listenTo(dmsInputView, 'input:enter', this.clickAddDmsWithStateCheck, this);

    this.stopListening(externalInputView, 'input:enter');
    this.listenTo(externalInputView, 'input:enter', this.clickAddExternalWithStateCheck, this);
  },

  templateContext() {
    return {
      Formatter,
      isDmsTypeSelected: this.fileTypeDropdownModel.getData() === DMS_TYPE_CODE,
      hasPrimary: this.model.getPrimaryDisputeHearing(),
      hearingDateTimeDisplay: `${Moment(this.model.get('local_start_datetime')).format('ddd, MMM D, YYYY - h:mmA')} - ${
        Moment(this.model.get('local_end_datetime')).format('h:mmA')}`,
      hasHearingNotice: this.model.getHearingNoticeFileDescription()?.getUploadedFiles()?.length,
    };
  }

});
