import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DisputeEvidenceCollection from '../../../../core/components/claim/DisputeEvidence_collection';
import InputModel from '../../../../core/components/input/Input_model';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import InputView from '../../../../core/components/input/Input';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import EvidenceBannerView from '../../../components/evidence/EvidenceBanner';
import EvidenceView from '../../../components/evidence/Evidence';
import template from './StandaloneEvidence_template.tpl';

const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');

export default Marionette.View.extend({
  template,
  className: 'standalone-evidence-container container-with-border',

  regions: {
    evidenceBannerRegion: '.standalone-evidence-banner',
    evidenceRegion: '.evidence-claim-evidence',

    evidenceDate: '.standalone-evidence-date',
    evidenceSignedBy: '.standalone-evidence-signed'
  },

  disputeEvidenceCollection: null,
  isTenancyAgreement: false,

  initialize(options) {
    this.mergeOptions(options, ['title', 'bodyHtml', 'associated_claim_titles', 'showArrows', 'isTenancyAgreement']);
    
    this.disputeEvidenceCollection = new DisputeEvidenceCollection([this.model]);
    this.showArrows = this.isTenancyAgreement;

    // Make sure to refresh the state of the file_description, because claims might change
    const fileDescription = this.model.get('file_description')    
    if (this.model.get('mustUploadNow') && this.model.getFileMethod() !== configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW')) {
      fileDescription.set('file_method', null);
    }

    this.createSubModels();

    this.listenTo(this.disputeEvidenceCollection, 'update:evidence', this.renderEvidenceBanner, this);
    this.listenTo(this.disputeEvidenceCollection, 'update:evidence', this.updateExtraInfo, this);
  },

  _getSignedByOptions() {
    const DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY = configChannel.request('get', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY');
    return _.map([
        'DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_AND_TENANTS', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_LANDLORDS_ONLY',
        'DISPUTE_TENANCY_AGREEMENT_SIGNED_TENANTS_ONLY', 'DISPUTE_TENANCY_AGREEMENT_SIGNED_NOT_SIGNED'
      ], function(key) {
        const value = configChannel.request('get', key);
        return { value, text: _.has(DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY, value) ? DISPUTE_TENANCY_AGREEMENT_SIGNED_DISPLAY[value] : value };
      });
  },

  isExtraInfoRequired() {
    const file_description = this.model.get('file_description');
    return this.isTenancyAgreement && this.model.get('required') && String(file_description.get('file_method')) !== String(configChannel.request('get', 'FILE_METHOD_DONT_HAVE'));
  },

  createSubModels() {
    const dispute = disputeChannel.request('get'),
      extraInfoRequired = this.isExtraInfoRequired();
    
    this.evidenceDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Effective Date of Agreement',
      errorMessage: 'Enter the date',
      required: extraInfoRequired,
      cssClass: extraInfoRequired ? '' : 'optional-input',
      minDate: Moment(configChannel.request('get', 'TENANCY_START_YEAR_MIN'), 'YYYY'),
      value: dispute.get('tenancy_agreement_date') ? dispute.get('tenancy_agreement_date') : null,
      apiMapping: 'tenancy_agreement_date',
    });

    this.evidenceSignedByModel = new DropdownModel({
      optionData: this._getSignedByOptions(),
      defaultBlank: true,
      labelText: 'Signed By',
      required: extraInfoRequired,
      cssClass: extraInfoRequired ? '' : 'optional-input',
      minDate: Moment().subtract( configChannel.request('get', 'DATE_MIN_YEAR_OFFSET'), 'years' ),
      value: dispute.get('tenancy_agreement_signed_by') ? dispute.get('tenancy_agreement_signed_by') : null,
      apiMapping: 'tenancy_agreement_signed_by'
    });
  },

  updateExtraInfo() {
    const isRequired = this.isExtraInfoRequired();
    let needsRender = false;
    if (this.evidenceDateModel.get('required')) {
      if (!isRequired) {
        needsRender = true;
      }
    } else if (isRequired) {
      needsRender = true;
    }

    this.evidenceDateModel.set({
      required: isRequired,
      cssClass: isRequired ? '' : 'optional-input',
    });
    this.evidenceSignedByModel.set({
      required: isRequired,
      cssClass: isRequired ? '' : 'optional-input',
    });

    if (needsRender) {
      this.render();
    }
  },


  validateAndShowErrors() {
    const evidenceView = this.getChildView('evidenceRegion'),
      evidenceDateView = this.getChildView('evidenceDate'),
      evidenceSignedByView = this.getChildView('evidenceSignedBy');
      
    return (evidenceView ? evidenceView.validateAndShowErrors() : true) &&
      (this.showArrows ? evidenceDateView.validateAndShowErrors() & evidenceSignedByView.validateAndShowErrors() : true);
  },

  getDisputeSaveAttrs() {  
    return _.extend(this.evidenceDateModel.getPageApiDataAttrs(), this.evidenceSignedByModel.getPageApiDataAttrs());
  },

  onRender() {
    this.showChildView('evidenceRegion', new EvidenceView({ model: this.model }));
    this.renderEvidenceBanner();

    if (this.isTenancyAgreement) {
      this.showChildView('evidenceDate', new InputView({ model: this.evidenceDateModel }));
      this.showChildView('evidenceSignedBy', new DropdownView({ model: this.evidenceSignedByModel }));
    }
  },

  renderEvidenceBanner() {
    this.showChildView('evidenceBannerRegion', new EvidenceBannerView({
      disputeEvidenceCollection: this.disputeEvidenceCollection,
      useShortMessages: true,
      treatAsRequired: true
    }));
  },

  templateContext() {
    return {
      title: this.title,
      bodyHtml: this.bodyHtml,
      associated_claim_titles: this.associated_claim_titles,
      showArrows: this.showArrows
    };
  }
});