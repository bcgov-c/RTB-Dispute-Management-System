/**
 * @class core.components.model.CMModel
 * @memberof core.components.model
 * @extends Backbone.Model
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Formatter from '../formatter/Formatter';

const apiChannel = Radio.channel('api');

export default Backbone.Model.extend({
  // NOTE: This needs to be overwritten by implementation
  API_SAVE_ATTRS: null,

  // Attributes in here are only valid for post and will only be added for the POST
  API_POST_ONLY_ATTRS: null,

  // Attributes in here are only valid for patch and will only be added for the PATCH
  API_PATCH_ONLY_ATTRS: null,

  // NOTE: A value can be provided here to enable auto-initiallizing and auto-parsing into a nested Collection
  // format: name: <collection class to create>
  // The collection name provided needs to be the same as the API name and the same as the internal model name
  // The collection class to create is the class that will be created
  nested_collections_data: null,

  // This can be overwritten, but make sure to call this initialize after in order to save snapshot data
  initialize() {
    this.set('_originalData', {});
    this.on('sync', function() {
      this.mergeLocalAndApiData();
      this.trigger('sync:complete');
    }, this);

    if (!this.isNew()) {
      // Only merge data and save snapshot if we have a model with API changes
      this.mergeLocalAndApiData();
    }

    // Allow functions for option "nested_collections_data"
    if (this.nested_collections_data && typeof this.nested_collections_data === 'function') {
      this.nested_collections_data = this.nested_collections_data();
    }
    // Now parse any nested collections
    _.each(_.keys(this.nested_collections_data), function(collection_name) {
      const collection_class = this.nested_collections_data[collection_name];
      this.set(collection_name, this.parseNestedCollection(this.toJSON(), collection_name, collection_class));
    }, this);
  },

  // Every time we fetch and sync, save a "snapshot" of the data so we can compare on-save
  mergeLocalAndApiData() {
    this.saveApiSnapshotOfData();
  },

  getApiSavedAttr(attribute) {
    const apiData = this.getApiSnapshotOfData();
    return _.has(apiData, attribute) ? apiData[attribute] : null;
  },

  pickWhitelistedAttrs(attrs) {
    const whitelisted_attrs = {};
    if (this.isNew()) {
      // Get the values that should only be sent on post
      if (this.API_POST_ONLY_ATTRS !== null) {
        _.extend(whitelisted_attrs, _.pick(attrs, this.API_POST_ONLY_ATTRS));
      }
    } else if (this.API_PATCH_ONLY_ATTRS !== null) {
      _.extend(whitelisted_attrs, _.pick(attrs, this.API_PATCH_ONLY_ATTRS));
    }

    if (this.API_SAVE_ATTRS !== null ) {
      // Filter the data to send to the server
      _.extend(whitelisted_attrs, _.pick(attrs, this.API_SAVE_ATTRS));
    } else {
      _.extend(whitelisted_attrs, attrs);
    }
    return whitelisted_attrs;
  },

  save(attrs, options) {
    // Default to not to validate on save, because sometimes we unset fields
    // Always wait for the server response and parse back to get correct IDs
    options = _.extend({ validate: false, wait: true, parse: true, send_nulls: false}, options || {});
    attrs = attrs || _.clone(this.attributes);

    const dfd = $.Deferred();    
    const whitelisted_attrs = this.pickWhitelistedAttrs(attrs);
    if (_.isEmpty(whitelisted_attrs)) {
      return dfd.resolve().promise();
    }

    // NOTE: General system API rule - we don't use empty string, we instead use null
    // Convert "" to nulls
    _.each(whitelisted_attrs, function(val, key) {
      if (val === '') {
        whitelisted_attrs[key] = null;
      }
    });

    if (this.isNew()) {
      options.type = "POST";
      // NOTE: If model is new, don't POST null to fields - they should already be null by default
      if (!options.send_nulls) {
        _.each(whitelisted_attrs, function(val, key) {
          if (val === null) {
            delete whitelisted_attrs[key];
          }
        });
      }
    } else {
      options.type = "PATCH";
      options.patch = true;

      if (this.get('modified_date') && !options.skip_conflict_check) {
        // NOTE: Add extra collision-detection header
        if (!_.has(options, 'headers')) {
          options.headers = {};
        }
        _.extend(options.headers, {
          'If-Unmodified-Since': Formatter.toIfUnmodifiedDate(Moment(this.get('modified_date')))
        });
      }
    }

    options.contentType = "application/json";
    if (options.singleton_batch) {
      options.data = JSON.stringify([whitelisted_attrs]);
      Backbone.Model.prototype.save.call(this, whitelisted_attrs, options).done(function(response) {
        dfd.resolve(_.isArray(response) && response.length === 1 ? response[0] : response);
      }).fail(dfd.reject);
      return dfd.promise();
    } else {
      options.data = JSON.stringify(whitelisted_attrs);
      return Backbone.Model.prototype.save.call(this, whitelisted_attrs, options);
    }
  },

  // This parse will look at any nested collections and try to re-parse them into the correct objects
  parse(response, options) {
    const parse_response = Backbone.Model.prototype.parse.call(this, response, options);
    if (this.nested_collections_data) {
      _.each(_.keys(this.nested_collections_data), function(collection_name) {
        const collection_class = this.nested_collections_data[collection_name];
        parse_response[collection_name] = this.parseNestedCollection(parse_response, collection_name, collection_class);
      }, this);
    }
    return parse_response;
  },

  parseNestedCollection(model_response_data, collection_name, collection_class) {
    model_response_data = model_response_data || {};
    let nested_collection;
    if (model_response_data[collection_name] instanceof Backbone.Collection) {
      nested_collection = model_response_data[collection_name];
    } else {
      if (this.get(collection_name) instanceof Backbone.Collection) {
        if (_.has(model_response_data, collection_name)) {
          this.get(collection_name).reset(model_response_data[collection_name]);
        }
        nested_collection = this.get(collection_name);
      } else {
        nested_collection = new collection_class( model_response_data[collection_name] );
      }
    }
    return nested_collection;
  },


  fetch(options) {
    // Turn parsing on by default
    options = _.extend({}, { parse: true }, options);
    if (options.singleton_batch) {
      const dfd = $.Deferred();
      Backbone.Model.prototype.fetch.call(this, options).done(function(response) {
        dfd.resolve(_.isArray(response) && response.length === 1 ? response[0] : response);
      }).fail(dfd.reject);
      return dfd.promise();
    } else {
      return Backbone.Model.prototype.fetch.call(this, options);
    }
  },

  destroy(options) {
    // Always wait for the server response before continuing with deletes
    options = _.extend({ wait: true }, options || {});
    if (this.get('modified_date') && !options.skip_conflict_check) {
      // NOTE: Add extra collision-detection header
      if (!_.has(options, 'headers')) {
        options.headers = {};
      }
      _.extend(options.headers, {
        'If-Unmodified-Since': Formatter.toIfUnmodifiedDate( Moment(this.get('modified_date')) )
      });
    }

    if (!apiChannel.request('check:delete', this) && !this.isNew()) {
      apiChannel.request('track:delete', this);
    }
    
    const destroyReturn = Backbone.Model.prototype.destroy.call(this, options);
    // Backbone.Model .destroy() will  return false if model is new
    return _.isBoolean(destroyReturn) ? $.Deferred().resolve().promise() : destroyReturn;
  },

  sync() {
    // Any time the model has sync'd with the server, update the local "refresh" time
    this.set('refreshTime', Moment());
    return Backbone.Model.prototype.sync.call(this, ...arguments);
  },


  // Reset values to the last saved API snapshot
  resetModel() {
    const data_snapshot = this.get('_originalData');
    if (data_snapshot && !_.isEmpty(data_snapshot)) {
      this.set(this.get('_originalData'), {silent: true});
    } else {
      this.clear({silent: true}).set(this.defaults, {silent: true});
    }
  },

  // Store a local version of the api snapshot
  saveApiSnapshotOfData() {
    this.set('_originalData', this.getPageApiDataAttrs());
  },

  getApiSnapshotOfData() {
    return this.get('_originalData');
  },

  getApiChangesOnly() {
    if (!this.needsApiUpdate()) {
      return {};
    } else {
      const data_snapshot = this.get('_originalData') || {};
      return _.omit(this.getPageApiDataAttrs(), function(val, key) {
        return val === data_snapshot[key];
      }, this);
    }
  },

  // Checks the saved data snapshot to see if it requires an update, OR if it's new
  needsApiUpdate(options) {
    options = options || {};
    const data_snapshot = this.get('_originalData');
    // If we are on update only, then the original data can be empty, and only send changes
    if (options.update_only && this.isNew()) {
      return _.any(this.getPageApiDataAttrs(), function(val, key) {
        if (key === options.ignore_key) {
          return false;
        }
        return val;
      });
    } else {
      const page_api_data = this.getPageApiDataAttrs();
      return this.isNew() || !data_snapshot || _.isEmpty(data_snapshot) || !_.isEqual(data_snapshot, page_api_data);
    }
  },

  // Default implementation.  Can be overwritten for models that have more complex logic
  getPageApiDataAttrs() {
    return _.pick(this.toJSON(), _.union(this.API_POST_ONLY_ATTRS, this.API_PATCH_ONLY_ATTRS, this.API_SAVE_ATTRS));
  }
});
