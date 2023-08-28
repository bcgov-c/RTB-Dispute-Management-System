import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Graphs from '../../components/graph/Graphs';
import GraphTables from '../../components/graph/GraphTables';
import { GraphChartCollection, GraphTableCollection } from '../../components/graph/GraphCollection';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { FormBuilder} from '../../../core/components/form-builder/FormBuilder';

const loaderChannel = Radio.channel('loader');
const reportsChannel = Radio.channel('reports');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const AdjudicatorReportsPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    //each graph takes up entire row
    this.fullWidthGraphs = new GraphChartCollection();
    //displayed inline with table graph in one row
    this.inlineGraphs = new GraphChartCollection();
    this.tableGraphs = new GraphTableCollection();
    this.isLoading = false;
    this.selectedArb = null;
    this.reports = [];
    this.loadReports();
  },

  async loadReports() {
    this.isLoading = true;
    const LANDING_REPORTS__ADJ = configChannel.request('get', 'LANDING_REPORTS__ADJ') || [];
    loaderChannel.trigger('page:load');

    this.reports = await reportsChannel.request('load').fail(err => {
      this.isLoading = false;
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('ADMIN.ADHOC_REPORTS.LOAD')(err);
    });

    // Use the first bar graph in the report, AdjGP_TB1-AdjudicatorQueues, to get parameter config data to be used for all reports
    const paramReport = this.reports.find(report => report.get('title') === LANDING_REPORTS__ADJ?.[0]?.reportTitle);
    this.createParamFormBuilder(paramReport);

    await this.loadReportContents();
  },

  async loadReportContents() {
    const LANDING_REPORTS__ADJ = configChannel.request('get', 'LANDING_REPORTS__ADJ') || [];
    const parameters = this.formBuilder.formSteps.map(step => step.toFormResponse()?.value);
    const loadedGraphs = await reportsChannel.request('load:from:config', LANDING_REPORTS__ADJ, this.reports, parameters);
    this.fullWidthGraphs.reset([], { silent: true });
    this.inlineGraphs.reset([], { silent: true });
    this.tableGraphs.reset([], { silent: true });
    loadedGraphs.forEach(graph => {
      if (graph.get('type') === configChannel.request('get', 'GRAPH_TYPE_TABLE')) {
        this.tableGraphs.push(graph);
      } else {
        if (graph.get('reportTitle') === LANDING_REPORTS__ADJ?.[1]?.reportTitle) {
          this.inlineGraphs.push(graph);
        } else {
          this.fullWidthGraphs.push(graph);
        }
      }
    });
    this.isLoading = false;
    this.render();
  },

  onRender() {
    if (this.formBuilder) {
      this.showChildView('paramFormRegion', this.formBuilder.createFormView(''));
    }

    if (this.tableGraphs?.length) {
      this.showChildView('tablesRegion', new GraphTables({ collection: this.tableGraphs }));
    }

    if (this.inlineGraphs?.length) {
      this.showChildView('inlineGraphRegion', new Graphs({ collection: this.inlineGraphs }));
    }

    if (this.fullWidthGraphs?.length) {
      this.showChildView('graphsRegion', new Graphs({ collection: this.fullWidthGraphs }));
    }

    if (!this.isLoading) loaderChannel.trigger('page:load:complete');
  },

  createParamFormBuilder(paramConfigReport) {
    try {
      if (this.formBuilder) {
        this.formBuilder.set('jsonString', paramConfigReport?.get('parameter_config'));
      } else {
        this.formBuilder = new FormBuilder({ jsonString: paramConfigReport?.get('parameter_config') });
      }

      // Auto-set the default value to be the current user - assume first form step is the arb dropdown
      // If the current user exists in the list, disable dropdown selection
      const formStep = this.formBuilder.formSteps?.[0]
      let disableUserSelection = false;
      if (formStep) {
        if (!this.selectedArb) {
          const availableArbs = formStep.dmsModel.get('optionData')?.map(opt => opt.value) || [];
          if (availableArbs.includes(String(sessionChannel.request('get:user:id')))) {
            this.selectedArb = sessionChannel.request('get:user:id');
            disableUserSelection = true;
          } else {
            this.selectedArb = availableArbs?.[0];
          }
        }
        formStep.dmsModel.set(Object.assign({
          value: this.selectedArb ? String(this.selectedArb) : null
        }, disableUserSelection ? { disabled: true, } : {}));
        
        // Refresh the page and reports on arb change
        this.listenTo(formStep.dmsModel, 'change:value', () => {
          loaderChannel.trigger('page:load');
          this.loadReportContents();
        });
      }
    } catch (err) {
      console.log(`Error parsing JSON parameter report form:\n${err}`);
    }
  },

  regions: {
    paramFormRegion: '.landing-page__adj-reports__param-form',
    tablesRegion: '.landing-page__adj-reports__table-graphs-view',
    graphsRegion: '.landing-page__adj-reports__graphs-view',
    inlineGraphRegion: '.landing-page__adj-reports__inline-graphs-view'
  },

  template() {
    return (
      <div className="landing-page__adj-reports">
        <div className="landing-page__adj-reports__param-form"></div>
        <div className="landing-page__adj-reports__wrapper">
          <div className="landing-page__adj-reports__inline-wrapper">
            <div className="landing-page__adj-reports__table-graphs-view"></div>
            <div className="landing-page__adj-reports__inline-graphs-view"></div>
          </div>
          <div className="landing-page__adj-reports__graphs-view"></div>
        </div>
      </div>
    )
  }

});

_.extend(AdjudicatorReportsPage.prototype, ViewJSXMixin);
export default AdjudicatorReportsPage;