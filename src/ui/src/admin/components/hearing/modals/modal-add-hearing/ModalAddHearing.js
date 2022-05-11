import Radio from 'backbone.radio';
import ModalBaseView from '../../../../../core/components/modals/ModalBase';
import DropdownView from '../../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../../core/components/input/Input';
import InputModel from '../../../../../core/components/input/Input_model';
import CheckboxesView from '../../../../../core/components/checkbox/Checkboxes';
import CheckboxCollection from '../../../../../core/components/checkbox/Checkbox_collection';
import HearingCollection from '../../../../../core/components/hearing/Hearing_collection';
import AvailableHearingsListView from './AvailableHearingsList';

import template from './ModalAddHearing_template.tpl';

const HEARING_RETURN_SIZE = 10;

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const userChannel = Radio.channel('users');
const Formatter = Radio.channel('formatter').request('get');

export default ModalBaseView.extend({
  template,
  id: 'addHearing_modal',

  regions: {
    prioritiesRegion: '.addHearing-filter-priority',
    arbLevelsRegion: '.addHearing-filter-arbLevels',
    startDateRegion: '.addHearing-filter-min-date',
    endDateRegion: '.addHearing-filter-max-date',
    staffRegion: '.addHearing-filter-staff',

    searchResultsRegion: '.addHearing-search-results',
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      loadMore: '.addHearing-search-results-load-more',
      search: '.addHearing-search-btn',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.search': 'clickSearch',
      'click @ui.loadMore': 'clickLoadMore'
    });
  },

  clickSearch() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    this.forceHideLoadMore = false;
    this.count = HEARING_RETURN_SIZE;
    this.loadAvailableHearings().always(() => {
      this.render();
      this.renderHearingResults();
    });
  },

  clickLoadMore() {
    this.count += HEARING_RETURN_SIZE;
    this.loadAvailableHearings().always(() => {
      this.render();
      this.renderHearingResults();
    });
  },

  getArbLevels() {
    const dispute = disputeChannel.request('get');
    const complexity = dispute.get('dispute_complexity');
    if (!disputeChannel) return [];

    const isLevelPreSelected = (value) => {
      return (complexity === configChannel.request('get', 'COMPLEXITY_SIMPLE')) ||
      (complexity === configChannel.request('get', 'COMPLEXITY_STANDARD') && (value === configChannel.request('get', 'USER_SUBGROUP_LVL2') || value === configChannel.request('get', 'USER_SUBGROUP_LVL3'))) ||
      (complexity === configChannel.request('get', 'COMPLEXITY_COMPLEX')) && value === configChannel.request('get', 'USER_SUBGROUP_LVL3')
    }

    const arbLevels = ['USER_SUBGROUP_LVL1', 'USER_SUBGROUP_LVL2'];
    const USER_ROLE_TYPE_DISPLAY = configChannel.request('get', 'USER_ROLE_TYPE_DISPLAY');
    
    return arbLevels.map(configName => {
      const value = configChannel.request('get', configName);
      return { html: USER_ROLE_TYPE_DISPLAY[value], value, checked: isLevelPreSelected(value) }
    });
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.editGroup, function(view_name) {
      const view = this.getChildView(view_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    }, this);
    return is_valid;
  },

  initialize() {
    this.hearingResultsCollection = null;
    this.forceHideLoadMore = false;
    this.count = HEARING_RETURN_SIZE;
    this.editGroup = ['prioritiesRegion', 'arbLevelsRegion', 'startDateRegion', 'endDateRegion',  'staffRegion'];
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const DISPUTE_URGENCY_DISPLAY = configChannel.request('get', 'DISPUTE_URGENCY_DISPLAY');
    const dispute = disputeChannel.request('get');
    const disputeUrgency = dispute ? dispute.get('dispute_urgency') : -1;
    this.prioritiesCollection = new CheckboxCollection(_.map([
      'DISPUTE_URGENCY_EMERGENCY',
      'DISPUTE_URGENCY_REGULAR',
      'DISPUTE_URGENCY_DEFERRED',
      'DISPUTE_URGENCY_DUTY'
    ], function(config_name) {
      const value = configChannel.request('get', config_name);
      return { html: DISPUTE_URGENCY_DISPLAY[value], value, checked: disputeUrgency === value };
    }));

    this.arbLevelsCollection = new CheckboxCollection(this.getArbLevels());

    this.minDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Min Start Date',
      errorMessage: 'Enter the start date',
      required: true,
      allowFutureDate: true,
      customLink: 'Today + 23 days',
      minDate: Moment(),
      customLinkFn() {
        this.trigger('update:input', Moment().add(23, 'days').format(InputModel.getDateFormat()));
      }
    });

    this.maxDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Max End Date',
      required: false,
      cssClass: 'optional-input',
      allowFutureDate: true,
      minDate: this.minDateModel.getData() ? this.minDateModel.getData() : this.minDateModel.get('minDate'),
      value: null
    });

    this.staffModel = new DropdownModel({
      optionData: _.map(userChannel.request('get:arbs'), function(arb) { return {value: String(arb.get('user_id')), text: arb.getDisplayName() }; }),
      defaultBlank: true,
      labelText: 'Staff Member',
      required: false,
      cssClass: 'optional-input',
      value: null
    });
  },

  setupListeners() {
    this.listenTo(this.minDateModel, 'change:value', this.onMinDateChange, this);
  },

  setupHearingCollectionListeners() {
    this.listenTo(this.hearingResultsCollection, 'close:hearing:modal', () => {
      this.close();
    });
    this.listenTo(this.hearingResultsCollection, 'hide:hearing:modal', () => {
      this.$el.hide();
    });
    this.listenTo(this.hearingResultsCollection, 'show:hearing:modal', () => {
      this.forceHideLoadMore = true;
      this.render();
      // Don't render the results list yet
      this.$el.show();
    });
  },

  onMinDateChange(minDateModel, minDateValue) {
    // Set the value on the model here initially because ".isValid()" check can't be used in change handlers as "value" is still previous
    minDateModel.set('value', minDateValue, { silent: true });

    const minDateMoment = Moment(minDateModel.getData());
    if (minDateModel.isValid()) {
      this.maxDateModel.set(_.extend({
          minDate: minDateMoment
        },
        Moment(minDateModel.getData()).isAfter(Moment(this.maxDateModel.getData()), 'days') ? { value: null } : {}
      ));

      // Always refresh the End Time view, to update the minDate
      const endDateView = this.getChildView('endDateRegion');
      if (endDateView) {
        endDateView.render();
      }
    }
  },

  loadAvailableHearings() {
    const dfd = $.Deferred();
    const originalHearingResultsLength = this.count !== HEARING_RETURN_SIZE && this.hearingResultsCollection ? this.hearingResultsCollection.length : 0;
    const dateFormat = 'YYYY-MM-DD';
    const parsedMinDate = this.minDateModel.getData({ format: 'date' });
    const isToday = this.minDateModel.get('value') && parsedMinDate === Moment().format(dateFormat);
    const MinStartDate = !this.minDateModel.get('value') ? null : `${parsedMinDate}${isToday ? `T${Moment().format('HH:mm')}` : ''}`
    loaderChannel.trigger('page:load');
    hearingChannel.request('get:available', _.extend({
        index: 0,
        count: this.count,
        IncludedPriorities: _.map(this.prioritiesCollection.getData(), function(checkbox) { return checkbox.get('value'); }),
        IncludedOwnerRoleSubtypeId: _.map(this.arbLevelsCollection.getData(), function(checkbox) { return checkbox.get('value'); })
      },
      // R1 Note: This relies on the Admin site being in the same time zone as server time - this is expected for RTB R1
      this.minDateModel.get('value') ? { MinStartDate } : {},
      this.maxDateModel.get('value') ? { MaxStartDate: Moment(this.maxDateModel.getData()).add(1, 'day').format(dateFormat) } : {},
      this.staffModel.get('value') ? { IncludedOwnerId: this.staffModel.getData({ parse: true }) } : {},
    )).done(response => {
      response = response || {};
      response.available_hearings = response.available_hearings || [];
      
      const hearingId = this.model.get('hearing_id');
      this.hearingResultsCollection = new HearingCollection(_.filter(response.available_hearings, function(hearing) {
        return hearing.hearing_id !== hearingId;
      }));
      this.setupHearingCollectionListeners();

      if (this.hearingResultsCollection.length && this.hearingResultsCollection.length === originalHearingResultsLength) {
        this.forceHideLoadMore = true;
      }

      dfd.resolve(this.hearingResultsCollection);
    }).fail(dfd.reject)
    .always(() => loaderChannel.trigger('page:load:complete'));

    return dfd.promise();
  },

  onRender() {
    this.showChildView('prioritiesRegion', new CheckboxesView({ collection: this.prioritiesCollection }));
    this.showChildView('arbLevelsRegion', new CheckboxesView({ collection: this.arbLevelsCollection }))
    this.showChildView('startDateRegion', new InputView({ model: this.minDateModel }));
    this.showChildView('endDateRegion', new InputView({ model: this.maxDateModel }));
    this.showChildView('staffRegion', new DropdownView({ model: this.staffModel }));
  },

  renderHearingResults() {
    this.showChildView('searchResultsRegion', new AvailableHearingsListView({ hearingModel: this.model, collection: this.hearingResultsCollection }));
  },

  templateContext() {
    const dispute = disputeChannel.request('get');
    return {
      Formatter,
      dispute,
      complexityDisplay: dispute.get('dispute_complexity') ? Formatter.toComplexityDisplay(dispute.get('dispute_complexity')) : `<span class="dispute-complexity-not-set">Not set</span>`,
      showLoadMore: this.hearingResultsCollection && this.hearingResultsCollection.length &&
        this.count && this.hearingResultsCollection.length === this.count && !this.forceHideLoadMore      
    };
  }

});
