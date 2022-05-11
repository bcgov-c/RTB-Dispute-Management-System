import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './LinkedHearingsListItem_template.tpl';

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'addHearing-search-result standard-list-item',

  ui: {
    makePrimary: '.editHearingLink-primary span',
    remove: '.glyphicon-remove'
  },

  events: {
    'click @ui.makePrimary': 'clickMakePrimary',
    'click @ui.remove': 'clickRemove'
  },

  clickMakePrimary() {
    this.model.trigger('make:primary', this.model);
  },

  clickRemove() {
    this.model.trigger('delete:edithearinglinks', this.model);
  },

  templateContext() {
    return {
      Formatter,
      parent,
      isPrimary: this.model.isPrimary(),
      fileNumberDisplay: this.model.getFileNumber(),
      linkRoleDisplay: this.model.isPrimary() ? 'Primary' : this.model.isSecondary() ? 'Secondary' : '-',
      linkTypeDisplay: this.model.isExternal() ? 'External File' : 'Internal - DMS'
    };
  }
});