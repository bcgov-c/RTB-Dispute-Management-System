import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';
import ClaimInformationCollectionView from '../../../components/claim-information/ClaimInformations';
import ClaimInformationCollection from '../../../components/claim-information/ClaimInformation_collection';
import StandaloneEvidenceView from './StandaloneEvidence';
import IntakeIssuesConfig from '../issues/intake_issues_page_config';
import template from './IntakePageInformation_template.tpl';

const standaloneEvidenceHtml = {
  mow_required: `<p>A monetary order worksheet is required that includes a detailed description of the following issue(s)</p>`,
  mow_optional: `<p>Please provide a monetary order worksheet in support of the following issue(s)</p>`,
  ta_no_issues: `<p>Please provide a copy of your tenancy agreement</p>`,
  ta_has_issues: `<p>Please provide a tenancy agreement in support of the following issue(s)</p>`
};

const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const claimsChannel = Radio.channel('claims');
const filesChannel = Radio.channel('files');
const participantChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,

  regions: {
    claims: '#p6-ClaimInformation',
    tenancyAgreementEvidence: '#p6-TenancyAgreementEvidence',
    monetaryOrderWorksheetEvidence: '#p6-MonetaryOrderWorksheetEvidence'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      
    });
  },

  getRoutingFragment() {
    return 'page/6';
  },

  // Clean up changes in progress
  cleanupPageInProgress() {
    const dispute = disputeChannel.request('get');
    if (this.disputeClaims) {
      this.disputeClaims.each(function(disputeClaim) { disputeClaim.resetModel(); });
    }
    if (dispute) {
      dispute.resetModel();
    }
    // Invalidate the tenancy agreement item changes to allow routing
    this.addPageItem('tenancyAgreementEvidence', new PageItemView({}));

    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.CLAIM_TOTAL_LIMIT = configChannel.request('get', 'CLAIM_TOTAL_LIMIT');
    this.disputeClaims = claimsChannel.request('get');

    if (!this.disputeClaims || !this.disputeClaims.length) {
      console.log(`[Error] No claims able to be retrieved, going back to list`);

      const modalView = modalChannel.request('show:standard', {
        title: 'No Claims',
        bodyHtml: 'No claims are selected.  You will be redirected to your list of disputes.',
        hideContinueButton: true,
        cancelButtonText: 'Return to File List',
      });
      
      this.listenTo(modalView, 'removed:modal', () => {
        this.cleanupPageInProgress();
        Backbone.history.navigate('list', { trigger: true });
      });

      return;
    }

    this.createPageItems();
    this.setupListenersBetweenItems();

    applicationChannel.trigger('progress:step', 6);
  },

  // Create all the models and page items for this intake page
  createPageItems() {
    // Prime the collection from the disputeClaims
    // Filter the list to exclude fee recovery issue, as this is handled on the payment page
    const filteredDisputeClaims = this.disputeClaims.filter(dc => !dc.isFeeRecovery());
    this.claimInformationCollection = new ClaimInformationCollection(_.map(filteredDisputeClaims, function(disputeClaim, index) {
      const claim_code = disputeClaim.get('claim_code');
      const claim_config = configChannel.request('get:issue', claim_code);
      if (!claim_config) {
        console.log(`[Warning] Should be getting a matching config value for issue ${claim_code}`, disputeClaim);
      }
      return _.extend({
        claim_item_number: index+1,
        cssClass: `claim-information-item-${claim_code}`,
        claim_title: claim_config.issueTitle,
        html: claim_config.issueTitle,
        claimCode: claim_config.code,
        useNoticeDueDate: claim_config.useNoticeDueDate,
        noticeDueDateTitle: claim_config.noticeDueDateTitle,
        noticeDueDateHelp: claim_config.noticeDueDateHelp,
        useNoticeMethod: claim_config.useNoticeMethod,
        noticeMethodTitle: claim_config.noticeMethodTitle,
        allowedNoticeMethodCodes: claim_config.allowedNoticeMethodCodes,
        useAmount: claim_config.useAmount,
        amountTitle: claim_config.amountTitle,
        useTextDescription: claim_config.useTextDescription,
        textDescriptionTitle: claim_config.textDescriptionTitle,
        helpHtml: claim_config.issueHelp,

        // Load in values from the api
        disputeClaim: disputeClaim,

        // NOTE: Create a new Dispute Evidence collection each time.
        // It will be filled with correct config / api info during initialization of this ClaimInformation object
        disputeEvidenceCollection: new DisputeEvidenceCollection()
      });
    }));

    this.addPageItem('claims', new PageItemView({
      stepText: null,
      subView: new ClaimInformationCollectionView({ collection: this.claimInformationCollection }),
      forceVisible: true
    }));

    this.createStandaloneEvidence();
  },

  createStandaloneEvidence() {
    const hasDirectRequest = this.claimInformationCollection.any(claimInfo => claimInfo.get('disputeClaim').isDirectRequest());
    const hasTenancyAgreement = this.claimInformationCollection.any(claimInfo => claimInfo.hasConfigTenancyAgreementEvidence());
    const hasMonetaryOrderWorksheet = this.claimInformationCollection.any(claimInfo => claimInfo.hasConfigMonetaryOrderWorksheetEvidence());
    const isMonetaryOrderWorksheetOptional = this.claimInformationCollection.all(claimInfo => (
      claimInfo.hasConfigMonetaryOrderWorksheetEvidence() ? claimInfo.hasAllOptionalConfigMonetaryOrderWorksheetEvidence() : true
    ));
    const tenancyAgreementEvidenceModel = claimsChannel.request('create:supporting:ta');
    const monetaryOrderWorksheetEvidenceModel = claimsChannel.request('create:supporting:mow');

    tenancyAgreementEvidenceModel.set({
      description_by: participantChannel.request('get:primaryApplicant:id'),
      mustUploadNow: hasDirectRequest
    }, { silent: true }).createSubModels();

    monetaryOrderWorksheetEvidenceModel.set({
      required: !isMonetaryOrderWorksheetOptional,
      description_by: participantChannel.request('get:primaryApplicant:id'),
      mustUploadNow: hasDirectRequest
    }, { silent: true }).createSubModels();

    // Use stepComplete to dictate whether we should show/hide the containers
    this.addPageItem('monetaryOrderWorksheetEvidence', new PageItemView({
      stepText: null,
      subView: new StandaloneEvidenceView({
        title: 'Monetary Order Worksheet',
        bodyHtml: isMonetaryOrderWorksheetOptional ? standaloneEvidenceHtml.mow_optional : standaloneEvidenceHtml.mow_required,
        associated_claim_titles: _.map(this.claimInformationCollection.filter(function(claimInfo) {
          return claimInfo.hasConfigMonetaryOrderWorksheetEvidence();
        }), function(claimInfo) { return claimInfo.get('claim_title'); }),
        model: monetaryOrderWorksheetEvidenceModel
      }),
      forceVisible: hasMonetaryOrderWorksheet,
    }));
    this.addPageItem('tenancyAgreementEvidence', new PageItemView({
      stepText: null,
      subView: new StandaloneEvidenceView({
        title: 'Tenancy Agreement',
        bodyHtml: hasTenancyAgreement ? standaloneEvidenceHtml.ta_has_issues : standaloneEvidenceHtml.ta_no_issues,
        isTenancyAgreement: true,
        associated_claim_titles: _.map(this.claimInformationCollection.filter(function(claimInfo) {
          return claimInfo.hasConfigTenancyAgreementEvidence();
        }), function(claimInfo) { return claimInfo.get('claim_title'); }),
        model: tenancyAgreementEvidenceModel,
      }),
      forceVisible: true,
    }));
  },

  showModalAllIssuesDeleted() {
    const modalView = modalChannel.request('show:standard', {
      title: `All Issues Removed`,
      bodyHtml: `<p>All issues have been removed. Returning to the Issues page.`,
      primaryButtonText: 'Ok',
      hideCancelButton: true,
      onContinueFn(modalView) {
        modalView.close();
      }
    });
    this.listenToOnce(modalView, 'removed:modal', function() {
      this.cleanupPageInProgress();
      Backbone.history.navigate('page/5', { trigger: true });
    });
  },

  showModalRequestAmountExceeded(onDoneFn) {
    const claimsOverLimit = this.claimInformationCollection.filter(claimInfoModel => {
      const disputeClaim = claimInfoModel.get('disputeClaim');
      return !(disputeClaim && (disputeClaim.claimConfig || {}).noAmountLimit) && claimInfoModel.getAmount() > 0;
    });
    const claimLimitDisplay = Formatter.toAmountDisplay(this.CLAIM_TOTAL_LIMIT, true);
    const modalView = modalChannel.request('show:standard', {
      modalCssClasses: 'modal-claimLimitExceeded',
      title: 'Monetary Claim Limit Exceeded',
      bodyHtml: `<p>The total amount being requested for these specific issues cannot exceed ${claimLimitDisplay}. The following amounts that you entered have caused your application to exceed this monetary claim limit:
      <ul>${claimsOverLimit.map(claimInfoModel => `<li>${Formatter.toAmountDisplay(claimInfoModel.getAmount())} - ${claimInfoModel.get('claim_title')}</li>`).join('')}</ul>
      <p>Press Continue to return to the page where you can reduce your requested amounts so that they do not exceed ${claimLimitDisplay}. The specific issues that need to be adjusted will show the error "Monetary claim limit exceeded".</p>
      <p>For information about monetary claim limits, see <a href="javascript:;" class="static-external-url" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl27.pdf">Policy Guideline 27: Jurisdiction</a>.</p>`,
      onContinueFn(_modalView) { _modalView.close(); },
      hideCancelButton: true
    });

    if (_.isFunction(onDoneFn)) {
      this.listenTo(modalView, 'removed:modal', onDoneFn);
    }

    // Show error message on amount field
    claimsOverLimit.forEach(claimInfoModel => claimInfoModel.trigger('show:amount:error'));
  },

  checkAndCleanupMonetaryOrderWorksheet() {
    if (this.disputeClaims && !this.disputeClaims.any(function(claim) { return claim.hasConfigMonetaryOrderWorksheetEvidence(); })) {
      const mow_fileDescription = filesChannel.request('get:filedescription:code', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE'));
      if (mow_fileDescription) {
        return mow_fileDescription.destroy();
      }
    }
    return $.Deferred().resolve().promise();
  },

  // Add listeners and relationships onto page items
  setupListenersBetweenItems() {
    this.listenTo(this.claimInformationCollection, 'delete:complete', () => {
      $.whenAll(
        this.checkAndUpdateIssueQuestions(this.claimInformationCollection),
        this.checkAndCleanupMonetaryOrderWorksheet()
      ).always(() => {
        // If a delete occurs, refresh the menu
        applicationChannel.request('refresh:progress');
        if (!this.claimInformationCollection.length) this.showModalAllIssuesDeleted();
        else this.updateAndRenderStandaloneEvidence();
      });
    });
  },

  // Returns a list of api updates
  checkAndUpdateIssueQuestions(claimCollection) {
    const dispute = disputeChannel.request('get'),
      questions = dispute ? dispute.get('questionCollection') : null,
      update_xhr = [];

    if (!questions) {
      return $.Deferred().resolve().promise();
    }

    // For each question that is "Yes", are there any with no linked claims?  If so, update the question to "No"
    _.each(questions.where({ group_id: 5, question_answer: "1" }), function(questionModel) {
      const question_name = questionModel.get('question_name'),
        key = _.findKey(IntakeIssuesConfig, function(config_data) {
          return config_data.question_name === question_name;
        }),
        linked_claim_config_name = key && _.has(IntakeIssuesConfig, key) ? IntakeIssuesConfig[key].linked_claims : null,
        linked_claim_config_data = IntakeIssuesConfig[linked_claim_config_name],
        linked_claims = linked_claim_config_data ? linked_claim_config_data.selection_claims : [];

        // Check if no linked claims are saved anymore to the API
        if (
          linked_claims &&
          !claimCollection.find(function(claimInfo) {
            const disputeClaim = claimInfo.get('disputeClaim');
            return !disputeClaim.isNew() && _.contains(linked_claims, disputeClaim.getClaimCode());
          })
        ) {
          // Update the question and return the api change needed
          questionModel.set("question_answer", "0");
          update_xhr.push(_.bind(questionModel.save, questionModel));
        }
    });

    const dfd = $.Deferred();
    if (update_xhr.length) {
      Promise.all(_.map(update_xhr, function(xhr) { return xhr(); }))
        .then(dfd.resolve, dfd.reject);
    } else {
      dfd.resolve();
    }
    return dfd.promise();
  },

  updateAndRenderStandaloneEvidence() {
    this.createStandaloneEvidence();
    const standaloneEvidence = ['monetaryOrderWorksheetEvidence', 'tenancyAgreementEvidence'];

    _.each(standaloneEvidence, function(evidenceName) {
      this.showChildView(evidenceName, this.getPageItem(evidenceName));
    }, this);
  },

  previousPage() {
    Backbone.history.navigate('page/5', {trigger: true});
  },


  getPageApiUpdates() {
    const all_xhr = this.getAllPageXHR();
    const claimsView = this.getPageItem('claims');
    if (claimsView) {
      claimsView.getCollection().each(function(claimInformationModel) {
        // Save local data into the disputeClaim, and then update the APIs
        claimInformationModel.updateLocalModels();
        const disputeClaim = claimInformationModel.get('disputeClaim');
        // Ignore models that are "new" but empty, just ones that need updating
        if (disputeClaim.needsApiUpdate({ update_only: true, ignore_key: 'description_by' })) {
          all_xhr.push( _.bind(disputeClaim.save, disputeClaim) );
        }
      });
    }
    
    const tenancyAgreementPageItem = this.getPageItem('tenancyAgreementEvidence');
    const dispute = disputeChannel.request('get');
    if (tenancyAgreementPageItem && tenancyAgreementPageItem.isActive() && tenancyAgreementPageItem.subView.showArrows) {
      dispute.set(tenancyAgreementPageItem.subView.getDisputeSaveAttrs());
      if (!_.isEmpty(dispute.getApiChangesOnly())) {
        all_xhr.push( _.bind(dispute.save, dispute, dispute.getApiChangesOnly()) );
      }
    }
    return all_xhr;
  },

  nextPage() {
    if (!this.validatePage()) {
      const scrollToFirstErrorFn = () => {
        console.log(`[Info] Page did not pass validation checks`);
        const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
        if (visible_error_eles.length === 0) {
          console.log(`[Warning] Page not valid, but no visible error message found`);
        } else {
          animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true, scrollOffset: 90});
        }
      };
      if (this.claimInformationCollection.isTotalOverLimit()) {
        this.showModalRequestAmountExceeded(scrollToFirstErrorFn.bind(this));
      } else {
        scrollToFirstErrorFn();
      }
      return;
    } else if (!this.claimInformationCollection.length) {
      this.showModalAllIssuesDeleted();
      return;
    }

    const onNextSuccessFn = function() {
      applicationChannel.trigger('progress:step:complete', 6);
      Backbone.history.navigate('page/7', {trigger: true});
    };

    const all_xhr = this.getPageApiUpdates();

    if (all_xhr.length === 0) {
      console.log("[Info] No changes to the Claims and related API.  Moving to next page");
      onNextSuccessFn();
      return;
    }

    loaderChannel.trigger('page:load');
    Promise.all(all_xhr.map(xhr => xhr())).then(() => {
      // Once all claims are created, add all remedies
      loaderChannel.trigger('page:load:complete');
      console.log("[Info] API updates successful.  Moving to next page");
      onNextSuccessFn();
    }, this.createPageApiErrorHandler(this));
  },

  onRender() {
    // Render all user elements on the page
    _.each(this.page_items, function(itemView, regionName) {
      const region = this.showChildView(regionName, itemView);
      const view = region.currentView;
      if (view.stepComplete) {
        this.showPageItem(regionName, {no_animate: true});
      }
    }, this);
  },

  onDomRefresh() {
    const tenancyAgreementEvidence = this.getPageItem('tenancyAgreementEvidence');
    if (tenancyAgreementEvidence && tenancyAgreementEvidence.getModel()) {
      tenancyAgreementEvidence.getModel().trigger('open:help');
    }
  },

  templateContext() {
    return {
      Formatter,
      CLAIM_TOTAL_LIMIT: this.CLAIM_TOTAL_LIMIT
    };
  }
  
});
