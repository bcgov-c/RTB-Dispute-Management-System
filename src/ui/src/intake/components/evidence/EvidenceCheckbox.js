import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import EvidenceView from '../evidence/Evidence';
import ViewMixin from '../../../core/utilities/ViewMixin';
import template from './EvidenceCheckbox_template.tpl';

const configChannel = Radio.channel('config');

export default Marionette.View.extend({
  template,
  className: 'clearfix intake-evidence-checkbox-component',
  DEFAULT_ACCORDION_DURATION: 300,

  regions: {
    checkboxRegion: '.checkbox',
    evidenceRegion: '.evidence-model'
  },

  initialize() {
    this.listenTo(this.model, 'change:checked', function() {
      if (this.model.get('evidenceModel')) {
        this.toggleEvidenceDisplay();
      }
    }, this);
  },

  toggleEvidenceDisplay(options) {
    const delay_time = options ? options.duration : this.DEFAULT_ACCORDION_DURATION;
    this.$('.evidence-model').animate({height: 'toggle'}, delay_time);
  },

  validateAndShowErrors() {
    return this.model.get('evidenceModel') ? this.getChildView('evidenceRegion').validateAndShowErrors() : true;
  },

  onRender() {
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.model.get('checkboxModel') }));    
    if (this.model.get('evidenceModel')) {
      this.showChildView('evidenceRegion', new EvidenceView({
        model: this.model.get('evidenceModel'),
        fileType: configChannel.request('get', 'FILE_TYPE_USER_EXTERNAL_NON_EVIDENCE')
      }));
    }

    ViewMixin.prototype.initializeHelp(this, this.model.get('checkboxModel').get('helpHtml'));
  },

  templateContext() {
    return {
      checked: this.model.get('checkboxModel').get('checked')
    };
  }
  
});