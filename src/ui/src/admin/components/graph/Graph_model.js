import Backbone from 'backbone';
import Radio from 'backbone.radio';
import 'jquery-csv';

const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const reportsChannel = Radio.channel('reports');

const Graph_model = Backbone.Model.extend({
  defaults: {
    // Graphs must be associated to a reportModel
    // Note that a report title is often used to find and load the report, however the actual report title will be retrieved from the reportModel
    reportModel: null,
    reportContents: null,

    // A parsed field that is auto-set and managed by the model based on the provided reportContents
    // Likely a 2d array representing the csv report contents
    processedContents: null,

    // Type of graph, different GraphModels are available for different use cases
    type: null,

    // Root name to be used when downloading the graph contents
    downloadFilename: null,

    // Title to use for the graph
    title: null,

    
    // Validation fields
    expectedColumns: null,
    expectedRows: null,
    columnsToDisplay: null,
    isUsingPlaceholderData: false,
    
    // TODO: Add these into a custom/specific overwrite object?
    // TODO2: Move some of these defaults out of graph model and into line/bar/table etc specifically??
    showLegend: true,
    graphColors: null,
    displayLabel: null,
    displayTrendlineForLabelName: null,
    maintainAspectRatio: true,
  },

  initialize() {
    // Automatically process any passed-in reportContents string
    if (!this.get('processedContents') && this.get('reportContents')) {
      this.processAndSetReportData();
    }
    this.on('change:reportContents', () => this.processAndSetReportData());
  },

  processAndSetReportData() {
    const processedContents = this.cleanupDataStr(this.get('reportContents'));
    this.set('processedContents', processedContents);
  },

  validate() {
    return !!this.get('processedContents');
  },
  
  // TODO: Should this be done with model detection?
  isTypeTable() {
    return this.get('type') === configChannel.request('get', 'GRAPH_TYPE_TABLE');
  },

  isTypeLine() {
    return this.get('type') === configChannel.request('get', 'GRAPH_TYPE_LINE');
  },

  cleanupDataStr(dataToClean='') {
    if (!dataToClean?.length) return [];
    // Parse csv into 2d array, remove empty rows

    let reportDataArray = $.csv.toArrays(dataToClean).filter(data => data.length);

    if (this.get('swapColumnsForRows')) {
      reportDataArray = reportDataArray?.length ? Object.keys(reportDataArray[0]).map((c) => reportDataArray.map(function(r) { return r[c]; })) : [];
    }

    return reportDataArray
  }
});

const GraphChart_model = Graph_model.extend({
  defaults() {
    return Object.assign({}, Graph_model.defaults, {
      chartConfig: null,
    });
  },

  processAndSetReportData() {
    Graph_model.prototype.processAndSetReportData.call(this);
    this.set('chartConfig', this.createChartConfig());
  },

  cleanupDataStr(dataToClean='') {
    dataToClean = Graph_model.prototype.cleanupDataStr.call(this, dataToClean);
    // Any empty non label data is replaced with '0' in charts
    dataToClean = dataToClean.map((data, index) => data.map((data, index2) => data.length || index === 0 || index2 === 0 ? data : '0'));
    return dataToClean;
  },

  filterGraphData() {
    let filterData = this.get('processedContents');
    
    if (this.get('columnsToDisplay')?.length) {
      filterData = filterData.map(arr => arr.filter((column, index) => this.get('columnsToDisplay').includes(index)));
    }

    if (this.get('rowsToDisplay')?.length) {
      filterData = filterData.filter((arr, index) => this.get('rowsToDisplay').includes(index));
    }

    return filterData;
  },

  setPlaceholderData() {
    const placeholderData = this.get('placeholderReport');
    if (!placeholderData) return;
    this.set({reportContents: placeholderData, isUsingPlaceholderData: true });
  },

  createChartConfig() {
    let graphError = false;
    if (!this.get('processedContents')?.length) {
      graphError = true
      this.setPlaceholderData();
    }

    let graphData = this.filterGraphData();
    let labels = graphData.filter((data, index) => index !== 0).map(data => data[0]);

    if (
      !labels || //no labels = don't create chart
      graphData.some(chart => chart.length !== graphData[0].length) ||//must have uniform column lengths
      graphData.length < 3 || graphData[0].length < 2 || //must have at least 2 or more data points
      graphData.some(data => Number(data[0]) || !data[0]) || graphData[0].some(data => Number(data) || !data)
    ) {
      graphError = true;
      this.setPlaceholderData();
      graphData = this.filterGraphData();
      labels = graphData.filter((data, index) => index !== 0).map(data => data[0]);
    }

    const colorsArray = this.get('graphColors');
    const filteredData =_.zip(...graphData.filter((data, index) => index !== 0).map(data => data.filter((data, index) => index !== 0)).filter(data => data.length))
    const filteredDataLabels = graphData.filter((data, index) => index === 0).map(data => data.filter((data, index) => index !== 0)).flat();
    const isSimpleBarGraph = filteredData?.length <= 1 && this.get('type') === configChannel.request('get', 'GRAPH_TYPE_BAR');
    const datasets = filteredData.map((data, index) => ({
      label: filteredDataLabels[index],
      data,
      borderColor: isSimpleBarGraph && colorsArray ? colorsArray : 
      colorsArray ? colorsArray[index] : [],
      backgroundColor: isSimpleBarGraph && colorsArray ? colorsArray : 
      colorsArray ? colorsArray[index] : [],
      ...(this.get('displayTrendlineForLabelName')?.includes(filteredDataLabels[index]) && { trendlineLinear: {
        colorMin: colorsArray[index],
        colorMax: colorsArray[index],
        lineStyle: "dotted",
        width: 2,
        projection: false
      } }),
    }))

    const data = { labels, datasets };
    return {
      type: this.get('type') || configChannel.request('get', 'GRAPH_TYPE_LINE'),
      data: data,
      options: {
        scales: {
          y: {
              min: 0,
          }
        },
        barPercentage: 0.3,
        responsive: true,
        maintainAspectRatio: this.get('maintainAspectRatio'),
        plugins: {
          datalabels: {
            align: "top",
            display: this.get('displayLabel') || false,
            anchor: this.get('type') === configChannel.request('get', 'GRAPH_TYPE_LINE') ? 'center' : 'end',
          },
          title: {
            display: true,
            text: this.get('title') || '',
            font: {
              size: 13
            },
          },
          subtitle: {
            display: true,
            text: graphError ? 'Data not available' : Formatter.toDateAndTimeDisplay(Moment()),
            color: graphError ? '#d80000' : '#666',
            padding: {
              top: 0,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom',
            display: this.get('showLegend')
          },
        },
      },
    };
  },

  validate() {
    const isValid = Graph_model.prototype.validate.call(this);
    return isValid && !!this.get('chartConfig');
  },
});

const GraphTable_model = Graph_model.extend({
  defaults() {
    return Object.assign({}, Graph_model.prototype.defaults, {
      type: 'table'
    });
  },

  cleanupDataStr(dataToClean='') {
    dataToClean = Graph_model.prototype.cleanupDataStr.call(this, dataToClean);
    // Any empty non label data in tables is replaced with '-'
    dataToClean = dataToClean.map((data, index) => data.map((data, index2) => data.length || index === 0 || index2 === 0 ? data : '-'));
    return dataToClean;
  },

  validate() {
    const isValid = Graph_model.prototype.validate.call(this);
    const data = this.get('processedContents');
    return isValid && (
      // Cannot have empty rows
      data?.every(data => data[0]) &&
      data?.[0]?.every(data => data) &&
      
      // Any row/column validation must 
      (this.get('expectedRows') ? this.get('expectedRows') === data?.length : true) &&
      (this.get('expectedColumns') ? this.get('expectedColumns') === data?.[0]?.length : true)
    );
  },
});

export { GraphChart_model, GraphTable_model, Graph_model };

