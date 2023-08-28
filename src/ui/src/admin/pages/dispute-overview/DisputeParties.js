import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../components/context-container/ContextContainer';
import DisputePartyView from './DisputeParty';
import ModalAddParty from '../../components/modals/modal-add-party/ModalAddParty';
import template from './DisputeParties_template.tpl';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const notesChannel = Radio.channel('notes');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');

const EmptyPartiesView = Marionette.View.extend({
  template: _.template(`No <%= baseName ? baseName+'s' : 'parties' %> have been added`),
  className: 'standard-list-empty',
  templateContext() {
    return {
      baseName: this.getOption('baseName')
    };
  }
});

const DisputePartiesView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerWithNotesView,
  emptyView: EmptyPartiesView,

  _getMenuStates(model) {
    const isUnitType = this.model.isUnitType();
    const shouldFollowUnitTypeRules = isUnitType && model.isRespondent();
    const isMigrated = this.model.isMigrated();
    const isPostNotice = this.model.isPostNotice();
    const isFinalPersonBusiness =  model.isPersonOrBusiness() && model.collection.filter(function(model) {
      return model.isPersonOrBusiness(); }).length === 1;
    const isPrimary = participantsChannel.request('is:primary', model);
    const canBeSetToPrimary = !isPrimary && model.isApplicant();
    const isMailingAddressDeliveryAddress = model.hasMailAddress();
    // Let the menuTransitions list do the actual switching 

    const default_menu = [
      { name: 'Edit', event: isPostNotice || shouldFollowUnitTypeRules ? 'edit:post:notice' : 'edit:pre:notice' },
      ...(isPostNotice && !isUnitType && !this.model.isCreatedAriE() ? [{ name: 'Amend', event: 'amend' }] : []),
      ...(model.hasSubstitutedService() ? [{ name: 'Manage Substituted Service', event: 'manage:subservice' }] : []),
      ...(model.get('email') ? [{ name: 'Email Access Code', event: 'email:access:code' }] : []),
      ...(model.get('email') && !model.get('email_verified') ? [{ name: 'Send Confirmation Instructions', event: 'email:verification:instructions' }] : []),
      ...(model.get('email') && !model.get('email_verified') ? [{ name: 'Start Manual Email Confirmation', event: 'email:manual:verification'}] : []) 
    ];

    return {
      default: default_menu,
      edit_pre_notice: [{ name: 'Save', event: 'save:pre:notice' },
        { name: 'Cancel', event: 'cancel' },
        ...(!isFinalPersonBusiness && !isPrimary && !shouldFollowUnitTypeRules ? [{ name: 'Delete', event: 'delete' }] : []),
        ...(canBeSetToPrimary ? [{ name: 'Make Primary', event: 'make:primary' }] : [])
      ],

      edit_post_notice: [
        // If they are an agent, allow them to be deleted without recording an amendment
        { name: 'Save', event: 'save:post:notice' },
        { name: 'Cancel', event: 'cancel' },
        ...(model.isAssistant() && !shouldFollowUnitTypeRules ? [{ name: 'Delete', event: 'delete' }] : [])
      ],

      amend: [{ name: 'Cancel', event: 'cancel' },
          ...(!isFinalPersonBusiness && !isPrimary ? [{ name: 'Remove', event: 'remove' }] : []), 
          { name: 'Update Name/Type', event: 'amend:name:edit' },
          ...(isMailingAddressDeliveryAddress ? [{ name: 'Update Delivery Address', event: 'amend:mailing:edit' }] : []),
          ...(!isMailingAddressDeliveryAddress ? [{ name: 'Update Delivery Address', event: 'amend:address:edit' }] : []),
          ...(!isMailingAddressDeliveryAddress ? [{ name: 'Add Mailing Address', event: 'amend:mailing:add' }] : []),
          ...(!isMigrated && canBeSetToPrimary ? [{ name: 'Make Primary', event: 'make:primary:amend' }] : [])
        ],
      
      amend_mailing: [{ name: 'Submit Amendment', event: 'submit:mailing:amendment' },
        { name: 'Cancel', event: 'cancel' }],
    
      amend_mailing_add: [{ name: 'Submit Amendment', event: 'submit:mailing:amendment:add' },
        { name: 'Cancel', event: 'cancel' }],

      amend_address: [{ name: 'Submit Amendment', event: 'submit:address:amendment' },
        { name: 'Cancel', event: 'cancel' }],

      amend_name: [{ name: 'Submit Amendment', event: 'submit:name:amendment' },
        { name: 'Cancel', event: 'cancel' }]
    };
  },

  _getMenuTransitions() {
    return {
      'edit:post:notice': {
        view_mode: 'edit',
        next: 'edit_post_notice',
        isEdit: true
      },
      'edit:pre:notice': {
        view_mode: 'edit',
        next: 'edit_pre_notice',
        isEdit: true
      },
      amend: {
        view_mode: 'view',
        next: 'amend'
      },
      'amend:mailing:add': {
        view_mode: 'edit',
        next: 'amend_mailing_add',
        isEdit: true
      },
      'amend:mailing:edit': {
        view_mode: 'edit',
        next: 'amend_mailing',
        isEdit: true
      },
      'amend:address:edit': {
        view_mode: 'edit',
        next: 'amend_address',
        isEdit: true
      },
      'amend:name:edit': {
        view_mode: 'edit',
        next: 'amend_name',
        isEdit: true
      },
      cancel: {
        next: 'default',
        reset: true
      }
    };
  },

  buildChildView(child, ChildViewClass, childViewOptions) {
    const options = _.extend({model: child}, childViewOptions);
    
    if (ChildViewClass === EmptyPartiesView) {
      return new ChildViewClass(childViewOptions);
    }

    const matchingUnit = options.matchingUnit;
    let indexDisplay = options.childIndex;
    if (matchingUnit) {
      const index = (matchingUnit.getParticipantIds() || []).indexOf(child.id);
      if (index !== -1) {
        indexDisplay = index + 1;
      }
    }

    const PARTICIPANT_TYPE_DISPLAY = configChannel.request('get', 'PARTICIPANT_TYPE_DISPLAY');
    const type_val = child.get('participant_type');
    const partyDisplayName = `${matchingUnit ? `<b>${matchingUnit.getUnitNumDisplay()}:</b> ` : ''}${options.baseName} ${indexDisplay} ${
      type_val && child.isAssistant() ? `- ${PARTICIPANT_TYPE_DISPLAY[type_val]}` : ''
    }`;

    const _originalPartyContactName = child.getContactName();
    const _originalPartyDisplayName = child.getDisplayName();
    const self = this;
    // Create the child view instance
    const view = ContextContainer.withContextMenuNotes({
      wrappedContextContainerView: ContextContainer.withContextMenu({
        wrappedView: new DisputePartyView(options),
        titleDisplay: `${partyDisplayName}${participantsChannel.request('is:primary', child) ? ' - <b>Primary</b>' : ''}`,
        amendmentTypeToUse: child.isAmended() ? configChannel.request('get', 'AMENDMENT_TO_TYPE_PARTY') : null,
        showSubServiceIcon: child.hasSubstitutedService(),
        menu_title: `Participant ID ${child.id}`,
        menu_states: this._getMenuStates(child),
        menu_events: this._getMenuTransitions(),
        onMenuOpenFn: () => _.isFunction(this.onMenuOpenFn) ? this.onMenuOpenFn() : null,
        contextRender(contextContainerView, wrappedView) {
          const partyModel = wrappedView.model;

          if (partyModel && 
            (partyModel.getContactName() !== _originalPartyContactName || partyModel.getDisplayName() !== _originalPartyDisplayName)
          ) {
            partyModel.trigger('contextRender:refresh');
            return;
          }
          self.render();
          loaderChannel.trigger('page:load:complete');
        },
        disputeModel: this.model,
        collapseHandler: SessionCollapse.createHandler(this.model, 'DisputeView', 'parties', child.id),
      }),
      notes: notesChannel.request('get:participant', child.id),
      noteCreationData: {
        mode: 'edit',
        note_linked_to: configChannel.request('get', 'NOTE_LINK_PARTICIPANT'),
        note_link_id: child.id,
        note: null
      }
    });
    return view;
  },

  initialize(options) {
    this.mergeOptions(options, ['onMenuOpenFn']);
    this.listenTo(this.collection, 'update', this.render, this);
  },

  childViewOptions(model, index) {
    const unitCollection = this.getOption('unitCollection');
    return {
      parent: this,
      baseName: this.getOption('baseName'),
      participantType: this.getOption('participantType'),
      childIndex: index+1,

      matchingUnit: !model.isNew() && unitCollection && unitCollection.find(unitModel => _.contains(unitModel.getParticipantIds(), model.id))
    };
  },

  emptyViewOptions() {
    return {
      baseName: this.getOption('baseName')
    };
  }
});


export default Marionette.View.extend({
  template,

  ui: {
    add: '.participant-add-icon',
    collapse: '.dispute-section-title-add.collapse-icon'
  },

  regions: {
    partiesRegion: '.dispute-overview-parties',
  },

  events: {
    'click @ui.add': 'clickAdd',
    'click @ui.collapse': 'clickCollapse',
  },

  initialize(options) {
    this.mergeOptions(options, ['hideAddButton', 'unitCollection', 'participantType']);

    _.extend(this.options, {}, options);
    this.collapseHandler = SessionCollapse.createHandler(this.model, 'DisputeView', this.participantType);
    this.isCollapsed = this.collapseHandler?.get();
  },

  clickAdd() {
    const addPartyFn = () => {
      const modalAddParty = new ModalAddParty(_.extend({}, this.options, { is_post_notice: this.model.isPostNotice() }) );
      this.stopListening(modalAddParty);
      this.listenTo(modalAddParty, 'save:complete', function() {      
        this._checkAndSaveHearingParticipationForParticipant().finally(() => {
          modalChannel.request('remove', modalAddParty);
          // Refresh the main page to get the order of issues correct
          this.collection.trigger('contextRender:refresh');
        });
      }, this);
      loaderChannel.trigger('page:load:complete');
      modalChannel.request('add', modalAddParty, { duration: 350, duration2: 300 });
    };

    this.model.checkEditInProgressPromise().then(
      addPartyFn,
      () => {
        this.model.showEditInProgressModalPromise()
      }
    );
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },


  _checkAndSaveHearingParticipationForParticipant() {
    const hearing = hearingChannel.request('get:active');
    const allXHR = [];

    // Add a hearing service record to active hearing if the new participant should have a hearing record served to them
    if (hearing &&
      (hearing.checkIsDisputePrimaryLink(this.model) ||
      ((hearing.isCrossRepeatApp() || hearing.isJoinerApp()) && hearing.checkIsDisputeSecondaryLink(this.model))
    )) {
      hearingChannel.request('update:participations', hearing);
      allXHR.push(_.bind(hearing.saveHearingParticipations, hearing));  
    }

    return Promise.all(allXHR.map(xhr => xhr()));
  },

  onRender() {
    if (!this.collapseHandler?.get()) {
      this.showChildView('partiesRegion', new DisputePartiesView(this.options));
    }
  },

  templateContext() {
    return {
      headerHtml: this.getOption('headerHtml'),
      showAddButton: !this.hideAddButton && !this.model.isMigrated(),
      addButtonDisplay: this.getOption('addButtonDisplay') ? this.getOption('addButtonDisplay') : 'Add',
      enableCollapse: !!this.collapseHandler,
      isCollapsed: this.isCollapsed
    };
  }

});
