import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import template from './ModalLinkAmendmentItems_template.tpl';

const participantChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

const AmendmentView = Marionette.View.extend({
  template,
  className: 'notice-amendment-available',

  regions: {
    checkboxRegion: '.notice-amendment-include-checkbox'
  },

  ui: {
    itemBody: '.notice-amendment-available-content'
  },

  events: {
    'click @ui.itemBody': 'clickBody'
  },

  clickBody() {
    this.checkboxModel.set('checked', !this.checkboxModel.get('checked'));
    this.checkboxModel.trigger('render');
  },

  initialize(options) {
    this.mergeOptions(options, ['currentNoticeId']);
    
    this.AMENDMENT_TO_DISPLAY = configChannel.request('get', 'AMENDMENT_TO_DISPLAY');
    this.AMENDMENT_CHANGE_TYPE_DISPLAY = configChannel.request('get', 'AMENDMENT_CHANGE_TYPE_DISPLAY');

    const isChecked = this.currentNoticeId && this.model.get('notice_id') === this.currentNoticeId;
    this.model.set('_includeChecked', isChecked);
    this.checkboxModel = new CheckboxModel({ html: null, checked: isChecked });
    this.listenTo(this.checkboxModel, 'change:checked', function(model, value) {
      this.model.set('_includeChecked', value);
    }, this);
  },

  onRender() {
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.checkboxModel }));
  },

  templateContext() {
    return {
      Formatter,
      submitter: participantChannel.request('get:participant', this.model.get('amendment_submitter_id')),
      createdByDisplay: userChannel.request('get:user:name', this.model.get('created_by')),
    };
  }
});

export default Marionette.CollectionView.extend({
  childView: AmendmentView,
  
  childViewOptions() {
    return {
      currentNoticeId: this.currentNoticeId
    };
  },

  initialize(options) {
    this.mergeOptions(options, ['currentNoticeId']);
  }
});