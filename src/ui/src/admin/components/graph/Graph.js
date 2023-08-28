/**
 * @fileoverview - Uses chart.js to render charts/graphs based on provided data
 */
import React from 'react';
import Radio from 'backbone.radio';
import ViewMixin from '../../../core/utilities/ViewMixin';
import IconFullScreen from '../../static/Icon_Graph_FullScreen.png';
import IconDownload from '../../static/Icon_Graph_Download.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Chart from 'chart.js/auto';
import chartTrendline from 'chartjs-plugin-trendline';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AlertIcon from '../../static/Icon_Alert_SML.png';
import './Graph.scss';
import ModalGraph from './ModalGraph';

const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');

Chart.register(chartTrendline);
Chart.register(ChartDataLabels);

const Graph = ViewMixin.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['disableFullScreen', 'childViewIndex']);
    if (typeof this.childViewIndex === 'undefined' || this.childViewIndex === null) {
      this.childViewIndex = '';
    }
    this.isValid = this.model.validate();
  },

  downloadCsv() {
    filesChannel.request('download:csv', this.model.get('processedContents'), `${this.model.get('downloadFilename')}_${Moment().format('YYYY-MM-DD')}`);
  },

  openChartInModal() {
    const modalGraph = new ModalGraph({ model: this.model, });
    modalChannel.request('add', modalGraph);
  },

  createGraph() {
    if (!this.isValid) return;
    const ctx1 = this.getUI('canvas')?.[0]?.getContext('2d')
    this.chart = new Chart(
      ctx1,
      this.model.get('chartConfig')
    );
  },

  ui: {
    canvas: 'canvas',
  },

  onRender() {
    this.initializeHelp(this, this.model.get('helpHtml'));
  },

  onAttach() {
    this.createGraph();
  },

  template() {
    if (!this.isValid) {
      return (
        <div className="graph__error" key={this.childViewIndex}>
          <img src={AlertIcon} />
          &nbsp;
          <span className="graph__error__text">Error loading graph {this.childViewIndex + 1} data</span>
        </div>
      )
    }

    return (
      <div className="graph__wrapper" key={this.childViewIndex}>
        <div className="graph__button-wrapper">
          {this.model.get('helpHtml') ? <span className={`graph__help`}><div role="button" className="help-icon"></div></span> : null}
          { this.model.get('isUsingPlaceholderData') ? null : <img className="graph__chart__download" onClick={() => this.downloadCsv()} src={IconDownload} /> }
          {!this.disableFullScreen && !this.model.get('isUsingPlaceholderData') ? <img className="graph__chart__modal" onClick={() => this.openChartInModal()} src={IconFullScreen}/> : null}
        </div>
        <div className={`graph__chart-wrapper ${this.model.isTypeLine() ? 'graph__type-line' : 'graph__type-bar'}`}>
          <canvas></canvas>
        </div>
      </div>
    )
  }

});

_.extend(Graph.prototype, ViewJSXMixin);

export default Graph;