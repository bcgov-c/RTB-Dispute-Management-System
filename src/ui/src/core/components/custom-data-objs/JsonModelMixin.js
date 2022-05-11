import CM_model from "../model/CM_model";

export default CM_model.extend({
  initialize() {
    CM_model.prototype.initialize.call(this, ...arguments);
    // jsonData will be the first configuration used
    if (!_.isEmpty(this.get('jsonData'))) {
      this.setStringJson();
    } else if (this.get('object_json')) {
      this.setParsedJson();
    }
  },

  // Updates internal jsonData and object_json save attribute
  updateJSON(dataObj) {
    if (!this.get('jsonData')) this.set('jsonData', {})
    const jsonData = this.get('jsonData');
    Object.assign(jsonData, dataObj);
    this.setStringJson();
  },

  setStringJson() {
    const jsonData = this.get('jsonData');
    let jsonString;
    if (jsonData) {
      jsonString = JSON.stringify(jsonData).replace('"', '\"');
      this.set('object_json', jsonString);
    }
    return jsonString;
  },

  setParsedJson() {
    let jsonData = null;
    try {
      jsonData = this.get('object_json') ? JSON.parse(this.get('object_json')) : {};
      // Add another iteration of JSON.parse to deal with "overly-stringified" JSON strings
      if (typeof jsonData === 'string') jsonData = JSON.parse(jsonData);
      this.set('jsonData', jsonData);
    } catch (err) {
      this.set('object_json', null);
    }
    return jsonData;
  },

  getParsedJson() {
    if (_.isEmpty(this.get('jsonData')) && this.get('object_json')) {
      this.setParsedJson();
    }
    return this.get('jsonData');
  },

  validateJson() {
    
  },

  // Always re-parse internal JSON field after saving object_json
  save(attrs, options) {
    const dfd = $.Deferred();
    CM_model.prototype.save.call(this, attrs, options).done(() => {
      this.setParsedJson();
      dfd.resolve();
    }).fail(dfd.reject);
    return dfd.promise();
  },

});