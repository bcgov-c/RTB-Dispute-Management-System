import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import CommunicationEmailListView from './CommunicationEmailList';
import ModalCreateEmailView from './modals/ModalCreateEmail';
import template from './CommunicationEmailSection_template.tpl';

let UAT_TOGGLING = {};

const EMAIL_FILTER_CODE_ALL = 'all';

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');

export default Marionette.View.extend({
  template,

  regions: {
    emailList: '#comm-email-list',
    emailTypeFilters: '#comm-email-type-filters'
  },

  ui: {
    'addEmail': '.comm-add-email-btn',
    'emailFilter': '.email-section-filter'
  },

  events: {
    'click @ui.addEmail': 'clickAddEmail'
  },

  clickAddEmail() {
    const addEmailModalView = new ModalCreateEmailView({ model: this.model });
    this.listenToOnce(this.model, 'refresh:page', () => this.collection.trigger('refresh:page'));
    modalChannel.request('add', addEmailModalView);
  },

  initialize(options) {
    this.mergeOptions(options, ['emailFilter', 'sectionTitle', 'disableTypeFilter', 'isPickup', 'isDraft', 'showAddEmail']);
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.showAddEmail = UAT_TOGGLING.SHOW_ADD_CUSTOM_EMAIL && (_.isBoolean(this.showAddEmail) ? this.showAddEmail : true);
    this.createSubModels();

    this.listenTo(this.collection, 'render', this.render, this);
    this.listenTo(this.emailTypeFiltersModel, 'change:value', (model, value) => {
      this.getUI('emailFilter').html(` - ${this.emailTypeFiltersModel?.getSelectedText()}`);
      this.model.set({
        sessionSettings: { 
          ...this.model.get('sessionSettings'), 
          communicationPage: {
            ...this.model.get('sessionSettings')?.communicationPage,
            filter_emailType: value
          }
        }
      });
    })
  },

  _getTypeFilterOptions() {
    const typeOptionCodes = ['EMAIL_MESSAGE_TYPE_NOTIFICATION', 'EMAIL_MESSAGE_TYPE_SYSTEM', 'EMAIL_MESSAGE_TYPE_CUSTOM', 'EMAIL_MESSAGE_TYPE_RECEIPT'];
    const EMAIL_TYPE_DISPLAY = configChannel.request('get', 'EMAIL_TYPE_DISPLAY');

    return [{ value: EMAIL_FILTER_CODE_ALL, text: 'View All' }, ...typeOptionCodes.map(code => {
      const configVal = configChannel.request('get', code);
      return { text: EMAIL_TYPE_DISPLAY[configVal], value: configVal };
    })];
  },

  createSubModels() {
    if (this.disableTypeFilter) return;
    const cachedData = this.model.get('sessionSettings')?.communicationPage;
    this.emailTypeFiltersModel = new RadioModel({
      optionData: this._getTypeFilterOptions(),
      value: cachedData?.filter_emailType ? cachedData?.filter_emailType : EMAIL_FILTER_CODE_ALL,
    });
  },

  onRender() {
    this.showChildView('emailList', new CommunicationEmailListView({
      collection: this.collection,
      typeFilter: this.emailTypeFiltersModel,
      emailFilter: this.emailFilter,
      isPickup: this.isPickup,
    }));

    if (this.disableTypeFilter) return;
    this.showChildView('emailTypeFilters', new RadioView({ model: this.emailTypeFiltersModel }));
  },

  templateContext() {
    return {
      showAddEmail: this.showAddEmail,
      hasEmails: this.collection.length,
      sectionTitle: this.sectionTitle || 'Emails',
      selectedEmailFilter: this.emailTypeFiltersModel?.getSelectedText() ? `- ${this.emailTypeFiltersModel?.getSelectedText()} Filter ` : '',
      disableTypeFilter: this.disableTypeFilter
    };
  }
});
