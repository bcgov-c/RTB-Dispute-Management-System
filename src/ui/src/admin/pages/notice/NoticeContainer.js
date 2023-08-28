import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeNoticeView from './DisputeNotice';
import ContextContainer from '../../components/context-container/ContextContainer';
import template from './NoticeContainer_template.tpl';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const modalChannel = Radio.channel('modals');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const notesChannel = Radio.channel('notes');
const hearingChannel = Radio.channel('hearings');

export default Marionette.View.extend({
  template,

  className: 'notice-container-component',

  ui: {
    collapse: '.page-section-title-container > .collapse-icon',
  },

  regions: {
    disputeNoticeRegion: '.notice-container-notice',
    amendmentNoticeRegion: '.notice-container-amendment',
  },

  events: {
    'click @ui.collapse': 'clickCollapse',
  },

  initialize(options) {
    this.mergeOptions(options, ['containerTitle', 'noticeCollection', 'amendmentCollection', 'unitCollection']);

    const dispute = disputeChannel.request('get');

    this.disputeNoticeId = this.model.get('notice_id');
    this.disputeIsMigrated = dispute && dispute.isMigrated();
    this.disputeIsParticipatory = dispute && dispute.checkProcess(configChannel.request('get', 'NOTICE_HEARING_TYPE_PARTICIPATORY'));
    this.disputeIsUnitType = dispute && dispute.isUnitType();
    this.disputeIsRentIncrease = dispute && dispute.isCreatedRentIncrease();
    this.hasAssociatedAmendmentNotice = this.noticeCollection.any(this._isAmendmentAssociatedToDisputeNotice, this);

    this.collapseHandler = SessionCollapse.createHandler(dispute, 'Notice', 'noticeContainers', this.disputeNoticeId);
    this.isCollapsed = this.collapseHandler?.get();
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },

  _isAmendmentAssociatedToDisputeNotice(model) {
    const parentNoticeId = model.get('parent_notice_id');
    return parentNoticeId && parentNoticeId === this.disputeNoticeId && model.isAmendmentNotice();
  },

  _doesNoticeHaveSavedData(model) {
    /*
      Saved data is defined as a notice having:
      - any served services
      - any saved notice_delivered_to value, EXCEPT if (notice==amendment AND notice_delivery_method === 'user submitted'
    */
    return model.getServedServices().length ||
      ( this.hasAssociatedAmendmentNotice && (model.isDisputeNotice() || model.isOtherNotice()) ) ||
      (model.isAmendmentNotice() && model.isDeliveryMethodUser() ? false : model.get('notice_delivered_to'));      
  },

  _getMenuStates(model) {
    const isAmendment = model.isAmendmentNotice();
    const nounToUse = isAmendment ? 'Amendment' : 'Notice';
    const associatedHearing = hearingChannel.request('get:hearing', model.get('hearing_id'));
    const isNoticeAssociatedToInactiveHearing = associatedHearing && !associatedHearing.isActive();
    const canReplaceAndRemove = !model.isProvided() && (isAmendment ? !this.amendmentCollection.filter(a => a.get('notice_id') === model.get('notice_id')).length : !this.hasAssociatedAmendmentNotice);
    const canDownloadAll = (model.getNoticeFileModels() || []).length > 1;

    let defaultMenu = [
      { name: 'Edit Package Provision', event: 'edit' }
    ];

    if (!this.disputeIsMigrated) {
      defaultMenu = defaultMenu.concat([
        ...( isAmendment ? [{ name: 'Link Amendments', event: 'link:amendments' }] : [] ),
        ...( !isAmendment && !isNoticeAssociatedToInactiveHearing && !this.disputeIsUnitType && !this.disputeIsRentIncrease ? [{ name: 'Add Amendment', event: 'add:amendment:notice' }] : [] ),
        ...( canReplaceAndRemove ? [{ name: `Replace ${nounToUse} and Mark Deficient`, event: 'regenerate:notice' }] : [] ),
        ...( !canReplaceAndRemove || this._doesNoticeHaveSavedData(model) ? [] : [{ name: `Remove ${nounToUse} and Mark Deficient`, event: 'delete' }] ),
        ...(canDownloadAll ? [{ name: `Download All`, event: 'download:all' }] : [])
      ]);
    }

    return {
      default: defaultMenu,
      edit: [{ name: 'Save', event: 'save' },
        { name: 'Cancel', event: 'cancel' }]
    };
  },

  _getMenuTransitions() {
    return {
      edit: {
        view_mode: 'edit',
        next: 'edit',
        isEdit: true
      },
      cancel: {
        next: 'default',
        reset: true
      }
    };
  },

  _createNoticeViewWithContextContainer(noticeViewOptions, model) {
    const modelId = model.id;
    const disputeModel = disputeChannel.request('get');
    const view = ContextContainer.withContextMenuNotes(
      _.extend({
        wrappedContextContainerView: ContextContainer.withContextMenu({
          wrappedView: new DisputeNoticeView(_.extend({ model, amendmentCollection: this.amendmentCollection, unitCollection: this.unitCollection }, noticeViewOptions)),
          titleDisplay: model.getTitleDisplay(),
          menu_title: `ID ${modelId}`,
          menu_states: this._getMenuStates(model),
          menu_events: this._getMenuTransitions(),
          menu_help_fn: () => {
            const helpRulesToShow = [
              `Notice that has been provided to the applicant cannot be removed or replaced.`,
              `Notice with an associated amendment notice cannot be removed or replaced.`,
              `An amendment notice with linked amendments cannot be removed or replaced.`,
              `Notice that was migrated from legacy systems cannot be modified.`
            ];
            modalChannel.request('show:standard', {
              title: 'General Notice Rules',
              bodyHtml: `<p class="menu-help-warning-modal">The following rules affect the options available to notices:<ul>`
              + `${_.map(helpRulesToShow, rule => `<li>${rule}</li>`).join('')}`
              + `</ul></p>`,
              hideContinueButton: true,
              cancelButtonText: 'Close'
            });
          },
          disputeModel,
          collapseHandler: SessionCollapse.createHandler(disputeModel, 'Notice', 'notices', modelId),
        }),
        notes: notesChannel.request('get:notice', modelId),
        noteCreationData: {
          mode: 'edit',
          note_linked_to: configChannel.request('get', 'NOTE_LINK_NOTICE'),
          note_link_id: modelId,
          note: null
        }
      })
    );

    const refreshMenuFn = () => {
      view.wrappedContextContainerView.wrappedView.trigger('contextRender:menu', this._getMenuStates(model));
    };

    const services = model.getServices();
    this.stopListening(model, 'sync', refreshMenuFn);
    this.listenTo(model, 'sync', refreshMenuFn);

    this.stopListening(services, 'sync update subservice:save', refreshMenuFn);
    this.listenTo(services, 'sync update', refreshMenuFn);
    this.listenTo(services, 'subservice:save', () => this.model.trigger('refresh:notice:container'), this);

    return view;
  },
  

  onRender() {
    // Refresh this state on every render
    this.hasAssociatedAmendmentNotice = this.noticeCollection.any(this._isAmendmentAssociatedToDisputeNotice, this);

    if (!this.isCollapsed) {
      this.showChildView('disputeNoticeRegion', this._createNoticeViewWithContextContainer({}, this.model));
      if (this.hasAssociatedAmendmentNotice) {
        this.showChildView('amendmentNoticeRegion', new (
          Marionette.CollectionView.extend({
            template: _.noop,
            childView: ContextContainer.ContextContainerWithNotesView,        
            buildChildView: (child, ChildViewClass, childViewOptions) => {
              return this._createNoticeViewWithContextContainer(childViewOptions, child);
            }
          }))({
            collection: this.noticeCollection,
            filter: _.bind(this._isAmendmentAssociatedToDisputeNotice, this),
          })
        );
      }
    }
  },
  
  
  templateContext() {
    return {
      containerTitle: this.containerTitle,
      enableCollapse: !!this.collapseHandler,
      isCollapsed: this.isCollapsed,
    };
  }

});