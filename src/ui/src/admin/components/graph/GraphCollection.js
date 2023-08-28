import Backbone from 'backbone';
import { GraphChart_model, GraphTable_model, Graph_model } from './Graph_model';

const GraphCollection = Backbone.Collection.extend({
  model: Graph_model,
});

const GraphTableCollection = GraphCollection.extend({
  model: GraphTable_model,
});

const GraphChartCollection = GraphCollection.extend({
  model: GraphChart_model,
});

export { GraphCollection, GraphTableCollection, GraphChartCollection };