/**
 * @fileoverview - Displays a graph in a modal. Contains ability to download file.
 */
import React from 'react';
import ViewMixin from '../../../core/utilities/ViewMixin';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './Graph.scss';
import Graph from './Graph';

const ModalGraph = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.once('shown:modal', () => this.render());

    this.model.set('maintainAspectRatio', true);
    this.model.processAndSetReportData();
  },

  onRender() {
    ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'));
  },

  regions: {
    graphRegion: '.modal-graph__graph'
  },

  onRender() {
    this.showChildView('graphRegion', new Graph({
      model: this.model,
      disableFullScreen: true,
    }));
  },

  template() {
    return (
      <div className="modal-dialog modal-graph">
      <div className="modal-content clearfix">
        <div className="modal-header">
          <h4 className="modal-title">__</h4>
          <div className="modal-close-icon-lg close-x"></div>
        </div>
        <div className="modal-body clearfix">
          <div className="modal-graph__container">
            <div className="modal-graph__wrapper">
              <div className="modal-graph__graph"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }
});

_.extend(ModalGraph.prototype, ViewJSXMixin);
export default ModalGraph;