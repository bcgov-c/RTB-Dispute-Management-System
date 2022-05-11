/**
 * @class core.components.remedy.RemedyDetailModel
 * @memberof core.components.remedy
 * @augments core.components.model.CMModel
 */

import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';
import Formatter from '../../../core/components/formatter/Formatter';

const configChannel = Radio.channel('config');
const participantChannel = Radio.channel('participants');
const sessionChannel = Radio.channel('session');
const userChannel = Radio.channel('users');

const api_name = 'issues/remedydetail';
export default CMModel.extend({
  idAttribute: 'remedy_detail_id',
  defaults: {
    remedy_detail_id: null,
    remedy_id: null,
    is_amended: null,
    description_by: null,
    description: null,
    associated_date: null,
    amount: 0,
    modified_date: null
  },

  API_SAVE_ATTRS: [
    'is_amended',
    'description_by',
    'description',
    'associated_date',
    'amount'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${this.get('remedy_id')}` : '');
  },

  save(attrs, options) {
    options = options || {};
    
    // Make sure a valid description_by is always set
    if (!participantChannel.request('check:id', this.get('description_by'))) {
      this.set('description_by', sessionChannel.request('get:active:participant:id'), { silent: true });
    }
    return CMModel.prototype.save.call(this, attrs, options);
  },

  getModifiedDisplay() {
    const user = userChannel.request('get:user', this.get('modified_by')) || null;
    if (!user) return null;
    const modifiedBy = user ? user.getDisplayName() : null;
    return `${modifiedBy ? `${modifiedBy}: `:''}${Formatter.toDateAndTimeDisplay(this.get('modified_date')) || ''}`;
  },
});
