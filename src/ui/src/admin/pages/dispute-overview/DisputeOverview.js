
/**
 * @class admin.pages.dispute-overview.DisputeOverview
 * @memberof admin.pages.dispute-overview
 * @augments Marionette.View
 */

import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DisputeOverviewHeader from './DisputeOverviewHeader';
import ContextContainer from '../../components/context-container/ContextContainer';
import DisputeInfoView from './DisputeInfo';
import DisputeAmendmentInfo from './DisputeAmendmentInfo';
import DisputePartiesView from './DisputeParties';
import DisputeClaimsView from '../../components/dispute-claim/DisputeClaims';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import template from './DisputeOverview_template.tpl';
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalAutoAssignUnassignedDispute from './modals/ModalAutoAssignUnassignedDispute';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const claimsChannel = Radio.channel('claims');
const notesChannel = Radio.channel('notes');
const menuChannel = Radio.channel('menu');
const filesChannel = Radio.channel('files');
const hearingChannel = Radio.channel('hearings');
const sessionChannel = Radio.channel('session');
const Formatter = Radio.channel('formatter').request('get');
const disputeChannel = Radio.channel('dispute');

const STAGE_HEARING_VALUE = 8;
const STATUS_HEARING_ASSIGNED_VALUE = 80;
const STAGE_POST_SUPPORT_VALUE = 10;
const STATUS_DECISION_PENDING_VALUE = 100;

export default PageView.extend({
  template,
  tagName: 'div',
  className: `${PageView.prototype.className} overview-page`,

  regions: {
    overviewHeader: '#dispute-overview-upper-bar',
    generalInfo: '#dispute-general-info',
    amendmentInfo: '#dispute-amendment-info',
    applicantsInfo: '#dispute-applicants-info',
    respondentsInfo: '#dispute-respondents-info',
    claimsInfo: '#dispute-claims-info',
    disputeFlags: '.dispute-flags',
  },

  ui: {
    printHeader: '.print-header'
  },

  onChildviewCommunication() {
    Backbone.history.navigate(routeParse('communication_item', this.model.get('dispute_guid')), {trigger: true});
  },

  onChildviewHearing() {
    Backbone.history.navigate(routeParse('hearing_item', this.model.get('dispute_guid')), {trigger: true});
  },

  onChildviewTasks() {
    Backbone.history.navigate(routeParse('task_item', this.model.get('dispute_guid')), {trigger: true});
  },
  
  onChildviewHistory() {
    Backbone.history.navigate(routeParse('history_item', this.model.get('dispute_guid')), {trigger: true});
  },

  onChildviewDocuments() {
    Backbone.history.navigate(routeParse('document_item', this.model.get('dispute_guid')), {trigger: true});
  },  

  onChildviewNotice() {
    Backbone.history.navigate(routeParse('notice_item', this.model.get('dispute_guid')), {trigger: true});
  },

  onChildviewPayments() {
    Backbone.history.navigate(routeParse('payment_item', this.model.get('dispute_guid')), {trigger: true});
  },

  onChildviewQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  onChildviewRefresh() {
    const refreshPageFn = () => {
      this.model.triggerPageRefresh();
    };

    this.model.checkEditInProgressPromise().then(
      refreshPageFn,
      () => {
        this.model.showEditInProgressModalPromise(true).then(isAccepted => {
          if (isAccepted) {
            this.model.stopEditInProgress();
            refreshPageFn();
          }
        });
      });
  },

  onChildviewClose() {
    menuChannel.trigger('close:dispute', this.model.get('dispute_guid'));
    Backbone.history.navigate(routeParse('landing_item'), {trigger: true});
  },


  _getMenuStates() {
    const showAmendOption = this.model.isPostNotice() && !(this.model.isCreatedRentIncrease() || this.model.isCreatedPfr());
    const default_menu = [
      { name: 'Edit Dispute', event: this.model.isPostNotice() ? 'edit:post:notice' : 'edit:pre:notice' },
      ...(showAmendOption ? [{ name: 'Amend Dispute', event: 'amend' }] : []),
      { name: 'Change Status', event: 'edit:status' },
    ];

    return {
      default: default_menu,
      edit_pre_notice: [{ name: 'Save', event: 'save:pre:notice' },
        { name: 'Cancel', event: 'cancel' }],
      edit_post_notice: [{ name: 'Save', event: 'save:post:notice' },
        { name: 'Cancel', event: 'cancel' }],
      edit_status: [{ name: 'Save Status', event: 'save:status' },
        { name: 'Cancel', event: 'cancel' }],
      amend: [{ name: 'Submit Amendment', event: 'submit:amendment' },
          { name: 'Cancel', event: 'cancel' }]
    };
  },

  _getMenuTransitions() {
    return {
      'edit:pre:notice': {
        view_mode: 'dispute-edit',
        next: 'edit_pre_notice',
        isEdit: true
      },
      'edit:post:notice': {
        view_mode: 'dispute-edit',
        next: 'edit_post_notice',
        isEdit: true
      },
      'edit:status': {
        view_mode: 'status-edit',
        next: 'edit_status',
        isEdit: true
      },
      amend: {
        view_mode: 'dispute-edit',
        next: 'amend',
        isEdit: true
      },
      cancel: {
        next: 'default',
        reset: true
      }
    };
  },

  showCutoverWarning() {
    return new Promise((resolve, reject) => {
      if (!this.model.isMigrated()) {
        resolve();
        return;
      }
      modalChannel.request('show:standard', {
        title: 'Cut-Over File Warning',
        bodyHtml: `<p>This file was created in a retired system and only email addresses should be updated. The DMS is not the source of truth for any other file information.</p>`,
        primaryButtonText: 'Continue with Edit',
        onContinueFn(modalView) {
          modalView.close();
          resolve();
        },
        onCancelFn(modalView) {
          modalView.close();
          reject();
        }
      });
    });
  },

  autoAssignBeforeHearing() {
    const activeHearing = hearingChannel.request('get:active');
    if (!activeHearing) return;

    const hearingStartTime = activeHearing.get('hearing_start_datetime');
    const loggedInUser = sessionChannel.request('get:user');

    if (this.model.getOwner() === loggedInUser.id || !loggedInUser.isArbitrator()) return;

    const hearingAssignedDateCheck = Moment(hearingStartTime).isBetween(Moment().subtract(2, 'hours'), Moment().add(8, 'hours'));
    const hearingAssignedStageStatusCheck = this.model.checkStageStatus(6, [60,61]);

    return ((hearingAssignedStageStatusCheck) && 
            this.model.checkProcess([1,4,6,7]) &&
            (hearingAssignedDateCheck) &&
            activeHearing.get('hearing_owner') === loggedInUser.id)
  },

  autoAssignAfterHearing() {
    const latestHearing = hearingChannel.request('get:latest');
    if (!latestHearing) return;

    const hearingStartTime = latestHearing.get('hearing_start_datetime');
    const loggedInUser = sessionChannel.request('get:user');

    if (this.model.getOwner() === loggedInUser.id || !loggedInUser.isArbitrator()) return;

    const decisionPendingDateCheck = Moment(hearingStartTime).isBefore(Moment().add(2, 'hours'));
    const decisionPendingStageStatusCheck = this.model.checkStageStatus(6, [60,61]) || this.model.checkStageStatus(8, [80]);

    return ((decisionPendingDateCheck) && 
            this.model.checkProcess([1,4,6,7]) &&
            (decisionPendingStageStatusCheck) &&
            latestHearing.get('hearing_owner') === loggedInUser.id)

  },

  openAssignDisputeModal(nextStage, nextStatus) {
    const modalAutoAssignUnassignedDispute = new ModalAutoAssignUnassignedDispute({ nextStage, nextStatus });
    modalChannel.request('add', modalAutoAssignUnassignedDispute);

    this.listenTo(modalAutoAssignUnassignedDispute, 'save:completed', () => Backbone.history.loadUrl(Backbone.history.fragment))
  },

  initialize() {
    if (this.autoAssignBeforeHearing()) this.openAssignDisputeModal(STAGE_HEARING_VALUE, STATUS_HEARING_ASSIGNED_VALUE);
    else if (this.autoAssignAfterHearing()) this.openAssignDisputeModal(STAGE_POST_SUPPORT_VALUE, STATUS_DECISION_PENDING_VALUE);

    this.unitCollection = participantsChannel.request('get:dispute:units');
    this.listenTo(this.model, 'change:hearingToolsEnabled', (dispute, isEnabled) => {
      if (isEnabled) TrialLogic_BIGEvidence.checkAndShowArbWarning(dispute);
      this.render();
    });
  },

  onRender() {
    const isMigrated = this.model.isMigrated();
    const applicants = participantsChannel.request('get:applicants');
    const respondents = participantsChannel.request('get:respondents');
    const dispute = disputeChannel.request('get');
    const claims = claimsChannel.request('get:full:with:supporting', { skip_tenancy_agreement: true }).removeAllRemovedClaimsAndEvidence();
    
    const issueCodesDisplay = this.model.isCreatedPfr() && claims.length ? claims.at(0).getClaimCodeReadable() : Formatter.toIssueCodesDisplay(claims);
   
    this.stopListening(claims, 'contextRender:refresh');
    this.stopListening(claims, 'remove:claim:then:contextRender:refresh');
    this.stopListening(applicants, 'contextRender:refresh');
    this.stopListening(respondents, 'contextRender:refresh');
    this.stopListening(dispute, 'contextRender:refresh');

    this.listenToOnce(dispute, 'contextRender:refresh', this.render, this);
    this.listenToOnce(claims, 'contextRender:refresh', this.render, this);
    // Add a new event here to delete the issue AFTER render is called, otherwise we lose the triggering model because it's moved from collection
    this.listenToOnce(claims, 'remove:claim:then:contextRender:refresh', (claimModel) => {
      if (claimModel) {
        claimsChannel.request('remove:claim', claimModel);
      }
      this.render();
    });
    this.listenToOnce(applicants, 'contextRender:refresh', this.render, this);
    this.listenToOnce(respondents, 'contextRender:refresh', this.render, this);
    
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${dispute.get('file_number')}: Dispute Overview`
    }));

    this.showChildView('overviewHeader', new DisputeOverviewHeader({ model: this.model }));
    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('generalInfo', ContextContainer.withContextMenuNotes({
      wrappedContextContainerView: ContextContainer.withContextMenu({
        wrappedView: new DisputeInfoView({ model: this.model }),
        titleDisplay: `<div class="dispute-general-info-title">${isMigrated?'**':'#'}${this.model.get('file_number')}</div>${isMigrated?'<span>Service Portal or Re-opened CMS File</span>':''}`,
        menu_title: `Dispute ID ${this.model.id}`,
        menu_options: {
          modifiedBy: this.model.get('dispute_last_modified_by'),
          modifiedDate: this.model.get('dispute_last_modified_date')
        },
        amendmentTypeToUse: this.model.get('is_amended') ? configChannel.request('get', 'AMENDMENT_TO_TYPE_DISPUTE') : null,
        showComplexityAndUrgency: true,
        onMenuOpenFn: () => this.showCutoverWarning(),
        menu_states: this._getMenuStates(),
        menu_events: this._getMenuTransitions(),
        contextRender: () => this.render(),
        disputeModel: this.model
      }),
      notes: notesChannel.request('get:disputeinfo', this.model.id),
      noteCreationData: {
        mode: 'edit',
        note_linked_to: configChannel.request('get', 'NOTE_LINK_DISPUTE_INFO'),
        note: null
      }
    }));

    this.showChildView('amendmentInfo', new DisputeAmendmentInfo());


    const hideAddApplicants = (this.model.isUnitType() || this.model.isCreatedAriE()) && this.model.isPostNotice();
    const hideAddRespondents = this.model.isUnitType() || (this.model.isCreatedAriE() && this.model.isPostNotice());
    this.showChildView('applicantsInfo', new DisputePartiesView({
      headerHtml: 'Applicants <span class="page-section-subtitle">(that filed the dispute)</span>',
      participantType: 'Applicant',
      addButtonDisplay: 'Add Applicant, Agent or Advocate',
      baseName: this.model.isLandlord() ? 'Landlord' : 'Tenant',
      onMenuOpenFn: () => this.showCutoverWarning(),
      hideAddButton: hideAddApplicants,
      collection: applicants,
      model: this.model
    }));

    this.showChildView('respondentsInfo', new DisputePartiesView({
      headerHtml: 'Respondents <span class="page-section-subtitle">(the dispute is against)</span>',
      participantType: 'Respondent',
      addButtonDisplay: 'Add Respondent',
      baseName: this.model.isLandlord() ? 'Tenant' : 'Landlord',
      onMenuOpenFn: () => this.showCutoverWarning(),
      hideAddButton: hideAddRespondents,
      collection: respondents,
      model: this.model,
      unitCollection: this.unitCollection,
      enableKnownContact: !this.model.isLandlord() ? true : this.model.isPastTenancy()
    }));
    

    const allFileModels = claims.reduce((memo, claim) => _.union(memo || [], claim.getUploadedFiles()), null);
    this.showChildView('claimsInfo', new DisputeClaimsView({
      headerHtml: `Issues and evidence${ issueCodesDisplay ? `: ${issueCodesDisplay}` : ''}`,
      addButtonDisplay: 'Add Issue',
      onMenuOpenFn: () => this.showCutoverWarning(),
      collection: claims,
      model: this.model,
      unitCollection: this.unitCollection,
      fileDupTranslations: filesChannel.request('get:duplicate:translations',  allFileModels)
    }));
 
    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    return {
      Formatter,
      lastRefreshTime: Moment(),
    };
  }
  
});
