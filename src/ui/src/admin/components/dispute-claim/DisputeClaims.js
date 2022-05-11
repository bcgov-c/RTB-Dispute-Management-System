import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../context-container/ContextContainer';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import DisputeClaimView from './DisputeClaim';
import ModalAddClaim from '../modals/modal-add-claim/ModalAddClaim';
import template from './DisputeClaims_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import ViewMixin from '../../../core/utilities/ViewMixin';

import ModalAriDashboardView from '../../../core/components/custom-data-objs/ari-c/ri-dashboard/ModalAriDashboard';
import ModalPermitsDashboardView from '../../../core/components/custom-data-objs/ari-c/permits-dashboard/ModalPermitsDashboard';

const HEARING_TOOLS_CLAIMS_CLASS = 'hearing-tools-enabled';
const FILTER_CLASS_HIDE_CONSIDERED = 'filter-hide-not-considered';

const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');
const notesChannel = Radio.channel('notes');
const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const participantChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

let UAT_TOGGLING = {};

const EmptyClaimsView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`No claims have been added`)
});

const DisputeClaimsCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerWithNotesView,
  emptyView: EmptyClaimsView,

  emptyViewOptions: {
    // Add this so childViewOptions are not called on empty view
  },

  childViewOptions(model) {
    const issue_config = model && model.claim ? configChannel.request('get:issue', model.claim.get('claim_code')) : null;
    const claimTitle = model.get('claim_title') || issue_config.issueTitle;
    return {
      parent: this,
      claimTitle: claimTitle || `<i>No title in config - code ${model && model.claim ? model.claim.get('claim_code') : 'unknown'}</i>`,
      showThumbnails: this.showThumbnails,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations
    };
  },

  viewComparator(child) {
    const claimId = child.get('claim_id');
    const matchingUnit = this.unitCollection && this.unitCollection.find(unit => unit.get('issue_id') === claimId);
    return this.unitCollection ?
      (matchingUnit ? matchingUnit.get('unit_id') : Number.MAX_SAFE_INTEGER)
      : claimId;
  },

  initialize(options) {
    this.mergeOptions(options, ['onMenuOpenFn', 'showThumbnails', 'unitCollection', 'fileDupTranslations']);
  },

  buildChildView(child, ChildViewClass, childViewOptions) {
    const options = _.extend({model: child}, childViewOptions);
    
    if (ChildViewClass === EmptyClaimsView) {
      return new ChildViewClass(childViewOptions);
    }

    // Set dispute_guid on the dispute claim model so that ContextContainer.clickAmendmentIcon can navigate properly
    child.set('dispute_guid', this.model.id);
    
    const claimCode = child.getClaimCodeReadable();
    const isSupportingEvidence = child.isSupportingEvidence();
    const self = this;

    const claimViewWithMenu = ContextContainer.withContextMenu({
      wrappedView: new DisputeClaimView(options),
      titleDisplay: `${claimCode && !this.model.isCreatedPfr() ? `${claimCode} - ` : ''}${options.claimTitle}`,
      amendmentTypeToUse: child.isAmended() ? configChannel.request('get', 'AMENDMENT_TO_TYPE_ISSUE') : null,
      menu_title: isSupportingEvidence ? ' ' : `Issue ID ${child.claim.get('claim_id')}`,
      menu_states: this._getMenuStates(child),
      menu_events: this._getMenuTransitions(),
      onMenuOpenFn: () => _.isFunction(this.onMenuOpenFn) ? this.onMenuOpenFn() : null,
      contextRender() {
        self.render();
      },
      cssClass: isSupportingEvidence ? 'dispute-claim-supporting' : null,
      disputeModel: this.model
    });
    // Create the child view instance
    const view = isSupportingEvidence ? claimViewWithMenu :
      ContextContainer.withContextMenuNotes({
        wrappedContextContainerView: claimViewWithMenu,
        notes: notesChannel.request('get:claim', child.get('claim_id')),
        noteCreationData: {
          mode: 'edit',
          note_linked_to: configChannel.request('get', 'NOTE_LINK_CLAIM'),
          note_link_id: child.claim.get('claim_id'),
          note: null
        }
      });
    return view;
  },

  _getMenuStates(claimModel) {
    const default_menu = [];
    const isReverseApplicantIssue = claimModel.isReverseAward();
    const uploadedFiles = claimModel.getUploadedFiles();
    const fileCountDisplay = `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'}`;
    const totalFileSizeDisplay = Formatter.toFileSizeDisplay(_.reduce(uploadedFiles, function(memo, file) { return memo + file.get('file_size'); }, 0));
    
    
    if (uploadedFiles.length) {
      default_menu.push({ name: `Download All (${fileCountDisplay}, ${totalFileSizeDisplay})`, event: 'download:all' });
    }

    if (claimModel.isSupportingEvidence() || claimModel.isExpenseIssue() || this.model.isUnitType() || this.model.isCreatedRentIncrease()) {
      return {
        default: default_menu
      }
    }

    if (!this.model.isPostNotice() || isReverseApplicantIssue) {
      default_menu.unshift({ name: 'Edit', event: 'edit:pre:notice' });
    } else {
      default_menu.unshift({ name: 'Amend', event: 'amend' });
    }

    return {
      default: default_menu,
      edit_pre_notice: [
        ...(isReverseApplicantIssue ? [] : [{ name: 'Save', event: 'save:pre:notice' }]),
        { name: 'Cancel', event: 'cancel' },
        { name: 'Delete', event: 'delete' }
      ],

      amend: [{ name: 'Submit Amendment', event: 'submit:amendment' },
        { name: 'Cancel', event: 'cancel' },
        { name: 'Remove', event: 'remove' }
      ]
    };
  },

  _getMenuTransitions() {
    return {
      'edit:pre:notice': {
        view_mode: 'edit',
        next: 'edit_pre_notice',
        isEdit: true
      },
      amend: {
        view_mode: 'edit',
        next: 'amend',
        isEdit: true
      },
      cancel: {
        next: 'default',
        reset: true
      }
    };
  }
});

export default Marionette.View.extend({
  template,

  className: FILTER_CLASS_HIDE_CONSIDERED.replace(/^\./, ''),

  ui: {
    add: '.claim-add-icon',
    addReverseApplicantIssue: '.claim-add-reverse-applicant-text',
    ariDashboard: '.claim-ari-dashboard-btn',
    permitsDashboard: '.claim-permits-dashboard-btn',
    claimsRegion: '.dispute-overview-claims',
    printFilterText: '.print-filter-text'
  },

  regions: {
    showThumbnailsRegion: '.dispute-overview-claims-thumbnails',
    showHearingToolsRegion: '.dispute-overview-claims-hearing-tools',
    showEvidenceRegion: '.dispute-overview-claims-show-evidence',
    claimsRegion: '@ui.claimsRegion',
    supportingEvidenceRegion: '.dispute-overview-supporting-claims'
  },

  events: {
    'click @ui.add': 'clickAdd',
    'click @ui.addReverseApplicantIssue': 'clickAddReverseApplicantIssue',
    'click @ui.ariDashboard': function() { this.clickOpenDashboard(ModalAriDashboardView) },
    'click @ui.permitsDashboard': function() { this.clickOpenDashboard(ModalPermitsDashboardView) },
  },

  clickAdd() {
    
    if (!participantChannel.request('get:primaryApplicant:id')) {
      alert("Add a primary applicant before adding any claims");
      return;
    }

    const addClaimFn = () => {
      const modalAddClaim = new ModalAddClaim(_.extend({}, this.options, { is_post_notice: this.model.isPostNotice() }));
      this.stopListening(modalAddClaim);
      this.listenTo(modalAddClaim, 'save:complete', function(claimModel) {
        modalChannel.request('remove', modalAddClaim);

        // Make sure added claim is added to all claims
        if (claimModel) {
          claimsChannel.request('add:claim', claimModel);
        }

        // Refresh the main page to get the order of issues correct
        this.collection.trigger('contextRender:refresh');
      }, this);
      loaderChannel.trigger('page:load:complete');
      modalChannel.request('add', modalAddClaim);
    };

    this.model.checkEditInProgressPromise().then(
      addClaimFn,
      () => {
        this.model.showEditInProgressModalPromise()
      }
    );
  },

  clickAddReverseApplicantIssue(ev) {
    const issueElement = $(ev.currentTarget);
    const claimCode = issueElement.data('code');
    const matchingIssue = this.reverseApplicantIssues.find(issue => issue.getClaimCode() === claimCode);
    if (!matchingIssue) {
      console.log(`[Error] No claim to add`);
      return;
    }

    const addReverseApplicantClaimFn = () => {
      loaderChannel.trigger('page:load');
      matchingIssue.save().done(() => {
        this.collection.add(matchingIssue, { merge: true });
        claimsChannel.request('add:claim', matchingIssue);
        this.collection.trigger('contextRender:refresh');
        this.render();
        loaderChannel.trigger('page:load:complete');
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.CLAIM.CREATE');
        handler(err);
      });
    };

    this.model.checkEditInProgressPromise().then(
      addReverseApplicantClaimFn,
      () => {
        this.model.showEditInProgressModalPromise()
      }
    );
  },

  clickOpenDashboard(dashboardView) {
    const openDashboardFn = () => modalChannel.request('add', new dashboardView({ model: this.model }));

    this.model.checkEditInProgressPromise().then(
      openDashboardFn,
      () => this.model.showEditInProgressModalPromise()
    );
  },

  initialize(options) {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    _.extend(this.options, {}, options);

    this.disputeIsMigrated = this.model && this.model.isMigrated();
    this.showHearingToolsBool = UAT_TOGGLING.SHOW_ARB_TOOLS && !this.disputeIsMigrated;

    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.showThumbnailsModel = new CheckboxModel({
      html: 'Thumbnails',
      checked: this.model.get('sessionSettings')?.thumbnailsEnabled
    });

    this.hearingToolsModel = new CheckboxModel({
      html: 'Hearing tools',
      disabled: false,
      checked: this.model.get('sessionSettings')?.hearingToolsEnabled && !this.model.isMigrated()
    });

    this.showEvidenceModel = new CheckboxModel({
      html: 'Not considered evidence',
      checked: this.model.get('sessionSettings').notConsideredEvidence || false
    });
  },

  setupListeners() {
    this.listenTo(this.showThumbnailsModel, 'change:checked', (checkboxModel, value) => {
      this.getUI('printFilterText').html(this.getPrintPageFiltersText());
      this.model.checkEditInProgressPromise().then(
        () => {
          if (value) {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), thumbnailsEnabled: true } });
          } else {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), thumbnailsEnabled: false } });
          }
          this.renderClaimsAndEvidence();
        },
        // Cancel the selection
        () => {
          checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
          checkboxModel.trigger('render');
          this.model.showEditInProgressModalPromise()
        }
      );
    });

    this.listenTo(this.hearingToolsModel, 'change:checked', (checkboxModel, value) => {
      this.model.checkEditInProgressPromise().then(
        () => {
          if (value) {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: true } });
          } else {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: false } });
          }
          this.model.trigger('change:hearingToolsEnabled');
        },
        // Cancel the selection
        () => {
          checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
          checkboxModel.trigger('render');
          this.model.showEditInProgressModalPromise()
        }
      );
    });

    this.listenTo(this.showEvidenceModel, 'change:checked', (model, value) => {
      this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), notConsideredEvidence: value } });
      this.showOrHideNotConsidered(value)
    });
  },

  showOrHideNotConsidered(notConsidered) {
    this.getUI('printFilterText').html(this.getPrintPageFiltersText());
    if (notConsidered) {
      this.$el.removeClass(FILTER_CLASS_HIDE_CONSIDERED);
    } else {
      this.$el.addClass(FILTER_CLASS_HIDE_CONSIDERED);
    }
  },

  showHearingTools() {
    const ele = this.getUI('addReverseApplicantIssue');
    if (ele && ele.length) {
      ele.removeClass('hidden-item');
    }

    this.getUI('claimsRegion').addClass(HEARING_TOOLS_CLAIMS_CLASS);
    const claimsView = this.getChildView('claimsRegion');
    if (claimsView && claimsView.isRendered()) {
      claimsView.children.each(function(view) {
        if (view.wrappedContextContainerView) {
          // Always force close the menu
          if (_.isFunction(view.wrappedContextContainerView.closeMenu)) {
            view.wrappedContextContainerView.closeMenu({ no_animate: true });
          }
          if (_.isFunction(view.wrappedContextContainerView.wrappedView.showHearingTools)) {
            view.wrappedContextContainerView.wrappedView.showHearingTools();
          }
        }
      });
    }
  },

  hideHearingTools() {
    const ele = this.getUI('addReverseApplicantIssue');
    if (ele && ele.length) {
      ele.addClass('hidden-item');
    }

    this.getUI('claimsRegion').removeClass(HEARING_TOOLS_CLAIMS_CLASS);
    const claimsView = this.getChildView('claimsRegion');
    if (claimsView && claimsView.isRendered()) {
      claimsView.children.each(function(view) {
        if (view.wrappedContextContainerView) {
          // Always force close the menu
          if (_.isFunction(view.wrappedContextContainerView.closeMenu)) {
            view.wrappedContextContainerView.closeMenu({ no_animate: true });
          }
          if (_.isFunction(view.wrappedContextContainerView.wrappedView.hideHearingTools)) {
            view.wrappedContextContainerView.wrappedView.hideHearingTools();
          }
        }
      });
    }
  },

  getReverseApplicantIssueConfigs() {
    const dispute = disputeChannel.request('get');
    const LL_POSSESSION_TENANT_APP_ISSUE_CODE = configChannel.request('get', 'LL_POSSESSION_TENANT_APP_ISSUE_CODE');
    const TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE = configChannel.request('get', 'TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE');
    const LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE = configChannel.request('get', 'LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE');
    const canAddCNOP = dispute.isTenant() && !dispute.isPastTenancy() && this.collection.hasTenantMoveOut() && !this.collection.find(c => c.getClaimCode() === LL_POSSESSION_TENANT_APP_ISSUE_CODE);
    const canAddOLRD = dispute.isLandlord() && dispute.isPastTenancy() && this.collection.hasLandlordDeposit() && !this.collection.find(c => c.getClaimCode() === TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE);
    const canAddCNMN = dispute.isTenant() && this.collection.find(c => c.isCNR() || c.isCNOP()) && !this.collection.find(c => c.getClaimCode() === LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE);
    return [
      ...(canAddCNOP ? [LL_POSSESSION_TENANT_APP_ISSUE_CODE] : []),
      ...(canAddOLRD ? [TT_DEPOSIT_AWARD_LANDLORD_APP_ISSUE_CODE] : []),
      ...(canAddCNMN ? [LL_UNPAID_RENT_AWARD_TENANT_APP_ISSUE_CODE] : []),
    ].map(issueId => configChannel.request('get:issue', issueId) || {});
  },

  onBeforeRender() {
    this.reverseApplicantIssues = this.getReverseApplicantIssueConfigs().map(issueConfig => (
      this.collection.createClaimWithRemedy({
        claim_title: issueConfig.issueTitle,
        claim_code: Number(issueConfig.id),
      })
    ));
  },

  onRender() {
    this.showChildView('showThumbnailsRegion', new CheckboxView({ model: this.showThumbnailsModel }));
    this.showChildView('showEvidenceRegion', new CheckboxView({ model: this.showEvidenceModel }));

    this.renderClaimsAndEvidence();
    
    if (this.showHearingToolsBool) {
      this.showChildView('showHearingToolsRegion', new CheckboxView({ model: this.hearingToolsModel }));
      if (this.model.get('sessionSettings')?.hearingToolsEnabled) {
        this.showHearingTools();
        this.getUI('addReverseApplicantIssue').popover();
      }
    }

    this.showOrHideNotConsidered(this.showEvidenceModel.getData());

    ViewMixin.prototype.initializePopovers(this);
  },

  renderClaimsAndEvidence() {
    this.showChildView('claimsRegion', new DisputeClaimsCollectionView(_.extend({
      showThumbnails: this.showThumbnailsModel.get('checked')
    }, this.options)));
  },

  getPrintPageFiltersText() {
    const textPrintArray = [
      ...this.showThumbnailsModel?.getData() ? ['Thumbnails'] : [],
      ...this.showEvidenceModel?.getData() ? ['Not Considered Evidence'] : [],
    ];

    return textPrintArray.length ? `<b>Show:</b> <span>${textPrintArray.join(", ")}</span>` : '';
  },

  templateContext() {
    let allIssuesCompleted = true;
    let totalRequestedAmount = 0;
    let totalGrantedAmount = 0;
    const grantedMoveOutClaims = [];
    let grantedCount = 0;
    
    this.collection.each(claim => {
      if (!claim.allOutcomesComplete() && !claim.isSupportingEvidence()) {
        allIssuesCompleted = false;
      }

      totalRequestedAmount += claim.getAmount();
      totalGrantedAmount += claim.getAwardedAmount();

      if (claim.hasOutcomeAwarded() || claim.hasOutcomeSettled()) {
        grantedCount = claim.getAllRemedies().reduce((memo, remedy) => memo + (remedy.isOutcomeAwarded() || remedy.isOutcomeSettled() ? 1 : 0), grantedCount);
        if (claim.isLandlordMoveOutIssue()) {
          grantedMoveOutClaims.push(claim);
        }
      }
    });

    const sortedGrantedClaims = _.sortBy(grantedMoveOutClaims, claim => (claim.getApplicantsRemedy() || {get(){return 0;}}).get('modified_date'));
    const oldestModifiedGrantedMoveOutClaim = sortedGrantedClaims.length ? sortedGrantedClaims[0] : null;
    const dateDisplay = oldestModifiedGrantedMoveOutClaim && oldestModifiedGrantedMoveOutClaim.getFirstGrantedMoveOutOutcomeDateDisplay();

    const isCreatedPfr = this.model && this.model.isCreatedPfr();
    const isCreatedAriC = this.model && this.model.isCreatedAriC();
    const isCreatedAriE = this.model && this.model.isCreatedAriE();

    return {
      Formatter,
      headerHtml: this.getOption('headerHtml'),
      showHearingTools: this.showHearingToolsBool,
      showAddButton: !this.disputeIsMigrated && !isCreatedPfr && !isCreatedAriC && !(isCreatedAriE && this.model.isPostNotice()),
      showAriDashboardButton: !this.disputeIsMigrated && isCreatedAriC,
      showPermitsDashboardButton: !this.disputeIsMigrated && isCreatedPfr,
      addButtonDisplay: this.getOption('addButtonDisplay') ? this.getOption('addButtonDisplay') : 'Add',
      disputeIsMigrated: this.disputeIsMigrated,
      reverseApplicantIssues: this.reverseApplicantIssues,
      totalRequestedAmount,
      grantedNumDisplayString: !allIssuesCompleted ? '?' : grantedCount,
      grantedDisplayString: this.model.isCreatedPfr() ? 'See Issues' :
        !allIssuesCompleted ? 'Incomplete Issue Outcomes' : `${Formatter.toAmountDisplayWithNegative(totalGrantedAmount)}` +
          (oldestModifiedGrantedMoveOutClaim ? ` - ${oldestModifiedGrantedMoveOutClaim.getClaimCodeReadable()}${grantedMoveOutClaims.length>1?', See issues' : (dateDisplay ? `, ${dateDisplay}` : '')}` : ''),
      isEmpty : this.collection && this.collection.isEmpty(),
      printFilterText: this.getPrintPageFiltersText()
    };
  }

});
