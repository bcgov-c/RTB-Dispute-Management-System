import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import AddressView from '../../../../core/components/address/Address';
import AddressModel from '../../../../core/components/address/Address_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import TOU_template from '../../../../core/components/tou/TOU_template.tpl';
import QuestionEvents from '../../../../core/components/question/Question_events.js';

const touLinkClass = 'accepted-terms-link';

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const applicationChannel = Radio.channel('application');

export default PageView.extend({
  // Should be overriden
  template: _.noop,
  // Should be overriden
  pageItemsConfig: null,

  regions: {
    touRegion: '#p1-TOU',
    propertyType: '#p1-PropertyType',
    manufacturedHomeType: '#p1-ManufacturedHomeType',
    rentalAddress: '#p1-RentalAddress',
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      'out-of-bc-warning': '#out-of-bc-warning',
      mhptaWarning: '#p1-mhptaWarning',
      touContents: '.info-help-container',
    });
  },

  events() {
    return _.extend({}, PageView.prototype.events, {
      [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
    });
  },

  clickTermsOfUseLink(e) {
    e.preventDefault();
    const touContentsEle = this.getUI('touContents');

    if (touContentsEle.hasClass('help-opened')) {
      touContentsEle.slideUp({duration: 400, complete: function() {
        touContentsEle.removeClass('help-opened');
      }});
    } else {
      touContentsEle.addClass('help-opened');
      touContentsEle.find('.close-help').on('click', _.bind(this.clickTermsOfUseLink, this));
      touContentsEle.slideDown({duration: 400});
    }
  },

  getRoutingFragment() {
    return 'page/1';
  },

  cleanupPageInProgress() {
    const dispute = disputeChannel.request('get');
    if (dispute) {
      dispute.resetModel();
    }
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 1);
  },

  // Create all the models and page items for this intake page
  createPageItems() {
    const dispute = disputeChannel.request('get');
    const step1HasProgress = dispute.get('questionCollection').find(function(q) { return q.get('group_id') === 11 && q.get('question_answer') !== null });

    // Add event handlers
    const eventHandlers = [
      { pageItem: 'propertyType', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
    ];

    PageItemCreator.definePageItemEventHandlers(this, this.pageItemsConfig, eventHandlers);
    PageItemCreator.buildPageItemsFromConfig(this, this.pageItemsConfig);

    const touCheckboxModel = new CheckboxModel({
      html: `<span class="accepted-terms-content">I agree to the Residential Tenancy online systems </span><span class="${touLinkClass}">Terms of Use</span>`,
      disabled: !!step1HasProgress,
      checked: !!step1HasProgress,
      required: true,
      ignoredLinkClass: touLinkClass
    });

    this.addPageItem('touRegion', new PageItemView({
      stepText: null,
      subView: new CheckboxView({ model: touCheckboxModel }),
      stepComplete: touCheckboxModel.isValid()
    }));

    const rentalAddressApiMappings = {
      street: 'tenancy_address',
      city: 'tenancy_city',
      country: 'tenancy_country',
      postalCode: 'tenancy_zip_postal',
      geozoneId: 'tenancy_geozone_id',
      addressIsValidated: 'tenancy_address_validated'
    };
    const rentalAddressModel = new AddressModel({
        json: _.mapObject(rentalAddressApiMappings, function(val) { return dispute.get(val); }),
        apiMapping: rentalAddressApiMappings,
        required: true,
        selectProvinceAndCountry: false,
        showUpdateControls: true,
        useSubLabel: false,
        useAddressValidation: true,
      }),
      is_rental_address_valid = rentalAddressModel.isValid();

    // Create rental address component
    this.addPageItem('rentalAddress', new PageItemView({
      stepText: 'What is the address of the rental unit or site where you are seeking a rent increase?',
      subView: new AddressView({ model: rentalAddressModel }),
      stepComplete: is_rental_address_valid
    }));

    this.first_view_id = 'touRegion';
  },

  // Add listeners and relationships onto page items
  setupListenersBetweenItems() {
    
  },

  _showOrHideWarning(uiEleName, toShow=false) {
    const ele = this.getUI(uiEleName);
    if (ele && ele.length) {
      animationChannel.request('run', ele, toShow ? 'fadeIn' : 'fadeOut');
    }
  },

  showOutOfBCWarning() {
    this._showOrHideWarning('out-of-bc-warning', true);
  },

  hideOutOfBCWarning() {
    this._showOrHideWarning('out-of-bc-warning', false);
  },

  showMhptaWarning() {
    this._showOrHideWarning('mhptaWarning', true);
  },

  hideMhptaWarning() {
    this._showOrHideWarning('mhptaWarning', false);
  },

  // To be overriden
  setupFlows() {
    
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView)
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  getPageApiUpdates() {
    return this.getAllPageXHR();
  },

  performNextPageApiCalls(all_xhr) {
    all_xhr = all_xhr && !_.isEmpty(all_xhr) ? all_xhr : [];

    const onNextSuccessFn = function() {
      applicationChannel.trigger('progress:step:complete', 1);
      Backbone.history.navigate('page/2', {trigger: true});
    };

    _.each(this.getPageApiUpdates(), function(xhr) {
      all_xhr.push(xhr);
    });

    if (all_xhr.length === 0) {
      console.log("[Info] No changes to the Dispute or IntakeQuestions API.  Moving to next page");
      onNextSuccessFn();
      return;
    }

    loaderChannel.trigger('page:load');
    Promise.all(all_xhr.map(xhr => xhr())).then(() => {
      loaderChannel.trigger('page:load:complete');
      console.log("[Info] API updates successful.  Moving to next page");
      onNextSuccessFn();
    }, this.createPageApiErrorHandler(this, 'INTAKE.PAGE.NEXT.GENERAL'));
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    this.performNextPageApiCalls();
  },

  templateContext() {  
    return {
      TOU_template: TOU_template(),
    };
  }
});
