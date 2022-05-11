import Radio from 'backbone.radio';
import CMModel from '../model/CM_model';
import TrialDispute_model from './TrialDispute_model';

const apiName = 'trial';

const trialsChannel = Radio.channel('trials');
const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'trial_guid',

  defaults: {
    trial_guid: null,
    associated_trial_guid: null,
    opt_in_required: null,
    trial_type: null,
    trial_sub_type: null,
    trial_status: null,
    trial_sub_status: null,
    trial_title: null,
    trial_description: null,
    min_disputes: null,
    min_participants: null,
    min_interventions: null,
    max_disputes: null,
    max_participants: null,
    max_interventions: null,
    trial_start_date: null,
    trial_end_date: null,
    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,
  },
  

  API_SAVE_ATTRS: [
    'associated_trial_guid',
    'opt_in_required',
    'trial_type',
    'trial_sub_type',
    'trial_status',
    'trial_sub_status',
    'trial_title',
    'trial_description',
    'min_disputes',
    'min_participants',
    'min_interventions',
    'max_disputes',
    'max_participants',
    'max_interventions',
    'trial_start_date',
    'trial_end_date'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${apiName}`;
  },

  isActive() {
    return this.get('trial_status') === configChannel.request('get', 'TRIAL_STATUS_ACTIVE');
  },

  hasStarted() {
    return Moment(this.get('trial_start_date')).isSameOrBefore(Moment());
  },

  hasEnded() {
    return Moment().isSameOrAfter(Moment(this.get('trial_end_date')));
  },

  createTrialDispute(disputeModel, trialDisputeData={}) {
    return new Promise((res, rej) => {
      const trialDispute = new TrialDispute_model(Object.assign({
        trial_guid: this.get('trial_guid'),
        dispute_guid: disputeModel.id,
        dispute_trial_status: configChannel.request('get', 'TRIAL_DISPUTE_STATUS_STANDARD'),
      }, trialDisputeData));
      trialDispute.save().done(() => {
        trialsChannel.request('add:dispute:trial', trialDispute);
        res(trialDispute);
      }).fail(rej);
    });
  },

});
