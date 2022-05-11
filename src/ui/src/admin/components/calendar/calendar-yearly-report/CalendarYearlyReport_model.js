
import Backbone from 'backbone';

export default Backbone.Model.extend({
  defaults: {
    headerLabel: null,
    rowEvents: null,

    currentYear: null
  },

  parseYearlyFromApi(apiHearings) {
    const events = [];

    this.set('rowEvents', null, { silent: true });
    events.push(apiHearings);
    this.set({
      events,
      currentYear: apiHearings.year
    });
  },

});
