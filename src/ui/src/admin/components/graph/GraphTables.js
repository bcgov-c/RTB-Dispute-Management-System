/**
 * @fileoverview - View that renders a table with a title and clickable help dropdown. Display, and error states are driven by the table data and class names that are passed in.
 */
import React from 'react';
import Marionette from 'backbone.marionette';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './Graph.scss';
import GraphTable from './GraphTable';

const GraphTableCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: GraphTable,
  childViewOptions(model, index) {
    return {
      childViewIndex: index,
    }
  }
});

const GraphTables = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  regions: {
    tableView: '.graph__tables',
  },

  onRender() {
    this.showChildView('tableView', new GraphTableCollectionView(this.options))
  },
  
  template() {
    return (
      <>
        <div className="graph__tables"></div>
      </>
    )
  }
});

_.extend(GraphTables.prototype, ViewJSXMixin);
export default GraphTables;

