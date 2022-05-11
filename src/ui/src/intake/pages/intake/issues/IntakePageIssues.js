import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemCreator from '../../../components/page-item-creator/PageItemCreator';
import PageItemsConfig from './intake_issues_page_config';
import QuestionEvents from '../../../../core/components/question/Question_events';
import ModalIssueDeletes from '../../../components/modals/modal-issue-deletes/ModalIssueDeletes';
import template from './IntakePageIssues_template.tpl';

import TrialLogic_BIGEvidence from '../../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalIntakeIssueIntervention from '../../../../core/components/trials/BIGEvidence/ModalIntakeIssueIntervention';

const URGENT_TENANT_POSSESSION_MODAL_WARNING_HTML = "<p>By selecting this issue you may get an expedited hearing.  Select this issue only if you have been denied access to the rental unit or site by your landlord and you urgently require an order of possession. If you have additional issues, you may complete a separate application for dispute resolution for those issues as no other issues can be combined with an expedited hearing for a tenant's order of possession.</p><p>If this is not an urgent application press cancel. If you are certain this is an urgent application press continue.</p>";
const URGENT_TENANT_REPAIRS_MODAL_WARNING_HTML = `
  <p>By selecting this issue you may get an expedited hearing.  If you want to request a rent reduction for repairs that the landlord is taking too long to complete, or for repairs you have already paid for, you should complete an application for monetary compensation or a reduction in rent, as monetary claims cannot be combined with an expedited hearing for emergency repairs.</p>
  <p>If this is not an urgent application press cancel. If you are certain this is an urgent application press continue.</p>
  <p><a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/repairs-and-maintenance">Click here</a> for information on emergency repairs.</p>
`;

const RENT_REPAIRS_REDUCTION_MODAL_INFO_HTML = `<p>You may request a rent reduction if you have asked your landlord in writing to make repairs but the repairs have not been completed.  If you would like to include a request for rent reduction in your application, select "Include".  If you do not want to include a request for rent reduction in your application select "Don't Include".</p>`

const CLAIM_CODE_RR = 222;
const CLAIM_CODE_RP = 214;

const configChannel = Radio.channel('config');
const applicationChannel = Radio.channel('application');
const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');

export default PageView.extend({
  template,

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      repaymentError: '.repayment-error',
      noClaimsError: '.no-claims-error',
      claimsCount: '.claim-number-text'
    });
  },

  regions: {
    LandlordUrgentIssue: '#p4-LandlordUrgentIssue',
    LandlordDirectRequest: '#p4-LandlordDirectRequest',
    LandlordDirectRequestClaims: '#p4-LandlordDirectRequestClaims',
    LandlordSeekingMoveOut: "#p4-LandlordSeekingMoveOut",
    LandlordSeekingMoveOutClaims: "#p4-LandlordSeekingMoveOutClaims",
    LandlordSeekingMoney: "#p4-LandlordSeekingMoney",
    LandlordSeekingMoneyClaims: "#p4-LandlordSeekingMoneyClaims",

    TenantUrgentPossession: '#p4-TenantUrgentPossession',
    TenantUrgentRepairs: '#p4-TenantUrgentRepairs',
    TenantDirectRequest: '#p4-TenantDirectRequest',
    TenantDirectRequestClaims: '#p4-TenantDirectRequestClaims',
    TenantSeekingMoveOut: "#p4-TenantSeekingMoveOut",
    TenantSeekingMoveOutClaims: "#p4-TenantSeekingMoveOutClaims",
    TenantSeekingMoney: '#p4-TenantSeekingMoney',
    TenantSeekingMoneyClaims: '#p4-TenantSeekingMoneyClaims',
    TenantSeekingRepairs: '#p4-TenantSeekingRepairs',
    TenantSeekingRepairsClaims: '#p4-TenantSeekingRepairsClaims',
    TenantSeekingService: '#p4-TenantSeekingService',
    TenantSeekingServiceClaims: '#p4-TenantSeekingServiceClaims',
    TenantSeekingRestriction: '#p4-TenantSeekingRestriction',
    TenantSeekingRestrictionClaims: '#p4-TenantSeekingRestrictionClaims',
    TenantSeekingOther: '#p4-TenantSeekingOther',
    TenantSeekingOtherClaims: '#p4-TenantSeekingOtherClaims'
  },

  getRoutingFragment() {
    return 'page/5';
  },

  // If we are moving on, remove any front-end claims we've added
  cleanupPageInProgress() {
    // Clean up any claims that were added but not saved
    if (this.disputeClaims && this.disputeClaims.length) {
      const newDisputesClaims = this.disputeClaims.filter(function(disputeClaim) { return disputeClaim.isNew(); });
      console.log('new dispute claims: ', newDisputesClaims);
      this.disputeClaims.remove(newDisputesClaims);
    }

    // Reset question items to their original values
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.isPageCurrentlySaving = false;
    this.disputeClaims = claimsChannel.request('get');
    this.urgentIssueNames = ['LandlordUrgentIssue', 'TenantUrgentPossession', 'TenantUrgentRepairs'];

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 5);
  },

  createPageItems() {
    const eventHandlers = [
      { pageItem: 'LandlordDirectRequest', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordSeekingMoveOut', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'LandlordSeekingMoney', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantDirectRequest', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingMoveOut', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingMoney', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingRepairs', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingService', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingRestriction', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) },
      { pageItem: 'TenantSeekingOther', event: 'beforeClick', handler: QuestionEvents.beforeYesNoChange.bind(this) }
    ];

    PageItemCreator.definePageItemEventHandlers(this, PageItemsConfig, eventHandlers);
    PageItemCreator.buildPageItemsFromConfig(this, PageItemsConfig);

    const dispute = disputeChannel.request('get');
    const isPastTenancy = dispute.isPastTenancy();
    
    if (dispute.isLandlord()) {
      this.first_view_id = isPastTenancy ? 'LandlordSeekingMoney' : 'LandlordUrgentIssue';
    } else if (isPastTenancy && dispute.hasDeposit() && !dispute.isMHPTA()) {
      this.first_view_id = 'TenantDirectRequest';
    } else if (isPastTenancy) {
      this.first_view_id = 'TenantSeekingMoney'  
    } else {
      this.first_view_id = 'TenantUrgentPossession';
    }
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

    const pageItem = this.getPageItem('TenantSeekingRepairsClaims');
    if (pageItem) {
      this.listenTo(pageItem.getCollection(), 'change:checked', function(model, value) {
        const hasSelectedRR = _.contains(this.getSelectedClaims(), CLAIM_CODE_RR);
        if (value && _.contains(model.getChosenClaimCodes(), CLAIM_CODE_RP) && !hasSelectedRR) {
          this.showModalRentRepairsReduction();
        }
      }, this);
    }
    
  },


  deselectAndHideItem(pageItemId, options) {
    const pageItem = this.getPageItem(pageItemId);
    if (!pageItem) {
      return;
    }

    if (pageItem.getModel() && pageItem.getModel().get('question_answer') === "1") {
      pageItem.getModel().set('question_answer', 0, { silent: true} );
    } else if (pageItem.getCollection()) {
      if (pageItemId !== 'LandlordDirectRequestClaims' && pageItemId !== 'TenantDirectRequestClaims') {
        pageItem.getCollection().each(function(claimCheckbox) {
          claimCheckbox.set('checked', false, { silent: true });
          const checkboxModel = claimCheckbox.get('checkbox');
          if (checkboxModel) {
            checkboxModel.set('checked', false, { silent: true });
          }
        });
      }
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
    this.setupUrgentIssuesFlows();
    this.setupDirectRequestFlows();
    this.setupStandardLandlordFlows();
    this.setupStandardTenantFlows();
  },

  showModalLandlordUrgentIssue(questionName, options) {
    modalChannel.request('show:standard', {
      title: 'Confirm Application Urgency',
      bodyHtml: `<p>You should only file an urgent application when it would be unreasonable or unfair to wait for the standard notice to end tenancy timeline.</p>
        <p>If you select this option you must provide evidence with this application to prove why this is urgent and how you cannot wait for a standard Notice to End Tenancy to be issued.  No other dispute issues can be included with this type of application except a request to recover filing fees.</p>
        <p>If you have other issues or this is not an urgent application press cancel.  If you are certain this is an urgent application press continue.</p>`,
      onContinueFn: _.bind(function(modalView) {
        modalView.close();
        this.deselectAndHideItem('LandlordDirectRequest', options);
        this.deselectAndHideItem('LandlordDirectRequestClaims', options);
        this.deselectAndHideItem('LandlordSeekingMoveOut', options);
        this.deselectAndHideItem('LandlordSeekingMoveOutClaims', options);
        this.deselectAndHideItem('LandlordSeekingMoney', options);
        this.deselectAndHideItem('LandlordSeekingMoneyClaims', options);

        this.updateClaimsCount();
        this.showNextButton(_.extend({}, options, {no_animate: true}));
      }, this),
      onCancelFn: _.bind(function(modalView) {
        modalView.close();
        // Click the "No" item
        this.getChildView('LandlordUrgentIssue').$('*[data-name="urgent-issue-no"]').click();
        this.updateClaimsCount();
      }, this)
    });
  },

  showModalTenantUrgentIssue(questionName, options) {
    const isUrgentPossession = questionName === 'TenantUrgentPossession';
    modalChannel.request('show:standard', {
      title: 'Confirm Issue Selection',
      bodyHtml: isUrgentPossession ? URGENT_TENANT_POSSESSION_MODAL_WARNING_HTML : URGENT_TENANT_REPAIRS_MODAL_WARNING_HTML,
      onContinueFn: _.bind(function(modalView) {
        modalView.close();
        if (isUrgentPossession) {
          this.deselectAndHideItem('TenantUrgentRepairs', options);
        }

        this.deselectAndHideItem('TenantSeekingMoveOut', options);
        this.deselectAndHideItem('TenantSeekingMoveOutClaims', options);
        this.deselectAndHideItem('TenantSeekingMoney', options);
        this.deselectAndHideItem('TenantSeekingMoneyClaims', options);
        this.deselectAndHideItem('TenantSeekingRepairs', options);
        this.deselectAndHideItem('TenantSeekingRepairsClaims', options);
        this.deselectAndHideItem('TenantSeekingService', options);
        this.deselectAndHideItem('TenantSeekingServiceClaims', options);
        this.deselectAndHideItem('TenantSeekingRestriction', options);
        this.deselectAndHideItem('TenantSeekingRestrictionClaims', options);
        this.deselectAndHideItem('TenantSeekingOther', options);
        this.deselectAndHideItem('TenantSeekingOtherClaims', options);

        this.updateClaimsCount();
        this.showNextButton(_.extend({}, options, {no_animate: true}));
      }, this),
      onCancelFn: _.bind(function(modalView) {
        modalView.close();
        // Click the "No" item
        this.getChildView(questionName).$('.option-button-no').click();
        this.updateClaimsCount();
      }, this)
    });
  },

  showModalRentRepairsReduction() {
    modalChannel.request('show:standard', {
      title: 'Option to Request a Rent Reduction',
      bodyHtml: RENT_REPAIRS_REDUCTION_MODAL_INFO_HTML,

      modalCssClasses: '',
      cancelButtonText: "Don't Include",
      primaryButtonText: 'Include',

      onContinueFn: _.bind(function(modalView) {
        modalView.close();
        // If "Include" is selected, then add an additional issue

        const moneyClaims = this.getPageItem('TenantSeekingMoneyClaims').getCollection();
        const moneyClaimRR = moneyClaims.find(claimCheckbox => claimCheckbox.get('claimCode') === CLAIM_CODE_RR);

        const moneyQuestionModel = this.getPageItem('TenantSeekingMoney').getModel();
        if (moneyQuestionModel.get('question_answer') !== '1') {
          moneyQuestionModel.set('question_answer', '1');
          moneyQuestionModel.trigger('render');
        }

        moneyClaimRR.setToChecked();
        moneyClaimRR.trigger('render');
      }, this),

    });
  },

  setupUrgentIssuesFlows() {
    // Creates a handler for urgent issues
    const _getOnUrgentIssueItemCompleteFn = _.bind(function(pageItemName, notSelectedNextQuestionName, topOptions) {
      return _.bind(function(options) {
        const pageItem = this.getPageItem(pageItemName);
        const answer = pageItem.getModel().get('question_answer');
        if (answer === "1") {
          if (options && options.no_animate) {
            // On first load, don't show the modal
            this.showNextButton(options);
          }
        } else if (answer === "0") {
          this.updateClaimsCount();
          this.showPageItem(notSelectedNextQuestionName, _.extend({}, options, topOptions));
        }
      }, this);
    }, this);

    const _getOnUrgentIssueChangeAnswerFn = _.bind(function(pageItemName, onSelectedModalFn) {
      return _.bind(function(options) {
        const pageItem = this.getPageItem(pageItemName);
        const answer = pageItem.getModel().get('question_answer');
        if (answer === "1") {
          _.bind(onSelectedModalFn, this)(pageItemName, options);
        }
      }, this);
    }, this);


    const landlordIssueName = 'LandlordUrgentIssue';
    const tenantPossessionIssueName = 'TenantUrgentPossession';
    const tenantRepairsIssueName = 'TenantUrgentRepairs';

    this.listenTo(this.getPageItem(landlordIssueName).getModel(), 'change:question_answer', _getOnUrgentIssueChangeAnswerFn(landlordIssueName, this.showModalLandlordUrgentIssue), this);
    this.listenTo(this.getPageItem(tenantPossessionIssueName).getModel(), 'change:question_answer', _getOnUrgentIssueChangeAnswerFn(tenantPossessionIssueName, this.showModalTenantUrgentIssue), this);
    this.listenTo(this.getPageItem(tenantRepairsIssueName).getModel(), 'change:question_answer', _getOnUrgentIssueChangeAnswerFn(tenantRepairsIssueName, this.showModalTenantUrgentIssue), this);

    this.listenTo(this.getPageItem(landlordIssueName), 'itemComplete', _getOnUrgentIssueItemCompleteFn(landlordIssueName, 'LandlordDirectRequest', { no_animate: true }), this);
    this.listenTo(this.getPageItem(tenantPossessionIssueName), 'itemComplete', _getOnUrgentIssueItemCompleteFn(tenantPossessionIssueName, tenantRepairsIssueName), this);
    this.listenTo(this.getPageItem(tenantRepairsIssueName), 'itemComplete', _getOnUrgentIssueItemCompleteFn(tenantRepairsIssueName, 'TenantSeekingMoveOut'), this);
  },


  setupDirectRequestFlows() {
    const landlordDirectRequest = this.getPageItem('LandlordDirectRequest');
    this.listenTo(landlordDirectRequest, 'itemComplete', function(options) {
      this.showPageItem('LandlordSeekingMoveOut', options);
      const answer = landlordDirectRequest.getModel().get('question_answer');
      if (answer === "1") {
        // Hide all other Landlord items
        this.deselectAndHideItem('LandlordSeekingMoveOut', options);
        this.deselectAndHideItem('LandlordSeekingMoveOutClaims', options);
        this.deselectAndHideItem('LandlordSeekingMoney', options);
        this.deselectAndHideItem('LandlordSeekingMoneyClaims', options);

        this.showNextButton(_.extend({}, options, {no_animate: true}));
      } else if (answer === "0") {
        this.showPageItem('LandlordSeekingMoveOut', options);
      }
    }, this);

    const tenantDirectRequest = this.getPageItem('TenantDirectRequest');
    this.listenTo(tenantDirectRequest, 'itemComplete', function(options) {
      const answer = tenantDirectRequest.getModel().get('question_answer');
      if (answer === "1") {
        // Hide all other Tenant items
        this.deselectAndHideItem('TenantSeekingMoveOut', options);
        this.deselectAndHideItem('TenantSeekingMoveOutClaims', options);
        this.deselectAndHideItem('TenantSeekingMoney', options);
        this.deselectAndHideItem('TenantSeekingMoneyClaims', options);
        this.deselectAndHideItem('TenantSeekingRepairs', options);
        this.deselectAndHideItem('TenantSeekingRepairsClaims', options);
        this.deselectAndHideItem('TenantSeekingService', options);
        this.deselectAndHideItem('TenantSeekingServiceClaims', options);
        this.deselectAndHideItem('TenantSeekingRestriction', options);
        this.deselectAndHideItem('TenantSeekingRestrictionClaims', options);
        this.deselectAndHideItem('TenantSeekingOther', options);
        this.deselectAndHideItem('TenantSeekingOtherClaims', options);

        this.showNextButton(_.extend({}, options, {no_animate: true}));
      } else if (answer === "0") {
        this.showPageItem('TenantSeekingMoney', options);
      }
    }, this);
  },

  setupStandardLandlordFlows() {
    const landlordSeekingMoveOut = this.getPageItem('LandlordSeekingMoveOut');
    this.listenTo(landlordSeekingMoveOut, 'itemComplete', function(options) {
      const answer = landlordSeekingMoveOut.getModel().get('question_answer');
      this.showPageItem('LandlordSeekingMoney', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const landlordSeekingMoney = this.getPageItem('LandlordSeekingMoney');
    this.listenTo(landlordSeekingMoney, 'itemComplete', function(options) {
      this.showNextButton(options);
    }, this);
  },

  setupStandardTenantFlows() {
    const tenantSeekingMoveOut = this.getPageItem('TenantSeekingMoveOut');
    this.listenTo(tenantSeekingMoveOut, 'itemComplete', function(options) {
      const answer = tenantSeekingMoveOut.getModel().get('question_answer');
      this.showPageItem('TenantSeekingMoney', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);


    const tenantSeekingMoney = this.getPageItem('TenantSeekingMoney');
    this.listenTo(tenantSeekingMoney, 'itemComplete', function(options) {
      const answer = tenantSeekingMoney.getModel().get('question_answer'),
        dispute = disputeChannel.request('get');
      const nextPageItem = dispute.isPastTenancy() ? 'TenantSeekingOther' : 'TenantSeekingRepairs';
      this.showPageItem(nextPageItem, _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const tenantSeekingRepairs = this.getPageItem('TenantSeekingRepairs');
    this.listenTo(tenantSeekingRepairs, 'itemComplete', function(options) {
      const answer = tenantSeekingMoveOut.getModel().get('question_answer');
      this.showPageItem('TenantSeekingService', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const tenantSeekingService = this.getPageItem('TenantSeekingService');
    this.listenTo(tenantSeekingService, 'itemComplete', function(options) {
      const answer = tenantSeekingService.getModel().get('question_answer');
      this.showPageItem('TenantSeekingRestriction', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const tenantSeekingRestriction = this.getPageItem('TenantSeekingRestriction');
    this.listenTo(tenantSeekingRestriction, 'itemComplete', function(options) {
      const answer = tenantSeekingRestriction.getModel().get('question_answer');
      this.showPageItem('TenantSeekingOther', _.extend({}, options, {
          no_animate: answer === "1" ? true : (_.has(options, 'no_animate') ? options.no_animate : false) }));
    }, this);

    const tenantSeekingOther = this.getPageItem('TenantSeekingOther');
    this.listenTo(tenantSeekingOther, 'itemComplete', function(options) {
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


  templateContext() {
    const selected_claims = this.getSelectedClaims();
    return {
      issuesSelected: selected_claims ? selected_claims.length : 0
    };
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

    console.log(selected_claims);
    return selected_claims;
  },

  updateClaimsCount() {
    this.getUI('noClaimsError').hide();
    this.getUI('repaymentError').hide();
    const num_issues_selected = this.getNumIssuesSelected();
    this.getUI('claimsCount').text(`${num_issues_selected} Issue${num_issues_selected === 1?'':'s'} Selected`);
  },

  previousPage() {
    Backbone.history.navigate('page/4', {trigger: true});
  },


  getPageApiUpdates() {
    // Prime claims based on selections
    const selected_claims = this.getSelectedClaims();
    // Update all API questions and the claims list
    return _.union(this.getAllPageXHR(), this.disputeClaims.setClaimListTo(selected_claims));
  },

  checkAndCleanupMonetaryOrderWorksheet() {
    const claims = claimsChannel.request('get');

    if (!claims.any(function(claim) { return claim.hasConfigMonetaryOrderWorksheetEvidence(); })) {
      const mow_fileDescription = filesChannel.request('get:filedescription:code', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE'));
      if (mow_fileDescription) {
        return mow_fileDescription.destroy();
      }
    }
    return $.Deferred().resolve().promise();
  },

  checkAndCleanupDuplicates() {
    const claims = claimsChannel.request('get');

    const claimCodeGroups = {};
    claims.forEach(claim => {
      const claimCode = claim.get('claim_code');
      if (!claimCodeGroups[claimCode]) claimCodeGroups[claimCode] = [];
      claimCodeGroups[claimCode].push(claim);
    });
    
    const flatten = (arr) => [].concat(...arr);
    const duplicateClaims = flatten(Object.keys(claimCodeGroups).filter(claimCode => claimCodeGroups[claimCode].length > 1).map(claimCode => _.sortBy(claimCodeGroups[claimCode], 'created_date').slice(1)));
    
    return Promise.all(duplicateClaims.map(c => c.destroy()));
  },

  validatePage() {
    const num_issues_selected = this.getNumIssuesSelected();
    if (!num_issues_selected) {
      this.getUI('noClaimsError').show();
    }

    let hasRepaymentError = false;
    _.each(this.getActiveClaimCheckboxCollections(), function(activeCheckboxCollection) {
      if (hasRepaymentError) { return; }
      _.each(activeCheckboxCollection.getData(), function(checkboxModel) {
        if (hasRepaymentError) { return; }
        hasRepaymentError = _.isFunction(checkboxModel.get('hasRepaymentErrorFn')) ? checkboxModel.get('hasRepaymentErrorFn')(checkboxModel) : false;
      });
    });

    if (hasRepaymentError) {
      this.getUI('repaymentError').show();
    }

    return PageView.prototype.validatePage.call(this) && num_issues_selected && !hasRepaymentError;
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

    const all_claim_xhr = this.getPageApiUpdates();
    const claimSaveFn = () => {
      if (all_claim_xhr && all_claim_xhr.length) {
        loaderChannel.trigger('page:load');
      }
      this.isPageCurrentlySaving = true;
      Promise.all(all_claim_xhr.map(xhr => xhr())).then(() => {
        this.checkAndCleanupMonetaryOrderWorksheet().always(() => {
          this.checkAndCleanupDuplicates().finally(() => {
            applicationChannel.trigger('progress:step:complete', 5);
            Backbone.history.navigate('page/6', { trigger: true });
          });
        });
      }, this.createPageApiErrorHandler(this))
      .finally(() => { this.isPageCurrentlySaving = false });
    };


    const claim_deltas = this.disputeClaims.getClaimDeltas(this.getSelectedClaims());
    const claims_to_destroy = claim_deltas.to_destroy;
    this.showTrialIntervention().then(() => {
      if (claims_to_destroy.length) {
        const modalView = new ModalIssueDeletes({ issues_to_delete: claims_to_destroy });
        this.listenTo(modalView, 'continue', () => {
          modalChannel.request('remove', modalView);
          claimSaveFn();
        }, this);

        modalChannel.request('add', modalView);
      } else {
        claimSaveFn();
      }
    });
  },

  showTrialIntervention() {
    const directRequestCodes = configChannel.request('get', 'direct_request_issue_codes') || [];
    const isDirectRequestSelected = this.getSelectedClaims().find(c => directRequestCodes.includes(c));
    
    const isSubmitted = disputeChannel.request('get').isSubmitted();
    const updateDisputeTrialPromise = () => isSubmitted ?
      // If dispute is already submitted, don't change the trial
      Promise.resolve() :
      // Direct Requests don't see outcomes and are set to Control
      isDirectRequestSelected ?
      TrialLogic_BIGEvidence.saveDisputeTrialAsDirectRequest() :
      // Otherwise, switch the dispute back to outcome mode
      TrialLogic_BIGEvidence.saveDisputeTrialAsStandard();

    return new Promise(res => {
      updateDisputeTrialPromise().finally(() => {
        if (!TrialLogic_BIGEvidence.canViewIntakeCarousel()) return res();

        const trialModalView = new ModalIntakeIssueIntervention();
        this.listenTo(trialModalView, 'continue', () => {
          trialModalView.close();
          const primaryApplicant = participantsChannel.request('get:primaryApplicant');
          // Save intervention, save trial participant
          TrialLogic_BIGEvidence.addIntakeParticipantInterventionCarousel(primaryApplicant)
            .finally(res);
        });
        modalChannel.request('add', trialModalView);
      });

    });
  },

});
