import JsonModelMixin from '../JsonModelMixin';
import Radio from 'backbone.radio';

const api_name = 'customobject';

const configChannel = Radio.channel('config');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const disputeChannel = Radio.channel('dispute');

export default JsonModelMixin.extend({
  idAttribute: 'custom_data_object_id',
  defaults: {
    custom_data_object_id: null,

    object_type: null,
    object_status: null,
    object_sub_type: null,
    description: null,

    // Keep as a string for sending / receiving from DB
    object_json: null,
    // Used to hold the actual parsed json value
    jsonData: null
  },

  API_POST_ONLY_ATTRS: [
    'object_type'
  ],

  API_SAVE_ATTRS: [
    'object_status',
    'object_sub_type',
    'description',
    'object_json',
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${disputeChannel.request('get:id')}` : '');
  },

  isTypeAriC() {
    return this.get('object_type') === configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C');
  },

  isTypePfr() {
    return this.get('object_type') === configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR');
  },

  // On save, always add to main dispute collection
  save(attrs, options) {
    const dfd = $.Deferred();
    JsonModelMixin.prototype.save.call(this, attrs, options).done(() => {
      customDataObjsChannel.request('add', this);
      dfd.resolve(this);
    }).fail(dfd.reject);
    return dfd.promise();
  }
});