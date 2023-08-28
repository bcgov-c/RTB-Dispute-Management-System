import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeFilePackageClaimView from './DisputeFilePackageClaim';
import DisputeService from '../../../components/service/DisputeService';
import HearingToolsServiceView from '../../../components/service/HearingToolsService';
import template from './DisputeFilePackage_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'dispute-file-package clearfix',

  regions: {
    disputeClaimEvidenceRegion: '.dispute-file-package-claim-evidence',
    serviceHearingToolsRegion: '.dispute-file-package-service-container-hearing-tools',
    serviceDisplayRegion: '.dispute-file-package-service-display'
  },
  
  initialize(options) {
    this.mergeOptions(options, ['showThumbnails', 'showRemoved', 'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations', 'hideDups']);

    const creatorModel = this.model.getPackageCreatorParticipantModel()
    this.creatorUnit = creatorModel && this.unitCollection && this.unitCollection.find(unit => unit.hasParticipantId(creatorModel.get('participant_id')));

    filesChannel.request('update:filepackage:service', this.model.get('filePackageModel'), { silent: true});

    this.model.get('claimsWithFilesInPackage').each(function(claim) {
      claim.get('dispute_evidences').each(function(disputeEvidence) {
        const files = disputeEvidence.get('files');
        this.stopListening(files, 'change:file_referenced');
        this.listenTo(files, 'change:file_referenced', () => {
          this.trigger('contextRender');
          this.model.trigger('change:file_referenced');
        }, this);
        this.stopListening(files, 'change:file_considered');
        this.listenTo(files, 'change:file_considered', () => {
          this.trigger('contextRender');
          this.model.trigger('change:file_considered');
        }, this);
      }, this);
    }, this);
  },
  
  onMenuDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      const claims = this.model.get('claimsWithFilesInPackage');
      const files = _.flatten( claims.map(function(claimModel) { return claimModel.getUploadedFiles(); }) );
      filesChannel.request('download:files', files);
    };

    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Evidence' });
  },

  // Always update some dependent state data on render
  onBeforeRender() {
    this.hasRespondents = participantsChannel.request('get:respondents').length;
  },

  onRender() {
    this.showChildView('disputeClaimEvidenceRegion', new Marionette.CollectionView({
      childView: DisputeFilePackageClaimView,
      collection: this.model.get('claimsWithFilesInPackage'),
      childViewOptions: {
        showThumbnails: this.showThumbnails,
        showRemoved: this.showRemoved,
        evidenceFilePreviewFn: this.evidenceFilePreviewFn,
        showArrows: true,
        showArbControls: true,
        showDetailedNames: true,
        showSubmitterInfo: false,
        matchingUnit: this.creatorUnit,
        fileDupTranslations: this.fileDupTranslations,
        hideDups: this.hideDups,
      }
    }));

    if (this.hasRespondents) {
      this.renderHearingToolsRegions();
    }
  },

  renderHearingToolsRegions() {
    const filePackageModel = this.model.get('filePackageModel');

    this.showChildView('serviceDisplayRegion', new Marionette.CollectionView({
      childViewOptions: (serviceModel) => {
        const participantId = serviceModel.get('participant_id');
        return {
          mode: 'service-view',
          matchingUnit: this.unitCollection.find(unit => unit.hasParticipantId(participantId)),
          isNoticeService: false
        };
      },
      childView: DisputeService,
      collection: filePackageModel.getServices()
    }));
    
    this.showChildView('serviceHearingToolsRegion', new HearingToolsServiceView({
      model: filePackageModel,
      childView: DisputeService,
      containerTitle: 'Evidence Service',
      unitCollection: this.unitCollection,
      resetServicesFn() { filesChannel.request('update:filepackage:service', this.model); },
      saveAllNotServedModalBottomText: `<p>This will mark all evidence files in this file package to not considered.</p>
        <p>Are you sure you want to change the service information for the affected respondent(s)?</p>`,
      saveAllNotServedButtonText: 'Mark All Not Served and Evidence Not Considered',
      saveAllAcknowledgedServedButtonText: 'Mark All Acknowledged Served',
      onSaveAllNotServedFn() {
        const allFilesInPackage = filesChannel.request('get:files').where({ file_package_id: this.model.id });
        loaderChannel.trigger('page:load');
        Promise.all(_.union([],
          // Set all files to "not considered", and all services to "served"
          allFilesInPackage.map(fileModel => fileModel.save({ file_considered: false })),
          this.model.getServices().map(serviceModel => serviceModel.saveAsUnserved())
        ))
          .then(() => filePackageModel.trigger('refresh:evidence:page'),
              generalErrorFactory.createHandler('ADMIN.SAVE.SERVICE', () => filePackageModel.trigger('refresh:evidence:page')))
          .finally(() => loaderChannel.trigger('page:load:complete'));
      }
    }));
  },

  templateContext() {
    const claims = this.model.get('claimsWithFilesInPackage');
    return {
      Formatter,
      hasRespondents: this.hasRespondents,
      hasUploadedFiles: claims.any(function(claimModel) {
        return claimModel.getUploadedFiles().length;
      })
    };
  }
});
