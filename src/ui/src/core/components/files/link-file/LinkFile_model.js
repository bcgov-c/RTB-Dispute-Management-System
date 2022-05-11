/**
 * @class core.components.files.link-file.LinkFileModel
 * @memberof core.components.files.link-file
 * @augments core.components.model.CMModel
 */

import CMModel from '../../model/CM_model';
import Radio from 'backbone.radio';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

const api_name = 'linkfile';

export default CMModel.extend({
  idAttribute: 'link_file_id',
  defaults: {
    link_file_id: null,
    file_id: null,
    file_description_id: null,

    created_date: null,
    created_by: null,
    modified_date: null,
    modified_by: null
  },

  API_SAVE_ATTRS: [
    'file_id',
    'file_description_id'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `/${disputeChannel.request('get:id')}` : '');
  },

  areLinked(fileModel, fileDescriptionModel) {
    if (!fileModel || !this.get('file_id') || !fileDescriptionModel || !fileDescriptionModel.id) return false;
    return this.get('file_id') === fileModel.id && this.get('file_description_id') === fileDescriptionModel.id;
  },


});
