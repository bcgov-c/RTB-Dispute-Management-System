/**
 * @class core.components.question.QuestionModel
 * @memberof core.components.question
 */
import Backbone from 'backbone';
import CMModel from '../model/CM_model';
import Radio from 'backbone.radio';

const api_name = 'dispute/intakequestions/';

const configChannel = Radio.channel('config');

export default CMModel.extend({
  idAttribute: 'question_id',
  defaults: {
    question_id: null,
    dispute_guid: null,
    question_name: null,
    group_id: null,
    question_answer: null,
    beforeClick: null,
    optionData: [],
    unselectDisabled: false,
    unselectDisabledMessage: null,
    warningValidator: null,
    helpName: null,
    helpHtml: null,
    clearWhenHidden: false,
    apiToUse: 'question',
    apiMapping: null
  },

  API_POST_ONLY_ATTRS: [
    'question_name',
  ],

  API_SAVE_ATTRS: [
    'group_id',
    'question_answer'
  ],

  urlRoot() {
    return `${configChannel.request('get', 'API_ROOT_URL')}${api_name}` + (this.isNew() ? `${this.get('dispute_guid')}` : '');
  },

  save(attrs, options) {
    if (this.get('apiToUse') !== 'question') {
      // NOTE: Don't save to the API if it's type question
      console.log(`[Warning] Trying to save Question model to API when it is not properly configured`, this);

      const dfd = $.Deferred();
      dfd.resolve();
      return dfd.promise();
    }
    return CMModel.prototype.save.call(this, attrs, _.extend({}, options, { singleton_batch: true }));
  },

  parse(response, options) {
    // NOTE: This needs to be overwritten in order to properly parse the "batch" response we have set up in the API
    const parsedResponse = _.isArray(response) && response.length === 1 ? response[0] : response;
    return Backbone.Model.prototype.parse.call(this, parsedResponse, options);
  },

  fetch(options) {
    return CMModel.prototype.fetch.call(this, _.extend({}, options, { singleton_batch: true }));
  },

  clearModelValue(options) {
    this.set('question_answer', null, options);
  },

  getPageApiDataAttrs() {
    const mapping_attr = this.get('apiMapping') ? this.get('apiMapping') : 'question_answer';
    return { [mapping_attr]: this.getData() };
  },

  // Gets the attributes that were possibly changed from the page
  getData() {
    return this.get('question_answer');
  },

  validate() {
    return this.getData() === null ? 'Please select an option' : null;
  }

});
