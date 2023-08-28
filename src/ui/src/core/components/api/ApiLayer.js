/**
 * @namespace core.components.api.ApiLayer
 * @memberof core.components.api
 * @fileoverview - Manager that contains core api call logic. This includes GET/PATCH requests, error logging, error handling, and unauthorized request handling
 */

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ErrorLog_model from '../error-logs/ErrorLog_model';
import './AjaxQueue';

const disputeChannel = Radio.channel('dispute');
const timerChannel = Radio.channel('timers');
const formatterChannel = Radio.channel('formatter');
const sessionChannel = Radio.channel('session');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const default_BackboneAjax = Backbone.ajax;
/* As of Backbone.js 1.3.3, this is:
function() {
  return Backbone.$.ajax.apply(Backbone.$, arguments);
};
*/

const default_ajax_settings = {
    dataType: 'json',
    crossDomain: true
  },
  default_ajax_header_settings = {};
  /*,
  default_ajax_header_settings = {
    'Content-Type' : 'application/json',
  }*/

/**
 * @class Api Layer manager
 */
const ApiLayer = Marionette.Object.extend({
  channelName: 'api',

  radioRequests: {
    'set:seq': 'setRequestsToSequential',
    'set:async': 'setRequestsToAsync',
    'allow:unauthorized': 'setRequestsToAllowUnauth',
    'restrict:unauthorized': 'setRequestsToRestrictUnauth',
    'restrict:collisions': 'setRestrictCollisions',
    'track:delete': 'trackModelDelete',
    'check:delete': 'checkModelDeleted',
    'create:errorlog': 'createErrorLogItem',
    'reset': 'setRequestsToAsync',
    'call': 'performCall',
    'patch': 'performPatch',
    'convert:patch': 'convertToPatchFormat',
    'convert:patch:display': 'convertToDisplayablePatch',
    'create:errorHandler': 'createGeneralErrorHandler',
  },

  _allow_unauthorized_calls: false,
  _allow_collisions: true,

  // Track a global session list of what models have been deleted
  _deleted_models: null,

  initialize() {
    this._deleted_models = {};
    this.isShowingUnauthModal = false;

    this.addGeneralUnauthorizedHandler();
    this.addGeneralAjaxSuccessHandler();
    this.addAjaxOptions();
    this.updateBackbonePatchBehaviour();
  },

  _modelToIdCode(model) {
    return `${model.idAttribute}:${model.id}`;
  },

  trackModelDelete(model) {
    this._deleted_models[this._modelToIdCode(model)] = true;
  },

  checkModelDeleted(model) {
    return _.has(this._deleted_models, this._modelToIdCode(model));
  },

  convertToPatchFormat(json_data) {
    const new_patch_attrs = [];
    _.each(json_data, function(value, key) {
      new_patch_attrs.push({
        op: 'replace',
        path: `/${key}`,
        value: value
      });
    });
    return new_patch_attrs;
  },

  convertToDisplayablePatch(json_data) {
    const displayable_json = {};
    _.each(json_data, function(obj) {
      if (obj && obj.path && obj.value) {
        displayable_json[obj.path.charAt(0) === "/" ? obj.path.substring(1) : obj.path] = obj.value;
      }
    });
    return displayable_json;
  },

  /**
   * Converts the default PATCH format from the Backbone.sync "{ field: val }" format to the format in https://tools.ietf.org/html/rfc6902
   * Re-initializes Backbone.sync with new code to convert PATCH
   */
  updateBackbonePatchBehaviour() {
    const self = this;
    // Objects and methods from backbone.js that Backbone.sync requires
    const methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'patch': 'PATCH',
      'delete': 'DELETE',
      'read': 'GET'
    };
    // Throw an error when a URL is needed, and none is supplied.
    const urlError = function() {
      throw new Error('A "url" property or function must be specified');
    };
    Backbone.sync = _.bind(function(method, model, options) {
      var type = methodMap[method];

      // Default options, unless specified.
      _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      });

      // Default JSON-request options.
      var params = {type: type, dataType: 'json'};

      // Ensure that we have a URL.
      if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
      }

      if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(options.attrs || model.toJSON(options));
      }

      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (options.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data = params.data ? {model: params.data} : {};
      }

      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
        params.type = 'POST';
        if (options.emulateJSON) params.data._method = type;
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) return beforeSend.apply(this, arguments);
        };
      }

      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
      }

      // Pass along `textStatus` and `errorThrown` from jQuery.
      var error = options.error;
      options.error = function(xhr, textStatus, errorThrown) {
        options.textStatus = textStatus;
        options.errorThrown = errorThrown;
        if (error) error.call(options.context, xhr, textStatus, errorThrown);
      };


      // DMS NOTE: This is the custom PATCH update code
      if (method === 'patch') {
        options.contentType = 'application/json-patch+json';
        options.data = JSON.stringify(self.convertToPatchFormat(options.attrs || model.toJSON(options)));
      }

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Backbone.ajax(_.extend(params, options));

      // DMS NOTE: Add DMS simulate http500 error functionality
      const tok = String(localStorage.getItem('_simulate500') || '');
      const dfd = $.Deferred();
      if (tok && tok !== 'false' && tok !== '0') {
        xhr.done((res, statusString, _xhr) => {
          if (statusString) statusString = 'error';
          if (_xhr && _xhr.status) _xhr.status = 500;
          return dfd.reject(_xhr, statusString);
        }).fail(dfd.reject);
        xhr = dfd;
      }

      model.trigger('request', model, xhr, options);
      return xhr;
    }, Backbone);
  },

  setRequestsToAllowUnauth() {
    this._allow_unauthorized_calls = true;
  },
  setRequestsToRestrictUnauth() {
    this._allow_unauthorized_calls = false;    
  },

  setRestrictCollisions() {
    this._allow_collisions = false;
  },

  /**
   * Add a handler application-wide for an HTTP 401 response
   */
  addGeneralUnauthorizedHandler() {
    const self = this;
    $(document).ready(function() {
      
      $(document).ajaxError(function(event, xhr, ajaxOptions, thrownError) {
        const isFromLogout = !_.isEmpty(ajaxOptions) && $.trim(ajaxOptions.url).indexOf('/users/logout') !== -1;
        if (xhr.status === 401 && !self._allow_unauthorized_calls) {
          if (isFromLogout) {
            sessionChannel.trigger('redirect:logout');
          } else if (!self.isShowingUnauthModal) {
            self.isShowingUnauthModal = true;
            modalChannel.request('render:root');
            
            const isIntake = (window || global)._DMS_SITE_NAME === 'Intake';
            loaderChannel.trigger('page:load:complete');
            const logoutModal = modalChannel.request('show:standard', {
              modalCssClasses: 'session-expired-modal',
              title: 'Session Expired - Unauthorized',
              bodyHtml: `<p>Your session has expired or has been terminated.  To continue you will need to login again.${isIntake ? '  You may be seeing this message because you logged into a system on a second device or browser where only one login is permitted.':''}  Press Continue to login again.</p>`,
              onContinueFn(modaView) {
                modaView.close();
              },
              hideCancelButton: true
            });
            
            const autoLogoutTimer = setTimeout(function() {
              clearTimeout(autoLogoutTimer);
              if (self.isShowingUnauthModal) {
                loaderChannel.trigger('page:load');
                setTimeout(() => Backbone.history.navigate('logout', { trigger: true }), 50);
              }
            }, 10*1000);

            logoutModal.once('removed:modal', function() {
              clearTimeout(autoLogoutTimer);
              self.isShowingUnauthModal = false;
              loaderChannel.trigger('page:load');
              setTimeout(() => Backbone.history.navigate('logout', { trigger: true }), 50);
            });

            modalChannel.request('add', logoutModal);
          }
        }
        
        if (xhr.status === 409 && !self._allow_collisions) {

          loaderChannel.trigger('page:load:complete');
          const modalView = modalChannel.request('show:standard', {
            title: 'Multiple User Data Change',
            bodyHtml: 'We have detected that the information you are trying to update has been changed in another device, browser window or tab. To ensure your security and that important information is not overwritten by multiple user logins on the same application, this user account will be logged out.',
            hideCancelButton: true,
            primaryButtonText: 'Continue',
            onContinueFn(modalView) {
              modalView.close();
            }
          });
          modalView.once('removed:modal', function() {
            loaderChannel.trigger('page:load');
            setTimeout(() => Backbone.history.navigate('logout', { trigger: true }), 50);
          });
        }
      });
    });
  },

  /**
   * Add a handler application-wide for any time an ajax call succeeds.
   * Upon success, refresh all the application Timers
   */
  addGeneralAjaxSuccessHandler() {
    $(document).ready(function() {
      $(document).ajaxSuccess(function(event, xhr) {
        if (xhr.status && xhr.status === 204) {
          return;
        }
        if (xhr) {
          timerChannel.request('restart:timer', 'logoutWarningTimer', {silent: true});
          timerChannel.request('restart:timer', 'logoutTimer', {silent: true});
        }
      });
    });
  },


  /**
   * Add generic ajax on-send and on-receive behaviour.
   * On send:
   * - If a logged-in user exists, this will pass their token as a header.
   * - If a dispute is active, this will set the DisputeGuid header for audit logging
   * On receive:
   * - If any field matching "_date" in the name is received, it will convert the date from ISO format into a Moment object
   * If the date is SQL empty, "0001-01-01T00:00:00", it will convert it into null
   */
  addAjaxOptions() {

    /** Anonymous function to process (nested) JSON objects recursively */
    function traverseJSON(obj, func) {
      for (var i in obj) {
        func.apply(this,[i, obj[i], obj]);
        if (obj[i] !== null && typeof(obj[i]) === "object") {
          // Next step down the tree
          traverseJSON(obj[i], func);
        }
      }
    }


    $(document).ready(function() {
      $.ajaxSetup({
        beforeSend: function(xhr, settings) {
          // Add auto-date formatting from server dates.
          //   Empty dates: null SQL date string "0001-01-01T00:00:00" and empty string "" denote empty dates.  Parse them into <null>s
          //   Server dates are in UTC but do not contain 'Z' ending to denote UTC timezone.
          //   Moment library interprets this as relative timezone so we have to add a Z ourselves
          const token = sessionChannel.request('token');
          const dispute = disputeChannel.request('get');

          // Add Auth token request header
          if (token && !settings?.headers?.Token) {
            xhr.setRequestHeader('Token', token);
            //xhr.setRequestHeader('Content-Type', 'application/json');
            //xhr.setRequestHeader('Accept:application/json, text/javascript, */*; q=0.01');
          }

          // Add AuditLog DisputeGuid request header if endpoint is not blacklisted
          let isBlackListed = false;
          _.each(Object.keys(configChannel.request('get', 'INVALID_AUDIT_LOG_ENDPOINTS')), function(key) {
            if (settings.url.includes(key)) {
              isBlackListed = true;
              return;
            }
          })
          if (dispute && dispute.get('dispute_guid') && !settings?.headers?.DisputeGuid && !isBlackListed) {
            xhr.setRequestHeader('DisputeGuid', dispute.get('dispute_guid'));
          }

          // Add random queryId paramter to circumvent IE11 auto-cacheing
          const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
          if (isIE11) {
            settings.url = `${settings.url}${settings.url.indexOf('?') !== -1 ? '&' : '?' }rand${Math.random()}`;
          }
        },

        dataFilter(data, type) {
          if (type !== 'json') {
            return data;
          }
          let parsed_data;

          try {
            parsed_data = JSON.parse(data);
          } catch(err) {
            console.log(`[Error] Couldn't parse JSON from API response`, data);
            return data;
          }

          if (!parsed_data) {
            return JSON.stringify(parsed_data);
          }

          /** Anonymous function to process JSON objects.  Bind the formatter object into it for ISO date parsing. */
          const processDateKeys = _.bind(function(formatter, key, val, obj) {
            if (/(?:_date$)|(?:_date_?time)/.test($.trim(key))) {
              // Empty date handling and parsing
              if (/^0001-01-01T00\:00\:00/.test($.trim(val)) || val === "") {
                obj[key] = null;
              } else {
                // UTC conversion if required, and to Moment()
                obj[key] = formatter ? formatter.fromUTCDateString(val) : val;
              }
            }
          }, this, formatterChannel.request('get'));

          // If data is not an array, wrap an array outside so that we can always iterate through the data the same way.
          const parsed_data_list = _.isArray(parsed_data) ? parsed_data : [parsed_data];
          _.each(parsed_data_list, function(parsed_data_list_item) {
            // Run our JSON traversal function with the key processing function
            traverseJSON(parsed_data_list_item, processDateKeys);
          });
          // Make sure to unwrap from the array if it wasn't in one to begin with.
          return JSON.stringify(_.isArray(parsed_data) ? parsed_data_list : parsed_data_list[0]);
        }
      });
    });
  },

  request_fn() { return this.performCall.apply(this, arguments); },

  performCall(ajax_request_body, override_token) {
    if (_.has(ajax_request_body, 'headers')) {
      ajax_request_body.headers = _.extend({}, default_ajax_header_settings, ajax_request_body.headers);
    }
    if (override_token) {
      ajax_request_body.headers = _.extend({
        Token: override_token
      });
    }

    /**
     * Included for debugging for 1.02.01
     * Set token _simulate500 anything but 0/false to cause any non-Backbone mid-tier call to be interpreted as http500 from that point on
     */
    const dfd = $.Deferred();
    const callData = Object.assign({}, default_ajax_settings, ajax_request_body);
    const typesThatChangeData = ['POST', 'PATCH', 'PUT', 'DELETE'];
    const generatedApiId = typesThatChangeData.includes(callData?.type) ? sessionChannel.request('add:active:api', callData) : null;
    $.ajax(callData).done((res, statusString, xhr) => {
      const tok = String(localStorage.getItem('_simulate500') || '');
      if (tok && tok !== 'false' && tok !== '0') {
        if (statusString) statusString = 'error';
        if (xhr && xhr.status) xhr.status = 500;
        return dfd.reject(xhr, statusString);
      } else {
        dfd.resolve(res, statusString, xhr);
      }
    }).fail(dfd.reject)
    .always(() => generatedApiId ? sessionChannel.request('remove:active:api', generatedApiId) : null);
    return dfd.promise();
  },

  performPatch(ajax_options) {
    ajax_options = ajax_options || {};

    // Automatically add the PATCH header, set method to PATCH, and allow passing regular json data in
    // "_patch_data" field
    ajax_options.headers = _.extend({
      'Content-Type': 'application/json-patch+json',
    }, ajax_options.headers);

    return this.performCall(_.extend(
      { method: 'PATCH' },
      ajax_options._patch_data ? { data: JSON.stringify(this.convertToPatchFormat(ajax_options._patch_data)) } : {},
      ajax_options));
  },

  /**
   * All future requests using ajax will be asynchronous (default)
   */
  setRequestsToAsync() {
    this.request_fn = default_BackboneAjax;
  },

  /**
    * All future requests using ajax will be synchronous
    */
  setRequestsToSequential() {
    this.request_fn = this.requestSynchronous;
  },

  requestSynchronous() {
    return Backbone.$.ajaxQueue.apply(Backbone.$, arguments);
  },

  // When a top level javascript error is detected, create a new ErrorLog item
  createGeneralErrorHandler(defaultErrorLogAttrs={}) {
    const existingOnError = window.onerror;
    const ERROR_TYPE_GENERAL = configChannel.request('get', 'ERROR_TYPE_GENERAL');
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        // If logged in, fire a UI error in the background asynchronously
        if (sessionChannel.request('is:authorized')) {
          this.createErrorLogItem(Object.assign({
            error_details: `${message}|||${source}|||${lineno}|||${colno}|||${error}`.substring(0, 2450),
            error_type: ERROR_TYPE_GENERAL
          }, defaultErrorLogAttrs));
        }
        
        if (_.isFunction(existingOnError)) existingOnError.call(window, message, source, lineno, colno, error);
      } catch (err) {
        console.debug(err);
      }
    };
  },

  async createErrorLogItem(attrs={}) {
    const currentDisputeGuid = disputeChannel.request('get:id');
    const defaultErrorAttrs = Object.assign({
      error_title: `${window.location.href||''}`.substring(0, 145),
    }, currentDisputeGuid ? { dispute_guid: currentDisputeGuid } : null);
    return new Promise((res, rej) => new ErrorLog_model(Object.assign({}, defaultErrorAttrs, attrs)).save()
        .done(res).fail(rej));
  },

});

const apiLayerInstance = new ApiLayer();

// NOTE: Overwrite Backbone.ajax in order to change underlying api behaviour
Backbone.ajax = function() {
  return apiLayerInstance.request_fn(...arguments);
};


class ErrorResponseHandler {
  constructor(actionTitle, actionApi, onCloseAction, modalTitle, modalBody, apiErrorResponse) {
    this._actionTitle = actionTitle;
    this._actionApi = actionApi;
    this._onCloseAction = onCloseAction;
    this._modalTitle = modalTitle;
    this._modalBody = modalBody;
    this._apiErrorResponse = apiErrorResponse;
  }

  set apiErrorResponse(newApiErrorResponse) {
    this._apiErrorResponse = newApiErrorResponse;
  }

  get apiErrorResponse() {
    return this._apiErrorResponse;
  }
  
  get actionApi() {
    return this._actionApi;
  }

  toString() {
    return `actionTitle=${this._actionTitle}, modalTitle=${this._modalTitle}, modalBody=${this._modalBody}, onCloseAction=${this._onCloseAction}`;
  }

  showErrorModal() {
    if (!this._modalTitle || !this._modalBody || !this._onCloseAction) {
      console.log(`[Error] Missing required fields to show modal in ErrorResponseHandler`, this.toString());
      return;
    }

    loaderChannel.trigger('page:load:complete');
    const modalView = modalChannel.request('show:standard', {
      modalCssClasses: 'general-error-modal',
      title: this._modalTitle,
      bodyHtml: this._modalBody,
      hideCancelButton: true,
      primaryButtonText: 'Continue',
      onContinueFn(modalView) {
        modalView.close();
      }
    });
    modalView.once('removed:modal', this._onCloseAction);
    return modalView;
  }
}


const ErrorResponseFactory = Marionette.Object.extend({

  ERROR_MODAL_TITLES: {
    'DEFAULT': 'An Error Occurred',
    'HTTP.400': '400: Application Error',
    'HTTP.409': '409: Multiple User Data Change',
    'HTTP.500': '500: Internal Server or Network Error'
  },

  ERROR_ACTION_CONFIG: {
    'INTAKE.PAGE.NEXT.GENERAL': {
      title: 'Intake Step: General - Next'
    },
    'INTAKE.PAGE.NEXT.APPLICANTS': {
      title: 'Intake Step: Applicants - Next'
    },
    'INTAKE.PAGE.NEXT.APPLICANT_OPTIONS': {
      title: 'Intake Step: Applicant Options - Next'
    },
    'INTAKE.PAGE.NEXT.RESPONDENTS': {
      title: 'Intake Step: Respondents - Next'
    },
    'INTAKE.PAGE.NEXT.ISSUES': {
      title: 'Intake Step: Issues - Next'
    },
    'INTAKE.PAGE.NEXT.INFORMATION': {
      title: 'Intake Step: Information - Next'
    },
    'INTAKE.PAGE.NEXT.REVIEW': {
      title: 'Intake Submission'
    },
    'INTAKE.PAGE.NEXT.PAYMENT_OPTIONS': {
      title: 'Intake Step: Payment Options - Next'
    },
    'INTAKE.PAYMENT.RETURN': {
      api: 'PATCH /api/payments',
      title: 'Intake Payment Verification'
    },
    'INTAKE.PAGE.LOAD.REVIEW': {
      title: 'Validating Intake Application'
    },
    'INTAKE.DVIEW.LOAD.DISPUTE': {
      title: 'Load Intake Dispute View'
    },

    'INTAKE.FILEDESCRIPTION.SAVE': {
      api: 'POST/PATCH /api/filedescription',
      title: 'Evidence Save '
    },

    'PAYMENT.BEANSTREAM_CHECK': {
      api: 'POST /api/checkbamboratransactions',
      title: 'Payment Verification'
    },

    'ADMIN.SEARCH.CROSS': {
      api: 'GET /api/search/crossapplication',
      title: 'Cross/Repeated Application Search'
    },

    'ADMIN.SEARCH.PARTICIPANT': {
      api: 'GET /api/search/participants',
      title: 'Participants Search - Contact Info'
    },

    'ADMIN.SEARCH.ACCESSCODE': {
      api: 'GET /api/search/accesscode',
      title: 'Participants Search - Access Code'
    },

    'ADMIN.SEARCH.DISPUTE': {
      api: 'GET /api/search/disputefilenumber',
      title: 'Search Disputes'
    },

    'ADMIN.SEARCH.DISPUTE.INFO': {
      api: 'GET /api/search/disputeInfo',
      title: 'Dispute Search'
    },

    'ADMIN.SEARCH.STATUS': {
      api: 'GET /api/search/disputestatus',
      title: 'Dispute Status Search'
    },

    'ADMIN.SEARCH.HEARING': {
      api: 'GET /api/search/hearing',
      title: 'Hearings Search'
    },

    'ADMIN.SEARCH.CLAIMS': {
      api: 'GET /api/search/claims',
      title: 'Issues Search'
    },

    'ADMIN.SEARCH.DISPUTE.MESSAGES': {
      api: 'GET /api/search/disputemessageowners',
      title: 'Dispute Message Search'
    },

    'ADMIN.SEARCH.DISPUTE.STATUS': {
      api: 'GET /api/search/disputestatusowners',
      title: 'Dispute Status Search'
    },

    'ADMIN.SEARCH.DISPUTE.NOTES': {
      api: 'GET /api/search/disputenoteowners',
      title: 'Dispute Note Search'
    },

    'ADMIN.SEARCH.DISPUTE.DOCUMENTS': {
      api: 'GET ​/api​/search​/disputedocumentowners',
      title: 'Dispute Document Owners'
    },

    'ADMIN.SEARCH.MORE.RESULTS': {
      title: 'Search - More Results'
    },

    'ADMIN.CMS.NOTE': {
      api: 'POST /api/cmsarchive/cmsrecordnote',
      title: 'Note Creation'
    },

    'ADMIN.CMS.LOAD': {
      api: 'GET /api/cmsarchive/cmsrecord',
      title: 'Load CMS Record'
    },

    'ADMIN.CMS.SEARCH': {
      api: 'GET /api/cmsarchive',
      title: 'CMS Record Search'
    },

    'ADMIN.CMS.SAVE': {
      api: 'PATCH /api/cmsarchive/cmsrecord',
      title: 'CMS Record Save'
    },

    'LOGIN': {
      api: 'POST /api/users/authenticate',
      title: 'Login'
    },

    'SITE.LOAD': {
      api: 'GET /api/version, POST /api/users/extendsession',
      title: 'Initial Site Load'
    },

    'ADMIN.LOGIN.OVERRIDE': {
      api: 'POST /api/users/authenticate',
      title: 'Login Override',
    },

    'ADMIN.OUTCOMEDOCGROUPS.LOAD': {
      api: 'GET /api/disputeoutcomedocgroups',
      title: 'Load Outcome Doc Groups'
    },

    'ADMIN.OUTCOMEDOCGROUP.REMOVE.FULL': {
      api: 'DELETE /api/outcomedocgroup, /api/outcomedocfile, /api/outcomedocdelivery',
      title: 'Outcome Doc Group Full Removal'
    },

    'ADMIN.OUTCOMEDOCFILE.CREATE': {
      api: 'POST /api/outcomedocfile',
      title: 'Outcome Doc File Creation'
    },

    'ADMIN.OUTCOMEDOCGROUP.SAVE': {
      api: 'PATCH /api/outcomedocgroup',
      title: 'Outcome Doc Group Save'
    },
    
    'ADMIN.OUTCOMEDOCGROUP.SAVE.ALL': {
      api: 'PATCH /api/outcomedocgroup/*, PATCH/POST /api/outcomedocfile/*, PATCH/POST /api/outcomedocdelivery/*',
      title: 'Outcome Doc Group Full Save'
    },

    'ADMIN.OUTCOMEDOCFILE.SAVE.ALL': {
      api: 'PATCH/POST /api/outcomedocfile/*, PATCH/POST /api/outcomedocdelivery/*',
      title: 'Outcome Doc File Full Save'
    },

    'ADMIN.OUTCOMEDOCFILE.SAVE': {
      api: 'PATCH /api/outcomedocfile',
      title: 'Outcome Doc File Save'
    },

    'ADMIN.OUTCOMEDOCFILE.REMOVE': {
      api: 'DELETE /api/outcomedocfile',
      title: 'Outcome Doc File Removal'
    },

    'ADMIN.OUTCOMEDOCDELIVERY.UNDELIVERED.LOAD': {
      api: 'GET /api/outcomedocdelivery/undelivered',
      title: 'Load Undelivered Doc Files'
    },

    'ADMIN.OUTCOMEDOCDELIVERY.SAVE': {
      api: 'POST/PATCH /api/outcomedocdelivery',
      title: 'Outcome Doc Delivery Save'
    },

    'ADMIN.OUTCOMEDOCDELIVERY.REMOVE': {
      api: 'DELETE /api/outcomedocdelivery/*',
      title: 'Outcome Doc Delivery Removal'
    },

    'ADMIN.PRIMARY.OUTCOMEDOCGROUPS.LOAD': {
      api: 'GET /api/disputeoutcomedocgroups, /api/disputefiles',
      title: 'Load Linked File Outcome Doc Groups'
    },

    'ADMIN.EVIDENCEPAGE.LOAD': {
      title: 'Load Evidence Page Data'
    },

    'ADMIN.FILE.REMOVE': {
      api: 'DELETE /api/file/*',
      title: 'File Removal'
    },

    'ADMIN.FILES.LOAD.FULL': {
      title: 'Load Full Dispute Files'
    },

    'ADMIN.USERS.LOAD': {
      api: 'GET /api/users/internaluserslist',
      title: 'Load System Users'
    },

    'ADMIN.COMMONFILES.LOAD': {
      api: 'GET /api/commonfiles',
      title: 'Load All Common Files'
    },

    'ADMIN.COMMONFILE.SAVE': {
      api: 'PATCH /api/commonfiles',
      title: 'Common File Save'
    },

    'ADMIN.COMMONFILE.REMOVE': {
      api: 'PATCH /api/commonfiles',
      title: 'Common File Removal'
    },

    'ADMIN.USER.SAVE': {
      api: 'PATCH /api/users/internaluserstatus',
      title: 'User Activate/Deactivate'
    },

    'ADMIN.USER.UPDATE': {
      api: 'PATCH /api/userlogin/update',
      title: 'User Save'
    },

    'DISPUTE.LOAD.MINIMAL': {
      api: 'GET /api/dispute',
      title: 'Load Dispute'
    },
    'DISPUTE.LOAD.FULL': {
      title: 'Load Full Dispute'
    },
    'DISPUTE.LOAD.FULL.1': {
      title: 'Load Full Dispute (1/2)'
    },
    'DISPUTE.LOAD.FULL.2': {
      title: 'Load Full Dispute (2/2)'
    },

    'DISPUTE.LOAD.CORE': {
      title: 'Load Core Dispute'
    },
    'DISPUTE.LOAD.CORE.1': {
      title: 'Load Core Dispute (1/2)'
    },
    'DISPUTE.LOAD.CORE.2': {
      title: 'Load Core Dispute (2/2)'
    },

    'STATUS.SAVE': {
      api: 'POST /api/dispute/status',
      title: 'Dispute Status Change'
    },

    'FEE.CREATE': {
      api: 'POST /api/disputefee',
      title: 'Dispute Fee Creation'
    },

    'ADMIN.DISPUTE.SAVE': {
      api: 'PATCH /api/dispute',
      title: 'Dispute Info Save',
    },
    'ADMIN.PSSO.SAVE': {
      api: 'POST /api/dispute/status',
      title: 'Dispute Process/Stage/Status/Owner Save'
    },

    'ADMIN.PAYMENTS.LOAD.FULL': {
      api: 'GET /api/disputefees',
      title: 'Load Payments'
    },

    'ADMIN.PAYMENT.ONLINE.CHECK': {
      api: 'POST /api/checkbamboratransactions',
      title: 'Validate Online Payment'
    },

    'ADMIN.FEE.LOAD': {
      api: 'GET /api/disputefee',
      title: 'Dispute Fee Load'
    },

    'ADMIN.FEE.SAVE': {
      api: 'PATCH /api/disputefee',
      title: 'Dispute Fee Save'
    },

    'ADMIN.PAYMENT.CREATE': {
      api: 'POST /api/paytransaction',
      title: 'Payment Creation'
    },

    'ADMIN.PAYMENT.SAVE': {
      api: 'PATCH /api/paytransaction',
      title: 'Payment Save',
    },

    'ADMIN.HEARING.SAVE': {
      api: 'PATCH /api/hearing',
      title: 'Hearing Save'
    },

    'ADMIN.PARTICIPATION.SAVE': {
      api: 'PATCH /api/hearingParticipation',
      title: 'Hearing Participation Save'
    },

    'ADMIN.HEARING.REASSIGN': {
      api: 'PATCH /api/hearing/reassign',
      title: 'Hearing Reassign'
    },

    'ADMIN.HEARING.RESCHEDULE': {
      api: 'PATCH /api/hearing/reschedule',
      title: 'Hearing Reschedule'
    },

    'ADMIN.HEARINGS.LOAD': {
      api: 'GET /api/disputehearings',
      title: 'Load Dispute Hearings',
    },

    'ADMIN.OWNER.HEARINGS.LOAD': {
      api: 'GET /api/ownerhearingdetail',
      title: 'Load Owner Hearings',
    },

    'ADMIN.HEARING.HISTORY.LOAD': {
      api: 'GET /api/disputehearinghistory',
      title: 'Load Hearing Linking History',
    },

    'ADMIN.HISTORY.LOAD': {
      api: 'GET /api/dispute/disputestatuses, /api/dispute/disputeprocessdetails',
      title: 'Dispute History Full Load',
    },

    'ADMIN.AUDIT.HISTORY.LOAD': {
      api: 'GET /api/audit/history',
      title: 'Load Scheduling History',
    },

    'ADMIN.AUDIT.LOAD': {
      api: 'GET /api/audit/logitems',
      title: 'Load Audit History',
    },

    'ADMIN.AUDIT.ITEM.LOAD': {
      api: 'GET /api/audit/itemdata',
      title: 'Load Audit Item',
    },

    'ADMIN.AUDIT.SERVICE.LOAD': {
      api: 'GET /api/audit/service',
      title: 'Load Service Audit ',
    },

    'ADMIN.PROCESSDETAIL.SAVE': {
      api: 'GET /api/dispute/processdetail',
      title: 'Process Detail Save',
    },
    
    'ADMIN.PARTY.SAVE': {
      api: 'PATCH /api/parties/participant',
      title: 'Dispute Participant Save',
    },
    'ADMIN.PARTY.PRIMARY': {
      api: 'PATCH /api/parties/claimgroupparticipant',
      title: 'Primary Applicant Change',
    },
    'ADMIN.PARTY.CREATE': {
      api: 'POST /api/parties/*',
      title: 'Dispute Participant Creation',
    },
    'ADMIN.PARTY.REMOVE': {
      api: 'PATCH /api/parties/participant',
      title: 'Dispute Participant Removal',
    },
    'ADMIN.PARTY.AMEND_REMOVE': {
      api: 'PATCH /api/parties/participant',
      title: 'Dispute Participant Removal (Amendment)',
    },
    'ADMIN.PARTY.AMEND_PRIMARY': {
      api: 'PATCH /api/parties/claimgroupparticipant',
      title: 'Primary Applicant Change (Amendment)',
    },
    
    'ADMIN.CLAIM.SAVE': {
      api: 'PATCH /api/issues/*',
      title: 'Issue Save',
    },
    'ADMIN.CLAIM.CREATE': {
      api: 'POST /api/issues/*',
      title: 'Issue Creation',
    },
    'ADMIN.CLAIM.AMEND_CREATE': {
      api: 'POST /api/issues/*',
      title: 'Issue Creation (Amendment)',
    },
    'ADMIN.CLAIM.REMOVE': {
      api: 'DELETE /api/issues/*',
      title: 'Issue Removal',
    },

    'ADMIN.REMEDY.SAVE': {
      api: 'PATCH /api/issues/remedy',
      title: 'Remedy Save',
    },

    'ADMIN.DISPUTES.UNASSIGNED.LOAD': {
      api: 'GET /api/unassigneddisputes',
      title: 'Load Unassigned Disputes'
    },

    'ADMIN.DISPUTES.ASSIGNED.LOAD': {
      api: 'GET /api/assigneddisputes',
      title: 'Load Assigned Disputes'
    },

    'ADMIN.DIPSUTE.INCOMPLETE.CHECK': {
      api: 'GET /api/WorkflowReports/incompletedisputeitems',
      title: 'Load Dispute Incomplete Items'
    },

    'ADMIN.ADHOC_REPORTS.LOAD': {
      api: 'GET /api/adhocdlreport',
      title: 'Load AdHoc Reports'
    },

    'ADMIN.ADHOC_REPORT.LOAD': {
      api: 'POST /api/adhocdlreport',
      title: 'Load AdHoc Report'
    },

    'ADMIN.TASKS.UNASSIGNED.LOAD': {
      api: 'GET /api/unassignedtasks',
      title: 'Load Unassigned Tasks'
    },

    'ADMIN.TASKS.LOAD': {
      api: 'GET /api/disputetasks',
      title: 'Load Dispute Tasks'
    },

    'ADMIN.TASK.SAVE': {
      api: 'POST/PATCH /api/task',
      title: 'Task Save'
    },

    'ADMIN.TASK.LOAD': {
      api: 'GET /api/task',
      title: 'Task Load'
    },

    'ADMIN.MYTASKS.LOAD': {
      api: 'GET /api/ownertasks',
      title: 'Load User Tasks'
    },

    'ADMIN.NOTICE.LOAD': {
      api: 'GET /api/disputenotices',
      title: 'Load Dispute Notice'
    },

    'ADMIN.NOTICE.SAVE': {
      api: 'PATCH /api/notice',
      title: 'Notice Save'
    },

    'ADMIN.NOTICE.REMOVE': {
      api: 'DELETE /api/notice',
      title: 'Notice Removal'
    },

    'ADMIN.NOTICE.CLEANUP': {
      title: 'Prepare Notice Data'
    },

    'ADMIN.NOTICESERVICE.SAVE': {
      api: 'POST/PATCH /api/noticeservice',
      title: 'Notice Service Save'
    },

    'ADMIN.FILES.UPLOAD': {
      api: 'POST /api/file',
      title: 'File Upload'
    },

    'ADMIN.LINKFILE.CREATE': {
      api: 'POST /api/linkfile',
      title: 'File Link Creation'
    },

    'ADMIN.PDF.GENERATE': {
      api: 'POST /api/file/PDFfromhtml',
      title: 'PDF Creation'
    },

    'ADMIN.SUBSERVICE.LOAD': {
      api: 'GET /api/disputesubstitutedservices',
      title: 'Load Sub Services'
    },

    'ADMIN.SAVE.SERVICE': {
      title: 'Save Service'
    },

    'ADMIN.AMENDMENTS.LOAD': {
      api: 'GET /api/disputeamendments',
      title: 'Load Amendments'
    },

    'ADMIN.AMENDMENTS.SAVE': {
      api: 'POST/PATCH /api/amendment/*',
      title: 'Amendments Save'
    },

    'ADMIN.AMENDMENT.DISPUTE.SAVE': {
      api: 'POST /api/amendment',
      title: 'Dispute Info Save - Create Amedment',
    },
    'ADMIN.AMENDMENT.PARTY.CREATE': {
      api: 'POST /api/amendment',
      title: 'Participant Creation - Create Amendment',
    },
    'ADMIN.AMENDMENT.PARTY.REMOVE': {
      api: 'POST /api/amendment',
      title: 'Participant Removal - Create Amendment',
    },
    'ADMIN.AMENDMENT.PARTY.SAVE': {
      api: 'POST /api/amendment',
      title: 'Participant Save - Create Amendment',
    },
    'ADMIN.AMENDMENT.PARTY.PRIMARY': {
      api: 'POST /api/amendment',
      title: 'Change Primary Applicant - Create Amendment',
    },
    'ADMIN.AMENDMENT.CLAIM.CREATE': {
      api: 'POST /api/amendment',
      title: 'Issue Creation - Create Amendment',
    },
    'ADMIN.AMENDMENT.CLAIM.REMOVE': {
      api: 'POST /api/amendment',
      title: 'Issue Removal - Create Amendment',
    },
    'ADMIN.AMENDMENT.CLAIM.SAVE': {
      api: 'POST /api/amendment',
      title: 'Issue Save - Create Amendment',
    },

    'ADMIN.HEARING.LOAD': {
      api: 'GET /api/hearing/',
      title: 'Load Hearing',
    },

    'ADMIN.DISPUTEHEARINGS.SAVE': {
      api: 'POST/PATCH /api/disputehearing/*',
      title: 'Dispute/Hearing Links Save',
    },

    'ADMIN.DISPUTEHEARINGS.DELETE': {
      api: 'DELETE /api/disputehearing/*',
      title: 'Dispute/Hearing Links Removal',
    },

    'ADMIN.DISPUTEHEARING.SAVE': {
      api: 'POST/PATCH /api/disputehearing',
      title: 'Dispute/Hearing Link Save',
    },

    'ADMIN.DISPUTEHEARING.DELETE': {
      api: 'DELETE /api/disputehearing',
      title: 'Dispute/Hearing Link Removal',
    },

    'ADMIN.SCHEDULE.DAILY': {
      api: 'GET /api/dailyhearingdetail',
      title: 'Load Daily Schedule'
    },

    'ADMIN.SCHEDULE.AVAILABLE.STAFF': {
      api: 'GET /api/availablestaff',
      title: 'Load Available Staff'
    },

    'ADMIN.SCHEDULE.AVAILABLE.CONFERENCES': {
      api: 'GET /api/availableconferencebridges',
      title: 'Load Available Conference Bridges'
    },

    'ADMIN.SCHEDULE.REQUESTS.LOAD': {
      api: 'GET /api/schedulemanager/schedulerequest',
      title: 'Load Schedule Requests'
    },

    'ADMIN.COMMUNICATIONS.LOAD': {
      api: 'GET /api/disputeemailmessages, /api/disputenotes',
      title: 'Load Communications'
    },

    'ADMIN.NOTE.SAVE': {
      api: 'POST/PATCH /api/note',
      title: 'Dispute Note Save'
    },

    'ADMIN.NOTE.REMOVE': {
      api: 'DELETE /api/note',
      title: 'Dispute Note Removal'
    },

    'ADMIN.NOTES.LOAD': {
      api: 'GET /api/disputenotes',
      title: 'Load Dispute Notes'
    },

    'ADMIN.EMAIL.REMOVE': {
      api: 'DELETE /api/email',
      title: 'Email Removal'
    },

    'ADMIN.EMAIL.SEND': {
      api: 'POST/PATCH /api/email',
      title: 'Email Send'
    },

    'ADMIN.EMAILS.SAVE': {
      api: 'POST/PATCH /api/email/*',
      title: 'Emails Save'
    },

    'ADMIN.EMAIL.LOAD': {
      api: 'GET /api/email/',
      title: 'Load Email'
    },

    'ADMIN.FILEDESCRIPTION.SAVE': {
      api: 'POST/PATCH /api/filedescription',
      title: 'File Description Save'
    },

    'ADMIN.USER.DISPUTE.ACCESS': {
      api: 'POST/PATCH /api/dispute/disputeUserActive',
      title: 'Dispute User Active'
    },

    'OS.DISPUTE.LOAD': {
      api: 'GET /api/externalupdate/disputedetails',
      title: 'Load Dispute'
    },

    'OS.DISPUTE.CREATE': {
      api: 'POST /api/externalupdate/newdispute',
      title: 'Create Dispute'
    },

    'OS.DISPUTE.SAVE': {
      api: 'POST /api/externalupdate/disputeinfo',
      title: 'Save Dispute'
    },

    'OS.STATUS.SAVE': {
      api: 'POST /api/externalupdate/disputestatus',
      title: 'Dispute Status Change'
    },

    /* Start DA error items */
    'DA.DISPUTE.LOAD': {
      api: 'POST /api/accesscodelogin',
      title: 'Dispute Load'
    },

    'DA.ACTION.FILEUPLOAD': {
      api: 'POST /api/file, /api/filedescription',
      title: 'Upload Files and Evidence',
    },

    'DA.PAYMENT.RETURN': {
      api: 'PATCH /api/payments',
      title: 'Dispute Access Payment Verification'
    },

    'EXTERNAL.PAYMENT.SAVE': {
      api: 'POST/PATCH /api/disputefee, POST /api/externalupdate/paymenttransaction',
      title: 'External Payment Creation'
    },

    'FILEPACKAGE.CREATE': {
      api: 'POST /api/filepackage',
      title: 'File Package Creation',
    },

    'FILEPACKAGE.SAVE': {
      api: 'PATCH /api/filepackage',
      title: 'File Package Save',
    },

    'OS.EVIDENCE.CREATE': {
      api: 'POST /api/filedescription',
      title: 'Evidence Creation',
    },

    'OS.PAYMENT.SAVE': {
      api: 'POST /api/externalupdate/paymenttransaction | PATCH /api/paytransaction',
      title: 'Payment Transaction Save'
    },

    'OS.FEE.SAVE': {
      api: 'PATCH /api/disputefee',
      title: 'Dispute Fee Save'
    },

    'OS.REQUEST.AMEND.TASK': {
      api: 'POST /api/task',
      title: 'Amendment Request - Task Creation',
    },

    'OS.REQUEST.AMEND.NOTICE': {
      api: 'POST /api/externalupdate/notice',
      title: 'Amendment Request - Notice Creation',
    },

    'OS.REQUEST.SUBSERVICE.TASK': {
      api: 'POST /api/task',
      title: 'Substitute Service Request - Task Creation',
    },
    
    'OS.REQUEST.SUBSERVICE.CREATE': {
      api: 'POST /api/substitutedservice',
      title: 'Substitute Service Request - Service Creation',
    },

    'OS.REQUEST.TASK': {
      api: 'POST /api/task',
      title: 'OS Request - Task Creation',
    },

    'DA.NOTICESERVICE.SAVE': {
      api: 'PATCH /api/externalupdate/noticeservice',
      title: 'Notice Service Proof Change'
    },

    'DA.STATUS.SAVE': {
      api: 'POST /api/externalupdate/disputestatus',
      title: 'Dispute Status Change',
    },

    'DA.FILEDESCRIPTION.CREATE': {
      api: 'POST /api/filedescription',
      title: 'Evidence Creation'
    },
    
    'POSTED.DECISIONS.LOAD': {
      api: 'GET /api/posteddecision',
      title: 'Posted Decision Search'
    },

    'OUTCOME.DOC.REQUEST.CREATE': {
      api: 'POST /api/outcomedocrequests/outcomedocrequest',
      title: 'Outcome Document Request Creation'
    },

    'OUTCOME.DOC.REQUEST.SAVE': {
      api: 'PATCH /api/outcomedocrequests/outcomedocrequest',
      title: 'Outcome Document Request Change'
    },

    'OUTCOME.DOC.REQUEST.ITEM.CREATE': {
      api: 'POST /api/outcomedocrequests/outcomedocrequestitem',
      title: 'Outcome Document Request Creation'
    },

    'OUTCOME.DOC.REQUEST.ITEM.SAVE': {
      api: 'PATCH /api/outcomedocrequests/outcomedocrequestitem',
      title: 'Outcome Document Request Item Change'
    },

    'ACCESS.TOKEN.RECOVERY': {
      api: 'POST /api/accesscoderecovery',
      title: 'Access Code Recovery'
    },

    'DISPUTE.FLAGS.LOAD': {
      api: 'GET /api/linkeddisputeflags',
      title: 'Linked Dispute Flags'
    },

    'DISPUTE.FLAG.SAVE': {
      api: 'GET /api/linkeddisputeflags',
      title: 'Dispute Flags'
    },

    'HEARING.RESERVATION': {
      api: 'POST /api/hearings/holdhearing',
      title: 'Hold Hearing'
    },

    'HEARING.CANCEL.RESERVATION': {
      api: 'POST /api/hearings/cancelreservedhearing',
      title: 'Cancel Hearing Hold'
    },

    'SCHEDULE.REQUEST.SUBMIT': {
      api: 'POST /api/schedulemanager​/schedulerequest​/newschedulerequest',
      title: 'Submit Schedule Request'
    },

    'SCHEDULE.REQUEST.SAVE': {
      api: 'PATCH /api/schedulemanager​/schedulerequest​/newschedulerequest',
      title: 'Update Schedule Request'
    },

    'SCHEDULE.REQUEST.LOAD': {
      api: 'GET /api/schedulemanager​/schedulerequest​',
      title: 'Schedule Requests'
    },

    'SCHEDULE.PERIODS.LOAD': {
      api: 'GET /api/schedulemanager​/scheduleperiods',
      title: 'Schedule Periods'
    },

    'SCHEDULE.PERIODS.CREATE': {
      api: 'POST /api/schedulemanager​/scheduleperiods',
      title: 'Create Schedule Period'
    },

    'SCHEDULE.PERIODS.SAVE': {
      api: 'PATCH /api/schedulemanager​/scheduleperiods',
      title: 'Update Schedule Period'
    },

    'SCHEDULE.REQUEST.DELETE': {
      api: 'DELETE /api/schedulemanager​/schedulerequest​/newschedulerequest',
      title: 'Delete Schedule Request'
    },

    'SCHEDULE.BLOCK.CREATE': {
      api: 'POST /api/schedulemanager/scheduledblock',
      title: 'Create Scheduled Block'
    },

    'SCHEDULE.BLOCK.UPDATE': {
      api: 'PATCH /api/schedulemanager/scheduledblock',
      title: 'Update Scheduled Block'
    },

    'SCHEDULE.BLOCK.DELETE': {
      api: 'DELETE /api/schedulemanager/scheduledblock',
      title: 'Scheduled Block Removal'
    },

    'SCHEDULE.PERIODS.LOAD': {
      api: 'GET /api/schedulemanager/scheduleperiod',
      title: 'Scheduled Period Update'
    },

    'SCHEDULE.PERIOD.SAVE': {
      api: 'PATCH /api/schedulemanager/scheduleperiod',
      title: 'Scheduled Period Update'
    },

    'PICKUP.SET.SAVE': {
      api: 'PATCH /api/externalupdate/setpickupmessagestatus',
      title: 'Set Pickup Message Status'
    },

    'PICKUP.MESSAGE.LOAD': {
      api: 'PATCH api/externalupdate/pickupmessage',
      title: 'Get Pickup Message'
    },

    'EXTERNAL.CUSTOM.LOAD': {
      api: 'GET /api/externalcustomdataobjects',
      title: 'Get External Custom Objects'
    },

    'EXTERNAL.CUSTOM.LOAD.FILES': {
      api: 'GET /api/externalfiles',
      title: 'Get Files for External Object'
    },

    'EXTERNAL.CUSTOM.SAVE': {
      api: 'PATCH /api/externalcustomdataobject',
      title: 'Save External Custom Object'
    },

    'CP.ADDRESS.LOOKUP': {
      api: 'GET /AddressLookup',
      title: 'Address Lookup'
    },

    'EMAIL.VERIFICATION.MESSAGE': {
      api: 'POST /emailverificationmessage',
      title: 'Email Verification Message'
    },

    'EMAIL.CONTACT.VERIFICATION.SAVE': {
      api: 'POST /contactverification',
      title: 'Contact Verification'
    }

  },

  // Helper methods for external callers
  isErrorResponse(apiResponse) {
    return _.isArray(apiResponse) ? apiResponse.length > 2 && apiResponse[1] === 'error' :
      (_.isObject(apiResponse) ? apiResponse.status !== 200 : false);
  },

  // handlerId handlerId which can do different things depending on the handler
  createHandler(actionId, onCloseFn, closingMsg) {
    try {
      const errorAction = _.isString(actionId) && this.ERROR_ACTION_CONFIG[actionId] ? this.ERROR_ACTION_CONFIG[actionId] : null;
      const actionTitle = errorAction ? errorAction.title : null;
      const actionApi = errorAction ? errorAction.api : null;

      // ErrorResponseHandler requires a close action; use no-op function if no onCloseFn was provided
      onCloseFn = _.isFunction(onCloseFn) ? onCloseFn : () => {};

      const errorResponseHandler = new ErrorResponseHandler(actionTitle, actionApi, onCloseFn);
      
      return (apiErrorResponse) => {
        console.log(`[Info] Handling error:`, apiErrorResponse);
        apiErrorResponse = apiErrorResponse || {};
        const status = apiErrorResponse.status;
        errorResponseHandler._apiErrorResponse = apiErrorResponse;

        if (status === 401 || (typeof status === 'undefined' && !sessionChannel.request('is:authorized'))) {
          // Ignore, let the global unauthorized handler deal with this.
          // Sometimes, a 401 is not passed in the error.  In this case, check token and suppress general message
          return;
        }

        let displayFn, sideEffectOnDisplayFn;
        if (status === 400) {
          displayFn = this.showErrorModalAsHttp400;
        } else if (status === 409) {
          displayFn = this.showErrorModalAsHttp409;
        } else if (status === 500) {
          displayFn = this.showErrorModalAsHttp500;
          sideEffectOnDisplayFn = () => Radio.channel('api').request('create:errorlog', {
            error_details: `${errorResponseHandler?.apiErrorResponse?.responseText}`.substring(0, 2450),
            error_type: configChannel.request('get', 'ERROR_TYPE_SERVER_ERROR'),
          });
        } else {
          displayFn = this.showErrorModalDefault;
        }

        if (sideEffectOnDisplayFn && typeof actionFn === 'function') sideEffectOnDisplayFn?.bind(this)(errorResponseHandler);
        displayFn.bind(this)(errorResponseHandler, closingMsg);
      };
    } catch (err) {
      console.trace(`[Error] Unexpected JavaScript error occurred during API error handler: `, err);
    }
  },

  addErrorResponseDisplayToHtml(errorResponseHandler, html) {
    const actionApi = errorResponseHandler.actionApi;
    const responseJSON = errorResponseHandler.apiErrorResponse && errorResponseHandler.apiErrorResponse.responseJSON;
    let responseText = errorResponseHandler.apiErrorResponse && errorResponseHandler.apiErrorResponse.responseText;
    responseText = _.isString(responseText) ? $.trim(responseText) : responseText;

    if (_.isEmpty(responseJSON) && !$.trim(responseJSON)) {
      return html;
    }

    return `${html}
      <div style="margin:20px 0 5px 0;"><b>Error Details</b></p>
      ${actionApi ? `<span>Request:<br/></span><pre>${actionApi}</pre>` : ''}
      <span>Response:<br/></span>
      ${responseJSON ? `<pre>${JSON.stringify(responseJSON, null, 4)}</pre>` : ''}
      ${!responseJSON && responseText ? `<pre>${responseText}</pre>` : ''}`;
  },

  showErrorModalAsHttp400(errorResponseHandler, closingMsg) {
    const modalBody = `<p>An unexpected application error occurred ${errorResponseHandler._actionTitle ? 'during the above action ' : ''}and the data may be in an incorrect state.</p>${closingMsg ? closingMsg : ''}`;
    return this.showErrorResponseHandlerModalWithAction(errorResponseHandler, this.ERROR_MODAL_TITLES['HTTP.400'],
      this.addErrorResponseDisplayToHtml(errorResponseHandler, modalBody));
  },

  showErrorModalAsHttp409(errorResponseHandler, closingMsg) {
    const modalBody = `<p>We have detected that${errorResponseHandler._actionTitle ? ', during the above action, ' : ''}the information you are trying to update has been changed in another device, browser window or tab.</p>${closingMsg ? closingMsg : ''}`;
    return this.showErrorResponseHandlerModalWithAction(errorResponseHandler, this.ERROR_MODAL_TITLES['HTTP.409'],
      this.addErrorResponseDisplayToHtml(errorResponseHandler, modalBody));
  },

  showErrorModalAsHttp500(errorResponseHandler, closingMsg) {
    const modalBody = `<p>An unexpected network or server error occurred ${errorResponseHandler._actionTitle ? 'during the above action ' : ''}and the data may be in an incorrect state.</p>${closingMsg ? closingMsg : ''}`;
    return this.showErrorResponseHandlerModalWithAction(errorResponseHandler, this.ERROR_MODAL_TITLES['HTTP.500'],
      this.addErrorResponseDisplayToHtml(errorResponseHandler, modalBody));
  },

  showErrorModalDefault(errorResponseHandler, closingMsg) {
    const modalBody = `<p>An unexpected error occurred ${errorResponseHandler._actionTitle ? 'during the above action ' : ''}and the data may be in an incorrect state.</p>${closingMsg ? closingMsg : ''}`;
    return this.showErrorResponseHandlerModalWithAction(errorResponseHandler, this.ERROR_MODAL_TITLES['DEFAULT'],
      this.addErrorResponseDisplayToHtml(errorResponseHandler, modalBody));
  },

  showErrorResponseHandlerModalWithAction(errorResponseHandler, modalTitle, modalBody) {
    errorResponseHandler._modalTitle = modalTitle;
    errorResponseHandler._modalBody = `${errorResponseHandler._actionTitle ? `<p>Encountered during action: <b>${errorResponseHandler._actionTitle}</b></p>` : ''}${modalBody}`;
    return errorResponseHandler.showErrorModal();
  }

});

export const generalErrorFactory = new ErrorResponseFactory();
