/**
 * @fileoverview - Views that displays multiple Graph views
 */
import React from 'react';
import Marionette from 'backbone.marionette';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Graph from './Graph';
import './Graph.scss';

const GraphCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: Graph,
  childViewOptions(model, index) {
    return {
      childViewIndex: index,
      className: `graph__item ${model.isTypeLine() ? 'graph__item--line' : 'graph__item--bar'}`
    }
  }
});

const GraphsView = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  regions: {
    graphsRegion: '.graph__graphs',
  },

  onRender() {
    this.showChildView('graphsRegion', new GraphCollectionView(this.options))
  },
  
  template() {
    return (
      <>
        <div className="graph__graphs"></div>
      </>
    )
  }
});

_.extend(GraphsView.prototype, ViewJSXMixin);
export default GraphsView;