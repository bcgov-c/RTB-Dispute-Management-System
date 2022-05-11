import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';

import AriClaimInformationCollectionView from '../../../components/claim-information/AriClaimInformations';
import AriClaimInformationCollection from '../../../components/claim-information/AriClaimInformation_collection';

import template from './IntakeAriPageInformation_template.tpl';

const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const claimsChannel = Radio.channel('claims');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,

  regions: {
    claims: '#p6-ClaimInformation',
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      claimWarning: '.claim-total-warning'
    });
  },

  getRoutingFragment() {
    return 'page/5';
  },

  // Clean up changes in progress
  cleanupPageInProgress() {
    const claims = claimsChannel.request('get');
    const dispute = disputeChannel.request('get');
    if (claims) {
      claims.each(function(disputeClaim) { disputeClaim.resetModel(); });
    }
    if (dispute) {
      dispute.resetModel();
    }
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    this.createPageItems();
    this.setupListenersBetweenItems();

    applicationChannel.trigger('progress:step', 5);
  },

  // Create all the models and page items for this intake page
  createPageItems() {
    const disputeClaims = claimsChannel.request('get');
    if (!disputeClaims) {
      console.log(`[Error] No claims able to be retrieved, going back to list`);
      alert("[Error] No claims selected.  Redirecting to the claim selection page");
      Backbone.history.navigate('page/4', {trigger: true});
      return;
    }

    // Prime the collection from the disputeClaims
    const claimInformationCollection = new AriClaimInformationCollection(disputeClaims.map(function(disputeClaim, index) {
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
        
        remedyUseAmount: claim_config.remedyUseAmount,
        remedyUseTextDescription: claim_config.remedyUseTextDescription,
        remedyUseAssociatedDate: claim_config.remedyUseAssociatedDate,
        
        // Load in values from the api
        disputeClaim: disputeClaim,

        // NOTE: Create a new Dispute Evidence collection each time.
        // It will be filled with correct config / api info during initialization of this ClaimInformation object
        disputeEvidenceCollection: new DisputeEvidenceCollection()
      });
    }));

    this.addPageItem('claims', new PageItemView({
      stepText: null,
      subView: new AriClaimInformationCollectionView({ collection: claimInformationCollection }),
      forceVisible: true
    }));
  },

  // Add listeners and relationships onto page items
  setupListenersBetweenItems() {
    const claimPageItem = this.getPageItem('claims'),
      claimCollection = claimPageItem.getCollection();

    this.listenTo(claimCollection, 'amountChanged', this.updateClaimWarning, this);
    this.listenTo(claimCollection, 'delete:complete', function() {
    }, this);
  },

  updateClaimWarning() {
    const claimPageItem = this.getPageItem('claims');
    const claimCollection = claimPageItem.getCollection();

    if (claimCollection.isTotalOverLimit()) {
      this.getUI('claimWarning').removeClass('hidden-item');
    } else {
      this.getUI('claimWarning').addClass('hidden-item');
    }
  },

  previousPage() {
    Backbone.history.navigate('page/4', {trigger: true});
  },

  getPageApiUpdates() {
    return {};
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

    loaderChannel.trigger('page:load');
    const claimInfoCollection = this.getPageItem('claims').getCollection();
    
    Promise.all(claimInfoCollection.map(claimInfo => claimInfo.save()))
      .then(() => {
        applicationChannel.trigger('progress:step:complete', 5);
        Backbone.history.navigate('page/6', { trigger: true });
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

  templateContext() {
    return {
      Formatter,
      CLAIM_TOTAL_LIMIT: configChannel.request('get', 'CLAIM_TOTAL_LIMIT')
    };
  }
  
});
