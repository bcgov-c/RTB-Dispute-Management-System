import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import DisputeAmendmentView from './DisputeAmendment';
import template from './DisputeAmendments_template.tpl';

const DROPDOWN_CODE_ALL = '-1';

const configChannel = Radio.channel('config');

const EmptyDisputeAmendmentView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">There are currently no amendments available</div>`)
});

const DisputeAmendmentCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: DisputeAmendmentView,
  emptyView: EmptyDisputeAmendmentView,
  childViewOptions() {
    return {
      enableUnlinkedIcon: this.getOption('enableUnlinkedIcon'),
    };
  },
});

export default Marionette.View.extend({
  template,
  
  regions: {
    listRegion: '.dispute-amendments-collection',
    detailsToggleRegion: '.amendments-details-toggle',
    amendmentToTypeRegion: '.amendments-to-type-dropdown',
  },

  ui: {
    collectionContainer: '.dispute-amendments-collection'
  },

  viewDetailsClass: 'amendment-toggle-full',
  viewMinimalClass: 'amendment-toggle-minimal',

  initialize(options) {
    this.mergeOptions(options, ['collection', 'titleDisplay', 'enableTypeFilter', 'initialType', 'enableUnlinkedIcon']);
    _.extend(this.options, options);

    this.detailsToggleModel = new CheckboxModel({
      html: 'Show amendment details',
      checked: false
    });

    this.amendmentToTypeModel = new DropdownModel({
      labelText: 'Amendments related to',
      optionData: [
        { text: 'All', value: DROPDOWN_CODE_ALL },
        { text: 'Dispute', value: String(configChannel.request('get', 'AMENDMENT_TO_TYPE_DISPUTE')) },
        { text: 'Participants', value: String(configChannel.request('get', 'AMENDMENT_TO_TYPE_PARTY')) },
        { text: 'Issues', value: String(configChannel.request('get', 'AMENDMENT_TO_TYPE_ISSUE')) },
      ],
      value: this.initialType ? String(this.initialType) : DROPDOWN_CODE_ALL,
    });

    this.listenTo(this.detailsToggleModel, 'change:checked', function(model, checked) {
      if (checked) {
        this.getUI('collectionContainer').removeClass(this.viewMinimalClass).addClass(this.viewDetailsClass);
      } else {
        this.getUI('collectionContainer').removeClass(this.viewDetailsClass).addClass(this.viewMinimalClass);
      }
    }, this);

    this.listenTo(this.amendmentToTypeModel, 'change:value', () => {
      this.renderAmendmentList();
    });
  },

  onRender() {
    if (this.enableTypeFilter) {
      this.showChildView('amendmentToTypeRegion', new DropdownView({ model: this.amendmentToTypeModel }));
    }

    this.showChildView('detailsToggleRegion', new CheckboxView({ model: this.detailsToggleModel }));
    this.renderAmendmentList();
  },

  renderAmendmentList() {
    const viewOptions = Object.assign({}, this.options);
    const isAll = !this.amendmentToTypeModel || this.amendmentToTypeModel.getData() === DROPDOWN_CODE_ALL;
    if (this.enableTypeFilter) {
      viewOptions.filter = amendment => isAll || amendment.get('amendment_to') === this.amendmentToTypeModel.getData({ parse: true });
    }

    this.showChildView('listRegion', new DisputeAmendmentCollectionView(viewOptions));
  },

  templateContext() {
    const detailedTypeText = this.enableTypeFilter ? [
      ['All', this.collection.length],
      ['Dispute', this.collection.where({ amendment_to: configChannel.request('get', 'AMENDMENT_TO_TYPE_DISPUTE') }).length],
      ['Participants', this.collection.where({ amendment_to: configChannel.request('get', 'AMENDMENT_TO_TYPE_PARTY') }).length],
      ['Issues', this.collection.where({ amendment_to: configChannel.request('get', 'AMENDMENT_TO_TYPE_ISSUE') }).length],
    ].map(pair => `${pair[0]}: ${pair[1]}`).join(' - ') : null;

    return {
      titleDisplay: this.titleDisplay,
      amendmentsLength: this.collection ? this.collection.length : 0,
      enableTypeFilter: this.enableTypeFilter,
      detailedTypeText,
    }
  }
});
