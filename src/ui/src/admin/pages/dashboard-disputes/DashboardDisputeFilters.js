import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioView from '../../../core/components/radio/Radio';
import template from './DashboardDisputeFilters_template.tpl';

const statusChannel = Radio.channel('status');

export default Marionette.View.extend({
  template,

  initialize(options) {
    this.mergeOptions(options, ['filter_models']);
  },

  onRender() {
    _.each(this.filter_models, function(model) {
      const base_name = statusChannel.request('get:stage:display', model.get('stage')).replace(/\s+/g, '');
      this.addRegion(base_name+'Region', '.'+base_name+'dispute-filter');
      this.showChildView(base_name+'Region', new RadioView({ model: model}));
    }, this);
  },

  templateContext() {
    const filter_model_class_names = [];
    _.each(this.filter_models, function(model) {
      filter_model_class_names.push(statusChannel.request('get:stage:display', model.get('stage')).replace(/\s+/g, '')+'dispute-filter');
    });
    
    return {
      filter_models: this.filter_models,
      status_channel: statusChannel,
      filter_model_class_names: filter_model_class_names
    }
  }

});
