import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Graphs from '../../components/graph/Graphs';
import { GraphChartCollection } from '../../components/graph/GraphCollection';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { FormBuilder} from '../../../core/components/form-builder/FormBuilder';

const loaderChannel = Radio.channel('loader');
const reportsChannel = Radio.channel('reports');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const ArbReportsPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.graphs = new GraphChartCollection();
    this.isLoading = false;
    this.selectedArb = null;
    this.reports = [];
    this.loadReports();
  },

  async loadReports() {
    this.isLoading = true;
    const LANDING_REPORTS__ARB = configChannel.request('get', 'LANDING_REPORTS__ARB') || [];
    loaderChannel.trigger('page:load');

    this.reports = await reportsChannel.request('load').fail(err => {
      this.isLoading = false;
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('ADMIN.ADHOC_REPORTS.LOAD')(err);
    });

    // Use the first bar graph in the report, L2AGP_BG1-HearingsPerDayWorked, to get parameter config data to be used for all reports
    const paramReport = this.reports.find(report => report.get('title') === LANDING_REPORTS__ARB?.[0]?.reportTitle);
    this.createParamFormBuilder(paramReport);

    await this.loadReportContents();
  },

  async loadReportContents() {
    const LANDING_REPORTS__ARB = configChannel.request('get', 'LANDING_REPORTS__ARB') || [];
    const parameters = this.formBuilder.formSteps.map(step => step.toFormResponse()?.value);
    const loadedGraphs = await reportsChannel.request('load:from:config', LANDING_REPORTS__ARB, this.reports, parameters);
    this.graphs.reset([], { silent: true });
    LANDING_REPORTS__ARB.forEach(graphConfig => {
      const graph = loadedGraphs.find(graph => graph?.get('reportTitle') === graphConfig?.reportTitle);
      this.graphs.push(graph);
    })

    this.isLoading = false;
    this.render();
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

  onRender() {
    if (this.formBuilder) {
      this.showChildView('paramFormRegion', this.formBuilder.createFormView(''));
    }

    if (this.graphs?.length) {
      this.showChildView('graphsRegion', new Graphs({ collection: this.graphs }));
    }

    if (!this.isLoading) loaderChannel.trigger('page:load:complete');
  },

  regions: {
    paramFormRegion: '.landing-page__arb-reports__param-form',
    graphsRegion: '.landing-page__arb-reports__graphs-view'
  },

  template() {
    return (
      <div className="landing-page__arb-reports">
        <div className="landing-page__arb-reports__param-form"></div>
        <div className="landing-page__arb-reports__wrapper">
          <div className="landing-page__arb-reports__graphs-view"></div>
        </div>
      </div>
    )
  }

});
  _.extend(ArbReportsPage.prototype, ViewJSXMixin);
export default ArbReportsPage;