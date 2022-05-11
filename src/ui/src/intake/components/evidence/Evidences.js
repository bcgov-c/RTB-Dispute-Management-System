import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EvidenceView from './Evidence';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import template from './EvidenceCollection_template.tpl';

// BIG Trials logic
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import ModalEvidenceReminder from '../../../core/components/trials/BIGEvidence/ModalEvidenceReminder';
const disputeChannel = Radio.channel('dispute');
const participantsChannel = Radio.channel('participants')

const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const EvidenceCollectionView = Marionette.CollectionView.extend({
  childView: EvidenceView,

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() & is_valid;
    });
    
    return is_valid;
  }
});


export default Marionette.View.extend({
  template,

  ui: {
    add: '.add-other-evidence'
  },

  regions: {
    collectionRegion: '.evidence-list'
  },

  events: {
    'click @ui.add': 'clickAddOtherWithTrialCheck'
  },

  clickAddOtherWithTrialCheck() {
    if (!this.enableBigTrialIntervention) return this.clickAddOther();
    this.showTrialIntervention().then(() => this.clickAddOther());
  },

  showTrialIntervention() {
    const dispute = disputeChannel.request('get');
    const primaryApplicant = participantsChannel.request('get:primaryApplicant');
    if (!TrialLogic_BIGEvidence.canViewIntakeEvidenceNudgeInterventions(dispute, primaryApplicant)) return Promise.resolve();

    const trialModalView = new ModalEvidenceReminder();
    return new Promise(res => {
      this.listenTo(trialModalView, 'continue', () => {
        trialModalView.close();
        TrialLogic_BIGEvidence.addIntakeParticipantInterventionEvidence(primaryApplicant)
          .finally(res);
      });
      modalChannel.request('add', trialModalView);
    });
  },

  clickAddOther() {
    const EVIDENCE_METHOD_UPLOAD_NOW = String(configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW'));
    const added_model = this.collection.createBlankEvidence({
      title: '',
      evidence_id: configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE'),
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
      file_method: EVIDENCE_METHOD_UPLOAD_NOW
    });
    added_model.get('selectedActionPicklist').set('value', EVIDENCE_METHOD_UPLOAD_NOW, { silent: true });

    const intakeFilePackage = filesChannel.request('get:filepackage:intake');
    const modalAddFiles = new ModalAddFiles({
      model: added_model,
      files: added_model.get('files'),
      filePackageId: intakeFilePackage ? intakeFilePackage.id : null
    });

    this.stopListening(modalAddFiles);
    this.listenTo(modalAddFiles, 'save:complete', function() {
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);

    this.listenTo(modalAddFiles, 'removed:modal', function() {
      if (added_model && added_model.isNew()) {
        this.collection.remove(added_model);
        this.render();
      }
    }, this);

    modalChannel.request('add', modalAddFiles);
  },

  initialize(options) {
    this.mergeOptions(options, ['enableBigTrialIntervention']);
  },

  onRender() {
    this.showChildView('collectionRegion', new EvidenceCollectionView({
      collection: this.collection,
      childViewOptions: {
        enableBigTrialIntervention: this.enableBigTrialIntervention
      }
    }));
  },

  validateAndShowErrors() {
    return this.getChildView('collectionRegion').validateAndShowErrors();
  }

});
