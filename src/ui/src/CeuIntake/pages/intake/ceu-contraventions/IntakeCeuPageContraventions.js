import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import PageItemsConfig from './intake_ceu_issues_page_config';
import QuestionEvents from '../../../../core/components/question/Question_events';
import Question_model from '../../../../core/components/question/Question_model';
import Question from '../../../../core/components/question/Question';
import ClaimCheckboxes from '../../../components/claim-checkbox/ClaimCheckboxes';
import ClaimCheckbox_collection from '../../../components/claim-checkbox/ClaimCheckbox_collection';
import Checkbox_model from '../../../../core/components/checkbox/Checkbox_model';
import Dropdown_model from '../../../../core/components/dropdown/Dropdown_model';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import CeuPage from '../../../components/page/CeuPage';

const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageContraventions = CeuPage.extend({
  
  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);
    this.template = this.template.bind(this);

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    this.hasContraventionData = IntakeCeuDataParser.hasContraventionData();
    this.contraventions = IntakeCeuDataParser.getContraventionCollection();

    this.isRespondentLandlord = IntakeCeuDataParser.isRespondentLandlord();
    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 6);
  },

  getPageApiUpdates() {
    const savedContraventions = this.contraventions.map(c => c.get('c_code'));
    const selectedContraventions = this.getSelectedClaims();
    
    const hasUnsavedChanges = (!selectedContraventions.length && !selectedContraventions.length) ? false : (
      savedContraventions.length !== selectedContraventions.length ||
      _.difference(savedContraventions, selectedContraventions).length
    );

    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/6';
  },

  createPageItems() {
    // Add automatic Yes/No user checks:
    const eventHandlers = [
      { pageItem: 'LandlordOrdersRepairs', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordIntimidation', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordIllegalFees', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordBlockingAccess', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordGeneralUnlawful', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantUnpaidRent', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantGeneralUnlawful', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
    ];
    PageItemCreator.definePageItemEventHandlers(this, PageItemsConfig, eventHandlers);
    
    this.createLandlordPageItems();

    this.first_view_id = this.isRespondentLandlord ? 'LandlordOrdersRepairs' : 'TenantUnpaidRent';
  },

  createLandlordPageItems() {
    Object.keys(PageItemsConfig).forEach(pageItem => {
      const config = PageItemsConfig[pageItem];
      this.ceuBuildPageItem(pageItem, config);
    })
  },

  ceuBuildPageItem(pageItemName, item_config={}) {
    const selectedContraventionCodes = this.contraventions.map(c => c.get('c_code'));
    let viewToUse;
    let options_parse_result;
    
    // -- Taken from Intake -> PageItemCreator.js
    if (item_config.type === 'claimQuestion') {
      viewToUse = Question;

      const linkedConfig = PageItemsConfig[item_config.linked_claims] || {};
      const availableContraventionCodes = linkedConfig.selection_claims || [];

      // Add function on the model to be used in the issue page sorting
      const questionModel = new Question_model({
        question_answer: this.hasContraventionData ?
          (availableContraventionCodes.some(c => selectedContraventionCodes.indexOf(c) !== -1) ? '1' : '0')
          : null
      });
      const page_item_options = typeof item_config.page_item_options !== "function" ? item_config.page_item_options :
          item_config.page_item_options(questionModel);
      const question_options = typeof item_config.question_options !== "function" ? item_config.question_options :
          item_config.question_options(questionModel);

      // Map over event handlers
      if (item_config.page_item_events) {
        const eventNames = Object.keys(item_config.page_item_events);
        eventNames.forEach((eventName) => {
          question_options[eventName] = item_config.page_item_events[eventName];
        });
      }
      questionModel.set(question_options, { silent: true });
      options_parse_result = [page_item_options, { model: questionModel } ];
    } else if (item_config.type === 'claims') {
      viewToUse = ClaimCheckboxes;

      const page_item_options = typeof item_config.page_item_options !== "function" ? item_config.page_item_options :
        item_config.page_item_options(selectedContraventionCodes);
      const claims_options = typeof item_config.claims_options !== "function" ? item_config.claims_options :
          item_config.claims_options(selectedContraventionCodes);

      options_parse_result = [page_item_options, { collection: new ClaimCheckbox_collection(_.map(claims_options, function(claim_option) {
        return _.extend(claim_option, {
          checkbox: claim_option.checkboxOptions ? new Checkbox_model(claim_option.checkboxOptions) : null,
          dropdown: claim_option.dropdownOptions ? new Dropdown_model(claim_option.dropdownOptions) : null,
          secondDropdown: claim_option.secondDropdownOptions ? new Dropdown_model(claim_option.secondDropdownOptions) : null,
          thirdDropdown: claim_option.thirdDropdownOptions ? new Dropdown_model(claim_option.thirdDropdownOptions) : null,
          fourthDropdown: claim_option.fourthDropdownOptions ? new Dropdown_model(claim_option.fourthDropdownOptions) : null,
          extraValidationFn: claim_option.extraValidationFn || null,
          hasRepaymentErrorFn: claim_option.hasRepaymentErrorFn || null
        });
      })) } ];
    }

    if (!viewToUse || !options_parse_result || options_parse_result.length < 2) {
      console.log(`Invalid page config item: ${pageItemName}`);
      return;
    }

    this.buildPageItem(pageItemName, options_parse_result[0], new viewToUse(options_parse_result[1]));
  },

  setupListenersBetweenItems() {
    this.setupIssueClaimComponentsFlows();

    _.each(this.page_items, function(itemView) {
      if (!itemView) {
        return;
      }
      const collection = itemView.getCollection(),
        model = itemView.getModel();
      if (collection) {
        this.listenTo(collection, 'change:checked', this.updateClaimsCount, this);
        this.listenTo(collection, 'dropdownChanged', this.updateClaimsCount, this);
      } else if (model && !_.contains(this.urgentIssueNames, itemView.currentId)) {
        this.listenTo(model, 'change:question_answer', this.updateClaimsCount, this);
      }
    }, this);

  },


  deselectAndHideItem(pageItemId, options) {
    const pageItem = this.getPageItem(pageItemId);
    if (!pageItem) {
      return;
    }

    if (pageItem.getModel() && pageItem.getModel().get('question_answer') === "1") {
      pageItem.getModel().set('question_answer', 0, { silent: true} );
    } else if (pageItem.getCollection()) {
      pageItem.getCollection().each(function(claimCheckbox) {
        claimCheckbox.set('checked', false, { silent: true });
        const checkboxModel = claimCheckbox.get('checkbox');
        if (checkboxModel) {
          checkboxModel.set('checked', false, { silent: true });
        }
      });
    }

    this.hideAndCleanPageItem(pageItemId, options);
  },

  hideAndCleanPageItem(pageItemId, options) {
    const pageItem = this.getPageItem(pageItemId);

    this.listenToOnce(pageItem, 'itemHidden', function() {
      pageItem.render();
    });
    this.hidePageItem(pageItemId, options);
  },

  setupFlows() {
    if (this.isRespondentLandlord) this.setupStandardLandlordFlows();
    else this.setupStandardTenantFlows();
  },

  setupStandardLandlordFlows() {
    const LandlordOrdersRepairs = this.getPageItem('LandlordOrdersRepairs');
    this.listenTo(LandlordOrdersRepairs, 'itemComplete', function(options) {
      const answer = LandlordOrdersRepairs.getModel().get('question_answer');
      this.showPageItem('LandlordIntimidation', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const LandlordIntimidation = this.getPageItem('LandlordIntimidation');
    this.listenTo(LandlordIntimidation, 'itemComplete', function(options) {
      const answer = LandlordIntimidation.getModel().get('question_answer');
      this.showPageItem('LandlordIllegalFees', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const LandlordIllegalFees = this.getPageItem('LandlordIllegalFees');
    this.listenTo(LandlordIllegalFees, 'itemComplete', function(options) {
      const answer = LandlordIllegalFees.getModel().get('question_answer');
      this.showPageItem('LandlordBlockingAccess', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const LandlordBlockingAccess = this.getPageItem('LandlordBlockingAccess');
    this.listenTo(LandlordBlockingAccess, 'itemComplete', function(options) {
      const answer = LandlordBlockingAccess.getModel().get('question_answer');
      this.showPageItem('LandlordGeneralUnlawful', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const LandlordGeneralUnlawful = this.getPageItem('LandlordGeneralUnlawful');
    this.listenTo(LandlordGeneralUnlawful, 'itemComplete', function(options) {
      this.showNextButton(options);
    }, this);
  },

  setupStandardTenantFlows() {
    const TenantUnpaidRent = this.getPageItem('TenantUnpaidRent');
    this.listenTo(TenantUnpaidRent, 'itemComplete', function(options) {
      const answer = TenantUnpaidRent.getModel().get('question_answer');
      this.showPageItem('TenantGeneralUnlawful', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);
    
    const TenantGeneralUnlawful = this.getPageItem('TenantGeneralUnlawful');
    this.listenTo(TenantGeneralUnlawful, 'itemComplete', function(options) {
      this.showNextButton(options);
    }, this);
  },

  _isClaimQuestion(questionsConfigItem) {
    return questionsConfigItem && questionsConfigItem.type === 'claimQuestion';
  },


  // Sets up the listeners that will show/hide a claim when its assocated question is changed
  setupIssueClaimComponentsFlows() {
    _.each(this.page_items, function(itemView, regionName) {
      if (_.has(PageItemsConfig, regionName)) {
        const linked_claims_name = PageItemsConfig[regionName].linked_claims;
        if (this._isClaimQuestion(PageItemsConfig[regionName]) && _.has(PageItemsConfig, linked_claims_name)) {
          const questionPageItem = this.getPageItem(regionName);

          this.listenTo(questionPageItem, 'itemComplete', function(options) {
            if (this.isPageCurrentlySaving) { return; }
            const answer = questionPageItem.getModel().get('question_answer');
            if (answer === "1") {
              this.showPageItem(linked_claims_name, options);
            } else if (answer === "0") {
              this.deselectAndHideItem(linked_claims_name, options);
            }
          }, this);
        }
      }
    }, this);
  },

  /**
   * Returns the count of issues that have been selected.  If a checkbox is selected but its parent question is hidden,
   * then it will not count as being selected.
   * @returns {number} - The number of issues selected.
   */
  getNumIssuesSelected() {
    const selected_claims = this.getSelectedClaims();
    return selected_claims ? selected_claims.length : 0;
  },

  getActiveClaimCheckboxCollections() {
    const questionsSetToYes = _.filter(this.page_items, function(page_item) {
      return page_item.isActive() && page_item.getModel() && page_item.getModel().getData() === "1";
    });
    
    const activeLinkedClaims = _.map(questionsSetToYes, function(page_item) {
      return page_item.getOption('linked_claims');
    });

    return _.map(
      _.filter(this.page_items, page_item => page_item.isActive() && page_item.getCollection() && _.contains(activeLinkedClaims, page_item.currentId)),
      function(page_item) { return page_item.getCollection(); }
    );
  },


  getSelectedClaims() {
    // Get questions that link directly to one claim
    const selected_claims = [];

    const questionsSetToYes = _.filter(this.page_items, function(page_item) {
          return page_item.isActive() && page_item.getModel() && page_item.getModel().getData() === "1"; });
    _.each(questionsSetToYes, function(question) {
      if (question.getOption('question_claim_code')) {
        selected_claims.push(question.getOption('question_claim_code'));
      }
    });

    const activeClaimCheckboxes = this.getActiveClaimCheckboxCollections();

    _.each(activeClaimCheckboxes, function(activeCheckbox) {
      _.each(activeCheckbox.getData(), function(checkboxModel) {
        const selectedClaimCodes = checkboxModel.getChosenClaimCodes();
        if (!_.isEmpty(selectedClaimCodes)) {
          selected_claims.push.apply(selected_claims, selectedClaimCodes);
        }
      });
    });
    return selected_claims;
  },

  updateClaimsCount() {
    this.getUI('noClaimsError').hide();
    const num_issues_selected = this.getNumIssuesSelected();
    this.getUI('claimsCount').text(`${num_issues_selected} Contravention${num_issues_selected === 1?'':'s'} Selected`);
  },

  previousPage() {
    Backbone.history.navigate('#page/5', {trigger: true});
  },

  validatePage() {
    const num_issues_selected = this.getNumIssuesSelected();
    if (!num_issues_selected) {
      this.getUI('noClaimsError').show();
    }

    return CeuPage.prototype.validatePage.call(this) && num_issues_selected;
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

    const selectedClaims = this.getSelectedClaims();
    // Remove any saved claims that are not selected anymore
    const toRemove = this.contraventions.filter(c => selectedClaims.indexOf(c.get('c_code')) === -1);
    
    this.contraventions.remove(toRemove);

    selectedClaims.forEach(selectedClaim => {
      if (!this.contraventions.findWhere({ c_code: selectedClaim })) {
        const newContravention = this.contraventions.add({ c_code: selectedClaim });
        newContravention.set('c_title', newContravention.config.issueTitle);
      }
    });

    // Apply contravention collection updates
    IntakeCeuDataParser.setContraventionCollection(this.contraventions);
    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      applicationChannel.trigger('progress:step:complete', 6);
      Backbone.history.navigate('#page/7', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this));
  },


  className: `${CeuPage.prototype.className} intake-ceu-p6`,

  ui() {
    return _.extend({}, CeuPage.prototype.ui, {
      noClaimsError: '.no-claims-error',
      claimsCount: '.claim-number-text'
    });
  },

  regions: {
    LandlordOrdersRepairs: '.intake-ceu-p6__LandlordOrdersRepairs',
    LandlordOrdersRepairsClaims: '.intake-ceu-p6__LandlordOrdersRepairsClaims',
    LandlordIntimidation: '.intake-ceu-p6__LandlordIntimidation',
    LandlordIntimidationClaims: '.intake-ceu-p6__LandlordIntimidationClaims',
    LandlordIllegalFees: '.intake-ceu-p6__LandlordIllegalFees',
    LandlordIllegalFeesClaims: '.intake-ceu-p6__LandlordIllegalFeesClaims',
    LandlordBlockingAccess: '.intake-ceu-p6__LandlordBlockingAccess',
    LandlordBlockingAccessClaims: '.intake-ceu-p6__LandlordBlockingAccessClaims',
    LandlordGeneralUnlawful: '.intake-ceu-p6__LandlordGeneralUnlawful',
    LandlordGeneralUnlawfulClaims: '.intake-ceu-p6__LandlordGeneralUnlawfulClaims',

    TenantUnpaidRent: '.intake-ceu-p6__TenantUnpaidRent',
    TenantUnpaidRentClaims: '.intake-ceu-p6__TenantUnpaidRentClaims',
    TenantGeneralUnlawful: '.intake-ceu-p6__TenantGeneralUnlawful',
    TenantGeneralUnlawfulClaims: '.intake-ceu-p6__TenantGeneralUnlawfulClaims',
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  /**
   * When the content is rendered, then get the selected issues count.
   */
  onDomRefresh() {
    this.updateClaimsCount();
  },

  template() {
    return <>
      {this.renderJsxLandlordClaims()}
      {this.renderJsxTenantClaims()}
      
      <div className="claim-issue-number-container">
        <span className="claim-number-text"></span>
      </div>
      <div className="no-claims-error error-block hidden-item">To submit a complaint, you must add at least one contravention or issue. You must select yes to at least one question above  to show the issues in that category. If your issue is not listed above, please contact the&nbsp;<a href="javascript:;" className="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.</div>
      
      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="button">BACK</button>
        <button className="navigation option-button step-next step-next-disabled" type="submit">NEXT</button>
      </div>
    </>;
  },

  renderJsxLandlordClaims() {
    return <>
      <div className="intake-ceu-p6__LandlordOrdersRepairs step claim-question hidden-step"></div>
      <div className="intake-ceu-p6__LandlordOrdersRepairsClaims step claim-selection hidden-step"></div>

      <div className="intake-ceu-p6__LandlordIntimidation step claim-question hidden-step"></div>
      <div className="intake-ceu-p6__LandlordIntimidationClaims step claim-selection hidden-step"></div>

      <div className="intake-ceu-p6__LandlordIllegalFees step claim-question hidden-step"></div>
      <div className="intake-ceu-p6__LandlordIllegalFeesClaims step claim-selection hidden-step"></div>

      <div className="intake-ceu-p6__LandlordBlockingAccess step claim-question hidden-step"></div>
      <div className="intake-ceu-p6__LandlordBlockingAccessClaims step claim-selection hidden-step"></div>

      <div className="intake-ceu-p6__LandlordGeneralUnlawful step claim-question hidden-step"></div>
      <div className="intake-ceu-p6__LandlordGeneralUnlawfulClaims step claim-selection hidden-step"></div>
    </>
  },

  renderJsxTenantClaims() {
    return <>
    <div className="intake-ceu-p6__TenantUnpaidRent step claim-question hidden-step"></div>
    <div className="intake-ceu-p6__TenantUnpaidRentClaims step claim-selection hidden-step"></div>

    <div className="intake-ceu-p6__TenantGeneralUnlawful step claim-question hidden-step"></div>
    <div className="intake-ceu-p6__TenantGeneralUnlawfulClaims step claim-selection hidden-step"></div>
  </>
  },

});

_.extend(IntakeCeuPageContraventions.prototype, ViewJSXMixin);
export default IntakeCeuPageContraventions;
