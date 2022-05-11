import JsonModelMixin from '../JsonModelMixin';
import Radio from 'backbone.radio';

const api_name = 'externalcustomdataobject';

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

export default JsonModelMixin.extend({
  idAttribute: 'external_custom_data_object_id',
  defaults: {
    external_custom_data_object_id: null,
    external_user_session_expiry: null,
    reference_id: null,
    owner_id: null,
    object_type: null,
    object_sub_type: null,
    object_sub_status: null,
    object_status: null,
    
    object_title: null,
    object_description: null,
    is_active: null,
    
    // Keep as a string for sending / receiving from DB
    object_json: null,
    // Used to hold the actual parsed json value
    jsonData: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_PATCH_ONLY_ATTRS: [
    'reference_id',
    'owner_id',
    'external_user_session_expiry',
  ],

  API_SAVE_ATTRS: [
    'object_type',
    'object_sub_type',
    'object_status',
    'object_sub_status',
    'object_title',
    'object_description',
    'object_json',
  ],

  url() {
    const withSessionToken = (url) => {
      const shouldAddExternalSessionToUrl = !this.isNew();
      if (sessionChannel.request('is:login:external')) return `${url}${shouldAddExternalSessionToUrl?`/externalsession`:''}/${sessionChannel.request('token')}`;
      else return url;
    };

    const endpointUrl = `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
    if (this.isNew()) return withSessionToken(endpointUrl);

    return withSessionToken(`${endpointUrl}/${this.id}`);
  },

  // On save, always add to main dispute collection
  save(attrs, options={}) {
    const dfd = $.Deferred();
    JsonModelMixin.prototype.save.call(this, attrs, Object.assign({ skip_conflict_check: true }, options)).done(() => {
      customDataObjsChannel.request('add:external', this);
      dfd.resolve(this);
    }).fail(dfd.reject);
    return dfd.promise();
  }
});