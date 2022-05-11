import Backbone from 'backbone';
import SearchResultItemModel from './SearchResultItem_model';

export default Backbone.Collection.extend({
  model: SearchResultItemModel,

  DEFAULT_API_COUNT: 20,

  // Holds data for the last-used request so subsequent requests can be called
  lastUsedRequest: null,
  totalAvailable: null,
  lastUsedFetchIndex: null,
  lastUsedFetchCount: null,
  
  hasMoreAvailable(options) {
    options = options || {};
    
    // It has more available if the current length is less than the reported total,
    // and if we haven't searched for more records (request.count) than are reportedly available,
    // and if we haven't already tried to load more counts than was actually loaded (count > length)
    // The latter condition can be ignored off by passing { ignore_count_length_difference: true } in param options
    return Number(this.totalAvailable) > 0
      && this.totalAvailable > this.length
      && this.lastUsedFetchCount <= this.totalAvailable
      && (options.ignore_count_length_difference ? true : this.lastUsedFetchCount <= this.length);
  }
});
