import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import DisputeListItem from './DisputeListItem';
import template from './AriDisputeListPage_template.tpl';

let UAT_TOGGLING = {};
const ARI_RADIO_OPTION_TEXT = 'I made eligible repairs or improvements and am seeking to recover the associated capital costs through rent increase';
const PFR_RADIO_OPTION_TEXT = 'I am seeking possession of rental unit(s) from current tenants for renovations';
const RADIO_CODE_ARI_C = 1;
const RADIO_CODE_PFR = 2;

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
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
    return !model.isMigrated();
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
  className: 'dispute-list-page ari-dispute-list-page',

  regions: {
    radioRegion: '.ari-start-radio',

    ariDisputeListRegion: '#ari-disputes',
    renovationDisputeListRegion: '#renovation-disputes',
  },

  ui: {
    start: 'button.dispute-list-start',
    logout: 'a.appplication-logout',
    alternateIntakeLink: '.dispute-list-alternate-link'
  },

  events: {
    'click @ui.start': 'startDispute',
    'click @ui.logout': 'clickLogout',
    'click @ui.alternateIntakeLink': 'clickAlternateIntakeLink'
  },

  startDispute() {
    const childView = this.getChildView('radioRegion');
    if (childView && !childView.validateAndShowErrors()) {
      return;
    }

    loaderChannel.trigger('page:load');
    disputeChannel.request( this.radioModel.getData() === RADIO_CODE_PFR ? 'create:pfr' : 'create:ari' );
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
      bodyHtml: `<p>If you continue you will leave your additional landord file list and be taken to your list of standard dispute files.  If you want to stay on the current list, click 'Cancel'.</p>`,
      onContinue: (modalView) => {
        loaderChannel.trigger('page:load');
        modalView.close();
        window.location.href = this.alternateIntakeLink;
      }
    });
  },

  /**
   * @param {Collection} collection -
   */
  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};

    const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');
    this.alternateIntakeLink = INTAKE_URL && INTAKE_URL.replace('/Login', '');

    this.radioModel = new RadioModel({
      optionData: [
        { value: RADIO_CODE_ARI_C, text: ARI_RADIO_OPTION_TEXT },
        ...(UAT_TOGGLING.SHOW_PFR ? [{ value: RADIO_CODE_PFR, text: PFR_RADIO_OPTION_TEXT }] : [])
      ],
      required: true,
      value: null
    });
  },

  onRender() {
    this.showChildView('radioRegion', new RadioView({ model: this.radioModel }));

    this.showChildView('ariDisputeListRegion', new DisputeListView({ collection: this.collection, filter(child) {
        return child.dispute && child.dispute.isCreatedAriC();
      }
    }));
    
    if (UAT_TOGGLING.SHOW_PFR) {
      this.showChildView('renovationDisputeListRegion', new DisputeListView({ collection: this.collection, filter(child) {
          return child.dispute && child.dispute.isCreatedPfr();
        }
      }));
    }
  },

  templateContext() {
    return {
      showAriDisputes: true,
      showPfrDisputes: UAT_TOGGLING.SHOW_PFR,
      alternateIntakeLink: this.alternateIntakeLink,
      username: sessionChannel.request('name')
    };
  }
});
