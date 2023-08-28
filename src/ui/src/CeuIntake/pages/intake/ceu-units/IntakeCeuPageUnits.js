import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import CeuPage from '../../../components/page/CeuPage';
import PageItemView from '../../../../core/components/page/PageItem';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import IntakeCeuUnits from './IntakeCeuUnits';
import './IntakeCeuPageUnits.scss';

const MAX_NUMBER_OF_UNITS = 20;

const modalChannel = Radio.channel('modals');
const animationChannel = Radio.channel('animations');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageUnits = CeuPage.extend({
  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);

    this.isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    this.savedJsonData = IntakeCeuDataParser.toJSON() || {};
    this.units = IntakeCeuDataParser.getUnitCollection();

    this.createPageItems();
    this.setupFlows();
    this.setupListeners();
    
    applicationChannel.trigger('progress:step', 5);
  },

  getPageApiUpdates() {
    const keysToSkip = [];
    const currentData = {
      g_rental_units_impacted: this.totalCountModel.getData({ parse: true }),
      g_rental_units_provided: this.unitCountModel.getData({ parse: true }),
    };
    const unitsData = this.units.saveInternalDataToModel({ returnOnly: true });
    const hasUpdatesFn = (keyMatchObj={}, objToMatch={}) => {
      if (!keyMatchObj && !objToMatch) return;
      let _hasUpdates = false;
      Object.keys(keyMatchObj).forEach(key => {
        if (_hasUpdates || keysToSkip.indexOf(key) !== -1) return;
        
        if (Array.isArray(keyMatchObj[key]) && Array.isArray(objToMatch[key])) {
          _hasUpdates = keyMatchObj[key].length !== objToMatch[key].length ||
            _.any(keyMatchObj[key], (arr, arrInd) => hasUpdatesFn(arr, objToMatch[key].at(arrInd)));
        } else if (String(keyMatchObj[key]) !== String(objToMatch[key])) {
          _hasUpdates = true;
        }
      });
      return _hasUpdates;
    };

    const hasUnsavedChanges = (this.units.length !== unitsData.length)
      || _.any(unitsData, (a, index) => hasUpdatesFn(a, this.units.at(index).toJSON()))
      || hasUpdatesFn(currentData, IntakeCeuDataParser.toJSON());
    
    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/5';
  },

  createPageItems() {
    this.totalCountModel = new InputModel({
      inputType: 'positive_integer',
      labelText: ' ',
      maxLength: 5,
      required: true,
      errorMessage: 'Please enter the number of units',
      value: this.savedJsonData.g_rental_units_impacted,
      apiMapping: 'g_rental_units_impacted'
    });

    this.addPageItem('totalCountRegion', new PageItemView({
      stepText: 'How many rental units/sites are affected by the issues you are raising?',
      subView: new InputView({ model: this.totalCountModel }),
      stepComplete: this.totalCountModel.isValid(),
      helpHtml: `If you do not know the exact number of rental units/sites affected, please provide an approximate number.`,
      forceVisible: true,
    }));

    this.unitCountModel = new DropdownModel({
      labelText: ' ',
      optionData: Array.from(Array(MAX_NUMBER_OF_UNITS).keys()).map(index => (
        { text: `${index+1}`, value: index+1 }
      )),
      required: true,
      defaultBlank: true,
      value: this.savedJsonData.g_rental_units_provided ? this.savedJsonData.g_rental_units_provided : null,
      apiMapping: 'g_rental_units_provided',
    });
    this.addPageItem('unitCountRegion', new PageItemView({
      stepText: `How many impacted rental units/sites can you provide information about?`,
      subView: new DropdownView({ model: this.unitCountModel }),
      stepComplete: this.unitCountModel.isValid(),
      helpHtml: `Important information is the street address, unit/site number (if applicable), and the tenant's or landlord's name. If you do not have information about any of the impacted rental units/sites, select "1" from the drop-down menu and enter the street address for the building or park below.`,
    }));

    this.addPageItem('unitsRegion', new PageItemView({
      stepText: null,
      subView: new IntakeCeuUnits({
        collection: this.units,
        applicantSelectText: this.isRespondentLandlord ? `Please select the landlord that owns or manages the unit/site` : `Please select the tenants that currently reside or previously resided in this unit.`,
        applicantSelectHelp: this.isRespondentLandlord ? `If the name of the landlord is not listed below, please click the Edit link.` : `If the name of the tenant is not listed below, please click the Edit link.`,
        enableUnitType: !IntakeCeuDataParser.isMHPTA()
      }),
      stepComplete: true
    }));

    this.first_view_id = 'unitCountRegion';
  },

  setupFlows() {
    this.listenTo(this.getPageItem('unitCountRegion'), 'itemComplete', (options) => {
      if (!this.unitCountModel.isValid()) return;
      
      const newCount = this.unitCountModel.getData({ parse: true });
      if (newCount < this.units.length) {
        modalChannel.request('show:standard', {
          title: 'Removing a Unit',
          bodyHtml: 'To remove a unit from your application, please click the red garbage can icon. Press cancel to return to your application.',
          hideContinueButton: true
        });
        this.unitCountModel.set('value', this.units.length);
        this.unitCountModel.trigger('render');
      } else {
        this.units.setTo(newCount, { silent: true });
        this.showPageItem('unitsRegion', options);
      }

      this.showNextButton(_.extend({}, {no_animate: true}));
    });
  },

  setupListeners() {
    this.listenTo(this.units, 'click:delete', (unitModel) => {
      this.units.remove(unitModel);
      this.unitCountModel.set('value', Number(this.unitCountModel.get('value')) - 1, { silent: true })
        .trigger('render');
    });

    this.listenTo(this.unitCountModel, 'change:value', () => {
      // Clear any error message on the total
      this.totalCountModel.trigger('render');
    });
    
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  validatePage() {
    const totalCount = this.totalCountModel.getData({ parse: true });
    const unitCount = this.unitCountModel.getData({ parse: true });
    let isValid = CeuPage.prototype.validatePage.call(this);

    if (totalCount && unitCount && totalCount < unitCount) {
      isValid = false;
      this.getPageItem('totalCountRegion')?.showErrorMessage(`The total number of rental units impacted cannot be fewer than the number of rental units you are providing information for.`);
    }

    return isValid;
  },

  previousPage() {
    Backbone.history.navigate('#page/4', {trigger: true});
  },

  nextPage() {
    if (!this.validatePage()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {force_scroll: true, is_page_item: true});
      }
      return;
    }

    loaderChannel.trigger('page:load');

    const saveData = {
      g_rental_units_impacted: this.totalCountModel.getData({ parse: true }),
      g_rental_units_provided: this.unitCountModel.getData({ parse: true }),
    };
    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    
    // Apply unit updates
    this.units.saveInternalDataToModel();
    IntakeCeuDataParser.setUnitCollection(this.units);

    const existingData = IntakeCeuDataParser.toJSON();
    IntakeCeuDataParser.setJSON(Object.assign({}, existingData, saveData));
    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      applicationChannel.trigger('progress:step:complete', 5);
      Backbone.history.navigate('#page/6', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this));
  },

  className: `${CeuPage.prototype.className} intake-ceu-p5`,

  regions: {
    totalCountRegion: '.intake-ceu-p5__totalUnits',
    unitCountRegion: '.intake-ceu-p5__unitCount',
    unitsRegion: '.intake-ceu-p5__units',
  },

  template() {
    return <>
      <div className="intake-ceu-p5__totalUnits"></div>
      <div className="intake-ceu-p5__unitCount"></div>
      <div className="intake-ceu-p5__units"></div>
      
      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="submit">BACK</button>
          <button className="navigation option-button step-next" type="submit">NEXT</button>
      </div>
    </>

  }
});

_.extend(IntakeCeuPageUnits.prototype, ViewJSXMixin);
export default IntakeCeuPageUnits;