import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './ModalViewAuditItem_template.tpl';
import JSONFormatter from 'json-formatter-js';

const NO_REQUEST_BODY_POST_DELETE_MSG = 'Detailed call information not stored for successful POST/DELETE actions';

const Formatter = Radio.channel('formatter').request('get');
const auditChannel = Radio.channel('audits');
const modalChannel = Radio.channel('modals');
const apiChannel = Radio.channel('api');

export default Marionette.View.extend({
  id: 'audit-modal',
  className: 'modal fade modal-rtb-default',
  template,

  ui: {
    prevButton: '.btn-prev',
    nextButton: '.btn-next',
    close: '.close-x',
    jsonView: '.request-json-view'
  },

  events: {
    'click @ui.prevButton': 'clickPrevButton',
    'click @ui.nextButton': 'clickNextButton',
    'click @ui.close': 'close'
  },

  clickPrevButton() {
    this._loadNewAuditModel(this.options.collection.prev().getElement());
  },

  clickNextButton() {
    this._loadNewAuditModel(this.options.collection.next().getElement());
  },

  _loadNewAuditModel(newModel) {
    if (!newModel) {
      return;
    }
    this.switchToLoadingUI();
    const self = this;
    this.model = newModel;
    this.options.collection.setElement(newModel);
    auditChannel.request('get:audit', newModel.id)
      .done(function(audit_item) {
        newModel.set(audit_item);
        self.render();
      }).fail(function() {
        console.log('[warning] Audit item could not be loaded.');
      }).always(function() {
        self.switchToViewItemUI();
      });
  },

  switchToLoadingUI() {
    this.getUI('prevButton').addClass('disabled').attr('disabled', 'disabled');
    this.getUI('nextButton').addClass('disabled').attr('disabled', 'disabled');
  },

  switchToViewItemUI() {
    this.getUI('prevButton').removeClass('disabled').removeAttr('disabled');
    this.getUI('nextButton').removeClass('disabled').removeAttr('disabled');
  },

  initialize(options) {
    _.extend(this.options, {}, options);
  },

  close() {
    modalChannel.request('remove', this);
  },

  onRender() {
    this.renderJsonView();
  },

  renderJsonView() {
    let jsonObj = null;
    try {
      jsonObj = JSON.parse(this.model.get('api_call_data'));
    } catch(e) {
      // Could not parse as JSON, so this is not a JSON object
    }

    if (!jsonObj) {
      jsonObj = {};
    }

    _.each(Object.keys(jsonObj), function(key) {
      if (key.includes('html')) {
        jsonObj[key] = 'HTML Content';
        return;
      }
    });

    const apiCallType = this.model.get('api_call_type');
    
    // Convert raw PATCH request to a more human readable format
    if (apiCallType === 'PATCH') {
      jsonObj = apiChannel.request('convert:patch:display', jsonObj);
    }

    console.log(jsonObj);
    if (jsonObj && !_.isEmpty(jsonObj)) {
      const jsonView = new JSONFormatter(jsonObj, Infinity);
      this.getUI('jsonView').replaceWith(jsonView.render());
    } else if (apiCallType === 'POST' || apiCallType === 'DELETE') {
      this.getUI('jsonView').replaceWith(NO_REQUEST_BODY_POST_DELETE_MSG);
    }
  },

  templateContext() {
    return {
      Formatter,
      submitterRoleDisplay: auditChannel.request('get:user:role:display', this.model.get('submitter_role')),
      changeToDisplay: auditChannel.request('get:api:display', this.model.get('api_name')),
      typeOfChangeDisplay: auditChannel.request('get:http:display', this.model.get('api_call_type'))
    }
  },


});
