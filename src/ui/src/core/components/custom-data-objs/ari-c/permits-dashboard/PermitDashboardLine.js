import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './PermitDashboardLine_template.tpl';

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'permits-dashboard-line',

  initialize() {
    this.unitModel = this.model.get('unitModel');
    this.permitModel = this.model.get('permitModel');
  },

  templateContext() {
    return {
      Formatter,
      unitModel: this.unitModel,
      permitIdDisplay: this.permitModel ? this.permitModel.get('local-permit_id') || '-' : '-',
      permitDateDisplay: this.permitModel ? Formatter.toDateDisplay(Moment(this.permitModel.get('local-issued_date'))) || '-' : '-',
      permitIssuedByDisplay: this.permitModel ? this.permitModel.get('local-issued_by') || '-' : '-',
      permitDescriptionDisplay: this.permitModel ? this.permitModel.get('local-permit_description') || '-' : '-',
    };
  },

});
