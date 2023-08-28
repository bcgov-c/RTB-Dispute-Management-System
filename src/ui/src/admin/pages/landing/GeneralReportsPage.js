import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import GraphTables from '../../components/graph/GraphTables';
import Graphs from '../../components/graph/Graphs';
import { GraphChartCollection, GraphTableCollection } from '../../components/graph/GraphCollection';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const reportsChannel = Radio.channel('reports');

const GeneralReportsPage = Marionette.View.extend({

  regions: {
    tablesRegion: '.landing-page__tables',
    chartsRegion: '.landing-page__charts'
  },

  initialize() {
    this.template = this.template.bind(this);
    this.isLoading = false;
    this.lineGraphs = new GraphChartCollection();
    this.tableGraphs = new GraphTableCollection();
    this.loadReports();
  },

  async loadReports() {
    this.isLoading = true;
    loaderChannel.trigger('page:load');

    // Load all reports metadata
    const reports = await reportsChannel.request('load')
      .fail(err => {
        this.isLoading = false;
        loaderChannel.trigger('page:load:complete');
        generalErrorFactory.createHandler('ADMIN.ADHOC_REPORTS.LOAD')(err);
      });

    const loadedGraphs = await reportsChannel.request('load:from:config', configChannel.request('get', 'LANDING_REPORTS__GENERAL'), reports);
    loadedGraphs.forEach(graph => {
      if (graph.isTypeTable()) {
        this.tableGraphs.push(graph);
      } else {
        this.lineGraphs.push(graph);
      }
    });
    
    this.isLoading = false;
    this.render();
  },

  onRender() {
    if (this.tableGraphs?.length) {
      this.showChildView('tablesRegion', new GraphTables({ collection: this.tableGraphs }));
    }

    if (this.lineGraphs?.length) {
      this.showChildView('chartsRegion', new Graphs({ collection: this.lineGraphs }));
    }

    if (!this.isLoading) loaderChannel.trigger('page:load:complete');
  },

  template() {
    return (
      <div className="landing-page__performance-view">
        <div className="landing-page__tables">
        </div>
        <div className="landing-page__charts-view">
          <div className="landing-page__charts"></div>
        </div>
      </div>
    );
  },
});

_.extend(GeneralReportsPage.prototype, ViewJSXMixin);
export default GeneralReportsPage;