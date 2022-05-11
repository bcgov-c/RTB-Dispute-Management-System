import Backbone from 'backbone';
import MenuItemModel from './MenuItem_model';

// Expect less than 50 tabs for one group
const MAX_TABS_PER_GROUP = 50;
// Add this interval between named groups
const SORT_GROUP_OFFSET = 10000;

export default Backbone.Collection.extend({
  model: MenuItemModel,


  initialize() {
    Backbone.Collection.prototype.initialize.call(this, ...arguments);
    
    this._disputeCache = {};
  },

  _rank_compare(model) {
    if (model.isTitle()) {
      // Titles are always first within a group
      return 0;
    }
    const rank = model.get('rank');
    return rank ? rank : MAX_TABS_PER_GROUP;
  },
  _dispute_compare(model) {
    // Get the earliest menu creation time of all tabs related to this dispute
    const disputeGuid = model.get('dispute_guid');
    const disputeGroup = this.models.filter(m => m.get('dispute_guid') === disputeGuid && disputeGuid).map(m => (
      m.get('created_date') ? Number(Moment(m.get('created_date'))) : null)).filter(_date => _date);
    const earliestCreatedDate = Math.min.apply(Math, disputeGroup);
    return String(earliestCreatedDate || '').padEnd(10, '0');
  },

  comparator(model) {
    let order = Infinity;
    switch(model.get('group')) {
      case 'search_dashboard':
        order = SORT_GROUP_OFFSET + this._rank_compare(model);
        break;
      case 'general_dashboard':
        order = SORT_GROUP_OFFSET*2 + this._rank_compare(model);
        break;
      case 'admin_dashboard': 
        order = SORT_GROUP_OFFSET*3 + this._rank_compare(model);
        break;
      case 'ceu_complaints_dashboard':
        order = SORT_GROUP_OFFSET*4 + this._rank_compare(model);
        break;
      case 'report_viewer_dashboard':
        order = SORT_GROUP_OFFSET*5 + this._rank_compare(model);
        break;
      case 'schedule_manager_dashboard':
        order = SORT_GROUP_OFFSET*6 + this._rank_compare(model);
        break;
      case 'scheduler_dashboard':
        order = SORT_GROUP_OFFSET*7 + this._rank_compare(model);
        break;
      case 'arb_dashboard':
        order = SORT_GROUP_OFFSET*8 + this._rank_compare(model);
        break;
      case 'io_dashboard':
        order = SORT_GROUP_OFFSET*9 + this._rank_compare(model);
        break;
      case 'dispute':
        // NOTE: dispute_guid offset added will be large, means disputes will be last items in list
        order = SORT_GROUP_OFFSET*9 + this._dispute_compare(model) + this._rank_compare(model);
        break;
      default: break;
    }

    // Set what the order is on the model, may be needed for debugging errors
    model.set('_derived_order', order);
    return order;
  }
});