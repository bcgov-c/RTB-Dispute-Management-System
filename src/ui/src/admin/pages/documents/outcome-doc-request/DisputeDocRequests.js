import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import ContextContainer from '../../../../admin/components/context-container/ContextContainer';
import DisputeDocRequestView from './DisputeDocRequest';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import './doc-request.css';
import SessionCollapse from '../../../components/session-settings/SessionCollapseHandler';

const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const EmptyDisputeDocRequestView = Marionette.View.extend({
  template: _.template(`No outcome document requests have been added`),
  className: 'standard-list-empty'
});

const DisputeDocRequestCollection = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerView,
  emptyView: EmptyDisputeDocRequestView,

  _getMenuStates(child) {
    const uploadedFiles = child.getAllUploadedFiles();
    const fileCountDisplay = `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`;
    const totalFileSizeDisplay = Formatter.toFileSizeDisplay(_.reduce(uploadedFiles, function(memo, file) { return memo + file.get('file_size'); }, 0));

    return {
      default: [
        { name: 'Edit', event: 'edit' },
        ...(uploadedFiles.length ? [{ name: `Download All (${fileCountDisplay}, ${totalFileSizeDisplay})`, event: 'download:all' }] : [])
      ],
      edit: [
        { name: 'Save', event: 'save' },
        { name: 'Cancel', event: 'cancel' },
        { name: 'Auto-fill granted and completed', event: 'mark:granted' },
        { name: 'Auto-fill dismissed and completed', event: 'mark:dismissed' },
        { name: 'Auto-fill cancelled and completed', event: 'mark:cancelled' }
      ],
    };
  },

  _getMenuTransitions() {
    return {
      'edit': {
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

  buildChildView(child, ChildViewClass, childViewOptions) {
    const options = _.extend({model: child}, childViewOptions);
    
    if (ChildViewClass === EmptyDisputeDocRequestView) {
      return new ChildViewClass(childViewOptions);
    }

    const disputeModel = disputeChannel.request('get');
    // Create the child view instance
    const view = ContextContainer.withContextMenu({
      wrappedView: new DisputeDocRequestView(options),
      titleDisplay: child.getTitleDisplay(),
      menu_title: `ID ${child.id}`,
      menu_states: this._getMenuStates(child),
      menu_events: this._getMenuTransitions(),
      contextRender: () => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      },
      disputeModel,
      collapseHandler: SessionCollapse.createHandler(disputeModel, 'Documents', 'outcomeDocRequests', child.id),
    });

    const refreshMenuFn = () => {
      view.wrappedView.trigger('contextRender:menu', this._getMenuStates(child));
    };

    this.stopListening(child, 'sync update contextRender:menu', refreshMenuFn);
    this.listenTo(child, 'sync update contextRender:menu', refreshMenuFn);

    return view;
  },

  /**
   * @param {Backbone.Collection} collection - The collection of doc requests
   * @param {Boolean} showThumbnails - True if thumbails should be shown
   */
  initialize(options) {
    this.mergeOptions(options, ['collection', 'showThumbnails']);
    this.listenTo(this.collection, 'update', this.render, this);
  },

  childViewOptions(model, index) {
    return {
      childIndex: index+1,
      showThumbnails: this.showThumbnails
    };
  }
});

const DisputeDocRequests = Marionette.View.extend({
  /**
   * @param {Backbone.Model} disputeModel - Main DisputeModel for loaded page.  Required for showThumbnails logic
   * @param {Backbone.Collection} collection - The collection of doc requests
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['disputeModel', 'collection']);

    this.collapseHandler = SessionCollapse.createHandler(this.disputeModel, 'Documents', 'OutcomeDocRequests');
    this.isCollapsed = this.collapseHandler?.get();
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.showThumbnailsModel = new CheckboxModel({
      html: 'Thumbnails',
      checked: this.disputeModel.get('sessionSettings')?.thumbnailsEnabled
    });
  },

  setupListeners() {
    this.listenTo(this.showThumbnailsModel, 'change:checked', (checkboxModel, value) => {
      this.disputeModel.checkEditInProgressPromise().then(
        () => {
          this.disputeModel.set({ sessionSettings: { ...this.disputeModel.get('sessionSettings'), thumbnailsEnabled: value } });
          setTimeout(() => loaderChannel.trigger('page:load'), 1);
          setTimeout(() => this.render(), 50);
          setTimeout(() => loaderChannel.trigger('page:load:complete'), 100);
        },
        // Cancel the selection
        () => {
          checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
          checkboxModel.trigger('render');
          this.disputeModel.showEditInProgressModalPromise()
        }
      );
    });
  },

  clickCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseHandler.update(this.isCollapsed);
    this.render();
  },

  onRender() {
    this.showChildView('showThumbnailsRegion', new CheckboxView({ model: this.showThumbnailsModel }));
    
    if (!this.isCollapsed) {
      this.showChildView('docRequestsRegion', new DisputeDocRequestCollection({
        collection: this.collection,
        showThumbnails: !!this.showThumbnailsModel.getData()
      }));
    }
  },  

  regions: {
    showThumbnailsRegion: '.admin-banner__thumbnails',
    docRequestsRegion: '.doc-requests'
  },

  template() {
    const enableCollapse = !!this.collapseHandler;
    return (
      <div className={this.showThumbnailsModel.getData() ? 'thumbnails' : ''}>
        <div className="admin-banner">
          <div className="admin-banner__title">Outcome Documents Requests</div>
          <div className="admin-banner__options">
            <div className="admin-banner__thumbnails"></div>
            {enableCollapse ? 
              <span className={`dispute-section-title-add collapse-icon ${this.isCollapsed ? 'collapsed' : '' }`}
                onClick={() => this.clickCollapse()}
              ></span>
            : null}
          </div>
        </div>
        <div className="doc-requests"></div>
      </div>
    );
  },
});

_.extend(DisputeDocRequests.prototype, ViewJSXMixin);
export default DisputeDocRequests;
