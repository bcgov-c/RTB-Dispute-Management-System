import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ViewMixin from '../../../core/utilities/ViewMixin';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import DisputeClaimEvidenceCollectionView from './DisputeClaimEvidences';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';
import DisputeClaimHearingToolsView from './DisputeClaimHearingTools';
import ModalAmendmentConfirmView from '../../components/amendments/ModalAmendmentConfirm';
import DisputeRemedyView from './DisputeRemedy';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import ClaimOutcomeUserIcon from '../../static/Icon_ArbOutcomes_WHT.png';
import PrevClaimOutcomeUserIcon from '../../static/Icon_ArbOutcomes_PREV.png';
import template from './DisputeClaim_template.tpl';

const CONTENT_NOT_ADDED_HTML = `<i>Not yet added</i>`;

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const amendmentChannel = Radio.channel('amendments');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className() {
    return `review-information-body ${this.getOption('cssClass') || ''}`
  },

  ui: {
    outcomeDisplay: '.dispute-claim-outcome-display',
    hearingToolsRegion: '.dispute-claim-hearing-tools-container'
  },

  regions: {
    hearingToolsRegion: '@ui.hearingToolsRegion',
    amountRegion: '.review-claim-amount',
    noticeDeliveryDate: '.review-claim-delivery-date',
    noticeDeliveryMethod: '.review-claim-delivery-method',
    descriptionRegion: '.review-claim-description',
    evidenceListRegion: '.review-claim-evidence',

    remediesRegion: '.dispute-expense-claim-remedies'
  },

  showDeleteConfirmModal() {
    modalChannel.request('show:standard', {
      title: `Delete Issue?`,
      bodyHtml: `<p>Warning - this will delete the issue: <b>${this.model.getClaimTitleWithCode()}</b>. If this issue has associated evidence files, they will no longer be visible after this issue is deleted.`
        + `<p>Associated evidence: <b>${this.model.getUploadedFiles().length} files</b></p>`
        + `<p>This action cannot be undone.  Are you sure you want to delete this issue?</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: _.bind(function(modal) {
        modal.close();
        loaderChannel.trigger('page:load');
        this.model.setDeleted();
        this._saveModelRemoveOrDelete();
      }, this)
    });
  },

  showRemoveConfirmModal() {
    const modal = new ModalAmendmentConfirmView({
      title: `Remove Issue?`,
      bodyHtml: `<p>Warning - this will remove the issue: <b>${this.model.getClaimTitleWithCode()}</b> and store the change as an amendment.  Amendments must be served to responding parties.  After removing this issue, it will be indicated as removed in the dispute view, but will no longer be visible.  Any evidence associated to this issue will still be visible in the evidence view but it will be displayed as removed.`
        + `<p>Associated evidence: <b>${this.model.getUploadedFiles().length} files</b></p>`
        + `<p>This action cannot be undone.  Are you sure you want to remove this issue?</p>`,
    });

    this.listenToOnce(modal, 'save', function(amendment_data) {
      modal.close();
      loaderChannel.trigger('page:load');
      amendmentChannel.request('remove:claim', this.model, amendment_data)
        .done(() => {
          this.model.setAmendedRemoved();
          this._saveModelRemoveOrDelete();
        }).fail(
          generalErrorFactory.createHandler('ADMIN.AMENDMENT.CLAIM.REMOVE', () => {
            this.refreshList();
            loaderChannel.trigger('page:load:complete');
          })
        );
    }, this);

    modalChannel.request('add', modal);
  },

  showChangeConfirmModal() {
    const modal = new ModalAmendmentConfirmView({
      title: `Amend Issue?`,
      bodyHtml: `<p>Warning - this will modify the issue: <b>${this.model.getClaimTitleWithCode()}</b> and store the change as an amendment.`
        + `&nbsp;Amendments must be served to responding parties.</p>`
        + `<p>Are you sure you want to amend this issue?`,
    });

    this.listenToOnce(modal, 'save', function(amendment_data) {
      modal.close();
      loaderChannel.trigger('page:load');
      this._saveAmendment(amendment_data);
    }, this);

    modalChannel.request('add', modal);
  },

  onMenuDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      filesChannel.request('download:files', this.model.getUploadedFiles());
    };

    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Evidence' });
  },


  onMenuDelete() {
    this.showDeleteConfirmModal();
  },

  onMenuRemove() {
    this.showRemoveConfirmModal();
  },

  onMenuSubmitAmendment() {
    if (this.validateAndShowErrors(this.amendmentEditGroup)) {
      this._applyPageModelChanges(this.amendmentEditGroup);
      if (!this.model.needsApiUpdate()) {
        console.log("No amendment changes needed");
        this.reinitialize();
        this.render();
        loaderChannel.trigger('page:load:complete');
        return;
      }
      this.showChangeConfirmModal();
    }
  },


  onMenuSavePreNotice() {
    if (this.validateAndShowErrorsForPreNotice()) {
      loaderChannel.trigger('page:load');
      this._applyPageModelChanges(this.preNoticeEditGroup);
      this._saveModel();
    }
  },

  onMenuAmend() {
    this.switchToAmendState();
  },

  onMenuEditPreNotice() {
    this.switchToPreNoticeEditState();
  },

  resetModelValues() {
    //
  },

  _switchToEditGroup(editGroup) {
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);
  },

  switchToPreNoticeEditState() {
    this._switchToEditGroup(this.preNoticeEditGroup);
  },

  switchToAmendState() {
    this._switchToEditGroup(this.amendmentEditGroup);
  },

  initialize(options) {
    this.mergeOptions(options, ['cssClass', 'showThumbnails', 'showArrows', 'showArbControls', 'hideIssueContent', 'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations', 'hideDups']);

    this.disputeModel = disputeChannel.request('get');
    this.issueConfig = this.applyCustomIsseConfigOverrides(configChannel.request('get:issue', this.model.claim.get('claim_code') ) || {});
    this.outcomeDisplay = null;
    
    this.reinitialize();
  },

  reinitialize() {
    this.createEditModels();
    this.setEditGroups();
  },

  setEditGroups() {
    this.preNoticeEditGroup = ['amountRegion', 'noticeDeliveryDate', 'noticeDeliveryMethod', 'descriptionRegion'];
    this.amendmentEditGroup = ['amountRegion', 'noticeDeliveryDate', 'noticeDeliveryMethod', 'descriptionRegion'];
  },

  updateLocalModel(data) {
    this.model.updateApplicantClaimDetail(data);
    this.model.updateApplicantRemedy(_.extend({}, data));
    this.model.updateApplicantRemedyDetail(data);
  },

  validateAndShowErrorsForPreNotice() {
    return this.validateAndShowErrors(this.preNoticeEditGroup);
  },

  validateAndShowErrors(childViews) {
    let is_valid = true;
    _.each(childViews, function(component_name) {
      const component = this.getChildView(component_name);
      if (component.isActive()) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  applyPageModelChangesForPreNotice() {
    return this._applyPageModelChanges(this.preNoticeEditGroup);
  },

  _applyPageModelChanges(childViews) {
    const data = {};
    _.each(childViews, function(component_name) {
      const component = this.getChildView(component_name);
      if (component.isActive()) {
        // Save the local data into the participant model
        if (component.subView && component.getApiData) {
          _.extend(data, component.getApiData());
        }
      }
    }, this);
    this.updateLocalModel(data);
  },

  _saveModelRemoveOrDelete() {
    // Always un-set edit mode before API save
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }

    this.model.save()
      .done(() => {
        this.model.trigger('remove:claim:then:contextRender:refresh', this.model);
      }).fail(
        generalErrorFactory.createHandler('ADMIN.CLAIM.REMOVE', () => {
          loaderChannel.trigger('page:load:complete');
        })
      );
  },

  _saveModel() {
    // Always un-set edit mode before API save
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }

    const dfd = $.Deferred();
    this.model.save()
      .done(() => {
        this.trigger('contextRender');
        loaderChannel.trigger('page:load:complete');
        dfd.resolve();
      })
      .fail(
        generalErrorFactory.createHandler('ADMIN.CLAIM.SAVE', () => {
          this.model.resetModel();
          this.model.trigger('contextRender:refresh');
          loaderChannel.trigger('page:load:complete');
          dfd.reject();
        })
      );
    return dfd.promise();
  },

  _saveAmendment(amendment_data) {
    if (!this.model.needsApiUpdate()) {
      console.log("No amendment changes needed");
      loaderChannel.trigger('page:load:complete');
      return;
    }
    
    amendmentChannel.request('change:claim', this.model, amendment_data)
      .done(() => {
        this.model.setAmended();
        this._saveModel();
      }).fail(
        generalErrorFactory.createHandler('ADMIN.AMENDMENT.CLAIM.SAVE', () => {
          this.reinitialize();
          this.render();
          loaderChannel.trigger('page:load:complete');
        })
      );
  },


  createEditModels() {
    const notice_method = this.model.getNoticeDeliveryMethod();
    const notice_date = this.model.getNoticeDeliveryDate();
    const description = this.model.getDescription();
    const amount = this.model.getAmount();
    
    this.amountEditModel = new InputModel({
      labelText: 'Amount requested',
      inputType: 'currency',
      maxNum: configChannel.request('get', 'CLAIM_AMOUNT_MAX_NUM'),
      errorMessage: 'Please enter the amount',
      value: amount ? amount : null,
      required: !!this.issueConfig.useAmount,
      apiMapping: 'amount'
    });

    this.noticeDeliveryDateEditModel = new InputModel({
      labelText: this.model.claimConfig.noticeDueDateTitle || 'Notice delivery date',
      inputType: 'date',
      showYearDate: true,
      errorMessage: `Please enter the date`,
      value: notice_date,
      required: !!this.issueConfig.useNoticeDueDate,
      apiMapping: 'notice_date'
    });

    this.noticeDeliveryMethodEditModel = new DropdownModel({
      labelText: this.model.claimConfig.noticeMethodTitle || 'Notice delivery method',
      optionData: Formatter.getNoticeDeliveryMethodsFromCodeList(this.issueConfig.allowedNoticeMethodCodes) || Formatter.getClaimDeliveryMethods(),
      errorMessage: `Please enter the method`,
      defaultBlank: true,
      value: notice_method ? String(notice_method) : null,
      required: !!this.issueConfig.useNoticeMethod,
      apiMapping: 'notice_method'
    });

    this.descriptionEditModel = new TextareaModel({
      labelText: this.model.claimConfig.textDescriptionTitle ||'Description',
      errorMessage: `Please enter the description`,
      value: description,
      required: !!this.issueConfig.useTextDescription,
      apiMapping: 'description',
      max: configChannel.request('get', 'CLAIM_DESCRIPTION_MAX'),
      countdown: true
    });

    if (this.model.get('dispute_evidences') && this.model.get('dispute_evidences') instanceof DisputeEvidenceCollection) {
      this.disputeClaimEvidenceCollection = this.model.get('dispute_evidences');
    } else {
      const fileDescriptionsForClaim = this.model.isSupportingEvidence() ? filesChannel.request('get:filedescriptions:claim', this.model.get('claim_id')) : filesChannel.request('get:filedescriptions:claimless');
      const fileDescriptionsWithFiles = _.filter(
        _.map(fileDescriptionsForClaim,function(file_d) {
          return {
            file_description: file_d,
            files: filesChannel.request('get:filedescription:files', file_d)
          };
        }), function(decorated_data) {
          // Only return file descriptions that have files
          return decorated_data.files && decorated_data.files.length;
        });
      // Now construct a collection of DisputeEvidence_models
      this.disputeClaimEvidenceCollection = new DisputeEvidenceCollection(fileDescriptionsWithFiles ? fileDescriptionsWithFiles : []);   
    }

    this.stopListening(this.model, 'hearingTools:save');
    this.listenTo(this.model, 'hearingTools:save', function() { this.model.trigger('contextRender:refresh'); }, this);

    this.stopListening(this.model, 'contextRender:edit');
    this.listenTo(this.model, 'contextRender:edit', () => {
      this.render();
      this.model.trigger('render:edit');
    });
  },

  applyCustomIsseConfigOverrides(issueConfig) {
    let configToReturn = issueConfig;
    const isMigrated = this.disputeModel && this.disputeModel.isMigrated();

    if (isMigrated && _.contains([125, 126], issueConfig.id)) {
      configToReturn = _.extend(_.clone(issueConfig), {
        useNoticeDueDate: true,
        useNoticeMethod: true,
        useAmount: true
      });
    }

    return configToReturn;
  },

  onRender() {
    if (this.model.isExpenseIssue()) {
      this.renderExpenseIssue();
    } else {
      this.renderStandardIssue();
    }

    this.showChildView('evidenceListRegion', new DisputeClaimEvidenceCollectionView({
      showArrows: this.showArrows,
      showArbControls: this.showArbControls,
      showThumbnails: this.showThumbnails,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      collection: this.disputeClaimEvidenceCollection,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,

      viewComparator(model) {
        const collection = model.collection;
        return (model.get('isRespondent') ? 999999 : 0) + (collection ? collection.indexOf(model) : 0);
      }
    }));
    
    ViewMixin.prototype.initializePopovers(this);

    if (this.disputeModel && this.disputeModel.get('sessionSettings')?.hearingToolsEnabled && !this.model.isSupportingEvidence()) {
      this.showHearingTools();
    }
  },

  renderStandardIssue() {
    const notice_date = this.model.getNoticeDeliveryDate();
    const notice_method = this.model.getNoticeDeliveryMethod();
    const description = this.model.getDescription();
    const amount = this.model.getAmount();

    this.showChildView('amountRegion', new EditableComponentView({
      state: 'view',
      label: this.amountEditModel.get('labelText'),
      view_value: Formatter.toAmountDisplay(amount),
      subView: new InputView({
        model: this.amountEditModel
      })
    }));

    this.showChildView('noticeDeliveryDate', new EditableComponentView({
      state: 'view',
      label: this.noticeDeliveryDateEditModel.get('labelText'),
      view_value: notice_date ? Formatter.toDateDisplay(notice_date) : CONTENT_NOT_ADDED_HTML,
      subView: new InputView({
        model: this.noticeDeliveryDateEditModel
      })
    }));
    
    this.showChildView('noticeDeliveryMethod', new EditableComponentView({
      state: 'view',
      label: this.noticeDeliveryMethodEditModel.get('labelText'),
      view_value: notice_method ? Formatter.toNoticeMethodDisplay(notice_method) : CONTENT_NOT_ADDED_HTML,
      subView: new DropdownView({
        model: this.noticeDeliveryMethodEditModel
      })
    }));

    this.showChildView('descriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.descriptionEditModel.get('labelText'),
      view_value: description ? description : CONTENT_NOT_ADDED_HTML,
      subView: new TextareaView({
        model: this.descriptionEditModel
      })
    }));
  },

  renderExpenseIssue() {
    const _DisputeRemedyCollectionView = Marionette.CollectionView.extend({
      childView: DisputeRemedyView,
      childViewOptions: { disputeClaimModel: this.model }
    });

    if (this.disputeModel && this.disputeModel.get('sessionSettings')?.hearingToolsEnabled && !this.model.isSupportingEvidence()) {
      this.showHearingTools();
    }

    this.showChildView('remediesRegion', new _DisputeRemedyCollectionView({ collection: this.model.getAllRemedies() }));
  },

  showHearingTools() {
    if (this.model.isExpenseIssue()) {
      const remediesView = this.getChildView('remediesRegion');
      if (remediesView && remediesView.isRendered()) {
        remediesView.children.each(function(view) {
          if (_.isFunction(view.showHearingTools)) {
            view.showHearingTools();
          }
        });
      }
    } else {
      this.showChildView('hearingToolsRegion', new DisputeClaimHearingToolsView({ mode: 'claim-view',
        disputeClaimModel: this.model,
        remedyModel: this.model.getApplicantsRemedy()
      }));
      this.getUI('outcomeDisplay').hide();
    }
  },

  hideHearingTools() {
    // When hiding hearing tools, just re-render this claim view to reset it
    this.render();
  },

  refreshList() {
    this.getOption('parent').render();
  },

  templateContext() {
    const lastModifiedOutcomeModel = this.model.getOutcomeLastModifiedModel();
    const remedyModel = this.model.getApplicantsRemedy();
    return {
      isExpenseIssue: this.model.isExpenseIssue(),
      hideIssueContent: this.hideIssueContent,
      isMigrated: this.disputeModel && this.disputeModel.isMigrated(),
      isPostNotice: this.disputeModel && this.disputeModel.isPostNotice(),
      isSupportingEvidence: this.model.isSupportingEvidence(),
      outcomeDisplay: this.model.getFirstOutcomeDisplay({ use_html: true }),
      outcomeModifiedDisplay: lastModifiedOutcomeModel && lastModifiedOutcomeModel.getModifiedDisplay(),
      prevOutcomeDisplay: this.model.getFirstOutcomeDisplay({ use_html: true, use_prev: true }),
      prevOutcomeModifiedDisplay: remedyModel && remedyModel.getModifiedDisplay({ use_prev: true }),
      isRemedyReviewed: remedyModel && remedyModel.isReviewed(),
      useNoticeDueDate: this.issueConfig.useNoticeDueDate,
      useNoticeMethod: this.issueConfig.useNoticeMethod,
      useAmount: this.issueConfig.useAmount,
      useTextDescription: this.issueConfig.useTextDescription,
      PrevClaimOutcomeUserIcon,
      ClaimOutcomeUserIcon,
      hadStaffActivity: this.model.hadStaffActivity(),
    };
  }

});
