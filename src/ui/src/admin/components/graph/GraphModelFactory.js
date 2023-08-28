import Radio from 'backbone.radio';
import { GraphChart_model, GraphTable_model, Graph_model } from './Graph_model';

const configChannel = Radio.channel('config');

class _GraphModelFactory {
  createGraph(graphData={}) {
    // Create the graph model based on the passed-in class
    const graphModelClass = (graphData?.type === configChannel.request('get', 'GRAPH_TYPE_LINE')
      || graphData?.type === configChannel.request('get', 'GRAPH_TYPE_BAR')) ?
      GraphChart_model
      : graphData?.type === configChannel.request('get', 'GRAPH_TYPE_TABLE') ?
      GraphTable_model
      : Graph_model;

    return new (graphModelClass)(graphData);
  }
};

const GraphModelFactory = new _GraphModelFactory();
export { GraphModelFactory };