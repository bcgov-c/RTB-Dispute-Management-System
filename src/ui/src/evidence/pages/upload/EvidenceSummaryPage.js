import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DisputeEvidenceCollection from '../../../core/components/claim/DisputeEvidence_collection';
import AccessDisputeOverview from '../../components/access-dispute/AccessDisputeOverview';
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalIntakeIssueIntervention from '../../../core/components/trials/BIGEvidence/ModalIntakeIssueIntervention';
import UploadIssueCollection from './UploadIssueCollection';
import UploadIssue from './UploadIssue';
import PrintableIframe from '../../../core/components/printable-iframe/PrintableIframe';
import template from './EvidenceSummaryPage_template.tpl';

const DEFAULT_SUMMARY_HTML = `<p>Below is a summary of the recommended evidence for each claim in this dispute.</p>
<p><span class="instructions-em">Important:</span>&nbsp;You are responsible for submitting evidence to prove your position for each claim even if it is not listed. For privacy purposes, you cannot view or open the files you have previously submitted.
</p>`;

const PFR_SUMMARY_LANDLORD_HTML = `<p>All units associated to this application for vacant possession for renovation are listed below. Make sure you submit your evidence to the correct unit address. Once you have uploaded your evidence you will get a submission receipt. You cannot change or remove any files that have been added.</p>
<p><span class="instructions-em">Important:</span>&nbsp;You may submit one bulk evidence package for all units if you choose to do so. If submitting one evidence package for all units, upload the bulk submission to the first rental unit displayed under <i>Add something not listed above</i>, give a short evidence name of Bulk Evidence and indicate that this evidence package is for all units in the "Details and Description" field
</p>`;

const PFR_SUMMARY_TENANT_HTML = `<p>All units associated to this application for vacant possession for renovation are listed below. Make sure you submit your evidence to the correct unit address. Once you have uploaded your evidence you will get a submission receipt. You cannot change or remove any files that have been added.</p>
<p><span class="instructions-em">Important:</span>&nbsp;If you are a party acting on behalf of all units and you are authorized to do so, you may submit one bulk evidence package. Upload the package to the first rental unit displayed. Once you have selected Add Evidence for that rental unit, indicate that this evidence package is for all units in the "Details and Description" field.
</p>`;

const filesChannel = Radio.channel('files');
const modalChannel = Radio.channel('modals');
const claimsChannel = Radio.channel('claims');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants');

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} da-evidence-summary-page`,

  ui: {
    menu: '.dac__evidence__main-menu-btn',
    addFiles: '.dac__evidence__add-files-btn',
    print: '.dac__page-buttons__print-btn',
    content: '.dac__evidence__content'
  },

  regions: {
    disputeRegion: '.dac__evidence__dispute-overview',
    uploadsRegion: '#evidence-uploads',
    otherUploadsRegion: '#other-uploads',
    printableIframe: '.dac__evidence__print-frame'
  },

  events: {
    'click @ui.addFiles': 'clickAddFiles',
    'click @ui.print': 'clickPrint',
    'click @ui.menu': 'clickMenu'
  },

  clickAddFiles() {
    const navigate = () => Backbone.history.navigate('#evidence/upload', {trigger: true});
    if (TrialLogic_BIGEvidence.canViewDisputeAccessCarousel(this.dispute)) {
      this.showTrialIntervention().finally(navigate);
    } else {
      navigate();
    }
  },

  showTrialIntervention() {
    const trialModalView = new ModalIntakeIssueIntervention();
    return new Promise(res => {
      this.listenTo(trialModalView, 'continue', () => {
        trialModalView.close();
        const participant = participantsChannel.request('get:participant', this.dispute.get('tokenParticipantId'));
        // Save intervention, save trial participant
        TrialLogic_BIGEvidence.addDisputeAccessParticipantInterventionCarousel(participant)
          .finally(res);
      });
      modalChannel.request('add', trialModalView);
    });
  },

  clickMenu() {
    Backbone.history.navigate('#access', {trigger: true});
  },

  clickPrint() {
    const printView = new PrintableIframe({
      printPageTitle: 'Dispute Access Evidence',
      printPageBody: this.getUI('content'),
    });
    this.showChildView('printableIframe', printView);
    printView.print();
  },

  initialize() {
    this.dispute = disputeChannel.request('get');
    const loggedInParticipantId = this.dispute.get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    
    this.isRespondentLoggedIn = activeParticipant && activeParticipant.isRespondent();
    this.isCreatedPfr = this.dispute.isCreatedPfr();
    this.full_claims = claimsChannel.request('get:full');
    
    // Just used to co-ordinate help events
    this.uploadModel = new Backbone.Model();

    // Add the supporting claims into the issue claims
    this.other_upload_evidence = new DisputeEvidenceCollection([
      ...( this._shouldDisplayMOW() ?  [claimsChannel.request('create:supporting:mow')] : [] ),
      claimsChannel.request('create:supporting:ta'),
      
      ...(filesChannel.request('get:filedescriptions:claimless').filter(e => e.isCustom() && e.getUploadedFiles().length))
        .map(file_description => ({ file_description }))
    ]);

    if (this.isRespondentLoggedIn) {
      // If respondent, filter claims and evidence to remove evidence with no files
      this.full_claims.each(function(claim) {
        const claimDisputeEvidences = claim.get('dispute_evidences');
        const evidenceToRemove = [];
        claim.get('dispute_evidences').each(function(disputeEvidence) {
          if (_.isEmpty(disputeEvidence.getUploadedFiles())) {
            evidenceToRemove.push(disputeEvidence);
          }
        });
        
        claimDisputeEvidences.remove(evidenceToRemove, { silent: true });
      });
    }
  },

  // Only display MOW if logged-in user is applicant and the claims include MOW evidence
  _shouldDisplayMOW() {
    const loggedInParticipantId = this.dispute.get('tokenParticipantId');
    const activeParticipant = participantsChannel.request('get:participant', loggedInParticipantId);
    return (activeParticipant && activeParticipant.isApplicant()) &&
      this.full_claims.any(function(claim) { return claim.hasConfigMonetaryOrderWorksheetEvidence(); })
  },

  onDomRefresh() {
    this.other_upload_evidence.forEach(evidence => {
      if (evidence.isTenancyAgreement()) evidence.trigger('open:help');
    });

    this.uploadModel.trigger('open:help');
  },

  onRender() {
    this.showChildView('disputeRegion', new AccessDisputeOverview({ model: this.model }));

    this.showChildView('uploadsRegion', new UploadIssueCollection(_.extend({
      mode: 'displayOnly',
      collection: this.full_claims,
      uploadModel: this.uploadModel,
      evidenceCategory: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
      evidenceCode: configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE'),
      showEvidenceWarningPromise: null,
      enableRequiredEvidenceWarning: !this.isRespondentLoggedIn,
    })));


    if (!this.isCreatedPfr) {
      this.showChildView('otherUploadsRegion', new UploadIssue(_.extend({
        issueTypeTitle: 'Other',
        issueTitle: 'Files that support the above claims or your application',
        mode: 'displayOnly',
        evidenceCollection: this.other_upload_evidence,
        evidenceCode: configChannel.request('get', 'EVIDENCE_CODE_NON_ISSUE_EVIDENCE'),
        evidenceCategory: configChannel.request('get', 'EVIDENCE_CATEGORY_NON_ISSUE_EVIDENCE'),
        claimCollection: this.full_claims,
        uploadModel: this.uploadModel,
        showEvidenceWarningPromise: null,
        enableRequiredEvidenceWarning: !this.isRespondentLoggedIn,
      })));
    }
  },

  templateContext() {
    const evidenceSummaryText = this.isCreatedPfr ?
      (this.isRespondentLoggedIn ? PFR_SUMMARY_TENANT_HTML : PFR_SUMMARY_LANDLORD_HTML)
      : DEFAULT_SUMMARY_HTML;
    
    return {
      evidenceSummaryText,
    };
  }
});
