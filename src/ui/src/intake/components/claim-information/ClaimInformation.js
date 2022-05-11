
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../core/components/input/Input';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import TextareaView from '../../../core/components/textarea/Textarea';
import DisputeEvidenceCollectionView from '../evidence/Evidences';
import EvidenceBannerView from '../evidence/EvidenceBanner';
import ViewMixin from '../../../core/utilities/ViewMixin';
import template from './ClaimInformation_template.tpl';

const AMOUNT_ERROR_MSG = 'Monetary claim limit exceeded';
const RULES_ERROR_MSG = 'Cannot apply within dispute period';

const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const claimsChannel = Radio.channel('claims');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get')

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className() { return `step intake-claim ${this.model.get('cssClass')}`; },

  ui: {
    delete: '.evidence-claim-delete',
    help: '.evidence-claim-title .help-icon',
    rulesError: '.evidence-claim__rule-error'
  },

  regions: {
    claimAmountRegion: '.amount',
    claimNoticeDueDateRegion: '.notice-due-date',
    claimNoticeMethodRegion: '.notice-method',
    claimDescriptionRegion: '.text-description',

    evidenceRegion: '.evidence-claim-evidence',
    evidenceBannerRegion: '.evidence-claim-banner'
  },

  events: {
    'click @ui.delete': 'clickDelete',
    'click @ui.help': 'clickHelp'
  },

  showDeleteConfirmModal() {
    const claimCode = this.model.get('disputeClaim').get('claim_code');
    const dr_issue_to_monetary_codes = configChannel.request('get', 'dr_issue_to_monetary_codes');
    let associatedClaimCode;
    if (_.has(dr_issue_to_monetary_codes, claimCode)) {
      associatedClaimCode = dr_issue_to_monetary_codes[claimCode];
    }
    const associatedClaim = claimsChannel.request('get:by:code', associatedClaimCode);

    console.log(associatedClaim);
    modalChannel.request('show:standard', {
      title: `Delete Issue?`,
      bodyHtml: `<p>This will delete the issue: <b>${this.model.get('claim_title')}</b>.`
        + `&nbsp;All evidence associated to this will also be deleted.  This action can't be undone.</p>`
        + (associatedClaim ? `<p><b>Note:</b>&nbsp;The associated monetary issue <b>${associatedClaim.getClaimTitle()}</b> and any evidence added to it will also be deleted.</p>` : '')
        + `<p>Are you sure you want to delete the${associatedClaim?'se':''} issue${associatedClaim?'s':''}?</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: _.bind(function(modal) {
        loaderChannel.trigger('page:load');
        modal.close();
        const self = this;
        $.whenAll(
          claimsChannel.request('delete:full', this.model.get('disputeClaim'),
          associatedClaim ? claimsChannel.request('delete:full', associatedClaim) : null)
        ).always(function() {
          const collection = self.model.collection;
          if (collection && associatedClaim) {
            const associatedClaimInformationModel = collection.find(function(claimInfoModel) {
              return claimInfoModel.get('disputeClaim').get('claim_code') === associatedClaimCode
            });
            if (associatedClaimInformationModel) {
              collection.remove(associatedClaimInformationModel);
            }
          }

          if (collection) {
            collection.remove(self.model);
            collection.trigger('delete:complete', self);
          }
          
          loaderChannel.trigger('page:load:complete');
        });
      }, this)
    });
  },

  clickDelete() {
    this.showDeleteConfirmModal();
  },

  // BUG NOTE: For some reason, help won't open using the click listener.  Have to proxy it here
  // Catch the event and use the rtb-help tag on the click event
  clickHelp() {
    this.getUI('help').trigger('click.rtb-help');
  },


  initialize() {
    this.listenTo(this.model, 'ruleDateChanged', () => {
      if (this.model.get('useNoticeDueDate')) this.getChildView('claimNoticeDueDateRegion').render();
      if (this.model.get('useNoticeMethod')) this.getChildView('claimNoticeMethodRegion').render();
    
      this.getUI('rulesError').html('').hide();
    });
    this.listenTo(this.model, 'change:disputeEvidenceCollection', this.setupBannerListeners, this);
    this.listenTo(this.model, 'show:amount:error', function() { this.showErrorMessageOnAmount(AMOUNT_ERROR_MSG) }, this);
    this.setupBannerListeners();
  },

  setupBannerListeners() {
    this.stopListening(this.model.get('disputeEvidenceCollection'), 'update:evidence', this.renderEvidenceBanner, this);
    this.listenTo(this.model.get('disputeEvidenceCollection'), 'update:evidence', this.renderEvidenceBanner, this);

    this.stopListening(this.model, 'change', this.renderEvidenceBanner, this);
    this.listenTo(this.model, 'change', this.renderEvidenceBanner, this);
  },
  
  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }

      if (!childView.$el) {
        console.log(`[Warning] No childView element rendered in DOM to valdiate`, childView);
        return;
      }
      if (!childView.$el.is(':visible')) {
        console.log(`[Info] Skipping validation on hidden childView`, childView);
        return;
      }

      is_valid = childView.validateAndShowErrors() & is_valid;
    }, this);

    // Manually validate the Rule Date and show page controls
    const ruleDate = this.model.getRuleDate();
    if (ruleDate && Moment().isBefore(Moment(ruleDate))) {
      is_valid = false;
      const claimNoticeDueDateView = this.getChildView('claimNoticeDueDateRegion');
      const claimNoticeMethodView = this.getChildView('claimNoticeMethodRegion');
      
      if (claimNoticeDueDateView && claimNoticeDueDateView.isRendered()) claimNoticeDueDateView.showErrorMessage(RULES_ERROR_MSG);
      if (claimNoticeMethodView && claimNoticeMethodView.isRendered()) claimNoticeMethodView.showErrorMessage(RULES_ERROR_MSG);      
      
      const ruleWarningMsg = disputeChannel.request('get').isLandlord() ?
        `Based on the date and service method that you entered above you cannot apply for this issue until <b>${Formatter.toDateDisplay(ruleDate)}</b>. You can learn more about these rules at the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/serving-notices-during-tenancy">Residential Tenancy Branch web site</a>.`
        : `Based on the tenancy end date, the date the forwarding address was provided and the service method that you entered above you cannot apply for this issue until <b>${Formatter.toDateDisplay(ruleDate)}</b>. You can learn more about these rules at the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/serving-notices-during-tenancy">Residential Tenancy Branch web site</a>.`
      this.getUI('rulesError').html(ruleWarningMsg).show();
    }

    return is_valid;
  },

  showErrorMessageOnAmount(errorMessage) {
    if (!this.model.get('useAmount')) {
      return;
    }
    const view = this.getChildView('claimAmountRegion');
    if (view && view.isRendered()) {
      view.showErrorMessage(errorMessage);
    }
  },


  onRender() {
    this._renderChildViewIfModelsExist('claimAmountRegion', InputView, this.model.get('amountModel'), 'useAmount');
    this._renderChildViewIfModelsExist('claimNoticeDueDateRegion', InputView, this.model.get('noticeDueDateModel'), 'useNoticeDueDate');
    this._renderChildViewIfModelsExist('claimNoticeMethodRegion', DropdownView, this.model.get('noticeMethodModel'), 'useNoticeMethod');
    this._renderChildViewIfModelsExist('claimDescriptionRegion', TextareaView, this.model.get('textDescriptionModel'), 'useTextDescription');

    this.showChildView('evidenceRegion', new DisputeEvidenceCollectionView({
      enableBigTrialIntervention: true,
      collection: this.model.get('disputeEvidenceCollection')
    }));

    this.renderEvidenceBanner();

    ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'), ['.evidence-item-container', '.evidence-claim-claim']);
  },

  _renderChildViewIfModelsExist(region, viewClass, childModel, modelField) {
    if (childModel && this.model.get(modelField)) {
      this.showChildView(region, new viewClass({ model: childModel }));
    }
  },

  renderEvidenceBanner() {
    this.showChildView('evidenceBannerRegion', new EvidenceBannerView({
      disputeEvidenceCollection: this.model.get('disputeEvidenceCollection'),
      forceMissing: this.model.hasMissingRequired()
    }));
  },

  templateContext() {
    return {
      claimIndexDisplay: this.model.collection && _.isNumber(this.model.collection.indexOf(this.model)) ? this.model.collection.indexOf(this.model)+1 : this.model.get('claim_item_number')
    };
  }

});
