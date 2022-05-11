
import Marionette from 'backbone.marionette';
import CeuContravention from './CeuContravention';

import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';

const ContraventionCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CeuContravention
});

const CeuContraventions = Marionette.View.extend({
  initialize(options) {
    this.options = options || {};
    this.template = this.template.bind(this);
  },

  validateAndShowErrors() {
    let is_valid = true;
    const collectionView = this.getChildView('collectionRegion');
    collectionView.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() & is_valid;
    });
    return is_valid;
  },

  saveInternalDataToModel(options={}) {
    const returnData = [];
    const collectionView = this.getChildView('collectionRegion');
    collectionView.children.each(function(childView) {
      if (typeof childView.saveInternalDataToModel === "function") {
        const saveData = childView.saveInternalDataToModel(options);
        if (options.returnOnly) returnData.push(saveData);
      }
    });
    return returnData;
  },

  regions: {
    collectionRegion: '.claim-information-collection-view'
  },

  getChildren() {
    return this.getChildView('collectionRegion')?.children || [];
  },

  onRender() {
    this.showChildView('collectionRegion', new ContraventionCollectionView(this.options));
  },

  template() {
    return <div className="claim-information-collection-view"></div>;
  },
});

_.extend(CeuContraventions.prototype, ViewJSXMixin);
export default CeuContraventions;
