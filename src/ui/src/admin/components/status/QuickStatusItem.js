import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import template from './QuickStatusItem_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const userChannel = Radio.channel('users');
const sessionChannel = Radio.channel('session');
const statusChannel = Radio.channel('status');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'quickstatus-item clearfix',

  regions: {
    stageRegion: '.quickstatus-stage',
    statusRegion: '.quickstatus-status',
    ownerRegion: '.quickstatus-owner',
    overrideRegion: '.quickstatus-override',
  },

  ui: {
    save: '.quickstatus-save'
  },

  events: {
    'click @ui.save': 'clickSave'
  },

  clickSave() {
    const ownerView = this.getChildView('ownerRegion');
    if (ownerView && ownerView.isRendered() && !ownerView.validateAndShowErrors()) {
      return;
    }
    const ownerId = this.ownerModel.getData({ parse: true });
    const statusChanges = Object.assign({
        dispute_stage: this.model.get('dest_stage'),
        dispute_status: this.model.get('dest_status'),
        // Set owner to none (unassign) when no owner specified
        owner: this._requiresOwner() ? ownerId : 0,
      },
        this._requiresOverride() ? { evidence_override: this.model.get('dest_override')?1:0 } : {}
    );
    loaderChannel.trigger('page:load');

    this.applySspoModifiedCheck()
    .then(this.applyStatusCheck.bind(this))
    .then(() => {
      this.dispute.saveStatus(statusChanges)
      .done(() => {
        statusChannel.request('apply:sspo:flags', statusChanges, this.dispute).finally(() => this.model.trigger('save:complete'));
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('STATUS.SAVE', () => this.model.trigger('save:complete'));
        handler(err);
      });
    }).catch(() => {});
  },

  applySspoModifiedCheck() {
    return new Promise((res, rej) => (
      statusChannel.request('check:sspo:changed', this.dispute).then(res, () => {
        this.dispute.stopEditInProgress();
        this.model.trigger('save:complete');
        Backbone.history.loadUrl(Backbone.history.fragment);
        rej();
    })));
  },

  applyStatusCheck() {
    const status = this.model.get('dest_status');
    const evidenceOverride = this._requiresOverride() && this.model.get('dest_override');
    return new Promise((res, rej) => (
      statusChannel.request('check:sspo:status', this.dispute, status, evidenceOverride).then(() => {
        loaderChannel.trigger('page:load');
        res();
      }, () => {
        this.dispute.stopEditInProgress();
        this.dispute.trigger('save:complete');
        rej();
    })));
  },

  _requiresOwner() {
    const ownerTypes = this.model.get('ownerTypes');
    return ownerTypes && ownerTypes.length;
  },

  _requiresOverride() {
    return this.model.get('dest_override') !== null;
  },

  _useExistingOwner() {
    return this.model.get('dest_owner') === 'same';
  },

  initialize() {
    this.dispute = disputeChannel.request('get');
    this.stageModel = new DropdownModel({
      labelText: 'Stage',
      disabled: true,
      optionData: [{ value: -1, text: Formatter.toStageDisplay(this.model.get('dest_stage')) }],
      value: -1
    });
    this.statusModel = new DropdownModel({
      labelText: 'Status',
      disabled: true,
      optionData: [{ value: -1, text: Formatter.toStatusDisplay(this.model.get('dest_status')) }],
      value: -1
    });

    const availableUsersPicklist = this._getUsersPicklist();
    const currentUser = sessionChannel.request('get:user');
    const currentUserId = currentUser ? currentUser.get('user_id') : null;
    const userIdToPopulate = String((this._useExistingOwner() ? this.dispute.getOwner() : currentUserId) || '');
    this.ownerModel = new DropdownModel({
      labelText: 'Owner',
      required: true,
      defaultBlank: true,
      disabled: this._useExistingOwner(),
      optionData: availableUsersPicklist,
      errorMessage: `Please select an owner`,
      value: userIdToPopulate && _.contains(_.pluck(availableUsersPicklist, 'value'), userIdToPopulate) ? userIdToPopulate : null
    });

    this.overrideModel = new CheckboxModel({
      html: 'Allow evidence uploads',
      required: true,
      disabled: true,
      checked: this.model.get('dest_override'),
    });
  },

  _getUsersPicklist() {
    return _.map(userChannel.request('get:users:by:role', this.model.get('ownerTypes')), function(user) {
      return { value: String(user.get('user_id')), text: user.getDisplayName() };
    });
  },

  onRender() {
    this.showChildView('stageRegion', new DropdownView({ model: this.stageModel }));
    this.showChildView('statusRegion', new DropdownView({ model: this.statusModel }));

    if (this._requiresOwner()) {
      this.showChildView('ownerRegion', new DropdownView({ model: this.ownerModel }));
    }

    if (this._requiresOverride()) {
      this.showChildView('overrideRegion', new CheckboxView({ model: this.overrideModel }));
    }
  },

  templateContext() {
    return {
      requiresOwner: this._requiresOwner(),
      requiresOverride: this._requiresOverride()
    };
  },
});