import Radio from 'backbone.radio';
import CM_model from '../model/CM_model';

const api_name = 'externalerrorlogitem';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

export default CM_model.extend({
  idAttribute: 'exteral_error_log_id',
  defaults: {
    exteral_error_log_id: null,
    error_site: null,
    dispute_guid: null,
    error_severity: null,
    error_impact: null,
    error_urgency: null,
    error_type: null,
    error_subtype: null,
    error_status: null,
    error_owner: null,
    reported_date: null,
    error_title: null,
    feature_title: null,
    error_details: null,
    error_comment: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },

  API_PATCH_ONLY_ATTRS: [
    'error_severity',
    'error_impact',
    'error_urgency',
    'error_status',
    'error_comment',
  ],

  API_SAVE_ATTRS: [
    'error_site',
    'error_type',
    'error_title',
    'error_details',
    'dispute_guid',
    'error_owner',
    'reported_date',
  ],

  url() {
    const withSessionToken = (url) => {
      const shouldAddExternalSessionToUrl = !this.isNew();
      if (sessionChannel.request('is:login:external')) return `${url}${shouldAddExternalSessionToUrl ? `/${sessionChannel.request('token')}` : ''}`;
      else return url;
    };

    const endpointUrl = `${configChannel.request('get', 'API_ROOT_URL')}${api_name}`;
    if (this.isNew()) return withSessionToken(endpointUrl);
    return `${endpointUrl}/${this.id}`;
  },

});