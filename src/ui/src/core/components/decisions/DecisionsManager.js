import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

const api_posted_decisions = 'posteddecision';
const api_posted_decisions_full_text = 'posteddecision/full-text/search';
const configChannel = Radio.channel('config');
const apiChannel = Radio.channel('api');

const DecisionsManager = Marionette.Object.extend({
  channelName: 'decisions',

  radioRequests: { 
    'load:filtered:decisions': 'loadFilteredDecisions',
    'load:fulltext:decisions': 'loadFullTextDecisions',
  },

  loadFilteredDecisions(decisionData) {
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_POSTED_DECISION_URL')}${api_posted_decisions}?${$.param(decisionData, true)}`,
    }).done(response => { 
      return response;
    }).fail(err => {
      return err;
    });
  },

  loadFullTextDecisions(decisionData) {
    return apiChannel.request('call', {
      type: 'GET',
      url: `${configChannel.request('get', 'API_POSTED_DECISION_URL')}${api_posted_decisions_full_text}?${$.param(decisionData, true)}`,
    }).done(response => { 
      return response;
    }).fail(err => {
      return err;
    });
  }
});

export default new DecisionsManager();
