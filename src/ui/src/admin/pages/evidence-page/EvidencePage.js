import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import RadioModel from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import NoteModel from '../../components/note/Note_model';
import NoteView from '../../components/note/Note';
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import EvidenceNoteView from './EvidenceNote';
import DisputeFilePackagesView from './dispute-file-package/DisputeFilePackages';
import DisputeFilePackageCollection from './dispute-file-package/DisputeFilePackage_collection';
import EvidencePagePartyCollection from './EvidencePageParty_collection';
import EvidencePagePartyCollectionView from './EvidencePagePartyCollectionView';
import EvidencePageClaimsCollectionView from './EvidencePageClaimsCollectionView';
import ModalEvidencePreview from '../../components/dispute-claim/ModalEvidencePreview';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import AdminNotReferencedIcon from '../../static/Icon_Admin_Reference_DIS.png';
import AdminNotConsideredIcon from '../../static/Icon_Admin_Considered.png';
import QuickActionIcon from '../../static/Icon_Admin_QuickActionWHT.png';
import PartyNames from '../dispute-overview/PartyNames';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import EvidencePageOtherDocsView from './EvidencePageOtherDocsView';
import EvidencePageOtherDocs_model from './EvidencePageOtherDocs_model';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './EvidencePage_template.tpl';

const PACKAGE_TYPE_CODE = 1;
const ISSUE_TYPE_CODE = 2;
const PARTY_TYPE_CODE = 3;
const OTHER_DOCUMENTS_TYPE_CODE = 4;

const FILTER_CLASS_SHOW_NAMES = 'filter-show-names';

let UAT_TOGGLING = {};

const sessionChannel = Radio.channel('session');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const notesChannel = Radio.channel('notes');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const participantChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const claimsChannel = Radio.channel('claims');
const menuChannel = Radio.channel('menu');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const HEARING_TOOLS_CLASS = 'hearing-tools-enabled';
export default PageView.extend({
  template,
  className: `${PageView.prototype.className} evidence-page`,

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    addNote: '.evidence-page-note-icon-container',
    notesContainer: '.evidence-page-notes-container',
    evidenceContentContainer: '.evidence-page-files-container',
    filePackages: '.evidence-page-packages',
    evidenceViewer: '.evidence-page-file-preview',
    dupFilter: '.evidence-page-filter-dup',
    removedFilter: '.evidence-page-filter-removed',
    consideredFilter: '.evidence-page-filter-considered',
    referencedFilter: '.evidence-page-filter-referenced',
    notesFilter: '.evidence-page-filter-notes',
    hideLabel: '.evidence-page-filter-hide-radio-label',
    packageQuickActions: '.evidence-page-mark-all-evidence',
    markAllNotServed: '.mark-all-not-served',
    markAllAcknowledgedServed: '.mark-all-acknowledged-served'
  },

  regions: {
    disputeFlags: '.dispute-flags',
    partyNamesRegion: '.evidence-page-party-names',
    notesListRegion: '.evidence-page-notes',
    addNoteRegion: '.evidence-page-add-note',
    topFilterRegion: '.evidence-page-top-filters',
    consideredFilterRegion: '@ui.consideredFilter',
    referencedFilterRegion: '@ui.referencedFilter',
    notesFilterRegion: '@ui.notesFilter',
    removedFilterRegion: '@ui.removedFilter',
    dupFilterRegion: '@ui.dupFilter',
    thumbnailsFilterRegion: '.evidence-page-filter-thumbnails',
    namesFilterRegion: '.evidence-page-filter-names',
    showHearingToolsRegion: '.dispute-overview-claims-hearing-tools',
    filePackagesRegion: '@ui.filePackages',
    claimsRegion: '.evidence-page-claims',
    partiesRegion: '.evidence-page-parties',
    otherDocumentsRegion: '.evidence-page-other-docs',
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': function() { window.print(); },
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose',
    'click @ui.addNote': 'clickAddNote',
    'click @ui.markAllNotServed': 'clickMarkAllNotServed',
    'click @ui.markAllAcknowledgedServed': 'clickMarkAllAcknowledgedServed',
    'click @ui.evidenceViewer': 'clickEvidenceViewer'
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickRefresh() {
    this.model.triggerPageRefresh();
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), { trigger: true });
  },

  clickAddNote() {
    if (this.areNotesFiltered()) {
      // If Add Note button is clicked, always show notes
      this.notesFilterModel.set('checked', false);
      this.notesFilterModel.trigger('render');
    }

    const noteView = this.getChildView('addNoteRegion')
    if (noteView && noteView.isRendered()) {
      return;
    }

    const noteModel = new NoteModel({
      mode: 'edit',
      note_linked_to: configChannel.request('get', 'NOTE_LINK_EVIDENCE'),
      note: null
    });

    const removeNoteViewFn = _.bind(function() {
      const view = this.detachChildView('addNoteRegion');
      if (view) {
        view.destroy();
      }
    }, this);

    this.listenTo(noteModel, 'hide:edit', removeNoteViewFn);
    
    this.listenTo(noteModel, 'refresh:notes', function() {
      this.notes.add(noteModel);
      removeNoteViewFn();
      this.toggleFiltersUI('notesFilter');
    }, this);

    this.showChildView('addNoteRegion', new NoteView({ model: noteModel }));
  },

  markAllEvidenceAndSave(modalTitle, modalBody, serviceUpdateFn, deficientReason, fileSaveFn=null) {
    let inProgressCount = 0;
    modalChannel.request('show:standard', {
      title: modalTitle,
      bodyHtml: modalBody,
      onContinue: (_modalView) => {
        _modalView.close();
        
        // Set a minimum amount of time to show the progress modal for. Prevents the modal from flashing on quick changes
        let minWaitTimePassed = false;
        const minWaitTimeMs = 1500;
        setTimeout(() => {
          minWaitTimePassed = true;
        }, minWaitTimeMs);

        const allServiceModels = filesChannel.request('get:filepackages').reduce((memo, filePackage) => memo = [...memo, ...filePackage.getServices().models], []);
        const progressModalView = modalChannel.request('show:standard', {
          title: `Updating Service Records ${fileSaveFn ? 'and Files' : ''}`,
          bodyHtml: `<p>Service records ${fileSaveFn ? 'and files' : ''} are being updated.  When this process has completed this window will close automatically.</p>
          <div>
            <div>Progress...</div>
            <div class="file-upload-progress-container">
              <div class="file-progress-bar-container">
                <div class="file-progress-bar"></div>
              </div>
            </div>
          </div>`,
          modalCssClasses: 'modalStandardProgress',
          hideAllControls: true,
        });

        let funcs = [];
        // Add some utility functions for displaying info
        progressModalView.updateProgressBar = (index) => {
          const percent = parseInt((index / funcs.length) * 100, 10);
          progressModalView.$('.file-progress-bar').progressbar({ value: percent });
        };
        progressModalView.updateProgressBar(inProgressCount++);

        // Save all models
        funcs = allServiceModels.map(serviceModel => () => {
          // Udpate progress and run the save service function
          progressModalView.updateProgressBar(inProgressCount++);

          const fileDescription = serviceModel.getServiceFileDescription();
          if (fileDescription) fileDescription.markAsDeficient(deficientReason);
          serviceUpdateFn(serviceModel);
          return Promise.all([
            ...(fileDescription ? [fileDescription.save(fileDescription.getApiChangesOnly())] : []),
            serviceModel.save(serviceModel.getApiChangesOnly())
          ]);
        });

        if (fileSaveFn) {
          const allFilesInPackages = filesChannel.request('get:files').filter(f => f.get('file_package_id'));
          funcs.push(...allFilesInPackages.map(fileModel => {
            return () => {
              progressModalView.updateProgressBar(inProgressCount++);
              return fileSaveFn(fileModel);
            };
          }));
        }

        setTimeout(() => {
          // Add a small delay for modal to open
          UtilityMixin.util_serial(funcs)
          .then(() => {
            const closeModalAndRefreshFn = () => {
              try { progressModalView.close(); } catch {}
              Backbone.history.loadUrl(Backbone.history.fragment);
            };

            if (minWaitTimePassed) closeModalAndRefreshFn();
            else setTimeout(() => closeModalAndRefreshFn(), (minWaitTimeMs/3*2));
          }).catch(err => {
            try { progressModalView.close(); } catch {}
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.SAVE.SERVICE', () => Backbone.history.loadUrl(Backbone.history.fragment));
            handler(err);
          });
        }, 500);
      },
    });
  },

  clickMarkAllNotServed() {
    const serviceUpdateFn = (serviceModel) => serviceModel.setToUnserved({validation_status: configChannel.request('get', 'SERVICE_VALIDATION_INTERNAL_CONFIRMED')});
    const deficientReason = `Service record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} during "Mark All Evidence NOT Served" page action.`;
    const fileSaveFn = (fileModel) => Promise.all([ fileModel.save({ file_considered: false }) ]);

    this.model.checkEditInProgressPromise().then(
      () => {
        this.markAllEvidenceAndSave('Mark All Evidence NOT Served?',
          `<p>This action will reset all evidence service records and any information that was entered and will set all records to <b>not</b> served. All evidence files will be set to "not considered".  This action cannot be undone. If you are not sure you want to do this, click Cancel.</p>`,
          serviceUpdateFn,
          deficientReason,
          fileSaveFn
        );
      },
      () => {
        this.model.showEditInProgressModalPromise()
      });
  },

  clickMarkAllAcknowledgedServed() {    
    const serviceUpdateFn = (serviceModel) => serviceModel.setToAcknowledgedServed();
    const deficientReason = `Service record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} during "Mark All Acknowledged Served" page action.`;
    
    this.model.checkEditInProgressPromise().then(
      () => {
        this.markAllEvidenceAndSave('Mark All Evidence Acknowledged Served?',
          `<p>This action will reset all evidence service records and any information that was entered and will set all records to <b>acknowledged</b> served. This action cannot be undone. If you are not sure you want to do this, click Cancel.</p>`,
          serviceUpdateFn,
          deficientReason
        );
      },
      () => {
        this.model.showEditInProgressModalPromise()
      });
  },

  clickEvidenceViewer() {
    const showEvidenceViewerFn = () => {
      const regionToUse = this._getRegionNameToUse();
      const collectionToUse = this._getCollectionToUse();

      if (!regionToUse || !collectionToUse) {
        return;
      }

      const evidenceList = (collectionToUse && _.isFunction(collectionToUse.toEvidenceListData) ? collectionToUse : this.disputeFilePackages).toEvidenceListData();
      if ((_.isArray(evidenceList) && evidenceList.length) &&
          (_.isArray(evidenceList[0].data) && evidenceList[0].data.length) &&
          (_.isArray(evidenceList[0].data[0].files) && evidenceList[0].data[0].files.length)
      ) {
        const view = this.getChildView(regionToUse);
        if (view && _.isFunction(view.getOption('evidenceFilePreviewFn'))) {
          view.getOption('evidenceFilePreviewFn')(evidenceList[0].data[0].files[0], evidenceList[0].data[0].evidenceModel);
        }
      }
    };

    if (!this.model) {
      showEvidenceViewerFn();
      return;
    }

    this.model.checkEditInProgressPromise().then(
      () => {
        showEvidenceViewerFn();
      },
      () => {
        this.model.showEditInProgressModalPromise()
      });
  },

  hasViewableEvidenceFiles() {
    const regionToUse = this._getRegionNameToUse();
    const collectionToUse = this._getCollectionToUse();

    if (!regionToUse || !collectionToUse) {
      return;
    }
    const evidenceList = (collectionToUse && _.isFunction(collectionToUse.toEvidenceListData) ? collectionToUse : this.disputeFilePackages).toEvidenceListData();
    return ((_.isArray(evidenceList) && evidenceList.length) &&
        (_.isArray(evidenceList[0].data) && evidenceList[0].data.length) &&
        (_.isArray(evidenceList[0].data[0].files) && evidenceList[0].data[0].files.length)
    );
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    
    // Enable file viewer by default if there are any user files to display
    this.enableEvidenceFileViewer = true;

    this.unitCollection = participantsChannel.request('get:dispute:units');
    
    this.createSubModels();
    this.setupListeners();
    this.loadPageData();

    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
  },

  createSubModels() {
    const cachedRadioFilter = this.model.get('sessionSettings')?.evidencePage?.filter_viewType;
    const defaultValue = this.model.isMigrated() ? ISSUE_TYPE_CODE : PARTY_TYPE_CODE;
  
    this.viewTypeModel = new RadioModel({
      optionData: [
        ...(this.model.isMigrated() ? [] : [{ value: PACKAGE_TYPE_CODE, text: 'Packages/Service' }]),
        { value: ISSUE_TYPE_CODE, text: 'Issue' },
        { value: PARTY_TYPE_CODE, text: 'Participant' },
        { value: OTHER_DOCUMENTS_TYPE_CODE, text: 'Submitted Documents' }
      ],
      value: cachedRadioFilter || defaultValue
    });

    this.consideredFilterModel = new CheckboxModel({
      html: `<img src="${AdminNotConsideredIcon}" /> Not considered`,
      checked: this.model.get('sessionSettings')?.evidencePage?.hideNotConsidered || false
    });

    this.referencedFilterModel = new CheckboxModel({
      html: `<img src="${AdminNotReferencedIcon}" /> Not referenced`,
      checked: this.model.get('sessionSettings')?.evidencePage?.hideNotReferenced || false
    });

    this.notesFilterModel = new CheckboxModel({
      html: 'Notes',
      checked: this.model.get('sessionSettings')?.evidencePage?.hideNotes || false
    });

    this.removedFilterModel = new CheckboxModel({
      html: '<span class="evidence-page-filter-removed-text">Removed</span>',
      checked: this.model.get('sessionSettings')?.evidencePage?.hideRemoved || false
    });

    this.dupFilterModel = new CheckboxModel({
      html: '<span class="evidence-page-filter-dup-text">Duplicate</span>',
      checked: this.model.get('sessionSettings')?.evidencePage?.hideDups || false
    });

    this.thumbnailsFilterModel = new CheckboxModel({
      html: 'Thumbnails',
      checked: this.model.get('sessionSettings')?.thumbnailsEnabled || false
    });

    this.namesFilterModel = new CheckboxModel({
      html: 'Submitter / original file name',
      checked: this.model.get('sessionSettings')?.evidencePage?.showSubmitterName || false
    });

    this.hearingToolsModel = new CheckboxModel({
      html: 'Show hearing tools',
      disabled: false,
      checked: this.model.get('sessionSettings')?.hearingToolsEnabled || false
    });

    this._createClaimEvidenceModels();
  },

  _createClaimEvidenceModels() {
    this.notes = notesChannel.request('get:evidence');
    
    // Keep amended evidence around for now, but always remove deleted evidence
    this.disputeClaims = claimsChannel.request('get:full:with:supporting').removeAllRemovedClaimsAndEvidence(true);

    if (!this.isRemovedFilterSelected()) {
      this.disputeClaims.add( claimsChannel.request('get:removed:full').filter(m => m.isAmendRemoved()), { silent: true });
    } else {
      // Remove amended evidence
      this.disputeClaims.removeAllRemovedClaimsAndEvidence();
    }

    const isNotConsideredFilterSelected = this.isNotConsideredFilterSelected();
    const isReferencedFilterSelected = this.isReferencedFilterSelected();
    
    const claimsToFilter = [];
    if (isReferencedFilterSelected || isNotConsideredFilterSelected) {
      this.disputeClaims.each(function(claim) {
        const disputeEvidences = claim.get('dispute_evidences').clone();
        const disputeEvidencesToRemove = [];
        disputeEvidences.each(function(disputeEvidence) {
          const files = disputeEvidence.get('files').clone();
          const filesToBeRemoved = files.filter(file => (isNotConsideredFilterSelected && !file.isConsidered()) || (isReferencedFilterSelected && !file.isReferenced()));
          
          files.remove(filesToBeRemoved);
          disputeEvidence.set('files', files, { silent: true });

          if (filesToBeRemoved.length && files.length === 0) {
            disputeEvidencesToRemove.push(disputeEvidence);
          }
        });

        disputeEvidences.remove(disputeEvidencesToRemove);
        claim.set('dispute_evidences', disputeEvidences, { silent: true });
      });

      // Filter any removed claims or claims with empty evidence
      this.disputeClaims.remove(claimsToFilter);
    }

    // Filter again for removed evidence
    let allFileModels = this.disputeClaims.reduce((memo, claim) => _.union(memo || [], claim.getUploadedFiles()), null);
    const fileDupTranslations = filesChannel.request('get:duplicate:translations', allFileModels);
    if (this.isDupFilterSelected()) {
      this.disputeClaims.each(function(claim) {
        const disputeEvidences = claim.get('dispute_evidences').clone();
        const disputeEvidencesToRemove = [];
        disputeEvidences.each(function(disputeEvidence) {
          const files = disputeEvidence.get('files').clone();
          const filesToBeRemoved = files.filter(file => {
            const dupData = fileDupTranslations[file.id];
            return dupData && !dupData.isFirst;
          });

          files.remove(filesToBeRemoved);
          disputeEvidence.set('files', files, { silent: true });

          if (filesToBeRemoved.length && files.length === 0) {
            disputeEvidencesToRemove.push(disputeEvidence);
          }
        });

        disputeEvidences.remove(disputeEvidencesToRemove);
        claim.set('dispute_evidences', disputeEvidences, { silent: true });
      });

      // Filter any removed claims or claims with empty evidence
      this.disputeClaims.remove(claimsToFilter);
    }
    allFileModels = this.disputeClaims.reduce((memo, claim) => _.union(memo || [], claim.getUploadedFiles()), null);
    this.fileDupTranslations = filesChannel.request('get:duplicate:translations', allFileModels);

    
    const evidenceFilePackages = filesChannel.request('get:filepackages').filter(filePackage => (
      filePackage.isIntake() || filePackage.isDisputeAccess() || filePackage.isOffice() || filePackage.isLegacySP()
    ));
    
    this.disputeFilePackages = new DisputeFilePackageCollection(_.map(evidenceFilePackages, function(filePackage) {
      return {
        filePackageModel: filePackage,
        unitCollection: this.unitCollection,
        _fullDisputeClaims: this.disputeClaims.clone()
      };
    }, this));

    this.disputeParties = new EvidencePagePartyCollection(_.map(participantChannel.request('get:all:participants'), function(disputeParty) {
      return {
        participantModel: disputeParty,
        matchingUnit: this.unitCollection && !disputeParty.isNew() ? this.unitCollection.find(unit => unit.hasParticipantId(disputeParty.id)) : null,
        _fullDisputeClaims: this.disputeClaims.clone()
      };
    }, this));

    this.otherDocsModel = new EvidencePageOtherDocs_model();
  },

  clearListeners() {
    this.stopListening(this.hearingToolsModel, 'change:checked');
    this._clearClaimEvidenceListeners();
  },

  _clearClaimEvidenceListeners() {
    this.stopListening(this.notes);
    this.stopListening(this.disputeFilePackages);
    this.stopListening(this.disputeClaims);
  },

  setupListeners() {
    this.listenTo(this.viewTypeModel, 'change:value', () => {
      // Always clear the edit when the view changes because it clears edit modes
      this.model.stopEditInProgress();
      loaderChannel.trigger('page:load');
      setTimeout(() => this.render(), 150);
    }, this);

    // Save the checkbox show/hide selection to the dispute so it stays if page navigations occur
    const createHideFilterHandlerFn = (disputeAttr) => {
      return (checkboxModel, value) => {
        this.model.checkEditInProgressPromise().then(
          () => {
            this.model.set({ sessionSettings: {
              ...this.model.get('sessionSettings'),
              thumbnailsEnabled: this.thumbnailsFilterModel.getData(),
                evidencePage: {
                  ...this.model.get('sessionSettings')?.evidencePage,
                  [disputeAttr]: !!value
                }
              }
            });
            loaderChannel.trigger('page:load');
            this.render();
          },
          // Cancel the selection
          () => {
            checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
            checkboxModel.trigger('render');
            this.model.showEditInProgressModalPromise()
          }
        );
      };
    };
    this.listenTo(this.thumbnailsFilterModel, 'change:checked', createHideFilterHandlerFn('thumbnailsEnabled'));
    this.listenTo(this.removedFilterModel, 'change:checked', createHideFilterHandlerFn('hideRemoved'));
    this.listenTo(this.dupFilterModel, 'change:checked', createHideFilterHandlerFn('hideDups')); 
    this.listenTo(this.consideredFilterModel, 'change:checked', createHideFilterHandlerFn('hideNotConsidered'));
    this.listenTo(this.referencedFilterModel, 'change:checked', createHideFilterHandlerFn('hideNotReferenced'));

    this.listenTo(this.notesFilterModel, 'change:checked', function(model, value) {
      this.model.set({
        sessionSettings: { 
          ...this.model.get('sessionSettings'), 
          evidencePage: {
            ...this.model.get('sessionSettings')?.evidencePage,
            hideNotes: value
          }
        }
      });

      const ele = this.getUI('notesContainer');
      if (value) {
        ele.addClass('hidden');
      } else {
        ele.removeClass('hidden');
      }
    }, this);

    this.listenTo(this.namesFilterModel, 'change:checked', function(model, value) {
      this.model.set({
        sessionSettings: { 
          ...this.model.get('sessionSettings'), 
          evidencePage: {
            ...this.model.get('sessionSettings')?.evidencePage,
            showSubmitterName: value
          }
        }
      });
      const ele = this.getUI('evidenceContentContainer');
      if (value) {
        ele.addClass(FILTER_CLASS_SHOW_NAMES);
      } else {
        ele.removeClass(FILTER_CLASS_SHOW_NAMES);
      }
    }, this);

    this.listenTo(this.hearingToolsModel, 'change:checked', (checkboxModel, value) => {
      this.model.checkEditInProgressPromise().then(
        () => {
          if (value) {
            TrialLogic_BIGEvidence.checkAndShowArbWarning(this.model);
            
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: true } });
            this.showHearingTools();
            this.getUI('packageQuickActions').removeClass('hidden');
          } else {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: false } });
            this.hideHearingTools();
            this.getUI('packageQuickActions').addClass('hidden');
          }
          // Always update party name, for uppercase update
          if (this.isRendered()) this.showChildView('partyNamesRegion', new PartyNames({ maxLength: value ? 50 : null }));
        },
        // Cancel the selection
        () => {
          checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
          checkboxModel.trigger('render');
          this.model.showEditInProgressModalPromise()
        }
      );
    });

    this._setupClaimEvidenceListeners();
  },

  _setupClaimEvidenceListeners() {
    this.stopListening(this.disputeFilePackages, 'refresh:evidence:page');
    this.listenTo(this.disputeFilePackages, 'refresh:evidence:page', this.render, this);


    const collectionToUse = this._getCollectionToUse();
    this.stopListening(collectionToUse, 'change:file_considered');
    this.stopListening(collectionToUse, 'change:file_referenced');
    
    this.listenTo(collectionToUse, 'change:file_considered', () => this.toggleFiltersUI('consideredFilter'));
    this.listenTo(collectionToUse, 'change:file_referenced', () => this.toggleFiltersUI('referencedFilter'));
  },


  loadPageData() {
    this.model.stopEditInProgress();
    
    this.packagesLoaded = true;

    const disputeGuid = disputeChannel.request('get:id');
    notesChannel.request('load', disputeGuid)
      .done(() => this.render())
      .fail(generalErrorFactory.createHandler('ADMIN.NOTES.LOAD', () => this.render()));
  },

  isPackageViewSelected() {
    return this.viewTypeModel.getData() === PACKAGE_TYPE_CODE;
  },

  isIssueViewSelected() {
    return this.viewTypeModel.getData() === ISSUE_TYPE_CODE;
  },

  isPartiesViewSelected() {
    return this.viewTypeModel.getData() === PARTY_TYPE_CODE;
  },

  isOtherDocsViewSelected() {
    return this.viewTypeModel.getData() === OTHER_DOCUMENTS_TYPE_CODE;
  },

  isRemovedFilterSelected() {
    return this.removedFilterModel.getData();
  },

  isDupFilterSelected() {
    return this.dupFilterModel.getData();
  },

  isReferencedFilterSelected() {
    return this.referencedFilterModel.getData();
  },

  isNotConsideredFilterSelected() {
    return this.consideredFilterModel.getData();
  },

  areNotesFiltered() {
    return this.notesFilterModel.getData();
  },

  isShowThumbailsSelected() {
    return this.thumbnailsFilterModel.getData();
  },

  _getFilterClasses() {
    return this.namesFilterModel.getData() ? FILTER_CLASS_SHOW_NAMES : '';
  },

  showHearingTools() {
    this.getUI('filePackages').addClass(HEARING_TOOLS_CLASS);
  },

  hideHearingTools() {
    const filePackageListView = this.getChildView('filePackagesRegion');
    if (filePackageListView && filePackageListView.isRendered()) {
      loaderChannel.trigger('page:load');
      setTimeout(() => {
        filePackageListView.renderHearingToolsRegions();
        this.getUI('filePackages').removeClass(HEARING_TOOLS_CLASS);
        loaderChannel.trigger('page:load:complete');
      }, 150);
    } else {
      this.getUI('filePackages').removeClass(HEARING_TOOLS_CLASS);
    }
  },

  onBeforeRender() {
    this.model.set({
      sessionSettings: { 
        ...this.model.get('sessionSettings'), 
        evidencePage: {
          ...this.model.get('sessionSettings')?.evidencePage,
          filter_viewType: this.viewTypeModel.getData()
        }
      }
    });

    // Always prime the correct models for each render
    this._clearClaimEvidenceListeners();
    this._createClaimEvidenceModels();
    this._setupClaimEvidenceListeners();
  },

  onRender() {
    if (!this.packagesLoaded) {
      return;
    }

    const dispute = disputeChannel.request('get');

    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${dispute.get('file_number')}: Evidence Page`,
    }));

    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('partyNamesRegion', new PartyNames());
    this.showChildView('notesListRegion', new Marionette.CollectionView({
      childView: EvidenceNoteView,
      collection: this.notes
    }));

    this.showChildView('showHearingToolsRegion', new CheckboxView({ model: this.hearingToolsModel }));

    this.showChildView('topFilterRegion', new RadioView({ model: this.viewTypeModel }));

    this.showChildView('consideredFilterRegion', new CheckboxView({ model: this.consideredFilterModel }));
    this.showChildView('referencedFilterRegion', new CheckboxView({ model: this.referencedFilterModel }));
    this.showChildView('notesFilterRegion', new CheckboxView({ model: this.notesFilterModel }));
    this.showChildView('removedFilterRegion', new CheckboxView({ model: this.removedFilterModel }));
    this.showChildView('dupFilterRegion', new CheckboxView({ model: this.dupFilterModel }));
    this.showChildView('thumbnailsFilterRegion', new CheckboxView({ model: this.thumbnailsFilterModel }));
    this.showChildView('namesFilterRegion', new CheckboxView({ model: this.namesFilterModel }));

    if (this.model.get('sessionSettings')?.hearingToolsEnabled) {
      this.showHearingTools();
    }

    this.renderEvidenceContentView();
  },

  renderEvidenceContentView() {
    const showThumbnails = this.isShowThumbailsSelected();

    if (this.isPackageViewSelected()) {
      this.showChildView('filePackagesRegion', new DisputeFilePackagesView({
        evidenceFilePreviewFn: (fileModel, disputeEvidenceModel, modalOptions={}) => {
          this.openEvidencePreviewModal(Object.assign({
            fileModel,
            model: disputeEvidenceModel,
            navListData: this.disputeFilePackages.toEvidenceListData(),
            claimCollection: this.disputeClaims,
            fileDupTranslations: this.fileDupTranslations,
          }, modalOptions));
        },
        showThumbnails,
        showRemoved: true,
        collection: this.disputeFilePackages,
        unitCollection: this.unitCollection,
        fileDupTranslations: this.fileDupTranslations
      }));
    }

    if (this.isIssueViewSelected()) {
      this.showChildView('claimsRegion', new EvidencePageClaimsCollectionView({
        evidenceFilePreviewFn: (fileModel, disputeEvidenceModel, modalOptions={}) => {
          this.openEvidencePreviewModal(Object.assign({
            fileModel,
            model: disputeEvidenceModel,
            navListData: this.disputeClaims.toEvidenceListData(),
            claimCollection: this.disputeClaims,
            fileDupTranslations: this.fileDupTranslations,
          }, modalOptions));
        },
        showThumbnails,
        showRemoved: true,
        collection: this.disputeClaims,
        unitCollection: this.unitCollection,
        fileDupTranslations: this.fileDupTranslations
      }));
    }

    if (this.isPartiesViewSelected()) {
      this.showChildView('partiesRegion', new EvidencePagePartyCollectionView({
        evidenceFilePreviewFn: (fileModel, disputeEvidenceModel, modalOptions={}) => {
          this.openEvidencePreviewModal(Object.assign({
            fileModel,
            model: disputeEvidenceModel,
            navListData: this.disputeParties.toEvidenceListData(),
            claimCollection: this.disputeClaims,
            fileDupTranslations: this.fileDupTranslations,
          }, modalOptions));
        },
        showThumbnails,
        showRemoved: true,
        collection: this.disputeParties,
        unitCollection: this.unitCollection,
        fileDupTranslations: this.fileDupTranslations
      }));
    }

    if (this.isOtherDocsViewSelected()) {
      this.showChildView('otherDocumentsRegion', new EvidencePageOtherDocsView({
        evidenceFilePreviewFn: (fileModel, disputeEvidenceModel, modalOptions={}) => {
          const defaultOtherDocModalOptions = { openToNotes: false, disableNotes: true };
          this.openEvidencePreviewModal(Object.assign({
            fileModel,
            model: disputeEvidenceModel,
            navListData: this.otherDocsModel.toEvidenceListData(),
            fileDupTranslations: this.fileDupTranslations,
            hideArbControls: true,
            getClaimTitleFn: (disputeEvidence) => this.otherDocsModel.getTitle(disputeEvidence),
          }, Object.assign({}, modalOptions, defaultOtherDocModalOptions)));
        },
        showThumbnails,
        showRemoved: true,
        unitCollection: this.unitCollection,
        fileDupTranslations: this.fileDupTranslations,
        model: this.otherDocsModel,
      }));
    }

    // Perform this check in render so the evidence list data can be updated based on the filter displays
    this.toggleFiltersUI();
    loaderChannel.trigger('page:load:complete');
  },

  openEvidencePreviewModal(modalViewOptions={}) {
    const modalPreview = new ModalEvidencePreview(modalViewOptions);
    modalChannel.request('add', modalPreview, { duration: 0, duration2: 25 });
    this.listenTo(modalPreview, 'removed:modal', this.clickRefresh, this);
  },

  toggleFiltersUI(filterToCheck=null) {
    const toggleEleFn = (uiName, boolean) => this.getUI(uiName)[boolean ? 'removeClass' : 'addClass']('hidden');

    if (!filterToCheck || filterToCheck === 'dupFilter') {
      toggleEleFn('dupFilter', this.doesActiveFilterHaveDupEvidence() || this.dupFilterModel.getData());
    }

    if (!filterToCheck || filterToCheck === 'removedFilter') {
      toggleEleFn('removedFilter', this.doesActiveFilterHaveRemovedEvidence() || this.removedFilterModel.getData());
    }
    if (!filterToCheck || filterToCheck === 'consideredFilter') {
      toggleEleFn('consideredFilter', this.doesActiveFilterHaveNotConsideredFiles() || this.consideredFilterModel.getData());
    }
    if (!filterToCheck || filterToCheck === 'referencedFilter') {
      toggleEleFn('referencedFilter', this.doesActiveFilterHaveNotReferencedFiles() || this.referencedFilterModel.getData());
    }
    if (!filterToCheck || filterToCheck === 'notesFilter') {
      toggleEleFn('notesFilter', this.notes.length || this.notesFilterModel.getData());
    }

    toggleEleFn('hideLabel', !_.all(['dupFilter', 'removedFilter', 'consideredFilter', 'referencedFilter', 'notesFilter'], uiName => this.getUI(uiName).hasClass('hidden')));
  },

  _getCollectionToUse() {
    let collectionToUse;
    if (this.isPackageViewSelected()) collectionToUse = this.disputeFilePackages;
    else if (this.isIssueViewSelected()) collectionToUse = this.disputeClaims;
    else if (this.isPartiesViewSelected()) collectionToUse = this.disputeParties;
    else if (this.isOtherDocsViewSelected()) collectionToUse = this.otherDocsModel;
    return collectionToUse;
  },

  _getRegionNameToUse() {
    let regionNameToUse;
    if (this.isPackageViewSelected()) regionNameToUse = 'filePackagesRegion';
    else if (this.isIssueViewSelected()) regionNameToUse = 'claimsRegion';
    else if (this.isPartiesViewSelected()) regionNameToUse = 'partiesRegion';
    else if (this.isOtherDocsViewSelected()) regionNameToUse = 'otherDocumentsRegion';
    return regionNameToUse;
  },

  getActiveEvidenceListView() {
    const regionNameToUse = this._getRegionNameToUse();
    return regionNameToUse ? this.getChildView(regionNameToUse) : null;
  },

  doesActiveFilterHaveDupEvidence() {
    const collectionToUse = this._getCollectionToUse();
    let visibleFiles = [];
    try {
      (collectionToUse.toEvidenceListData() || []).forEach(obj => {
        obj.data.forEach(data => {
          if (data.files) visibleFiles = [...visibleFiles, ...(data.files || [])];
        });
      });
    } catch (err) {
    }

    return !_.isEmpty( filesChannel.request('get:duplicate:translations',  visibleFiles) );
  },

  doesActiveFilterHaveRemovedEvidence() {
    const collectionToUse = this._getCollectionToUse();
    let hasRemoved = false;
    try {
      (collectionToUse.toEvidenceListData() || []).forEach(data => {
        if (data.isRemoved) hasRemoved = true;
        if (hasRemoved) return;
        hasRemoved = hasRemoved || _.any(data.data || [], obj => obj.isRemoved);
      });
    } catch (err) {
    }
    return hasRemoved;
  },

  doesActiveFilterHaveNotConsideredFiles() {
    if (this.isOtherDocsViewSelected()) return false;
    const collectionToUse = this._getCollectionToUse();
    let hasNotConsideredFiles = false;
    try {
      (collectionToUse.toEvidenceListData() || []).forEach(data => {
        if (hasNotConsideredFiles) return;
        hasNotConsideredFiles = hasNotConsideredFiles || _.any(data.data || [], obj => {
          return obj.files && _.any(obj.files, fileModel => !fileModel.isConsidered());
        });
      });
    } catch (err) {
    }
    return hasNotConsideredFiles;
  },

  doesActiveFilterHaveNotReferencedFiles() {
    if (this.isOtherDocsViewSelected()) return false;
    const collectionToUse = this._getCollectionToUse();
    let hasNotReferencedFiles = false;
    try {
      (collectionToUse.toEvidenceListData() || []).forEach(data => {
        if (hasNotReferencedFiles) return;
        hasNotReferencedFiles = hasNotReferencedFiles || _.any(data.data || [], obj => {
          return obj.files && _.any(obj.files, fileModel => !fileModel.isReferenced());
        });
      });
    } catch (err) {
    }
    return hasNotReferencedFiles;
  },

  getPrintPageHideText() {
    const textPrintArray = [
      ...this.consideredFilterModel?.getData() ? ['Not Considered'] : [],
      ...this.referencedFilterModel?.getData() ? ['Not Referenced'] : [],
      ...this.dupFilterModel?.getData() ? ['Show Duplicates'] : [],
    ];

    return textPrintArray.length ? `<b>Hide:</b> <span>${textPrintArray.join(", ")}</span>` : '';
  },

  getPrintPageShowText() {
    const textPrintArray = [
      ...this.thumbnailsFilterModel?.getData() ? ['Thumbnails'] : [],
      ...this.namesFilterModel?.getData() ? ['Submitter/original file name'] : []
    ];

    return textPrintArray.length ? `<b>Show:</b> <span>${textPrintArray.join(", ")}</span>` : ''; 
  },

  templateContext() {
    const primaryApplicant = participantChannel.request('get:primaryApplicant');
    const latestHearing = hearingChannel.request('get:latest');
    const RTB_OFFICE_TIMEZONE_STRING = configChannel.request('get', 'RTB_OFFICE_TIMEZONE_STRING');
    return {
      isLoaded: this.packagesLoaded,
      Formatter,
      enableEvidenceFileViewer: this.enableEvidenceFileViewer,
      hasViewableEvidenceFiles: this.hasViewableEvidenceFiles(),
      lastRefreshTime: Moment(),
      enableFileViewer: this.enableFileViewer,
      enableQuickAccess: isQuickAccessEnabled(this.model),
      showHearingTools: UAT_TOGGLING.SHOW_ARB_TOOLS,
      applicantDeadline: latestHearing ? (Formatter.toDateDisplay(latestHearing.getApplicantEvidenceDeadline(), RTB_OFFICE_TIMEZONE_STRING) || '-') : '<i>No hearing</i>',
      respondentDeadline: latestHearing ? (Formatter.toDateDisplay(latestHearing.getRespondentEvidenceDeadline(), RTB_OFFICE_TIMEZONE_STRING) || '-') : '<i>No hearing</i>',
      primaryApplicantDisplay: primaryApplicant ? `${primaryApplicant.getContactName()} (${primaryApplicant.isTenant() ? 'Tenant' : 'Landlord'})` : null,
      showPackageView: this.isPackageViewSelected(),
      showIssueView: this.isIssueViewSelected(),
      showPartiesView: this.isPartiesViewSelected(),
      showOtherDocsView: this.isOtherDocsViewSelected(),
      hideNotes: this.areNotesFiltered(),
      filterClasses: this._getFilterClasses(),
      QuickActionIcon: QuickActionIcon,
      printPageFilterText: this.viewTypeModel?.getSelectedText(),
      printPageHideText: this.getPrintPageHideText(),
      printPageShowText: this.getPrintPageShowText(),
      hearingToolsEnabled: this.model.get('sessionSettings').hearingToolsEnabled
    };
  }

});