import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import QuestionView from '../../../core/components/question/Question';
import QuestionModel from '../../../core/components/question/Question_model';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import ClaimCheckboxCollection from '../claim-checkbox/ClaimCheckbox_collection';
import ClaimCheckboxCollectionView from '../claim-checkbox/ClaimCheckboxes';

const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');

// Uses Page.js's buildPageItem function to create and register a page item on the page.
// Uses configs to generate page items and subcomponents
const PageItemCreator = Marionette.Object.extend({

  // Builds a Question object that maps to a Question on the server
  _buildQuestionMappingPageItem(item_config) {
    const matchingQuestion = this.dispute.get('questionCollection').findWhere({ question_name: item_config.question_name });
    if (!matchingQuestion) {
      const errorMsg = `[Error] Need to have a matching API question to create page question.`;
      console.log(errorMsg, item_config);
      alert(errorMsg);
      return [{}, {}];
    }
    const page_item_options = typeof item_config.page_item_options !== "function" ? item_config.page_item_options :
        item_config.page_item_options(matchingQuestion),
      question_options = typeof item_config.question_options !== "function" ? item_config.question_options :
        item_config.question_options(matchingQuestion);

    // Map over event handlers
    if (item_config.page_item_events) {
      const eventNames = Object.keys(item_config.page_item_events);
      eventNames.forEach((eventName) => {
        question_options[eventName] = item_config.page_item_events[eventName];
      });
    }

    matchingQuestion.set(question_options, {silent: true});

    return [page_item_options, { model: matchingQuestion } ];
  },

  // Builds a Question object that maps to a field of the Dispute on the server
  _buildDisputeMappingPageItem(item_config) {
    const page_item_options = typeof item_config.page_item_options !== "function" ? item_config.page_item_options :
        item_config.page_item_options(item_config.api_attribute, this.dispute.get(item_config.api_attribute));

    const question_options = typeof item_config.question_options !== "function" ? item_config.question_options :
        item_config.question_options(item_config.api_attribute, this.dispute.get(item_config.api_attribute));

    // Map over event handlers
    if (item_config.page_item_events) {
      const eventNames = Object.keys(item_config.page_item_events);
      eventNames.forEach((eventName) => {
        question_options[eventName] = item_config.page_item_events[eventName];
      });
    }

    return [page_item_options, { model: new QuestionModel(_.extend({}, question_options, { apiToUse: 'dispute' })) }];
  },

  // Builds a Question object that maps to a selection/no-selection of claimCodes present on server
  _buildClaimQuestionPageItem(item_config) {
    return this._buildQuestionMappingPageItem(item_config);
  },

  // Builds a claimCheckbox, list of questions
  _buildClaimsPageItem(item_config) {
    const page_item_options = typeof item_config.page_item_options !== "function" ? item_config.page_item_options :
        item_config.page_item_options(this.parsedClaims);
    const claims_options = typeof item_config.claims_options !== "function" ? item_config.claims_options :
        item_config.claims_options(this.parsedClaims);

    return [page_item_options, { collection: new ClaimCheckboxCollection(_.map(claims_options, function(claim_option) {
      return _.extend(claim_option, {
        checkbox: claim_option.checkboxOptions ? new CheckboxModel(claim_option.checkboxOptions) : null,
        dropdown: claim_option.dropdownOptions ? new DropdownModel(claim_option.dropdownOptions) : null,
        secondDropdown: claim_option.secondDropdownOptions ? new DropdownModel(claim_option.secondDropdownOptions) : null,
        thirdDropdown: claim_option.thirdDropdownOptions ? new DropdownModel(claim_option.thirdDropdownOptions) : null,
        fourthDropdown: claim_option.fourthDropdownOptions ? new DropdownModel(claim_option.fourthDropdownOptions) : null,
        extraValidationFn: claim_option.extraValidationFn || null,
        hasRepaymentErrorFn: claim_option.hasRepaymentErrorFn || null
      });
    })) } ];
  },

  definePageItemEventHandlers(pageView, pageItemsConfig, eventMap) {
    if (!pageItemsConfig) return;
    if (!(eventMap instanceof Array)) return;

    eventMap.forEach((item) => {
      pageItemsConfig[item.pageItem] = this.definePageItemEventHandler(pageItemsConfig[item.pageItem], item.event, item.handler);
    });
  },

  definePageItemEventHandler(itemConfig, eventName, eventHandler) {
    if (!itemConfig.hasOwnProperty('page_item_events')) {
      itemConfig.page_item_events = {};
    }

    if (!itemConfig.page_item_events.hasOwnProperty(eventName)) {
      Object.defineProperty(itemConfig.page_item_events, eventName, {
        value: eventHandler,
        enumerable: true,
        writable: true,
        configurable: true
      });
    }

    return itemConfig;
  },

  buildPageItemFromConfig(pageView, pageItemsConfig, config_item_name) {
    if (!_.has(pageItemsConfig, config_item_name)) {
      console.log(`[Error] Can't build page item ${name} from current page config`);
      return;
    }
    const item_config = pageItemsConfig[config_item_name],
      item_type = item_config.type;

    let options_parse_result = [{}, {}],
      viewToUse = QuestionView;

    if (item_type === 'dispute') {
      options_parse_result = this._buildDisputeMappingPageItem(item_config);
    } else if (item_type === 'question') {
      options_parse_result = this._buildQuestionMappingPageItem(item_config);
    } else if (item_type === 'claimQuestion') {
      options_parse_result = this._buildClaimQuestionPageItem(item_config);
    } else if (item_type === 'claims') {
      options_parse_result = this._buildClaimsPageItem(item_config);
      viewToUse = ClaimCheckboxCollectionView;
    }

    pageView.buildPageItem(config_item_name, options_parse_result[0], new viewToUse(options_parse_result[1]));
  },

  buildPageItemsFromConfig(pageView, pageItemsConfig) {
    pageItemsConfig = pageItemsConfig || {};
    // Stash channel values first
    this.dispute = disputeChannel.request('get');
    this.disputeClaims = claimsChannel.request('get');
    this.parsedClaims = this.disputeClaims.toClaimCodeLookup();

    _.each(_.keys(pageItemsConfig), function(config_item_name) {
      this.buildPageItemFromConfig(pageView, pageItemsConfig, config_item_name);
    }, this);
  }
});

export default new PageItemCreator();
