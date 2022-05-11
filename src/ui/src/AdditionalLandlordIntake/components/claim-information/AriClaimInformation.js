
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeEvidenceCollectionView from '../evidence/Evidences';
import EvidenceBannerView from '../evidence/EvidenceBanner';
import AriRemedyInformationCollectionView from './AriRemedyInformations';
import ViewMixin from '../../../core/utilities/ViewMixin';
import template from './AriClaimInformation_template.tpl';

const ERROR_MESSAGE_NO_REMEDIES_ADDED = `Add at least one remedy to continue`;

const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className() { return `step intake-claim ${this.model.get('cssClass')}`; },

  ui: {
    numExpenses: '.remedy-num-expenses',
    total: '.remedy-total',
    addRemedy: '.evidence-claim-add-remedy',
    help: '.evidence-claim-title .help-icon'
  },

  regions: {
    remediesRegion: '.evidence-claim-remedies',
    evidenceRegion: '.evidence-claim-evidence',
    evidenceBannerRegion: '.evidence-claim-banner'
  },

  events: {
    'click @ui.help': 'clickHelp',
    'click @ui.addRemedy': 'clickAddRemedy'
  },

  // BUG NOTE: For some reason, help won't open using the click listener.  Have to proxy it here
  // Catch the event and use the rtb-help tag on the click event
  clickHelp() {
    this.getUI('help').trigger('click.rtb-help');
  },

  clickAddRemedy() {
    loaderChannel.trigger('page:load');

    const addedRemedyInfoModel = this.model.addRemedyModel();
    addedRemedyInfoModel.fullSave().done(() => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    }).fail((err) => {
      alert(err);
    });
  },

  initialize() {
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model, 'change:disputeEvidenceCollection', this.setupBannerListeners, this);
    this.listenTo(this.model.get('remedyInformationCollection'), 'amountChanged', this.updateTotals, this);
    this.listenTo(this.model.get('remedyInformationCollection'), 'change', this.renderEvidenceBanner, this);

    this.listenTo(this.model.get('remedyInformationCollection'), 'update', () => {
      this.renderRemedies();
      this.renderEvidenceBanner();
    }, this);

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
      console.log(childView);
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

    if (!this.model.get('remedyInformationCollection').length) {
      this.showErrorMessage(ERROR_MESSAGE_NO_REMEDIES_ADDED);
      is_valid = false;
    }
    return is_valid;
  },


  onRender() {
    this.renderRemedies();
    this.showChildView('evidenceRegion', new DisputeEvidenceCollectionView({ collection: this.model.get('disputeEvidenceCollection') }))
    this.renderEvidenceBanner();

    ViewMixin.prototype.initializeHelp(this, this.model.get('helpHtml'), ['.evidence-item-container', '.evidence-claim-claim']);
  },

  renderRemedies() {
    this.showChildView('remediesRegion', new AriRemedyInformationCollectionView({ collection: this.model.get('remedyInformationCollection') }));
    this.updateTotals();
  },

  renderEvidenceBanner() {
    this.showChildView('evidenceBannerRegion', new EvidenceBannerView({
      disputeEvidenceCollection: this.model.get('disputeEvidenceCollection'),
      forceMissing: this.model.hasMissingRequired()
    }));
  },

  _getDisplayTotal() {
    const remedyInformationCollection = this.model.get('remedyInformationCollection');
    return Formatter.toAmountDisplay(remedyInformationCollection ? remedyInformationCollection.getTotalAmount() : 0);
  },

  updateTotals() {
    this.getUI('numExpenses').html(this.model.get('remedyInformationCollection').length);
    this.getUI('total').html(this._getDisplayTotal());
  },

  templateContext() {
    const remedyInformationCollection = this.model.get('remedyInformationCollection');
    return {
      claimIndexDisplay: this.model.collection && _.isNumber(this.model.collection.indexOf(this.model)) ? this.model.collection.indexOf(this.model)+1 : this.model.get('claim_item_number'),
      numExpenses: remedyInformationCollection.length,
      displayTotal: this._getDisplayTotal()
    };
  }

});
