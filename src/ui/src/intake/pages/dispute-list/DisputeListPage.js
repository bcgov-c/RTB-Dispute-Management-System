import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeListItem from './DisputeListItem';
import template from './DisputeListPage_template.tpl';

const OFFSET_HEIGHT_FOR_SCROLL = 20;

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const applicationChannel = Radio.channel('application');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const sessionChannel = Radio.channel('session');

/**
 * @class intake.pages.dispute-list.EmptyDisputeListView
 * @memberof intake.pages.dispute-list
 * @augments Marionette.View
 */
const EmptyDisputeListView = Marionette.View.extend({
  tagName: 'tr',
  className: 'dispute-list-none-box',
  template: `<td colspan="4" class="dispute-list-none-text">You have no disputes or applications.</td>`,
});


const filterDisputeList = (listItemModel) => !listItemModel.isMigrated() && !listItemModel.isUnitType();

/**
 * @class intake.pages.dispute-list.DisputeListView
 * @memberof intake.pages.dispute-list
 * @augments Marionette.CollectionView
 */
const DisputeListView = Marionette.CollectionView.extend({
  template: `<tbody></tbody>`,
  tagName: 'table',
  className: 'table table-hover',

  childView: DisputeListItem,
  emptyView: EmptyDisputeListView,
  
  filter(model) {
    return filterDisputeList(model);
  }
});

/**
 * @class intake.pages.dispute-list.DisputeListPageView
 * @memberof intake.pages.dispute-list
 * @augments Marionette.View
 */
export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'page dispute-list-page',

  regions: {
    disputeListRegion: '#disputes'
  },

  ui: {
    'start': 'button.dispute-list-start',
    'logout': 'a.appplication-logout',
    alternateIntakeLink: '.dispute-list-alternate-link'
  },

  events: {
    'click @ui.start': 'startDispute',
    'click @ui.logout': 'clickLogout',
    'click @ui.alternateIntakeLink': 'clickAlternateIntakeLink'
  },

  startDispute() {
    loaderChannel.trigger('page:load');
    disputeChannel.request('create');
  },

  clickLogout() {
    Backbone.history.navigate('logout', { trigger: true });
  },

  clickAlternateIntakeLink() {
    if (!this.alternateIntakeLink) {
      return;
    }

    modalChannel.request('show:standard', {
      title: 'Confirm Site Change',
      bodyHtml: `<p>If you continue you will leave your standard dispute file list and be taken to your list of additional landlord files.  If you want to stay on the current list, click 'Cancel'.</p>`,
      onContinue: (modalView) => {
        loaderChannel.trigger('page:load');
        modalView.close();
        window.location.href = this.alternateIntakeLink;
      }
    });
  },

  /**
   * @param {Collection} collection -
   * @param {Number} total_available_records - 
   */
  initialize(options) {
    this.mergeOptions(options, ['total_available_records']);

    const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');
    this.alternateIntakeLink = INTAKE_URL && INTAKE_URL.replace('/Intake', '/AdditionalLandlordIntake').replace('/Login', '');

    this._lock_dispute_list_load = false;
    this._last_searched_index = 0;

    // Used to denote when all disputes have been loaded and no more searching will be done.
    // Needed because deleted disputes alter the "total" dispute remaining count
    this.all_loaded_override = false;

    this.total_available_records = this.total_available_records || 0;

    const onScroll = _.bind(this.onScroll, this);
    // Remove any scroll already there, and add another
    applicationChannel.request('remove:scroll', onScroll);
    applicationChannel.request('add:scroll', onScroll);
  },

  _hasDisputesToLoad() {
    const num_disputes = this.collection ? this.collection.length : 0;
    return num_disputes < this.total_available_records;
  },

  onScroll() {
    if (!this.$el.is(':visible')) {
      // If dispute list is not being displayed, don't do the scroll behvaiour
      return;
    }

    const isPageAtBottom = function() { return $(window).scrollTop() > $(document).height() - $(window).height() - OFFSET_HEIGHT_FOR_SCROLL; };

    // If all disputes are loaded, don't continue
    if (this.all_loaded_override) {
      return;
    }
    const index = this.collection ? this.collection.length : 0;

    if (!this._lock_dispute_list_load && this._hasDisputesToLoad() && isPageAtBottom()) {
      this._lock_dispute_list_load = true;

      if (this._last_searched_index && this._last_searched_index === index) {
        // We have already searched at this level this session, don't perform another search here
        this.all_loaded_override = true;
        this.render();
        return;
      }

      this._lock_dispute_list_load = true;
      this._last_searched_index = index;
      this.all_loaded_override = false;
      this._showDisputeListLoader();

      const loadData = { index, creationMethod: configChannel.request('get', 'DISPUTE_CREATION_METHOD_INTAKE') };
      disputeChannel.request('load:disputes', loadData)
        .done(disputeListCollection => {
          this.collection.add(disputeListCollection.models, { merge: true });
          this.total_available_records = disputeListCollection.totalAvailable;
          if (!this._hasDisputesToLoad()) {
            this.all_loaded_override = true;
          }
          this.render();
        }).fail(() => {
          console.debug(`[Error] Couldn't load dispute list`);
          Backbone.history.navigate('logout', { trigger: true });
        });
    }
  },

  _showDisputeListLoader() {
    this.$('#dispute-list-loader').show();
  },

  onRender() {
    this.showChildView('disputeListRegion', new DisputeListView({ collection: this.collection }));
    this._lock_dispute_list_load = false;
  },

  templateContext() {
    if (!this._hasDisputesToLoad()) this.all_loaded_override = true;
    
    const numDisputes = this.collection && this.collection.filter(filterDisputeList).length;
    return {
      alternateIntakeLink: this.alternateIntakeLink,
      username: sessionChannel.request('name'),
      numDisputes: numDisputes || 0,
      all_loaded_override: this.all_loaded_override
    };
  }
});
