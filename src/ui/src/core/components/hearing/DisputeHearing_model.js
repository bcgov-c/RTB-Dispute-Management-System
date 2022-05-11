import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import { routeParse } from '../../../admin/routers/mainview_router';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const hearing_api_url = 'disputehearing';

export default CMModel.extend({
  idAttribute: 'dispute_hearing_id',

  defaults: {
    dispute_hearing_id: null,
    hearing_id: null,
    dispute_guid: null,
    file_number: null,
    external_file_id: null,
    dispute_hearing_role: null,
    shared_hearing_link_type: null,
    dispute_hearing_status: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null,

    is_deleted: null // Normally not returned for records, but for LinkingHistory use case this is returned
  },

  API_SAVE_ATTRS: [
    'shared_hearing_link_type',
    'dispute_hearing_status'
  ],

  API_POST_ONLY_ATTRS: [
    'hearing_id',
    'dispute_guid',
    'external_file_id',
    'dispute_hearing_role'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${hearing_api_url}`;
  },

  isPrimary() {
    return this.get('dispute_hearing_role') === configChannel.request('get', 'DISPUTE_HEARING_ROLE_PRIMARY');
  },

  isSecondary() {
    return this.get('dispute_hearing_role') === configChannel.request('get', 'DISPUTE_HEARING_ROLE_SECONDARY');
  },

  isDeleted() {
    return this.get('is_deleted');
  },

  _checkLinkType(configCode) {
    return configChannel.request('get', configCode) === this.get('shared_hearing_link_type');
  },

  isSingleLink() {
    return this._checkLinkType('DISPUTE_HEARING_LINK_TYPE_SINGLE');
  },

  isCrossLink() {
    return this._checkLinkType('DISPUTE_HEARING_LINK_TYPE_CROSS');
  },

  isJoinerLink() {
    return this._checkLinkType('DISPUTE_HEARING_LINK_TYPE_JOINER');
  },

  isCrossRepeatLink() {
    return this._checkLinkType('DISPUTE_HEARING_LINK_TYPE_CROSS_REPEAT');
  },
  
  isRepeatedLink() {
    return this._checkLinkType('DISPUTE_HEARING_LINK_TYPE_REPEATED');
  },

  getDisputeLinkHtml(options={}) {
    const fileNumber = this.getFileNumber();
    const activeDispute = disputeChannel.request('get');
    const isLinkedToActiveDispute  = activeDispute && activeDispute.get('file_number') === fileNumber;
    return this.isExternal() || isLinkedToActiveDispute ? fileNumber :
      `<a ${options.clearModalsOnNav ? 'class="static-clear-modals"' : ''} href="#${routeParse('overview_item', this.get('dispute_guid'))}">${fileNumber}</a>`;
  },

  getFileNumber() {
    return this.isExternal() ? this.get('external_file_id') : this.get('file_number');
  },

  isExternal() {
    return (!this.get('dispute_guid') || this.get('dispute_guid') === "00000000-0000-0000-0000-000000000000") && !this.get('file_number');
  }

});