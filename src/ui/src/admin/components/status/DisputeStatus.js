import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import TextareaView from '../../../core/components/textarea/Textarea';
import TextareaModel from '../../../core/components/textarea/Textarea_model';
import StageStatusOwnerModel from './StageStatusOwner_model';
import StageStatusOwnerView from './StageStatusOwner';
import QuickStatusView from './QuickStatus';
import template from './DisputeStatus_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const sessionChannel = Radio.channel('session');
const menuChannel = Radio.channel('menu');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const userChannel = Radio.channel('users');
const loaderChannel = Radio.channel('loader');
const statusChannel = Radio.channel('status');
const Formatter = Radio.channel('formatter').request('get');
const hearingChannel = Radio.channel('hearings');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'two-column-edit-container review-information-body',

  ui: {
    error: '.error-block',
    quickstatusContainer: '.quickstatus-container',
  },

  regions: {
    ownerRegion: '.review-status-owner-container',
    stageRegion: '.review-status-stage',
    statusRegion: '.review-status',
    processRegion: '.review-status-process',
    overrideRegion: '.review-evidence-override',
    commentRegion: '.review-status-note',
    quickstatusRegion: '.quickstatus-region',
  },

  validateAndShowErrors() {
    // Hide any existing errors first
    this.getUI('error').html('');

    let is_valid = true;
    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      // ownerRegion is not an EditableComponent, needs different handling
      if (component_name === 'ownerRegion' || component.isActive()) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);

    // Don't validate the owner/process/etc requiredness
    if (!is_valid) {
      return;
    }

    // Now validate that at least one of these fields is entered:
    const at_least_one_required = [this.stageStatusOwnerModel, this.stageEditModel, this.statusEditModel, this.processEditModel];
    if (_.all(at_least_one_required, function(model) { return model && $.trim(model.get('value')) === ''; }, this)) {
      this.getUI('error').html('Please enter an owner, a stage, a status, or a process to save');
      is_valid = false;
    }
    return is_valid;
  },

  _saveData() {
    const originalOwner = this.model.getOwner();
    const loggedInUserId = sessionChannel.request('get:user:id');
    const onSaveCompleteFn = () => {
      loaderChannel.trigger('page:load:complete');
      this.reinitialize();
      this.model.trigger('save:status');
    };

    _.each(this.editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      // ownerRegion is not an EditableComponent, needs different handling
      if (component_name === 'ownerRegion') {
        if (!component.model.getData()) {
          this.model.set({ owner : 0 });
        } else {
          this.model.set(component.model.getPageApiDataAttrs());
        }
        return;
      }

      if (component.isActive()) {
        // Save the local data into the participant model
        if (component_name === 'processRegion' && !component.getModel().get('value')) {
          this.model.set( { process : 0 });
        } else if (component.subView && component.getApiData) {
          this.model.set(component.getApiData());
        }
      }
    }, this);

    const status_snapshot = (this.model.getApiSnapshotOfData() || {}).status;
    const status_changes = _.omit(_.pick(this.model.toJSON(), this.model.API_STATUS_ATTRS), function(val, key) {
      return val === status_snapshot[key];
    }, this);

    if (_.isEmpty(this.model.getApiChangesOnly()) && _.isEmpty(status_changes)) {
      onSaveCompleteFn();
      return;
    }

    // If edit, just save to participant
    const wasAssignedToCurrentUserNowUnassiged = status_changes.owner
      && loggedInUserId === originalOwner
      && loggedInUserId !== status_changes.owner;
    
    const isNowAssignedToCurrentUser = status_changes.owner
      && loggedInUserId !== originalOwner
      && loggedInUserId === status_changes.owner;

    const disputesMenuItems = ['my_disputes_arb_item', 'my_disputes_io_item'];
    loaderChannel.trigger('page:load');
    $.whenAll(this.model.saveStatus(status_changes), this.model.save(this.model.getApiChangesOnly()))
      .done(() => {
        if (isNowAssignedToCurrentUser) {
          menuChannel.trigger('add:to:item:count', disputesMenuItems, 1);
        } else if (wasAssignedToCurrentUserNowUnassiged) {
          menuChannel.trigger('add:to:item:count', disputesMenuItems, -1);
        }
        statusChannel.request('apply:sspo:flags', status_changes, this.model).finally(() => onSaveCompleteFn());
      })
      .fail((statusSaveResponse, disputeSaveResponse) => {
        const onErrorFn = () => {
          this.model.resetModel();
          onSaveCompleteFn();
        };
        if (generalErrorFactory.isErrorResponse(disputeSaveResponse)) {
          return generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', onErrorFn)(disputeSaveResponse[0]);
        } else {
          statusSaveResponse = statusSaveResponse || {};
          return generalErrorFactory.createHandler('ADMIN.PSSO.SAVE', onErrorFn)(statusSaveResponse[0]);
        }
      });
  },

  reinitialize() {
    this.createEditModels();
    this.setupListeners();
    this.render();
  },

  showLinkedHearingConflictModal() {
    modalChannel.request('show:standard', {
      title: 'Linked Hearing Conflict',
      bodyHtml: `
        <p>
          You cannot withdraw any dispute that is linked to a shared hearing. If you wish to withdraw this dispute file you must use the edit hearing linking feature to remove this file from the shared hearing. 
          If you are not sure how to edit the linking in order to remove this file see the process library.
        </p>
      `,
      hideContinueButton: true,
      hideCancelButton: false,
    })
  },

  onMenuSave() {
    if (!this.validateAndShowErrors()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const hearing = hearingChannel.request('get:active');
    if (hearing) {
      const hasAtLeastTwoLinkedHearings = hearing.get('associated_disputes')?.length >= 2;
      const currentStatus = this.model.getStatus();
      const nextStatus = this.statusEditModel.getData({ parse: true });

      if (nextStatus === configChannel.request('get', 'STATUS_WITHDRAWN') && hasAtLeastTwoLinkedHearings && currentStatus !== nextStatus) {
        this.showLinkedHearingConflictModal();
        return;
      }
    }

    loaderChannel.trigger('page:load');
    this.saveDataWithChecks();
  },

  saveDataWithChecks() {
    this.applySspoModifiedCheck()
      .then(this.applyProcessCheck.bind(this))
      // Check the status and refresh the parent if there's an issue
      .then(this.applyStatusCheck.bind(this))
      .then(this._saveData.bind(this), () => {
        // If there was a rejection in status check, make sure to re-render context container parent
        this.trigger('contextRender');
      })
      .catch(() => {});
  },

  applySspoModifiedCheck() {
    return new Promise((res, rej) => (
      statusChannel.request('check:sspo:changed', this.model).then(res, () => {
        this.model.stopEditInProgress();                
        Backbone.history.loadUrl(Backbone.history.fragment);
        rej();
    })));
  },

  applyProcessCheck() {
    return new Promise((resolve, reject) => {
      const process = this.processEditModel.getData({ parse: true });
      if (process !== this.model.getProcess()) {
        loaderChannel.trigger('page:load:complete');
        const modalView = modalChannel.request('show:standard', {
          title: 'Change Dispute Process?',
          bodyHtml: `<p>You are changing the dispute process.  This should only be done when the dispute file is moving into a new business process.  This will close the previous process and record all future stage and status changes against the new process.</p>` +
            `<p>This action cannot be undone.</p><p>Are you sure you wish to change the current process?</p>`,
          cancelButtonText: 'No, cancel',
          primaryButtonText: 'Yes, change process',
          onContinueFn: ((_modalView) => {
            _modalView.close();
            resolve();
          }).bind(this)
        });
        this.listenTo(modalView, 'removed:modal', reject);
      } else {
        resolve();
      }
    });
  },

  applyStatusCheck() {
    const status = this.statusEditModel.getData({ parse: true });
    const evidenceOverride = this.overrideEditModel.getData({ parse: true });
    return new Promise((res, rej) => (
      statusChannel.request('check:sspo:status', this.model, status, evidenceOverride).then(res, () => {
        this.model.stopEditInProgress();
        this.trigger('contextRender');
        rej();
    })));
  },

  onMenuEdit() {
    this.getAndApplyStageStatusRules();

    this.switchToEditState();
  },

  resetModelValues() {
    this.model.resetModel();

    this.reinitialize();
  },

  switchToEditState() {
    _.each(this.editGroup, function(component_name) {
      if (component_name === 'ownerRegion') {
        return;
      }
      const component = this.getChildView(component_name);
      if (component) {
        component.toEditable();
      }
    }, this);

    _.each(this.editDisableGroup, function(component_obj) {
      const component = this.getChildView(component_obj.child);
      if (component) {
        component.toEditableDisabled(component_obj.disabledMessage);
      }
    }, this);


    this.checkAndShowQuickstatusView();
  },

  checkAndShowQuickstatusView() {
    const available_quickstatuses = statusChannel.request('get:rules:quickstatus', this.model);

    if (available_quickstatuses && available_quickstatuses.length) {
      const collection = new Backbone.Collection(available_quickstatuses);
      this.listenTo(collection, 'save:complete', function() {
        this.model.trigger('save:status');
        this.reinitialize();
      }, this);
      this.showChildView('quickstatusRegion', new QuickStatusView({ collection }));
      this.getUI('quickstatusContainer').removeClass('hidden');
    }
  },

  initialize() {
    this.createEditModels();
    this.setupListeners();
    this.setEditGroups();
  },

  _getProcessOptions() {
    return (statusChannel.request('get:processes') || []).map(configValue => {
      return { value: String(configValue), text: Formatter.toProcessDisplay(configValue) };
    });
  },

  createEditModels() {
    const dispute = this.model;
    const status = dispute ? dispute.get('status') : {};

    this.stageEditModel = new DropdownModel({
      optionData: this.stagesToPicklist(),
      labelText: 'Stage',
      errorMessage: 'Select a stage type',
      required: false,
      defaultBlank: true,
      value: String(dispute.getStage()),
      apiMapping: 'dispute_stage'
    });


    this.statusEditModel = new DropdownModel({
      optionData: this.statusesToPicklistFromStage(status.dispute_stage),
      labelText: 'Status',
      errorMessage: 'Select a status type',
      required: false,
      defaultBlank: $.trim(status.dispute_stage) !== "" ? false : true, // When there is a real stage, don't let 0 status be chosen
      value: String(dispute.getStatus()),
      apiMapping: 'dispute_status'
    });
    const statusNotInDropdown = (this.statusEditModel.get('optionData')||[]).filter(opt => opt.value === this.statusEditModel.getData());
    if (statusNotInDropdown) this.statusEditModel.set('defaultBlank', true);

    const processOptions = this._getProcessOptions();
    this.processEditModel = new DropdownModel({
      optionData: processOptions,
      labelText: 'Process',
      errorMessage: 'Select a process type',
      required: false,
      defaultBlank: false,
      value: $.trim(status.process) !== '' ? String(status.process) : processOptions[0].value,
      apiMapping: 'process'
    });

    this.overrideEditModel = new DropdownModel({
      optionData: [
        {value: 0, text: 'No, follow access rules'},
        {value: 1, text: 'Yes, allow all uploads'}
      ],
      labelText: 'Enable all uploads',
      required: true,
      defaultBlank: false,
      value: status.evidence_override ? 1 : 0,
      apiMapping: 'evidence_override'
    });

    this.commentEditModel = new TextareaModel({
      labelText: 'Comment',
      errorMessage: 'Enter a status comment',
      required: false,
      displayRows: 3,
      max: 200,
      countdown: true,
      value: status.status_note,
      apiMapping: 'status_note'
    });

    this.stageStatusOwnerModel = new StageStatusOwnerModel({ api_owner_id: this.model.getOwner() });
  },


  setInputModelToRequired(model) {
    model.set({
      required: true,
      cssClass: $.trim(model.get('cssClass')).replace('optional-input' , ''),
      value: model.get('value') ? model.get('value') : null
    });
  },
  setInputModelToOptional(model) {
    model.set({
      required: false,
      cssClass: `${$.trim(model.get('cssClass')).replace('optional-input' , '')} optional-input`,
      value: model.get('value') ? model.get('value') : null
    });
  },


  getAndApplyStageStatusRules() {
    const stage = this.stageEditModel.getData({ parse: true }),
      status = this.statusEditModel.getData({ parse: true }),
      stage_status_rules = statusChannel.request('get:rules:stagestatus', stage, status);

    if (!stage_status_rules || _.isEmpty(stage_status_rules)) {
      console.log(`[Warning] Couldn't retrieve status stage rules for "${stage}:${status}"`);
      return;
    }

    if (stage_status_rules.processOptional) {
      this.setInputModelToOptional(this.processEditModel);
    } else {
      this.setInputModelToRequired(this.processEditModel);
    }

    this.stageStatusOwnerModel.set({ stage, status });
    this.stageStatusOwnerModel.setOwnerBasedOnStageStatus();

    // Now re-render models that have changed
    const statusStageViews = ['ownerRegion', 'stageRegion', 'statusRegion', 'processRegion'];
    _.each(statusStageViews, function(viewName) {
      const view = this.getChildView(viewName);
      view.render();
    }, this);
  },


  stagesToPicklist(stages) {
    if (!stages) {
      stages = statusChannel.request('get:stages');
    }
    return _.map(stages, function(stage) {
      return { value: String(stage), text: statusChannel.request('get:stage:display', stage) };
    });
  },

  statusesToPicklist(statuses) {
    return _.map(statuses, function(status) {
      return { value: String(status), text: statusChannel.request('get:status:display', status) };
    });
  },

  statusesToPicklistFromStage(stage) {
    const STAGE_0_STATUSES_THAT_CANNOT_BE_SET = configChannel.request('get', 'STAGE_0_STATUSES_THAT_CANNOT_BE_SET') || [];
    const stageConfig = statusChannel.request('get:stage', stage);
    if (!stageConfig || !stageConfig.statuses) {
      console.trace("[Error] Invalid stage config - no statuses available");
      return;
    }

    let statuses = _.map(stageConfig.statuses, status => status);

    if (Number(stage) === 0 && _.isArray(STAGE_0_STATUSES_THAT_CANNOT_BE_SET) && STAGE_0_STATUSES_THAT_CANNOT_BE_SET.length) {
      statuses = _.omit(statuses, status => _.contains(STAGE_0_STATUSES_THAT_CANNOT_BE_SET, status));
    }

    const creationMethodStatusRestrictions = {
      // Paper/manual applications cannot be set to Needs Update (Intake-only status)
      isCreatedExternal: [1],
      isCreatedAriE: [1],
      // Intake applications cannot be set to Paper Application Needs Update (Paper/Manual-only status)
      isCreatedIntake: [6],
      // PFR and ARI-C are for landlords and cannot apply for fee waivers, they should not be able to be set into a status for paper applications or fee waivers.
      isUnitType: [3,6],
    };

    Object.keys(creationMethodStatusRestrictions).forEach(disputeModelFnName => {
      if (_.isFunction(this.model[disputeModelFnName]) && this.model[disputeModelFnName]()) {
        statuses = _.omit(statuses, status => _.contains(creationMethodStatusRestrictions[disputeModelFnName], status));
      }
    });

    return this.statusesToPicklist(statuses);
  },

  onStageChangeValue(model, value) {
    const status_options = this.statusesToPicklistFromStage(value);
    // Set the status to the first value in the list of available statuses
    this.statusEditModel.set({
      defaultBlank: $.trim(value) !== '' ? false : true, // When there is a real stage, don't let 0 status be chosen
      optionData: status_options,
      value: status_options && status_options.length ? status_options[0].value : null
    });
  },

  setupListeners() {
    // This will also trigger a status change if needed, which will apply the rules
    this.listenTo(this.stageEditModel, 'change:value', this.onStageChangeValue, this);
    this.listenTo(this.statusEditModel, 'change:value', () => this.getAndApplyStageStatusRules());
    this.listenTo(this.processEditModel, 'change:value', (model, value) => {
      if (value === String(configChannel.request('get', 'PROCESS_REVIEW_REQUEST'))) {
        model.set({ value: model.previous('value') }, { silent: true });
        this.processEditModel.trigger('render');
        
        modalChannel.request('show:standard', {
          title: 'System Change Warning',
          bodyHtml: `
          <p>
            <b>The 'Review Request' process has been replaced by tasks.</b>
            <br>
            The correction, clarification and review request processes are now managed through assigned tasks not dispute statuses.  
            This process should only be used to complete requests that were being worked on prior to the features being managed through tasks.  
            If you are not sure if you should use this process, contact your manager.
          </p>
          `,
          primaryButtonText: 'Set Status Anyway',
          onContinueFn: _modalView => {
            _modalView.close();
            this.processEditModel.set({ value }, { silent: true });
            this.processEditModel.trigger('render');
          },
        });
      }
    });
  },

  setEditGroups() {
    this.editGroup = ['ownerRegion', 'stageRegion', 'statusRegion', 'processRegion', 'overrideRegion', 'commentRegion'];
  },

  onRender() {
    const status = this.model.get('status') || {},
      stage_display = Formatter.toStageDisplay(this.stageEditModel.get('value')),
      status_display = Formatter.toStatusDisplay(this.statusEditModel.get('value'));

    this.showChildView('stageRegion', new EditableComponentView({
      state: 'view',
      label: this.stageEditModel.get('labelText'),
      view_value: stage_display ? stage_display : '-',
      view_class: statusChannel.request('get:colourclass', status.dispute_stage, status.dispute_status),
      subView: new DropdownView({
        model: this.stageEditModel
      })
    }));

    this.showChildView('statusRegion', new EditableComponentView({
      state: 'view',
      label: this.statusEditModel.get('labelText'),
      view_value: status_display ? status_display : '-',
      view_class: statusChannel.request('get:colourclass', status.dispute_stage, status.dispute_status),
      subView: new DropdownView({
        model: this.statusEditModel
      })
    }));

    this.showChildView('processRegion', new EditableComponentView({
      state: 'view',
      label: this.processEditModel.get('labelText'),
      view_value: Formatter.toProcessDisplay(this.processEditModel.getData({ parse: true })),
      subView: new DropdownView({
        model: this.processEditModel
      })
    }));

    this.showChildView('ownerRegion', new StageStatusOwnerView({
      model: this.stageStatusOwnerModel
    }));

    this.showChildView('overrideRegion', new EditableComponentView({
      state: 'view',
      label: this.overrideEditModel.get('labelText'),
      view_value: status.evidence_override ? 'Yes, allow all uploads' : 'No, follow access rules',
      view_class: status.evidence_override ? 'status-override' : '',
      subView: new DropdownView({
        model: this.overrideEditModel
      })
    }));

    this.showChildView('commentRegion', new EditableComponentView({
      state: 'view',
      label: this.commentEditModel.get('labelText'),
      view_value: this.commentEditModel.get('value') ? this.commentEditModel.get('value') : '-',
      subView: new TextareaView({
        model: this.commentEditModel
      })
    }));
  },

  templateContext() {
    const owner = this.model.getOwner();
    return {
      Formatter,
      ownerDisplay: owner ? userChannel.request('get:user:name', owner) : '-',
      hasComment: !!$.trim(this.model.getStatusComment() || ''),
    };
  }
});
