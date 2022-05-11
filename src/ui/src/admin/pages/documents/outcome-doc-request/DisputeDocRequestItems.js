import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import DisputeDocRequestItemView from './DisputeDocRequestItem';

const EmptyDisputeDocRequestItemView = Marionette.View.extend({
  template: _.template(`No outcome document request items have been added`),
  className: 'standard-list-empty'
});

const DisputeDocRequestItemCollection = Marionette.CollectionView.extend({
  template: _.noop,
  childView: DisputeDocRequestItemView,
  emptyView: EmptyDisputeDocRequestItemView,

  initialize(options) {
    this.mergeOptions(options, ['statusRequiredInitialVal', 'showThumbnails', 'isDisabledOnLoad']);
    this.listenTo(this.collection, 'update', this.render, this);
  },

  childViewOptions(model, index) {
    return {
      childIndex: index+1,
      statusRequiredInitialVal: this.statusRequiredInitialVal,
      showThumbnails: this.showThumbnails,
      isDisabledOnLoad: this.isDisabledOnLoad
    };
  }
});


const DisputeDocRequestItems = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.options = options;
  },

  getListViews() {
    const view = this.getChildView('docRequestItemsRegion');
    if (!(view && view.isRendered() && !view.isEmpty())) return [];
    return view.children || [];
  },

  validateAndShowErrors() {
    const listViews = this.getListViews();
    const isValid = listViews.reduce((memo, child) => child.validateAndShowErrors() && memo, true);
    return isValid;
  },
  
  toEditable() {
    const listViews = this.getListViews();
    listViews.forEach(child => child.toEditable());    
  },

  saveInternalDataToModel() {
    const listViews = this.getListViews();
    listViews.forEach(child => child.saveInternalDataToModel());
  },

  onRender() {
    this.showChildView('docRequestItemsRegion', new DisputeDocRequestItemCollection(this.options));
  },

  regions: {
    docRequestItemsRegion: '.doc-request-items'
  },

  template() {
    return (
      <>
        <div className="doc-request-items"></div>
      </>
    );
  },
});

_.extend(DisputeDocRequestItems.prototype, ViewJSXMixin);
export default DisputeDocRequestItems;