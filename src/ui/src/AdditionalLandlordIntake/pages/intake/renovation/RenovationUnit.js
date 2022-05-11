import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import AddressView from '../../../../core/components/address/Address';
import DoubleSelectorView from '../../../../core/components/double-selector/DoubleSelector';
import PageItemView from '../../../../core/components/page/PageItem';
import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import EvidenceBannerView from '../../../components/evidence/EvidenceBanner';
import DisputeEvidenceCollectionView from '../../../components/evidence/Evidences';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import ModalAriMultiDelete from '../../../components/multi-delete/ModalAriMultiDelete';
import RenovationUnitPermits from './RenovationUnitPermits';
import PermitCollection from '../../../../core/components/custom-data-objs/ari-c/units/Permit_collection';
import template from './RenovationUnit_template.tpl';

const RADIO_CODE_YES = 1;
const RADIO_CODE_NO = 0;

const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'intake-participant',

  regions: {
    evidenceBannerRegion: '.evidence-claim-banner',
    addressRegion: '.participant-address',
    hasUnitTypeRegion: '.participant-use-mail',
    unitTypeRegion: '.participant-mailing-address',
    unitTenantsRegion: '.pfr-unit-tenants',
    unitHasPermitsRegion: '.pfr-unit-has-permits',
    unitPermitsRegion: '.pfr-unit-permits',
    claimDescriptionRegion: '.text-description',
    evidenceRegion: '.evidence-claim-evidence',
  },

  ui: {
    delete: '.evidence-claim-delete'
  },

  events: {
    'click @ui.delete': 'clickDelete'
  },

  clickDelete() {
    this.model.trigger('delete:full', this.model, this.disputeClaim);
  },
  
  clickUseDisputeAddress() {
    const addressModel = this.model.get('addressModel');
    const participantAddress = addressModel.getPageApiDataAttrs();
    const updateAddressFn = _.bind(function(modalView) {
      if (modalView) { modalView.close(); }
      addressModel.get('postalCodeModel').set('value', this.disputePostalCode);
      addressModel.get('postalCodeModel').trigger('render');
    }, this);

    // Check if values in street, city or postal code to know if there was an existing values.
    // Also check just the streets are different so we don't warn just when updating same address
    if (participantAddress.postalCode && participantAddress.postalCode !== this.disputePostalCode) {
      modalChannel.request('show:standard', {
        title: 'Use Rental Address?',
        bodyHtml: `<p>Are you sure you want to replace the postal code you have entered with the Main Postal Code <b>${this.disputePostalCode}</b>?</p>`,
        primaryButtonText: 'Replace',
        onContinueFn: updateAddressFn
      });
    } else {
      updateAddressFn();
    }
  },

  showTenantRemovalFromUnitModal() {
    let isContinuePressed = false;
    const numTenants = Number(this.tenantsModel.getData());
    const numSavedTenants = this.unitModel.getParticipantIds().length;
    const numToRemove = numSavedTenants - numTenants;
    if (numToRemove < 1) {
      return;
    }

    const modalView = new ModalAriMultiDelete({
      title: `Delete Renovation Tenants`,
      bodyHtml: `<p>Information for ${numSavedTenants} tenant${numSavedTenants===1?'':'s'} in this unit has been saved to this application, but you have selected that only ${numTenants} tenant${numTenants===1?' is':'s are'} in the unit.</p>
      <p>Please select <b>${numToRemove} tenant${numToRemove===1?'':'s'}</b> to be deleted from this unit.</p>`,
      primaryButtonText: `Delete tenant${numToRemove===1?'':'s'}`,
      onContinueFn: (_modalView) => {
        isContinuePressed = true;
        const checkedIds = _.map(_modalView.checkboxCollection.getData(), model => model.get('participantId'));
        _modalView.close();

        // Also update tenant count in API count info
        this.unitModel.set(this.tenantsModel.getPageApiDataAttrs());
        
        // Save new inputs 
        //this.saveInputValuesToLocal();

        // Clean up participants and save
        this.model.trigger('delete:participants', this.unitModel, checkedIds);
      },
      checkboxesOptions: { minSelectsRequired: numToRemove, maxSelectsAllowed: numToRemove },
      checkboxesData: _.filter(_.map(this.model.getParticipantIds(), participantId => {
        const participantModel = participantsChannel.request('get:participant', participantId);
        if (!participantModel) {
          return null;
        }

        return {
          html: participantModel.getDisplayName(),
          participantId: participantModel.id
        };
      }), v => v)
    })

    modalChannel.request('add', modalView);
    this.listenTo(modalView, 'removed:modal', () => {
      if (!isContinuePressed) {
        this.tenantsModel.trigger('update:input', this.tenantsModel.get('_previousValue') || null, { update_saved_value: true });
      }
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['baseName', 'disputeClaim']);

    this.baseName = this.baseName || 'Unit';
    this.unitModel = this.model;

    if (!this.disputeClaim) {
      console.log(`[Error] Expected a dispute claim in renovation unit`);
    }

    this.disputePostalCode = disputeChannel.request('get').get('tenancy_zip_postal');
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    // Update address model in unit to have custom address link:
    const streetModel = this.unitModel.get('addressModel') && this.unitModel.get('addressModel').get('streetModel');
    if (streetModel) {
      streetModel.set({
        customLink: `Use Main Postal Code: ${this.disputePostalCode}`,
        customLinkFn: this.clickUseDisputeAddress.bind(this)
      });
    }
    
    this.tenantsModel = new InputModel({
      labelText: 'Tenants',
      errorMessage: 'Enter the number of tenants',
      inputType: 'positive_integer',
      cssClass: 'smallest-form-field',
      maxLength: 2,
      required: true,
      apiMapping: 'selected_tenants',
      showValidate: true,
      autoAcceptFirstTouch: true,
      value: this.unitModel.get('selected_tenants'),

      // Add an extra value here that can be used to re-set the model if tenant delete is cancelled
      _previousValue: this.unitModel.get('selected_tenants'),
    });

    const useTextDescription = this.disputeClaim && this.disputeClaim.claimConfig.useTextDescription;
    this.textDescriptionModel = new TextareaModel({
      labelText: this.disputeClaim && this.disputeClaim.claimConfig.textDescriptionTitle || 'Describe why this is being requested',
      errorMessage: 'Description is required',
      max: configChannel.request('get', 'CLAIM_DESCRIPTION_MAX'),
      countdown: true,
      cssClass: useTextDescription? 'no-max-width' : 'hidden',
      required: useTextDescription,
      value: this.disputeClaim ? this.disputeClaim.getDescription() : null,
      apiMapping: 'description'
    });

    this.hasPermitsModel = new RadioModel({
      labelText: null,
      optionData: [{ value: RADIO_CODE_NO, text: 'No' },
        { value: RADIO_CODE_YES, text: 'Yes' }],
      required: true,
      value: this.unitModel.get('permits') === null ? null :
        this.unitModel.getPermits().length ? RADIO_CODE_YES : RADIO_CODE_NO
    });

    this.permitsCollection = new PermitCollection(this.unitModel.getPermits());
  },

  setupListeners() {
    this.listenTo(this.unitModel.get('hasUnitTypeModel'), 'change:value', (model, value) => {
      const unitTypeView = this.getChildView('unitTypeRegion');
      
      if (unitTypeView && unitTypeView.isRendered()) {
        unitTypeView.triggerMethod( value ? 'show' : 'hide', { no_animate: true });
      }
    });

    this.listenTo(this.unitModel.get('addressModel'), 'change', this.renderEvidenceBanner, this);
    this.listenTo(this.unitModel.get('hasUnitTypeModel'), 'change:value', this.renderEvidenceBanner, this);
    this.listenTo(this.unitModel.get('rentDescriptionModel'), 'change', this.renderEvidenceBanner, this);
    
    this.listenTo(this.textDescriptionModel, 'change:value', (model, value) => {
      this.unitModel.set('_claimDescription', value);
      this.renderEvidenceBanner();
    });
    this.listenTo(this.disputeClaim.get('dispute_evidences'), 'update:evidence', this.renderEvidenceBanner, this);


    const updatePermitsFn = (value) => {
      const unitPermitsView = this.getChildView('unitPermitsRegion');
      if (unitPermitsView && unitPermitsView.isRendered()) {
        // If showing the permits, always ensure there's one editable
        if (!this.permitsCollection.length) this.permitsCollection.add({});
        unitPermitsView.triggerMethod( value ? 'show' : 'hide', { no_animate: true });
      }
      this.updateDisputeEvidenceHidden();
      const evidenceView = this.getChildView('evidenceRegion');
      if (evidenceView && evidenceView.isRendered()) evidenceView.render();
    };
    this.listenTo(this.hasPermitsModel, 'change:value', (model, value) => {
      let hasSavedData;
      if (value === RADIO_CODE_NO) {
        // Find any non-empty permits (needed, because a blank permit is added)
        hasSavedData = this.permitsCollection.length && this.permitsCollection.find(p => Object.values(p.toJSON()).find(v=>v));
      }
      hasSavedData = hasSavedData || _.any(this.getDisputeEvidenceToHide(), evidenceModel => !evidenceModel.isNew());

      if (hasSavedData) {
        // Immediately unset value, as the user must confirm selection
        this.hasPermitsModel.set({ value: model.previous('value') }, { silent: true });
        this.hasPermitsModel.trigger('render');

        modalChannel.request('show:standard', {
          title: 'Change Permit Answer?',
          bodyHtml: `<p>Changing your answer on whether a unit has associated permits will clear any specific permit evidence and information that was based on the previous answer.  If you continue, the permits and evidence will update to align with your new answer.  This action cannot be undone.  Are you sure you want to change your answer?</p>`,
          primaryButtonText: 'Change Answer',
          onContinueFn: _modalView => {
            loaderChannel.trigger('page:load');
            this.hasPermitsModel.set({ value }, { silent: true });
            if (value === RADIO_CODE_NO) this.permitsCollection.reset([]);
            Promise.all(this.getDisputeEvidenceToHide().map(evidenceModel => evidenceModel.destroy())).then(() => {
              // Add blank models back, toggle required on them again
              this.disputeClaim.get('dispute_evidences').syncModelDataWithDisputeClaim(this.disputeClaim);
              this.updateDisputeEvidenceHidden();
              this.hasPermitsModel.trigger('render');
              updatePermitsFn(value);
              loaderChannel.trigger('page:load:complete');
            }, err => {
              // There was an error deleting evidence - What to do?
            });
            _modalView.close();
          },
        });
      } else {
        updatePermitsFn(value);
      }
    });

    this.listenTo(this.unitModel.get('addressModel'), 'change', this.renderEvidenceBanner, this);
    this.listenTo(this.unitModel.get('hasUnitTypeModel'), 'change:value', this.renderEvidenceBanner, this);
  },


  /**
   * Returns which evidence codes to hide.  When Yes permits are selected, hides "permits not required", vice versa for when No selected.
   * If no select, hide both evidence that relates to permit approvals
   */
  getEvidenceCodesToHide(overrideHasPermitsVal=null) {
    let configCodes = [];
    const permitsSelection = overrideHasPermitsVal !== null ? overrideHasPermitsVal : this.hasPermitsModel.getData();
    if (permitsSelection === RADIO_CODE_YES) configCodes.push('NO_PERMITS_REQUIRED_EVIDENCE_CODE');
    else if (permitsSelection === RADIO_CODE_NO) configCodes.push('PERMITS_REQUIRED_EVIDENCE_CODE');
    else configCodes = [...configCodes, 'NO_PERMITS_REQUIRED_EVIDENCE_CODE', 'PERMITS_REQUIRED_EVIDENCE_CODE'];
    return configCodes.map(code => configChannel.request('get', code)).filter(v=>v);
  },

  getDisputeEvidenceToHide(overrideHasPermitsVal=null) {
    const codesToHide = this.getEvidenceCodesToHide(overrideHasPermitsVal);
    return this.disputeClaim.get('dispute_evidences').filter(ev => (codesToHide.indexOf(ev.get('evidence_id')) !== -1))
  },

  updateDisputeEvidenceHidden() {
    const codesToHide = this.getEvidenceCodesToHide();
    this.disputeClaim.get('dispute_evidences').each(evidenceModel => {
      const shouldHide = (codesToHide.indexOf(evidenceModel.get('evidence_id')) !== -1);
      evidenceModel.set('isHidden', shouldHide, { silent: true });
    });
  },


  hasMissingRequired() {
    return !this.textDescriptionModel.getData() || !this.tenantsModel.getData() || this.unitModel.isMissingRequiredSelections();
  },

  /**
   * Returns permits data entered into the UI
   */
  getUiPermits() {
    return this.hasPermitsModel.getData() === RADIO_CODE_YES ? this.permitsCollection.map(m => m.toJSON()) : [];
  },

  onBeforeRender() {
    // Set hidden-ness of evidence on initial render.  Subsequent ones should be handled in the change listener
    this.updateDisputeEvidenceHidden();
  },
  

  onRender() {
    this.showChildView('addressRegion', new AddressView({ useFlatLayout: true, model: this.unitModel.get('addressModel') }));
    
    this.renderPageItem('hasUnitTypeRegion', new PageItemView({
      stepText: 'If the rental unit is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e. basement, upper, lower, coach house, etc.)?',
      subView: new RadioView({ model: this.unitModel.get('hasUnitTypeModel') }),
      helpHtml: 'This might mean a basement suite, room rental, upper home, lower home, coach house or laneway.'
    }), true);
    
    this.renderPageItem('unitTypeRegion', new PageItemView({
      stepText: 'Please provide a description of the unit (i.e., basement suite, upper home, lower home, etc.)',
      subView: new DoubleSelectorView({ model: this.unitModel.get('rentDescriptionModel') })
    }), this.unitModel.isSharedAddressSelected());


    this.renderPageItem('unitTenantsRegion', new PageItemView({
      stepText: 'How many tenants are responsible for payment of the rent?',
      subView: new InputView({ model: this.tenantsModel }),
      helpHtml: 'Please only provide the number of tenants who are legally obligated to pay rent as per the tenancy agreement.'
    }), true);

    this.renderPageItem('unitHasPermitsRegion', new PageItemView({
      stepText: 'Are permits and approvals required by law to do this work?',
      subView: new RadioView({ model: this.hasPermitsModel }),
      helpHtml: `Renovations or repairs that are so extensive they require the rental unit to be vacant almost always require permits. Permits for renovations or repairs fall under broad categories including building, demolition and plumbing permits. These are obtained through local governments.<br/>`
        + `Landlords may also need electrical and gas permits. In general, the BC Safety Authority issues electrical and gas permits, however, some local governments may issue these permits.<br/>`
        + `Check with the local government where the rental unit is located to find out their requirements for all permits and inspections. <a href="javascript:;" class="static-external-link" url="https://www.civicinfo.bc.ca/directories">Find your local government</a>.<br/>`
        + `You can learn more about permit requirements on the <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/ending-a-tenancy/renovictions">Residential Tenancy Branch website</a> and <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl2b.pdf">Policy Guideline 2B: Ending a Tenancy to Demolish, Renovate, or Convert a Rental Unit to a Permitted Use</a>.`,
    }), true);

    this.renderPageItem('unitPermitsRegion', new PageItemView({
      stepText: 'Please provide the information for all required permits for the renovations on this unit.  Add additional permits as required.',
      subView: new RenovationUnitPermits({ collection: this.permitsCollection }),
    }), this.hasPermitsModel.getData() === RADIO_CODE_YES);

    if (this.disputeClaim && this.disputeClaim.claimConfig.useTextDescription) {
      this.renderEvidenceBanner();
      this.showChildView('claimDescriptionRegion', new TextareaView({ model: this.textDescriptionModel }));
      this.showChildView('evidenceRegion', new DisputeEvidenceCollectionView({
        collection: this.disputeClaim.get('dispute_evidences'),
        hideHidden: true,
      }));
    }

    // Add listeners to any Views
    this.setupViewListeners();

    // Do a dummy scroll in order to make sure floating headers are correct on re-renders
    this.$el.closest('.persist-area').scroll();
  },

  setupViewListeners() {
    // Setup tenant listener
    const view = this.getChildView('unitTenantsRegion');
    this.stopListening(view, 'itemComplete');
    this.listenTo(view, 'itemComplete', () => {
      if (!this.tenantsModel.isValid()) {
        return;
      }

      const numTenantsSelected = this.tenantsModel.getData({ parse: true });      
      if (Number(numTenantsSelected) < this.unitModel.getParticipantIds().length) {
        this.showTenantRemovalFromUnitModal();
        return;
      }
      
      // Stash the saved tenant value in the model
      if (this.tenantsModel.isValid()) {
        this.tenantsModel.set('_previousValue', numTenantsSelected, { silent: true });
      }
      
      this.unitModel.set('selected_tenants', numTenantsSelected);
      this.renderEvidenceBanner();
    });
  },

  renderPageItem(regionId, pageItem, showItem=false) {
    this.showChildView(regionId, pageItem);
    if (showItem && pageItem) {
      pageItem.triggerMethod('show', { no_animate: true });
    }
  },

  renderEvidenceBanner() {
    this.showChildView('evidenceBannerRegion', new EvidenceBannerView({
      disputeEvidenceCollection: this.disputeClaim.get('dispute_evidences'),
      forceMissing: this.hasMissingRequired()
    }));
  },

  showErrorMessage(participant_error) {
    console.info(`[Info] participant object error`, participant_error);
  },

  validateAndShowErrors() {
    let isValid = true;
    _.each(this.regions, (selector, region) => {
      let childView = this.getChildView(region);
      if (!childView) {
        console.log(`[Warning] No childView is configured for region:`, region);
        return;
      }
      if (childView instanceof PageItemView) {
        childView = childView.subView;
      }

      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }

      if (!childView.$el) {
        console.log(`[Warning] No childView element rendered in DOM to validate`, childView);
        return;
      }
      if (!childView.$el.is(':visible')) {
        console.log(`[Info] Skipping validation on hidden childView`, childView);
        return;
      }

      isValid = childView.validateAndShowErrors() && isValid;
    });

    return isValid;
  },

  templateContext() {
    const collection = this.model.collection;
    const unitIndex = collection ? collection.indexOf(this.model) : -1;
    const display_index = unitIndex !== -1 ? unitIndex + 1 : '';

    return {
      useTextDescription: this.disputeClaim && this.disputeClaim.claimConfig.useTextDescription,
      hasUnitType: this.model.isSharedAddressSelected(),
      unitName: `${Formatter.toLeftPad(display_index, '0', 3)}`
    };
  }
});
