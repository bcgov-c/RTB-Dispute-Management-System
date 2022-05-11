import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import FileCollection from '../../../core/components/files/File_collection';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import UploadEvidenceCollectionView from './UploadEvidenceCollectionView';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import template from './UploadEvidenceCollection_template.tpl';

const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,

  regions: {
    addedEvidenceRegion: '.added-issue-evidence',
    missingEvidenceRegion: '.not-added-issue-evidence',
    customEvidenceRegion: '.custom-issue-evidence'
  },
  
  ui: {
    addOther: '.da-upload-add-other-button'
  },

  events: {
    'click @ui.addOther': 'clickAddOtherWithWarning'
  },

  clickAddOtherWithWarning() {
    const showEvidenceWarningPromise = this.getOption('showEvidenceWarningPromise');
    if (showEvidenceWarningPromise && _.isFunction(showEvidenceWarningPromise)) {
      $.when(showEvidenceWarningPromise(this.associatedClaim)).then(() => this.clickAddOther());
    } else {
      this.clickAddOther();
    }
  },

  clickAddOther() {
    const new_dispute_evidence_model = this.evidenceCollection.createBlankEvidence(
      _.extend({
          title: '',
          file_method: configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW')
        },
        this.evidenceCategory ? { category: this.evidenceCategory } : {},
        this.evidenceCode ? { evidence_id: this.evidenceCode } : {}
      ),
      { no_add: true }
    );

    const modal_files = new FileCollection();
    if (this.isOfficeUse) {
      new_dispute_evidence_model.get('typeModel').set({
        optionData: new_dispute_evidence_model.getOfficeUploadFileTypeOptions()
      }, { silent: true });
    }

    const modalAddFiles = new ModalAddFiles(_.extend({
      title: this.isOfficeUse ? 'Add Office Use Files' :
        this.isNonIssue ? 'Add Non-Evidence Files' : 'Add Other Evidence',
      model: new_dispute_evidence_model,
      files: modal_files,
      noUploadOnSave: true,
      saveButtonText: 'Update upload list',
      mobileSaveButtonText: 'Update'
    }, this.modalAddFilesOptions));
    
    this.listenTo(modalAddFiles, 'save:complete', function() {
      // Filter out any error files
      new_dispute_evidence_model.get('files').reset(_.map(modal_files.getReadyToUpload(), function(file_model) {
        file_model.set('display_mode', true);
        file_model.collection = new_dispute_evidence_model.get('files');
        return file_model;
      }));

      if (this.deriveEvidenceCategory) {
        const typeValue = new_dispute_evidence_model.get('typeModel').getData({ parse: true });
        const evidence_config = configChannel.request('get:evidence', typeValue);
        const category = evidence_config ? evidence_config.category : 0;
        
        new_dispute_evidence_model.set('category', category);
        new_dispute_evidence_model.get('file_description').set({
          description_code: typeValue,
          description_category: category
        });
      }      
      this.uploadModel.addPendingUpload(new_dispute_evidence_model);
      this.evidenceCollection.add(new_dispute_evidence_model, {merge: true});
      this.claimCollection.trigger('update:file:count');
    }, this);

    modalChannel.request('add', modalAddFiles);
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'uploadModel', 'isNonIssue', 'deriveEvidenceCategory', 'evidenceCategory', 'evidenceCode', 'isOfficeUse', 'evidenceCollection', 'evidenceCode', 'claimCollection', 'associatedClaim', 'modalAddFilesOptions', 'isIssue', 'showEvidenceWarningPromise']);

    const dispute = disputeChannel.request('get');
    const participant = participantsChannel.request('get:participant', dispute.get('tokenParticipantId'));
    this.isApplicant = participant && participant.isApplicant();
    
    this.parseAndSetEvidenceCollections();
    this.listenTo(this.evidenceCollection, 'add', this.onEvidenceChange, this);
    this.listenTo(this.evidenceCollection, 'remove', this.onEvidenceChange, this);
  },

  parseAndSetEvidenceCollections() {
    this.provided_evidences = this.evidenceCollection.getFilesProvided({ no_custom: true });
    this.missing_evidences =  this.evidenceCollection.getFilesMissing({ no_custom: true });
    this.uploadedOtherEvidenceCount = this.evidenceCollection.reduce((memo, evidence) => memo + (evidence.isCustom() ? evidence.getUploadedFiles().length : 0), 0);

    // Now set any standalone evidence which is required.  Only applies to MOW for now.
    this.related_other_evidences = [];    
    
    if (!this.isApplicant) {
      return;
    }

    const matchingClaim = this.associatedClaim ? this.claimCollection.findWhere({ claim_id: this.associatedClaim.get('claim_id') }) : null
    if (matchingClaim && matchingClaim.hasConfigMonetaryOrderWorksheetEvidence()) {
      this.related_other_evidences.push(new DisputeEvidenceModel(
        configChannel.request('get:evidence', configChannel.request('get', 'STANDALONE_MONETARY_ORDER_WORKSHEET_CODE'))
      ));
    }
  },

  onEvidenceChange() {
    this.parseAndSetEvidenceCollections();
    this.render();
    loaderChannel.trigger('page:load:complete');
  },

  onRender() {
    const self = this;

    this.showChildView('addedEvidenceRegion', new UploadEvidenceCollectionView({
      mode: this.mode,
      uploadModel: this.uploadModel,
      collection: this.evidenceCollection,
      associatedClaim: this.associatedClaim,
      claimCollection: this.claimCollection,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise,
      filter(child) {
        return !self.isOfficeUse && !child.isCustom() && child.getUploadedFiles().length;
      }
    }));

    this.showChildView('missingEvidenceRegion', new UploadEvidenceCollectionView({
      mode: this.mode,
      uploadModel: this.uploadModel,
      collection: this.evidenceCollection,
      associatedClaim: this.associatedClaim,
      claimCollection: this.claimCollection,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise,
      filter(child) {
        return !self.isOfficeUse && !child.isCustom() && !child.getUploadedFiles().length;
      }
    }));

    this.showChildView('customEvidenceRegion', new UploadEvidenceCollectionView({
      mode: this.mode,
      uploadModel: this.uploadModel,
      collection: this.evidenceCollection,
      associatedClaim: this.associatedClaim,
      claimCollection: this.claimCollection,
      showEvidenceWarningPromise: this.showEvidenceWarningPromise,
      filter(child) {
        return self.isOfficeUse || (child.isCustom() && child.getReadyToUploadFiles().length);
      }
    }));
  },

  templateContext() {
    const containerHasEvidence = !(_.isEmpty(this.provided_evidences) && _.isEmpty(this.missing_evidences));

    return {
      provided_evidences: this.provided_evidences,
      missing_evidences: this.missing_evidences,
      related_other_evidences: this.related_other_evidences,
      hasUploadedEvidence: !_.isEmpty(this.provided_evidences) || this.uploadedOtherEvidenceCount,
      uploadedOtherEvidenceCount: this.uploadedOtherEvidenceCount,
      isUpload: this.mode === 'upload',
      isDisplayOnly: this.mode === 'displayOnly',
      addOtherLinkText: this.isOfficeUse ? 'Add office files to dispute' :
        containerHasEvidence ? 'Add something not listed above' : 'Add evidence'
    };
  }
});
