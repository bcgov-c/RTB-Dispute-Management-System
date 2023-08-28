import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Graphs from '../../components/graph/Graphs';
import GraphTables from '../../components/graph/GraphTables';
import { GraphCollection,GraphChartCollection, GraphTableCollection } from '../../components/graph/GraphCollection';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { FormBuilder} from '../../../core/components/form-builder/FormBuilder';

const loaderChannel = Radio.channel('loader');
const reportsChannel = Radio.channel('reports');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

/**TODO: Look at general layout refactoring for reports. Main issue is needing to split graph and tables into seperate collections/views */
const SECTION_ONE_TABLE_TITLES = ["IOGP_TB1-6MonthIntakeProcessing"];
const SECTION_ONE_GRAPH_TITLES = ["IOGP_TG1-6MonthIntakeProcessingTrend"];
const SECTION_TWO_GRAPH_TITLES = ["IOGP_BG2a-6MonthComparitiveBySource","IOGP_BG2b-6MonthComparitiveByUrgency","IOGP_BG2c-6MonthComparitiveByHearingLinking","IOGP_BG3-6MonthComparitiveProcessTime45m",
"IOGP_TG3-6MonthComparitiveProcessTrend45m","IOGP_BG4-6MonthComparativeProcessOutcome","IOGP_TG4-6MonthProcessOutcomeTrend","IOGP_BG5-6MonthComparativeProcessOverUnder45m","IOGP_TG5-6MonthOverUnder45mProcessTrend"];
const SECTION_TWO_TABLE_TITLES = ["IOGP_TB6-6MonthCompleteTaskCounts","IOGP_TB9-2MonthNotesCounts"];
const SECTION_THREE_GRAPH_TITLES = ["IOGP_TG6-6MonthCompleteTaskTrend"];
const SECTION_FOUR_GRAPH_TITLES = ["IOGP_BG7-6MonthComparativeTaskTimes","IOGP_BG8-6MonthOverUnder2hTaskTrend","IOGP_BG9-2MonthComparitiveNotesPerWeekDay"];

const IOReportsPage = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.tablesSectionOne = new GraphTableCollection();
    this.graphsSectioOne = new GraphCollection();
    this.tablesSectionTwo = new GraphTableCollection();
    this.graphsSectionTwo = new GraphCollection();
    this.graphsSectionThree = new GraphCollection();
    this.graphsSectionFour = new GraphCollection();

    this.isLoading = false;
    this.selectedArb = null;
    this.reports = [];
    this.loadReports();
  },

  async loadReports() {
    this.isLoading = true;
    const LANDING_REPORTS__IO = configChannel.request('get', 'LANDING_REPORTS__IO') || [];
    loaderChannel.trigger('page:load');

    this.reports = await reportsChannel.request('load').fail(err => {
      this.isLoading = false;
      loaderChannel.trigger('page:load:complete');
      generalErrorFactory.createHandler('ADMIN.ADHOC_REPORTS.LOAD')(err);
    });

    // Use the first bar graph in the report, L2AGP_BG1-HearingsPerDayWorked, to get parameter config data to be used for all reports
    const paramReport = this.reports.find(report => report.get('title') === LANDING_REPORTS__IO?.[0]?.reportTitle);
    this.createParamFormBuilder(paramReport);

    await this.loadReportContents();
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

  async loadReportContents() {
    const LANDING_REPORTS__IO = configChannel.request('get', 'LANDING_REPORTS__IO') || [];
    const parameters = this.formBuilder.formSteps.map(step => step.toFormResponse()?.value);
    const loadedGraphs = await reportsChannel.request('load:from:config', LANDING_REPORTS__IO, this.reports, parameters);
    this.tablesSectionOne.reset([], { silent: true });
    this.graphsSectioOne.reset([], { silent: true });
    this.tablesSectionTwo.reset([], { silent: true });
    this.graphsSectionTwo.reset([], { silent: true });
    this.graphsSectionThree.reset([], { silent: true });
    this.graphsSectionFour.reset([], { silent: true });
    LANDING_REPORTS__IO.forEach(graphConfig => {
      const graph = loadedGraphs.find(graph => graph?.get('reportTitle') === graphConfig?.reportTitle);
      if (SECTION_ONE_TABLE_TITLES.includes(graph?.get('reportTitle'))) this.tablesSectionOne.push(graph);
      else if (SECTION_ONE_GRAPH_TITLES.includes(graph?.get('reportTitle'))) this.graphsSectioOne.push(graph);
      else if (SECTION_TWO_TABLE_TITLES.includes(graph?.get('reportTitle'))) this.tablesSectionTwo.push(graph);
      else if (SECTION_TWO_GRAPH_TITLES.includes(graph?.get('reportTitle'))) this.graphsSectionTwo.push(graph);
      else if (SECTION_THREE_GRAPH_TITLES.includes(graph?.get('reportTitle'))) this.graphsSectionThree.push(graph);
      else if (SECTION_FOUR_GRAPH_TITLES.includes(graph?.get('reportTitle'))) this.graphsSectionFour.push(graph);
    });
    this.isLoading = false;
    this.render();
  },

  regions: {
    paramFormRegion: '.landing-page__io-reports__param-form',
    tablesSectionOneRegion: '.landing-page__io-reports__table-section-one',
    graphsSectionOneRegion: '.landing-page__io-reports__graphs-section-one',
    tablesSectionTwoRegion: '.landing-page__io-reports__table-section-two',
    graphsSectionTwoRegion: '.landing-page__io-reports__graphs-section-two',
    graphsSectionThreeRegion: '.landing-page__io-reports__graphs-section-three',
    graphsSectionFourRegion: '.landing-page__io-reports__graphs-section-four'
  },

  onRender() {
    if (this.formBuilder) {
      this.showChildView('paramFormRegion', this.formBuilder.createFormView(''));
    }

    if (this.tablesSectionOne?.length) {
      this.showChildView('tablesSectionOneRegion', new GraphTables({ collection: this.tablesSectionOne }));
    }
    if (this.graphsSectioOne?.length) {
      this.showChildView('graphsSectionOneRegion', new Graphs({ collection: this.graphsSectioOne }));
    }
    if (this.tablesSectionTwo?.length) {
      this.showChildView('tablesSectionTwoRegion', new GraphTables({ collection: this.tablesSectionTwo }));
    }
    if (this.graphsSectionTwo?.length) {
      this.showChildView('graphsSectionTwoRegion', new Graphs({ collection: this.graphsSectionTwo }));
    }
    if (this.graphsSectionThree?.length) {
      this.showChildView('graphsSectionThreeRegion', new Graphs({ collection: this.graphsSectionThree }));
    }

    if (this.graphsSectionFour?.length) {
      this.showChildView('graphsSectionFourRegion', new Graphs({ collection: this.graphsSectionFour }));
    }

    if (!this.isLoading) loaderChannel.trigger('page:load:complete');
  },

  template() {
    return (
      <div className="landing-page__io-reports">
      <div className="landing-page__io-reports__param-form"></div>
      <div className="landing-page__io-reports__wrapper">
        <div className="landing-page__adj-reports__inline-wrapper">
          <div className="landing-page__io-reports__table-section-one"></div>
          <div className="landing-page__io-reports__graphs-section-one"></div>
        </div>
        <div className="landing-page__io-reports__graphs-section-two"></div>
        <div className="landing-page__adj-reports__inline-wrapper">
          <div className="landing-page__io-reports__table-section-two"></div>
          <div className="landing-page__io-reports__graphs-section-three"></div>
        </div>
        <div className="landing-page__io-reports__graphs-section-four"></div>
      </div>
    </div>
    )
  },
});

_.extend(IOReportsPage.prototype, ViewJSXMixin);
export default IOReportsPage;