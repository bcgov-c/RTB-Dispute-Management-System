import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import DisputeClaimView from '../../dispute-claim/DisputeClaim';
import template from './ModalAddClaim_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const PAPER_FILING_DESCRIPTION = 'See original paper application for issue information';

const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const amendmentChannel = Radio.channel('amendments');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  regions: {
    claimSelectorRegion: '.claim-selector',
    claimRegion: '.claim-add-edit-container',

    amendmentByRegion: '.amendment-by',
    amendmentRtbInitRegion: '.amendment-rtb-init',
    amendmentRespondentInitRegion: '.amendment-respondent-init',
    amendmentNoteRegion: '.amendment-note'
  },

  ui: {
    amend: '#addPartyAmend',
    save: '#addPartySave',
    cancel: '#addPartyCancel',
    close: '.close-x'
  },

  events: {
    'click @ui.close': 'clickClose',
    'click @ui.cancel': 'clickClose',
    'click @ui.save': 'clickSave',
    'click @ui.amend': 'clickAmend'
  },

  clickClose() {
    // Make sure to clean up the temporary add model we added to claimCollection
    if (this.claimModel.isNew() && this.claimCollection) {
      this.claimCollection.remove(this.claimModel);
    }
    Radio.channel('modals').request('remove', this);
  },

  clickSave() {
    const claimSelectorView = this.getChildView('claimSelectorRegion');
    const claimView = this.getChildView('claimRegion');

    if (claimSelectorView.validateAndShowErrors() & (claimView && claimView.validateAndShowErrorsForPreNotice())) {
      // Stash saved changes
      loaderChannel.trigger('page:load');
      claimView.applyPageModelChangesForPreNotice();
      this.claimModel.save()
        .done(() => {
          this.trigger('save:complete', this.claimModel);
          loaderChannel.trigger('page:load:complete');
        })
        .fail(
          generalErrorFactory.createHandler('ADMIN.CLAIM.CREATE', () => {
            loaderChannel.trigger('page:load:complete');
          })
        );
    }
  },

  clickAmend() {
    const claimSelectorView = this.getChildView('claimSelectorRegion'),
      claimView = this.getChildView('claimRegion'),
      amendmentByView = this.getChildView('amendmentByRegion');

    if (claimSelectorView.validateAndShowErrors() & (claimView && claimView.validateAndShowErrorsForPreNotice()) & (amendmentByView && amendmentByView.validateAndShowErrors())) {
      this.showAddConfirmModal();
    }
  },

  showAddConfirmModal() {
    modalChannel.request('show:standard', {
      title: `Add Issue?`,
      bodyHtml: `<p>Warning - this will add the new issue: <b>${this.claimModel.getClaimTitleWithCode()}</b> and store the change as an amendment.  Amendments must be served to responding parties.`
        + `<p>Are you sure you want to add this issue?`,
      primaryButtonText: 'Add Issue and Amendment',
      onContinueFn: _.bind(function(modal) {
        modal.close();
        const claimView = this.getChildView('claimRegion');
        loaderChannel.trigger('page:load');
        // Save the claim first to create it.  Then set the appropriate fields and save again.
        claimView.applyPageModelChangesForPreNotice();
        this.claimModel.setAmended();
        this.claimModel.save()
          .done(() => {
            amendmentChannel.request('add:claim', this.claimModel, _.extend(
              this.amendmentByModel.getPageApiDataAttrs(),
              this.amendmentRtbInitModel.getPageApiDataAttrs(),
              this.amendmentNoteModel.getPageApiDataAttrs()
            )).done(() => {
              loaderChannel.trigger('page:load:complete');
              this.trigger("save:complete", this.claimModel);
            })
            .fail(
              generalErrorFactory.createHandler('ADMIN.AMENDMENT.CLAIM.CREATE', () => {
                loaderChannel.trigger('page:load:complete');
              })
            );
          }).fail(
            generalErrorFactory.createHandler('ADMIN.CLAIM.AMEND_CREATE', () => {
              loaderChannel.trigger('page:load:complete');
            })
          );
      }, this)
    });
  },

  initialize(options) {
    if (!options.collection) {
      console.log(`[Error] Need a collection to add claim to`);
      return;
    }
    this.mergeOptions(options, ['is_post_notice', 'claimCollection']);
    this.claimCollection = options.collection;
    this.isDisputeCreatedAriE = this.model.isCreatedAriE();

    this.createClaimModels();
    this.createAmendmentModels();
    this.setupListeners();
  },

  createClaimModels() {
    this.claimSelectorModel = new DropdownModel({
      optionData: this.getAvailableClaimOptions(),
      labelText: "Issue to add",
      errorMessage: "Select an issue to add",
      defaultBlank: true,
      required: true,
      value: null
    });
    this.claimModel = this.claimCollection.createClaimWithRemedy();
    this.claimCollection.add(this.claimModel, {silent: true});
  },

  getAvailableClaimOptions() {
    // Gets available claims based on:
    // - dispute state
    // - claims that have already been chosen
    // - No DR issues to non-DR, and vise versa
    // - No ET
    const config_issues = configChannel.request('get:issues');
    const dr_issues = configChannel.request('get', 'direct_request_issue_codes');
    const dispute = disputeChannel.request('get');

    const LEGACY_FILING_LATE_CODE = configChannel.request('get', 'LEGACY_FILING_LATE_CODE');
    const LANDLORD_OTHER_ISSUE_CODE = configChannel.request('get', 'LANDLORD_OTHER_ISSUE_CODE');
    const TENANT_OTHER_ISSUE_CODE = configChannel.request('get', 'TENANT_OTHER_ISSUE_CODE');
    const ARI_E_ISSUE_CODE = configChannel.request('get', 'ARI_E_ISSUE_CODE');
    const ARI_C_ISSUE_CODE = configChannel.request('get', 'ARI_C_ISSUE_CODE');
    const PFR_ISSUE_CODE = configChannel.request('get', 'PFR_ISSUE_CODE');
    const landlord_fee_recovery = configChannel.request('get', 'landlord_fee_recovery');
    const tenant_fee_recovery = configChannel.request('get', 'tenant_fee_recovery');

    const isCreatedIntake = dispute.isCreatedIntake();
    const isCreatedPfr = dispute.isCreatedPfr();
    const isCreatedAriC = dispute.isCreatedAriC();
    const isCreatedAriE = this.isDisputeCreatedAriE;

    const filtered_issues = _.map(
      _.filter(config_issues, function(issue_config) {

        // The default "filing late" (code MT) is not able to be added
        if (issue_config.id === LEGACY_FILING_LATE_CODE) { return; }
        
        // Landlord/Tenant Other issues (OL/OT) are not available to Intake applications
        if ((issue_config.id === LANDLORD_OTHER_ISSUE_CODE || issue_config.id === TENANT_OTHER_ISSUE_CODE) && isCreatedIntake) { return; }

        // Issues which award the opposite of applicant type (TT awards on LL dispute, and LL awards on TT dispute) cannot be added here
        if (issue_config.reverseAward) { return; }


        // Filter issues based on creation method
        if (isCreatedAriE && issue_config.id !== ARI_E_ISSUE_CODE) { return; }
        if (issue_config.id === ARI_E_ISSUE_CODE && !isCreatedAriE) { return; }

        if (isCreatedAriC && issue_config.id !== ARI_C_ISSUE_CODE) { return; }
        if (issue_config.id === ARI_C_ISSUE_CODE && !isCreatedAriC) { return; }

        if (isCreatedPfr && issue_config.id !== PFR_ISSUE_CODE) { return; }
        if (issue_config.id === PFR_ISSUE_CODE && !isCreatedPfr) { return; }

        // Filter first that it passes visibility rules 
        const is_visible = (
          (issue_config.associatedToApplicantType === 'both' || issue_config.associatedToApplicantType === (dispute.isLandlord() ? 'landlord' : 'tenant') )
            && (issue_config.associatedToTenancyStatus === 'both' || issue_config.associatedToTenancyStatus === (dispute.isPastTenancy() ? 'past' : 'current') )
            && (issue_config.associatedToAct === 'both' || issue_config.associatedToAct === (dispute.isMHPTA() ? 'mhpta' : 'rta') )
            && (_.contains(['pet', 'both'], issue_config.associatedToDeposit) ? dispute.hasPetDeposit() : true)
            && (_.contains(['security', 'both'], issue_config.associatedToDeposit) ? dispute.hasSecurityDeposit() : true)
            && (issue_config.associatedToDeposit === 'any' ? dispute.hasDeposit() : true)
        );

        if (!is_visible) { return false }

        // Then validate that the issues have not already been chosen

        if (this.claimCollection.findWhere({ claim_code: issue_config.id })) { return false; }
        
        const isFilingFee = _.contains([landlord_fee_recovery, tenant_fee_recovery], issue_config.id);
        
        // Then validate DR / non-DR
        const issue_is_direct_request = _.contains(dr_issues, issue_config.id);
        if (dispute.isNonParticipatory()) {
          // Direct request, but issue is not request
          if (!issue_is_direct_request && !isFilingFee) {
            return false;
          }
        } else if (issue_is_direct_request) {
          // Not direct request, but issue is direct request
          return false;
        }

        // Lastly, check that there isn't already a related claim added
        if (issue_config.invalidWithClaims) {
          if (_.isArray(issue_config.invalidWithClaims)) {
            return !_.any(issue_config.invalidWithClaims, function(claim_code) {
                return this.claimCollection.findWhere({ claim_code });
            }, this);
          } else {
            return !this.claimCollection.findWhere({ claim_code: issue_config.invalidWithClaims });
          }
        }

        return true;
      }, this), function(issue_config) {
        return { value: issue_config.id, text: `${issue_config.code} - ${issue_config.issueTitle}` };
      });

    console.log(filtered_issues);

    return _.sortBy(filtered_issues, function(issue) { return issue.text; });
  },

  createAmendmentModels() {
    this.amendmentByModel = new DropdownModel({
      optionData: this.getAmendmentParticipantOptionData(participantChannel.request('get:applicants')),
      labelText: "Amendment By",
      required: true,
      defaultBlank: true,
      value: null,
      apiMapping: 'amendment_submitter_id'
    });

    this.amendmentRtbInitModel = new CheckboxModel({
      html: 'RTB Initiated',
      required: false,
      checked: false,
      apiMapping: 'is_internally_initiated'
    });

    this.amendmentRespondentInitModel = new CheckboxModel({
      html: 'Respondent Initiated',
      required: false,
      checked: false
    });

    this.amendmentNoteModel = new InputModel({
      labelText: "Amendment Note",
      cssClass: 'optional-input',
      required: false,
      apiMapping: 'amendment_description',
      maxLength: configChannel.request('get', 'AMENDMEND_NOTE_MAX_LENGTH')
    });
  },

  getAmendmentParticipantOptionData(participants) {
    return (participants || []).filter(p => !p.isNew()).map(p => ({ value: p.id, text: p.getContactName() }) );
  },

  setupListeners() {
    this.listenTo(this.claimSelectorModel, 'change:value', function(model, value) {
      if (value && parseInt(value)) {
        this.claimCollection.remove(this.claimModel, {silent: true});
        this.claimModel = this.claimCollection.createClaimWithRemedy({ claim_code: parseInt(value) });
        this.claimCollection.add(this.claimModel, {silent: true});
        this.renderClaim();
      }
    }, this);

    this.listenTo(this.amendmentRespondentInitModel, 'change:checked', (model, checked) => {
      this.amendmentByModel.set({
        optionData: this.getAmendmentParticipantOptionData(participantChannel.request(`get:${checked ? 'respondents' : 'applicants'}`)),
        value: null,
      });
      this.amendmentByModel.trigger('render');
    });
  },


  onRender() {
    this.showChildView('claimSelectorRegion', new DropdownView({ model: this.claimSelectorModel }));
    this.renderClaim();

    if (this.is_post_notice) {
      this.showChildView('amendmentByRegion', new DropdownView({ model: this.amendmentByModel }));
      this.showChildView('amendmentRtbInitRegion', new CheckboxView({ model: this.amendmentRtbInitModel }));
      this.showChildView('amendmentRespondentInitRegion', new CheckboxView({ model: this.amendmentRespondentInitModel }));
      this.showChildView('amendmentNoteRegion', new InputView({ model: this.amendmentNoteModel }));
    }
  },

  renderClaim() {
    // Don't render claim if none exists
    if (this.claimModel && this.claimModel.get('claim_code')) {
      const claimView = new DisputeClaimView({ model: this.claimModel });
      if (claimView && claimView.descriptionEditModel) {
        claimView.descriptionEditModel.set(this.isDisputeCreatedAriE ? {
          disabled: true,
          value: PAPER_FILING_DESCRIPTION,
          showInputEntry: true
        } :
        {
          disabled: false,
          value: null,
          showInputEntry: true
        });
      }
      
      if (this.claimModel.isFeeRecovery()) claimView.amountEditModel.set({ value: configChannel.request('get', 'PAYMENT_FEE_AMOUNT_INTAKE') || null });
      claimView.switchToPreNoticeEditState();
      this.showChildView('claimRegion', claimView);
    }
  },

  attachElContent(html) {
    // Have to attach modals this way so that the 'modal' class in the template is top-level
    this.setElement(html);
    return this;
  },

  templateContext() {
    const DISPUTE_CREATION_METHOD_DISPLAY = configChannel.request('get', 'DISPUTE_CREATION_METHOD_DISPLAY');
    const dispute = disputeChannel.request('get');
    return _.extend({
      dispute,
      Formatter,
      creationMethodDisplay: DISPUTE_CREATION_METHOD_DISPLAY[dispute.get('creation_method')],
    }, this.options);
  }
});
