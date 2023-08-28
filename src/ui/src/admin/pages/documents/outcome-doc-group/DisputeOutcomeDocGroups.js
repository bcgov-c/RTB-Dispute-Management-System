import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../../components/context-container/ContextContainer';
import DisputeOutcomeDocGroupView from './DisputeOutcomeDocGroup';
import OutcomeDocGroupModel from '../../../../core/components/documents/OutcomeDocGroup_model';
import ModalAddOutcomeFile from '../outcome-doc-file/modals/ModalAddOutcomeFile';
import PrimaryOutcomeDocGroupsView from './PrimaryOutcomeDocGroups';
import OutcomeDocGroupCollection from '../../../../core/components/documents/OutcomeDocGroup_collection';
import template from './DisputeOutcomeDocGroups_template.tpl';
import SessionCollapse from '../../../components/session-settings/SessionCollapseHandler';

let UAT_TOGGLING = {};

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const EmptyOutcomeDocGroupView = Marionette.View.extend({
  template: _.template(`No outcome documents have been added`),
  className: 'standard-list-empty'
});

const OutcomeDocGroupsView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerView,
  emptyView: EmptyOutcomeDocGroupView,

  _getMenuStates(child) {
    const dispute = disputeChannel.request('get');
    const hasFinalDocsWithNoUploads = child.getOutcomeFiles().find(outcomeFile => !outcomeFile.hasUploadedFile()) ? true : false;
    const canBeDeleted = child.canBeDeleted();

    return {
      default: child.isActive()? [
        ...(dispute && dispute.isMigrated() ? [] : [{ name: 'Manage Delivery', event: 'edit:delivery' }]),
        { name: 'Edit Documents', event: 'edit:documents' },
        ...(canBeDeleted ? [{ name: 'Delete', event: 'delete' }] : []),
      ] :
      child.isCompleted() ? 
        [
          { name: 'Indicate Sent Documents', event: 'edit:sent' },
          { name: 'Re-Open to Modify Documents and Deliveries', event: 'set:active' },
          ...(canBeDeleted ? [{ name: 'Delete', event: 'delete' }] : []),
        ] : [
          ...(canBeDeleted ? [{ name: 'Delete', event: 'delete' }] : []),
      ],
      edit_documents: [
        { name: 'Save', event: 'save:documents' },
        { name: 'Cancel', event: 'cancel' },
        { name: 'Add Document', event: 'add:doc:file' },
        ...(hasFinalDocsWithNoUploads ? [{ name: 'Bulk Upload Documents', event: 'bulk:upload:documents' }] : []),
      ],
      edit_delivery: [
        { name: 'Save', event: 'save:delivery' },
        { name: 'Cancel', event: 'cancel' },
      ],
    };
  },

  _getMenuTransitions() {
    return {
      'edit:documents': {
        view_mode: 'documents-edit',
        next: 'edit_documents',
        isEdit: true
      },
      'edit:delivery': {
        view_mode: 'delivery-edit',
        next: 'edit_delivery',
        isEdit: true
      },
      'edit:sent': {
        view_mode: 'delivery-edit delivery-sent-edit',
        next: 'edit_delivery',
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
    
    if (ChildViewClass === EmptyOutcomeDocGroupView) {
      return new ChildViewClass(childViewOptions);
    }

    const indexDisplay = Formatter.toLeftPad((child.collection.length+1) - childViewOptions.childIndex, '0', 2);
    const activeDisplay = child.isActive() ? 'In Progress / Not Completed' : 'Completed / Ready to Deliver';
    const disputeModel = disputeChannel.request('get')
    // Create the child view instance
    const view = ContextContainer.withContextMenu({
      wrappedView: new DisputeOutcomeDocGroupView(options),
      titleDisplay: `${child.getGroupTitle() || 'Document Set'} ${indexDisplay} (${activeDisplay})`,
      menu_title: `ID ${child.id}`,
      menu_states: this._getMenuStates(child),
      menu_events: this._getMenuTransitions(),
      contextRender: (view, subView, options={}) => {
        this.render();
        if (view.model && options.deliveryEdit) view.model.trigger('render:deliveryEdit', subView?.getSelectedDocumentEditData());
        loaderChannel.trigger('page:load:complete');
      },
      disputeModel,
      collapseHandler: SessionCollapse.createHandler(disputeModel, 'Documents', 'outcomeDocGroups', child.id),
    });

    const refreshMenuFn = () => {
      view.wrappedView.trigger('contextRender:menu', this._getMenuStates(child));
    };

    this.stopListening(child, 'sync update contextRender:menu', refreshMenuFn);
    this.listenTo(child, 'sync update contextRender:menu', refreshMenuFn);

    return view;
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.listenTo(this.collection, 'update', this.render, this);
  },

  childViewOptions(model, index) {
    return {
      childIndex: index+1
    };
  }
});


export default Marionette.View.extend({
  template,

  ui: {
    add: '.outcome-documents-add-icon',
    collapse: '.dispute-section-title-add.collapse-icon',
  },

  regions: {
    primaryDocGroupsRegion: '.dispute-outcome-doc__primary',
    outcomeDocsRegion: '.outcome-documents-container',
  },

  events: {
    'click @ui.add': 'clickAdd',
    'click @ui.collapse': 'clickCollapse',
  },

  /**
   * 
   * @param {Array|OutcomeDocGroupModel} options.primaryOutcomeDocGroupModels -
   * @param {Object} options.primaryFileModelLookup - 
   */
  initialize(options) {
    this.mergeOptions(options, ['primaryOutcomeDocGroupModels', 'primaryFileModelLookup']);
    _.extend(this.options, {}, options);
    this.collapseHandler = SessionCollapse.createHandler(disputeChannel.request('get'), 'Documents', 'OutcomeDocGroups');
    this.isCollapsed = this.collapseHandler?.get();
  },

  clickAdd() {
    const addDocSetFn = () => {
      const modalAddOutcomeDocGroup = new ModalAddOutcomeFile({
        fullSave: true,
        model: new OutcomeDocGroupModel({
          doc_group_type: configChannel.request('get', 'OUTCOME_DOC_GROUP_TYPE_CUSTOM'),
          doc_status: configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_ACTIVE')
        })
      });
      this.stopListening(modalAddOutcomeDocGroup);
      this.listenTo(modalAddOutcomeDocGroup, 'save:complete', function(outcome_doc_group_model) {
        modalChannel.request('remove', modalAddOutcomeDocGroup);
        this.collection.add(outcome_doc_group_model);
        loaderChannel.trigger('page:load:complete');
      }, this);
      loaderChannel.trigger('page:load:complete');
      modalChannel.request('add', modalAddOutcomeDocGroup);
    };

    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.checkEditInProgressPromise().then(
        addDocSetFn,
        () => dispute.showEditInProgressModalPromise()
      );
    } else {
      addDocSetFn();
    }
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },

  onRender() {
    if (this.isCollapsed) return;
    if (this.primaryOutcomeDocGroupModels && this.primaryOutcomeDocGroupModels.length) {
      this.showChildView('primaryDocGroupsRegion', new PrimaryOutcomeDocGroupsView({
        collection: new OutcomeDocGroupCollection(this.primaryOutcomeDocGroupModels || []),
        fileModelLookup: this.primaryFileModelLookup || {},
      }));
    }
    this.showChildView('outcomeDocsRegion', new OutcomeDocGroupsView(this.options));
  },

  templateContext() {
    return {
      enableCollapse: !!this.collapseHandler,
      isCollapsed: this.isCollapsed,
    }
  },
});
