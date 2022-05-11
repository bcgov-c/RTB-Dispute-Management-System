import Backbone from 'backbone';

export default Backbone.Model.extend({
  
  defaults: {
    _data_object_id: null,
    _json: null
  },

  getLoadedId() {
    return this.get('_data_object_id');
  },

  clear() {
    this.set('_data_object_id', null);
    this.setJSON({});
  },

  parseFromCustomDataObj(customDataObj) {
    this.set('_data_object_id', customDataObj.id);
    this.setJSON(customDataObj.getParsedJson());
  },

  setJSON(json) {
    this.set('_json', json || {});
  },

  toJSON() {
    return this.get('_json') || {};
  },

  getAttribute(attribute) {
    return (this.get('_json') || {})[attribute];
  },

});

