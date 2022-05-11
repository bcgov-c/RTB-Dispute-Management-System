import Marionette from 'backbone.marionette';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import template from './AdvancedSearchFilters_template.tpl';

export default Marionette.View.extend({
  template,

  regions: {
    restrictDateCheckBox: '.restrict-dates-check-box',
    restrictDateFieldBox: '.restrict-dates-field-box',
    restrictDateTypeBox: '.restrict-dates-type-box',
    restrictStartingDate: '.restrict-dates-starting-date',
    restrictEndingDate: '.restrict-dates-ending-date',
    restrictMethodCheckbox: '.restrict-created-method-checkbox',
    restrictMethodRegion: '.restrict-created-methods',

    sortResultsBox: '.sort-results-check-box',
    sortByBox: '.sort-by',
    sortTypeBox: '.sort-type',
    activeDisputesCheckBox: '.include-active-disputes',
    initialResultsBox: '.initial-results',
    restrictStatusCheckBox: '.restrict-status-check-box',
    statusBox: '.search-option-status',
    restrictCmsStatusCheckBox: '.restrict-cms-status-check-box',
    cmsStatusBox: '.search-option-cms-status',
  },

  ui: {
    allDisputes: '.all-disputes',
    maxDisputes: '.max-disputes'
  },

  initialize(options) {
    this.mergeOptions(options, ['displayActiveDisputes', 'displayResultsCount', 'resultsCountCss', 'displayedResultsTitle', 'displayRestrictFilters', 'displaySort', 'displayStatuses', 'displayCmsStatuses']);
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.get('restrictDateTypeModel'), 'change:value', this.handleRestrictDateIntervalChange, this);
    this.listenTo(this.model.get('restrictDatesCheckBoxModel'), 'change:checked', this.handleRestrictDatesCheckBoxChange, this);
    this.listenTo(this.model.get('restrictDateFieldModel'), 'change:value', this.updateRestrictDateField, this);
    this.listenTo(this.model.get('sortResultsCheckBoxModel'), 'change:checked', this.handleSortResultsCheckboxChange, this);
    this.listenTo(this.model.get('sortByModel'), 'change:value', this.updateSortByModel, this);
    this.listenTo(this.model.get('sortTypeModel'), 'change:value', this.updateSortTypeModel, this);
    this.listenTo(this.model.get('resultsCountModel'), 'change:value', this.updateResultCountModel, this);
    this.listenTo(this.model.get('restrictStatusCheckBoxModel'), 'change:checked', this.handleRestrictStatusCheckboxChange, this);
    this.listenTo(this.model.get('restrictCmsStatusCheckBoxModel'), 'change:checked', this.handleRestrictCmsStatusCheckboxChange, this);
    this.listenTo(this.model.get('startingDateModel'), 'change:value', this.handleStartingDateChanged, this);
    this.listenTo(this.model.get('restrictMethodModel'), 'change:checked', this.handleRestrictMethodChange, this);
  },

  updateResultCountModel() {
    this.model.get('resultsCountModel').set({value: Number(this.model.get('resultsCountModel').getData())});
  },

  updateSortTypeModel() {
    this.model.get('sortTypeModel').set({value: Number(this.model.get('sortTypeModel').getData())});
  },

  updateSortByModel() {
    this.model.get('sortByModel').set({value: Number(this.model.get('sortByModel').getData())});
  },

  updateRestrictDateField() {
    this.model.get('restrictDateFieldModel').set({ value: Number(this.model.get('restrictDateFieldModel').getData()) });
  },
 
  handleRestrictMethodChange() {
    const creationMethodsModel = this.model.get('creationMethodsModel');
    const shouldBeEnabled = this.model.get('restrictMethodModel').getData();

    creationMethodsModel.set({ disabled: !shouldBeEnabled, required: shouldBeEnabled });
    creationMethodsModel.trigger('render');
  },

  handleStartingDateChanged(minDateModel, minDateValue) {
    // Set the value on the model here initially because ".isValid()" check can't be used in change handlers as "value" is still previous
    minDateModel.set('value', minDateValue, { silent: true });

    const endingDateModel = this.model.get('endingDateModel');
    const minDateMoment = Moment(minDateModel.getData());
    if (minDateModel.isValid()) {
      endingDateModel.set(_.extend({
          minDate: minDateMoment
        },
        Moment(minDateModel.getData()).isAfter(Moment(endingDateModel.getData()), 'days') ? { value: null } : {}
      ));

      // Always refresh the End Time view, to update the minDate
      const endDateView = this.getChildView('restrictEndingDate');
      if (endDateView) {
        endDateView.render();
      }
    }
  },

  handleRestrictDatesCheckBoxChange() {
    if (this.model.get('restrictDatesCheckBoxModel').getData()) {
      this.model.get('restrictDateFieldModel').set({disabled: false, value: Number(this.model.get('restrictDateFieldModel').getData())});
      this.model.get('restrictDateTypeModel').set({disabled: false, value: Number(this.model.get('restrictDateTypeModel').getData())});
      this.model.get('startingDateModel').set({disabled: false, required: true});
      this.handleRestrictDateIntervalChange();
    } else {
      this.model.get('restrictDateFieldModel').set({disabled: true, value: Number(this.model.get('restrictDateFieldModel').getData())});
      this.model.get('restrictDateTypeModel').set({disabled: true, value: Number(this.model.get('restrictDateTypeModel').getData())});
      this.model.get('startingDateModel').set({disabled: true, required: false});
      this.model.get('endingDateModel').set({disabled: true, required: false});
      this.showChildView('restrictEndingDate', new InputView({ model: this.model.get('endingDateModel')}));
    }

    this.showChildView('restrictDateFieldBox', new DropdownView({ model: this.model.get('restrictDateFieldModel')}));
    this.showChildView('restrictDateTypeBox', new DropdownView({ model: this.model.get('restrictDateTypeModel')}));
    this.showChildView('restrictStartingDate', new InputView({ model: this.model.get('startingDateModel')}));
  },

  handleSortResultsCheckboxChange() {
    if (this.model.get('sortResultsCheckBoxModel').getData()) {
      this.model.get('sortByModel').set({disabled: false, value: Number(this.model.get('sortByModel').getData())});
      this.model.get('sortTypeModel').set({disabled: false, value: Number(this.model.get('sortTypeModel').getData())});
      
      this.showChildView('sortByBox', new DropdownView({ model: this.model.get('sortByModel')}));
      this.showChildView('sortTypeBox', new DropdownView({ model: this.model.get('sortTypeModel')}));
    } else {
      this.model.get('sortByModel').set({disabled: true, value: Number(this.model.get('sortByModel').getData())});
      this.model.get('sortTypeModel').set({disabled: true, value: Number(this.model.get('sortTypeModel').getData())});

      this.showChildView('sortByBox', new DropdownView({ model: this.model.get('sortByModel')}));
      this.showChildView('sortTypeBox', new DropdownView({ model: this.model.get('sortTypeModel')}));
    }
  },

  handleRestrictDateIntervalChange() {
    this.model.get('restrictDateTypeModel').set({value: Number(this.model.get('restrictDateTypeModel').getData())});
    
    if (this.model.get('restrictDateTypeModel').getData() !== 2) {
      this.model.get('endingDateModel').set({disabled: true, required: false});
    } else if (this.model.get('restrictDatesCheckBoxModel').getData()) {
      this.model.get('endingDateModel').set({disabled: false, required: true});
    }
    this.showChildView('restrictEndingDate', new InputView({ model: this.model.get('endingDateModel')}));
  },

  handleRestrictStatusCheckboxChange() {
    if (this.model.get('restrictStatusCheckBoxModel').getData()) {
      this.model.get('searchStatusModel').set({disabled: false, value: Number(this.model.get('searchStatusModel').getData())});
      this.showChildView('statusBox', new DropdownView({ model: this.model.get('searchStatusModel')}));
    } else {
      this.model.get('searchStatusModel').set({disabled: true, value: Number(this.model.get('searchStatusModel').getData())});
      this.showChildView('statusBox', new DropdownView({ model: this.model.get('searchStatusModel')}));
    }
  },

  handleRestrictCmsStatusCheckboxChange() {
    if (this.model.get('restrictCmsStatusCheckBoxModel').getData()) {
      this.model.get('searchCmsStatusModel').set({disabled: false, value: Number(this.model.get('searchCmsStatusModel').getData())});
      this.showChildView('cmsStatusBox', new DropdownView({ model: this.model.get('searchCmsStatusModel')}));
    } else {
      this.model.get('searchCmsStatusModel').set({disabled: true, value: Number(this.model.get('searchCmsStatusModel').getData())});
      this.showChildView('cmsStatusBox', new DropdownView({ model: this.model.get('searchCmsStatusModel')}));
    }
  },

  validateAndShowErrors() {
    const regionsToValidate = ['restrictStartingDate', 'restrictEndingDate', 'restrictMethodRegion'];
    let is_valid = true;
    _.each(regionsToValidate, (view_name) => {
      const view = this.getChildView(view_name);
      if (view) {
        is_valid = view.validateAndShowErrors() && is_valid;
      }
    });
    return is_valid;
  },

  onRender() {
    if (this.displayRestrictFilters) {
      this.showChildView('restrictDateCheckBox', new CheckboxView({ model: this.model.get('restrictDatesCheckBoxModel') }));
      this.showChildView('restrictDateFieldBox', new DropdownView({ model: this.model.get('restrictDateFieldModel') }));
      this.showChildView('restrictDateTypeBox', new DropdownView({ model: this.model.get('restrictDateTypeModel') }));
      this.showChildView('restrictStartingDate', new InputView({ model: this.model.get('startingDateModel') }));
      this.showChildView('restrictEndingDate', new InputView({ model: this.model.get('endingDateModel') }));
      
      this.showChildView('restrictMethodCheckbox', new CheckboxView({ model: this.model.get('restrictMethodModel') }));
      this.showChildView('restrictMethodRegion', new DropdownView({ model: this.model.get('creationMethodsModel') }));
    } 

    if (this.displaySort) {
      this.showChildView('sortResultsBox', new CheckboxView({ model: this.model.get('sortResultsCheckBoxModel')}));
      this.showChildView('sortByBox', new DropdownView({ model: this.model.get('sortByModel')}));
      this.showChildView('sortTypeBox', new DropdownView({ model: this.model.get('sortTypeModel')}));
    }

    if (this.displayStatuses) {
      this.showChildView('restrictStatusCheckBox', new CheckboxView({ model: this.model.get('restrictStatusCheckBoxModel')}));
      this.showChildView('statusBox', new DropdownView({ model: this.model.get('searchStatusModel') }));
    }

    if (this.displayCmsStatuses) {
      this.showChildView('restrictCmsStatusCheckBox', new CheckboxView({ model: this.model.get('restrictCmsStatusCheckBoxModel')}));
      this.showChildView('cmsStatusBox', new DropdownView({ model: this.model.get('searchCmsStatusModel') }));
    }

    if (this.displayActiveDisputes) {
      this.showChildView('activeDisputesCheckBox', new CheckboxView({ model: this.model.get('includeActiveDisputesCheckBox')}));
    }

    if (this.displayResultsCount) {
      this.showChildView('initialResultsBox', new DropdownView({ model: this.model.get('resultsCountModel')}));
    }
  },

  templateContext() {
    return {
      displayActiveDisputes: this.displayActiveDisputes,
      displayResultsCount: this.displayResultsCount,
      resultsCountCss: this.resultsCountCss,
      displayRestrictFilters: this.displayRestrictFilters,
      displaySort: this.displaySort,
      displayStatuses: this.displayStatuses,
      displayCmsStatuses: this.displayCmsStatuses,
      displayedResultsTitle: this.displayedResultsTitle || 'Initial Results'
    };
  }
});
