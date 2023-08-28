
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeEvidence_collection from '../../../core/components/claim/DisputeEvidence_collection';
import UtilityMixin from '../../../core/utilities/UtilityMixin';
import DecGenData from './DecGenData';

const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const sessionChannel = Radio.channel('session');
const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const noticeChannel = Radio.channel('notice');
const claimsChannel = Radio.channel('claims');
const notesChannel = Radio.channel('notes');
const documentsChannel = Radio.channel('documents');
const modalChannel = Radio.channel('modals');

const SIGNATURE_SCALED_DOWN_IMG_WIDTH = 200;

const DataLoader = Marionette.Object.extend({
  /**
   * @param {String} disputeGuid - The main dispute guid to load data for
   * @param {Object} dataToLoad - Data tags to be loaded
   * @param {Object} loadedData - Add data that is already loaded
   */
  initialize(options) {
    this.mergeOptions(options, ['disputeGuid', 'dataToLoad', 'loadedData']);
    this.dataToLoad = Object.assign({}, this.dataToLoad);
    this.loadedData = Object.assign({}, this.loadedData);
    this.loadErrors = [];
  },

  addDataToLoad(dataToLoad={}) {
    // Merge any data values one level deep
    Object.keys(dataToLoad).forEach(key => {
      if (typeof this.dataToLoad?.[key] === "object") {
        Object.assign(dataToLoad[key], this.dataToLoad[key]);
      }
    });

    Object.assign(this.dataToLoad, dataToLoad);
  },

  clearDataToLoad(dataAttr) {
    if (dataAttr) delete this.dataToLoad[dataAttr];
  },

  async loadData(dataTag, loadFn) {
    if (this.dataToLoad[dataTag]) {
      try {
        this.loadedData[dataTag] = await loadFn();
      } catch (err) {
        this.loadErrors.push({ name: dataTag, err });
      }
    }
  },
});


const DecGenDisputeLoader = DataLoader.extend({
  async load() {
    // Checks for all possible data loads and loads based on keys in dataToLoad
    await this.loadData(DecGenData.dispute, this.loadDispute.bind(this));
    await this.loadData(DecGenData.allParticipants, this.loadParticipants.bind(this));
    await this.loadData(DecGenData.files, this.loadFiles.bind(this));
    await this.loadData(DecGenData.linkFiles, this.loadLinkFiles.bind(this));
    await this.loadData(DecGenData.fileDescriptions, this.loadFileDescriptions.bind(this));
    await this.loadData(DecGenData.filePackages, this.loadFilePackages.bind(this));
    await this.loadData(DecGenData.allIssues, this.loadIssues.bind(this));
    await this.loadData(DecGenData.hearings, this.loadHearings.bind(this));
    await this.loadData(DecGenData.notices, this.loadNotices.bind(this));
    await this.loadData(DecGenData.notes, this.loadNotes.bind(this));
  
    return this.loadedData;
  },

  async loadDispute() {
    if (this.loadedData[DecGenData.dispute]) return this.loadedData[DecGenData.dispute];

    return new Promise((res, rej) => {
      return disputeChannel.request('load', this.disputeGuid, { no_cache: true }).then(res, rej)
    });
  },

  async loadHearings() {
    if (this.loadedData[DecGenData.hearings]) return this.loadedData[DecGenData.hearings];
    
    return new Promise((res, rej) => {
      return hearingChannel.request('load', this.disputeGuid, { no_cache: true })
        .then(() => res(hearingChannel.request('get')), rej);
    });
  },

  async loadNotices() {
    if (this.loadedData[DecGenData.notices]) return this.loadedData[DecGenData.notices];
    return new Promise((res, rej) => {
      return noticeChannel.request('load', this.disputeGuid, { no_cache: true })
        .then(res, rej);
    });
  },

  async loadParticipants() {
    if (this.loadedData[DecGenData.allParticipants]) return this.loadedData[DecGenData.allParticipants];
    return new Promise((res, rej) => {
      participantsChannel.request('load', this.disputeGuid, { no_cache: true })
        .then(([a, applicants, respondents, removed]) => {
          // Add all items together into the first collection and return it
          applicants.add(respondents.models, { merge: true });
          applicants.add(removed.models, { merge: true });
          res(applicants);
        }, rej);
    });
  },

  async loadIssues() {
    if (this.loadedData[DecGenData.allIssues]) return this.loadedData[DecGenData.allIssues];

    // NOTE: Issues must be loaded AFTER files, link files and file descriptions in order to associate files/evidence
    const linkFiles = this.loadedData[DecGenData.linkFiles];
    const fileDescriptions = this.loadedData[DecGenData.fileDescriptions];
    const dataContext = { linkFiles, fileDescriptions };
    return new Promise((res, rej) => {
      return claimsChannel.request('load', this.disputeGuid, { no_cache: true }).done(([disputeClaims, removed]) => {
        // Add all items together into the first collection and return it
        disputeClaims.add(removed.models, { merge: true });
        
        // TODO: Parse evidence
        disputeClaims.each(claim => {
          const dispute_evidence_collection = new DisputeEvidence_collection();
          dispute_evidence_collection.syncModelDataWithDisputeClaim(claim, dataContext);
          dispute_evidence_collection.each(function(dispute_evidence) {
            const associated_files = filesChannel.request('get:filedescription:files', dispute_evidence.get('file_description'), dataContext);
            dispute_evidence.set('files', associated_files);
          });
          claim.set('dispute_evidences', dispute_evidence_collection);
        });
        res(disputeClaims);
      }).fail(rej);
    });
  },

  async loadFiles() {
    if (this.loadedData[DecGenData.files]) return this.loadedData[DecGenData.files];
    const files = await filesChannel.request('load:files', this.disputeGuid, { no_cache: true });
    return files;
  },

  async loadFileDescriptions() {
    if (this.loadedData[DecGenData.fileDescriptions]) return this.loadedData[DecGenData.fileDescriptions];
    const fileDescriptions = await filesChannel.request('load:filedescriptions', this.disputeGuid, { no_cache: true });
    return fileDescriptions;
  },

  async loadLinkFiles() {
    if (this.loadedData[DecGenData.linkFiles]) return this.loadedData[DecGenData.linkFiles];
    const linkFiles = await filesChannel.request('load:linkfiles', this.disputeGuid, { no_cache: true });
    return linkFiles;
  },

  async loadFilePackages() {
    if (this.loadedData[DecGenData.filePackages]) return this.loadedData[DecGenData.filePackages];
    return new Promise((res, rej) => {
      return filesChannel.request('load:filepackages', this.disputeGuid, { no_cache: true }).then(res, rej);
    });
  },

  async loadNotes() {
    if (this.loadedData[DecGenData.notes]) return this.loadedData[DecGenData.notes];
    return new Promise((res, rej) => {
      return notesChannel.request('load', this.disputeGuid, { no_cache: true }).then(res, rej);
    });
  },

  async loadOutcomeDocumentSets() {
    if (this.loadedData[DecGenData.documentSets]) return this.loadedData[DecGenData.documentSets];
    return new Promise((res, rej) => (
      documentsChannel.request('load', this.disputeGuid, { no_cache: true }).then(res, rej)
    ));
  },
  
});


export default DataLoader.extend({
  async load() {
    await this.loadData(DecGenData.signature, this.loadSignature.bind(this));
    
    const primaryDisputeLoader = new DecGenDisputeLoader({ disputeGuid: this.disputeGuid, dataToLoad: this.dataToLoad, loadedData: this.loadedData });
    const loadedDisputeData = await primaryDisputeLoader.load();
    
    // Add all primary file loaded data into the return so it can be looked up
    Object.assign(this.loadedData, loadedDisputeData);

    await this.loadData(DecGenData.linkedDisputes, this.loadLinkedDisputes.bind(this));

    const allErrors = [...this.loadErrors, ...primaryDisputeLoader.loadErrors];
    return new Promise((resolve, reject) => {
      if (allErrors?.length) {
        modalChannel.request('hide:all');
        let continueToDecision = false;
        const modalView = modalChannel.request('show:standard', {
          title: 'Data Loading Error',
          bodyHtml: `<p>The system encountered one or more errors loading the following data tags:</p>
          <ul>${allErrors.map(error => `<li>${error.name}</li>` ).join('')}</ul>
          <p>
            This usually indicates a problem in the application or data, and the decision may have errors.
            If you would like to preview the decision anyways, click the "Continue to Decision" button below.
          </p>
          `,
          primaryButtonText: 'Continue to Decision',
          cancelButtonText: 'Close',
          onContinue: (modalView) => {
            modalChannel.request('show:hidden');
            continueToDecision = true;
            modalView.close();
          }
        });
        
        this.listenTo(modalView, 'removed:modal', () => {
          if (continueToDecision) {
            resolve(this.loadedData);
          } else {
            reject({ loadErrors: allErrors });
          }
        });
      } else {
        resolve(this.loadedData);
      }
    });
  },

  async loadSignature() {
    if (this.loadedData[DecGenData.signature]) return this.loadedData[DecGenData.signature];

    const getImageDimensions = (signature) => {
      return new Promise (resolve => {
        var i = new Image();
        i.onload = () => {
          const ratio = i.width / SIGNATURE_SCALED_DOWN_IMG_WIDTH;
          const newHeight = i.height / ratio;
          resolve({ width: SIGNATURE_SCALED_DOWN_IMG_WIDTH, height: Math.round(newHeight) });
        };
        i.src = signature;
      })
    }

    const loggedInUser = sessionChannel.request('get:user');
    const signatureFile = filesChannel.request('get:commonfile', loggedInUser.getProfile().get('signature_file_id'));
    let signatureData = null;
    if (signatureFile) {
      const signatureBase64 = await UtilityMixin.util_loadDataURL(signatureFile.getDisplayURL());
      const signatureDimensions = await getImageDimensions(signatureBase64);
      signatureData = {
        img: signatureBase64,
        dimensions: signatureDimensions
      }
    }
    return signatureData;
  },

  /**
   * Fully loads all data for any cross linked disputes
   * Returns data-holding object "LoadedDisputeData"
   * */
  async loadLinkedDisputes() {
    if (this.loadedData[DecGenData.linkedDisputes]) return this.loadedData[DecGenData.linkedDisputes];
    
    const linkedDisputeGuids = this.loadedData[DecGenData.hearings]?.at(0)?.getDisputeHearings()?.filter(dh => !dh.isExternal() && dh.get('dispute_guid') !== this.disputeGuid)
      .map(dh => dh.get('dispute_guid'));
    const allDisputesData = [];
    
    const defaultCrossDataToLoad = {
      [DecGenData.dispute]: true,
      [DecGenData.hearings]: true,
      [DecGenData.notices]: true,
      [DecGenData.notes]: true,
      [DecGenData.allParticipants]: true,
      [DecGenData.allIssues]: true,
    };

    // linkedDisputes can be requested with `true` to use defaults, or can pass an allow-list of attributes
    const crossDataToLoad = typeof this.dataToLoad[DecGenData.linkedDisputes] === "object" ? this.dataToLoad[DecGenData.linkedDisputes] : defaultCrossDataToLoad;    
    // Load each linked dispute, return as array of loaded data. Add global info like the generated doc into each cross dispute
    const globalStateInfo = _.pick(this.loadedData, DecGenData.currentDoc, DecGenData.currentDocSet, DecGenData.currentCcrItem, DecGenData.currentSubServItem);
    for (let i=0; i < linkedDisputeGuids.length; i++) {
      const crossLoader = new DecGenDisputeLoader({ disputeGuid: linkedDisputeGuids[i], dataToLoad: crossDataToLoad, loadedData: globalStateInfo });
      const loadedDisputeData = await crossLoader.load();
      allDisputesData.push(loadedDisputeData);
    }
    return allDisputesData;
  },

});
