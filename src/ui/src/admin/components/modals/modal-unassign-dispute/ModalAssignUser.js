import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import DisputeModel from '../../../../core/components/dispute/Dispute_model';
import StageStatusOwnerModel from '../../../components/status/StageStatusOwner_model';
import StageStatusOwnerView from '../../../components/status/StageStatusOwner';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import template from './ModalAssignUser_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import { ModalQuickAccess } from '../../quick-access';

const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const statusChannel = Radio.channel('status');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');

export default ModalBaseView.extend({
  template,
  id: 'assignUser-modal',
  
  regions : {
    ownerRegion: '.assign-user-stage-status-owner-container'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-save',
      quickStatus: '.btn-quickstatus',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'assignDisputeWithStateCheck',
      'click @ui.quickStatus': 'clickQuickStatus',
    });
  },

  assignDisputeWithStateCheck() {
    if (!this.getChildView('ownerRegion').validateAndShowErrors()) {
      return;
    }

    if (this.stageStatusOwnerModel.getData() === this.model.get('owner')) {
      this.close()
      return;
    }

    loaderChannel.trigger('page:load');
    if (this.nextStatus && this.fromUnassigned) this.model.set({ status: this.nextStatus });
    const existingOwner = this.model.get('owner');
    const disputeForCheck = new DisputeModel({ dispute_guid: this.model.get('dispute_guid') });
    
    disputeForCheck.fetch()
      .done(() => {
        if (disputeForCheck) {
          const currentOwner = disputeForCheck.getOwner();
          const hasOwnerChanged = this.fromUnassigned ? currentOwner : currentOwner !== existingOwner;
          if (hasOwnerChanged) this.showAlreadyAssignedMsg(currentOwner);
          else {
            this.assignDispute();
          }
        }
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('DISPUTE.LOAD.MINIMAL');
        handler(err);
      });
  },

  assignDispute() {
    statusChannel.request('update:dispute:status', this.model.get('dispute_guid'), this.prepareStatusUpdateAttrs())
    .done(() => {
      loaderChannel.trigger('page:load:complete');
      if (this.assignedToCurrentUser) {
        loaderChannel.trigger('page:load');
        Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), { trigger: true });
      } else {
        // Yield priority to give the loader time to hide.  Another loader is often started on the 'assign:dispute' event
        setTimeout(() => {
          const collection = this.model.collection;
          if (collection) {
            collection.remove(this.model);
            collection.trigger('assign:dispute');
          }
        }, 25);
      }
    }).fail(err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('STATUS.SAVE');
      handler(err);
    })
    .always(() => this.close());
  },

  showAlreadyAssignedMsg(ownerId) {
    this.$el.hide();
    loaderChannel.trigger('page:load:complete');    
    const modalView = modalChannel.request('show:standard', {
      title: 'Dispute Already Assigned',
      bodyHtml: `<p>This dispute has already been assigned to:</p>
        <p><ul><li>${userChannel.request('get:user:name', ownerId)}</li></ul></p>
        <p>Press Continue to be returned to the dashboard dispute list.  It will be refreshed to no longer show this ${this.fromUnassigned ?'' : 're-'}assigned dispute file.</p>`,
      primaryButtonText: 'Continue',
      hideCancelButton: true,
      onContinueFn: _modalView => _modalView.close()
    });

    this.listenTo(modalView, 'removed:modal', () => {
      const collection = this.model.collection;
      if (collection) {
        collection.trigger('assign:dispute');
    }
      this.close();
    });
  },

  prepareStatusUpdateAttrs() {
    const newStatusAttrs = { owner: this.stageStatusOwnerModel.getData() };
    
    _.extend(newStatusAttrs, 
      this.nextStage ? { dispute_stage: this.nextStage } : null,
      this.nextStatus ? { dispute_status: this.nextStatus} : null,
    )

    return newStatusAttrs;
  },

  clickQuickStatus() {
    this.close();
    setTimeout(() => {
      modalChannel.request('add', new ModalQuickAccess({
        model: this.disputeModel,
        quickStatusOnly: true
      }));
    }, 25);
  },

  initialize(options) {
    this.mergeOptions(options, ['nextStage', 'nextStatus', 'fromUnassigned']);
    this.disputeModel = this.model.toDisputeModel();
    this.assignedToCurrentUser = false;
    this.currentUser = sessionChannel.request('get:user');
    this.stageStatusOwnerModel = new StageStatusOwnerModel({
      forceRequired: true,
      stage: this.nextStage ? this.nextStage : this.model.get('stage'),
      status: this.nextStatus ? this.nextStatus : this.model.get('status'),
      api_owner_id: this.fromUnassigned ? null : this.model.get('owner'),
    });
    this.hasQuickStatusOptions = statusChannel.request('get:rules:quickstatus', this.disputeModel).length;

    this.listenTo(this.stageStatusOwnerModel, 'status:change', (status) => {
      //if status:20 and assign to me was clicked, change to status:21
      if (!this.fromUnassigned) return;
      this.nextStatus = status;
      this.render();
    });

    this.listenTo(this.stageStatusOwnerModel.get('ownerEditModel'), 'change:value', (model, value) => {
      //reset status back to 20 if user has clicked 'assign to me' and then changes dropdown to other user
      if (!this.fromUnassigned) return;

      if (value === String(this.currentUser.id)) {
        this.assignedToCurrentUser = true;
      } else if (this.assignedToCurrentUser) {
        this.assignedToCurrentUser = false;
      }

      if (!value && this.nextStatus === 21) {//if status has been set to 21 but unassigned, then reset
        this.nextStatus = null;
        this.render();
      } else if (this.model.get('status') === 20) {//if status === 20 and no user is assigned, then set status to 21
        this.nextStatus = 21;
        this.render();
      }
    });
  },

  onRender() {
    this.showChildView('ownerRegion', new StageStatusOwnerView({ model: this.stageStatusOwnerModel }));
  },

  templateContext() {
    return {
      hasQuickStatusOptions: this.hasQuickStatusOptions,
      stageDisplay: statusChannel.request('get:stage:display', this.nextStage ? this.nextStage : this.model.get('stage')),
      statusDisplay: statusChannel.request('get:status:display', this.nextStatus ? this.nextStatus : this.model.get('status')),
      assignedToCurrentUser: this.assignedToCurrentUser
    };
  }
});