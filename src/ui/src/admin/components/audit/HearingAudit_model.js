import Backbone from 'backbone';
import Radio from 'backbone.radio';
import DisputeHearingModel from '../../../core/components/hearing/DisputeHearing_model';

const DEFAULT_DISPLAY_RETURN_VALUE = '-';

const configChannel = Radio.channel('config');

export default Backbone.Model.extend({
  idAttribute: 'hearing_history_id',
  defaults: {
    hearing_history_id: null,
    hearing_change_type: null,
    hearing_id: null,
    hearing_type: null,
    hearing_subtype: null,
    hearing_priority: null,
    conference_bridge_id: null,
    hearing_owner: null,
    hearing_start_datetime: null,
    hearing_end_datetime: null,
    local_start_datetime: null,
    local_end_datetime: null,
    dispute_hearing_role: null,
    dispute_guid: null,
    file_number: null,
    shared_hearing_link_type: null,
    created_date: null,
    created_by: null,
  },

  API_SAVE_ATTRS: [],

  save() {
    // Save not allowed on this model
  },

  initialize() {
    // Used to look up display values
    this._disputeHearing = new DisputeHearingModel(this.toJSON());
    this._HEARING_AUDIT_CHANGE_TYPE_DISPLAY = configChannel.request('get', 'HEARING_AUDIT_CHANGE_TYPE_DISPLAY');
    this._HEARING_PRIORITY_DISPLAY = configChannel.request('get', 'HEARING_PRIORITY_DISPLAY');
    this._HEARING_AUDIT_CHANGE_TYPE_DELETE_HEARING = configChannel.request('get', 'HEARING_AUDIT_CHANGE_TYPE_DELETE_HEARING');
  },

  isChangeTypeDelete() {
    return this.get('hearing_change_type') === this._HEARING_AUDIT_CHANGE_TYPE_DELETE_HEARING;
  },

  getChangeTypeDisplay() {
    const changeType = this.get('hearing_change_type');
    return _.has(this._HEARING_AUDIT_CHANGE_TYPE_DISPLAY, changeType) ? this._HEARING_AUDIT_CHANGE_TYPE_DISPLAY[changeType] : DEFAULT_DISPLAY_RETURN_VALUE;
  },

  getPriorityDisplay() {
    const priority = this.get('hearing_priority');
    return _.has(this._HEARING_PRIORITY_DISPLAY, priority) ? this._HEARING_PRIORITY_DISPLAY[priority] : DEFAULT_DISPLAY_RETURN_VALUE;
  },

  getSharedHearingLinkTypeDisplay() {
    if (!this._disputeHearing) {
      return DEFAULT_DISPLAY_RETURN_VALUE;
    }

    return this._disputeHearing.isSingleLink() ? 'Single' :
      this._disputeHearing.isCrossLink() ? 'Cross' :
      this._disputeHearing.isJoinerLink() ? 'Joined' :
      this._disputeHearing.isCrossRepeatLink() ? 'Cross-Repeat' :
      this._disputeHearing.isRepeatedLink() ? 'Repeated' :
      DEFAULT_DISPLAY_RETURN_VALUE;
  },

  getRoleDisplay() {
    if (!this._disputeHearing) {
      return DEFAULT_DISPLAY_RETURN_VALUE;
    }

    return this._disputeHearing.isPrimary() ? 'Primary' :
      this._disputeHearing.isSecondary() ? 'Secondary' :
      DEFAULT_DISPLAY_RETURN_VALUE;
  }

});
