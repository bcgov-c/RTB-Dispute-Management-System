import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import ViewMixin from '../../../../core/utilities/ViewMixin';
import Input_model from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import Radio_model from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import Textarea_model from '../../../../core/components/textarea/Textarea_model';
import Checkbox_collection from '../../../../core/components/checkbox/Checkbox_collection';
import PageItemView from '../../../../core/components/page/PageItem';
import Textarea from '../../../../core/components/textarea/Textarea';
import Checkboxes from '../../../../core/components/checkbox/Checkboxes';
import CeuWitnessesView from './CeuWitnesses';
import CeuDmsFilesView from './CeuDmsFiles';
import DisputeEvidenceCollectionView from '../../../components/evidence/CeuEvidences';
import './CeuContravention.scss';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');

const CeuContravention = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    
    this.AMOUNT_FIELD_MAX = configChannel.request('get', 'AMOUNT_FIELD_MAX') || 12,
    this.showHideRules = this.model.config.showInputEntry || {};
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.estimatedAmountModel = new Input_model({
      inputType: 'currency',
      labelText: 'Estimated dollar value',
      maxLength: this.AMOUNT_FIELD_MAX,
      cssClass: this.showHideRules.estimatedAmount === "optional" ? 'optional-input' : null,
      required: this.showHideRules.estimatedAmount && this.showHideRules.estimatedAmount !== "optional",
      value: this.model.get('c_estimated_dollar_value'),
      apiMapping: 'c_estimated_dollar_value',
    });

    this.largestAmountModel = new Input_model({
      inputType: 'currency',
      labelText: 'Estimated largest dollar value',
      maxLength: this.AMOUNT_FIELD_MAX,
      cssClass: this.showHideRules.largestAmount === "optional" ? 'optional-input' : null,
      required: this.showHideRules.largestAmount && this.showHideRules.largestAmount !== "optional",
      value: this.model.get('c_largest_dollar_value'),
      apiMapping: 'c_largest_dollar_value',
    });

    this.numOccurrencesModel = new Input_model({
      inputType: 'positive_integer',
      labelText: 'How many times has this happened',
      maxLength: 3,
      errorMessage: 'Estimated number of occurrences is required',
      cssClass: this.showHideRules.numOccurrences === "optional" ? 'optional-input' : null,
      required: this.showHideRules.numOccurrences && this.showHideRules.numOccurrences !== "optional",
      value: this.model.get('c_total_known_occurrences'),
      apiMapping: 'c_total_known_occurrences',
    });

    this.latestViolationDateModel = new Input_model({
      inputType: 'date',
      labelText: 'Most recent date the issue happened',
      cssClass: this.showHideRules.latestViolationDate === "optional" ? 'optional-input' : null,
      required: this.showHideRules.latestViolationDate && this.showHideRules.latestViolationDate !== "optional",
      value: this.model.get('c_latest_occurrence_date'),
      apiMapping: 'c_latest_occurrence_date',
    });

    this.latestViolationDurationModel = new Input_model({
      inputType: 'text',
      labelText: 'How long has this issue been going on for?',
      maxLength: 250,
      cssClass: this.showHideRules.latestViolationDuration === "optional" ? 'optional-input' : null,
      required: this.showHideRules.latestViolationDuration && this.showHideRules.latestViolationDuration !== "optional",
      value: this.model.get('c_latest_violation_duration'),
      apiMapping: 'c_latest_violation_duration',
    });

    this.latestNoticeDateModel = new Input_model({
      inputType: 'date',
      labelText: 'What is the date of the latest notice to end tenancy form?',
      cssClass: this.showHideRules.latestNoticeDate === "optional" ? 'optional-input' : null,
      required: this.showHideRules.latestNoticeDate && this.showHideRules.latestNoticeDate !== "optional",
      value: this.model.get('c_latest_notice_date'),
      apiMapping: 'c_latest_notice_date',
    });

    this.dmsFileNumbersModel = new Radio_model({
      optionData: [
        { text: 'No', value: 0 },
        { text: 'Yes', value: 1 },
      ],
      displayTitle: 'Are there any applications to the Residential Tenancy Branch related to this contravention or issue?',
      required: true,
      value: this.model.get('c_dms_file_numbers') === null ? null :
          this.model.getDmsFileNumberCollection().length ? 1 : 0,
    });

    this.witnessesModel = new Radio_model({
      optionData: [
        { text: 'No', value: 0 },
        { text: 'Yes', value: 1 },
      ],
      displayTitle: 'Is there anyone else the Compliance and Enforcement Unit can contact to provide information about this contravention or issue?',
      required: true,
      value: this.model.get('c_witnesses') === null ? null :
          this.model.getWitnessCollection().length ? 1 : 0,
    });

    this.descriptionModel = new Textarea_model({
      labelText: this.model.config.textDescriptionTitle,
      required: true,
      min: 25,
      max: 500,
      countdown: true,
      value: this.model.get('c_description'),
      apiMapping: 'c_description',
    });

    this.tenantsCollection = new Checkbox_collection(
      (this.model.get('selectableTenants') || []).map(p => ({
        html: `${p.getDisplayName()}`,
        checked: !!this.model.hasParticipantId(p.id),
        participantId: p.id,
      })),
      { minSelectsRequired: 0 }
    );

    this.unitsCollection = new Checkbox_collection(
      (this.model.get('selectableUnits') || []).map(unit => ({
        html: `${unit.getStreetDisplayWithDescriptor()}, ${unit.getAddressWithoutStreet()}`,
        checked: !!this.model.hasUnitId(unit.id),
        unitId: unit.id,
      })),
      { minSelectsRequired: 1 }
    );
  },

  setupListeners() {
    const CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS = configChannel.request('get', 'CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS') || 0;
    this.listenTo(this.latestViolationDateModel, 'change:value', model => {
      if (!CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS) return;

      const date = model.isValid() && model.getData({ parse: true });
      const isDatePastLimitation = date ? Moment(date).add(CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS, 'years').isBefore(Moment(), 'days') : false;
      if (isDatePastLimitation) {
        modalChannel.request('show:standard', {
          title: `Two Year Limitation Warning`,
          bodyHtml: `<p>You have entered a latest occurrence date that is over two years ago. The CEU may not have jurisdiction and may not be able to assist with this matter. If you decide to continue with this matter, be aware that issues that occurred more than two years ago may not be considered.</p>`,
          primaryButtonText: 'I understand',
          hideCancelButton: true,
          onContinueFn(modalView) { modalView.close(); }
        });
      }
    });
    
    this.listenTo(this.dmsFileNumbersModel, 'change:value', () => this.render());
    this.listenTo(this.witnessesModel, 'change:value', () => this.render());

    if (this.model.collection) {
      // Any time a model is added or removed, refresh all views in collection to ensure correct header numbering
      this.listenTo(this.model.collection, 'update', () => this.render());
    }
  },

  saveInternalDataToModel(options={}) {
    const modelSaveData = {};
    const internalSaveData = this.model.saveInternalDataToModel(options) || {};
    Object.assign(modelSaveData, internalSaveData, {
        c_associated_complainants: this.tenantsCollection.getData().map(p => p.get('participantId')),
        c_associated_rental_units: this.unitsCollection.getData().map(unit => unit.get('unitId')),
      },
      this.estimatedAmountModel.getPageApiDataAttrs(),
      this.largestAmountModel.getPageApiDataAttrs(),
      this.numOccurrencesModel.getPageApiDataAttrs(),
      this.latestViolationDateModel.getPageApiDataAttrs(),
      this.latestViolationDurationModel.getPageApiDataAttrs(),
      this.latestNoticeDateModel.getPageApiDataAttrs(),
      this.descriptionModel.getPageApiDataAttrs(),
    );

    if (!options.returnOnly) {
      if (!this.dmsFileNumbersModel.getData()) this.model.getDmsFileNumberCollection().reset([], { silent: true });
      if (!this.witnessesModel.getData()) this.model.getWitnessCollection().reset([], { silent: true });
    }

    const dmsFileView = this.getChildView('dmsFileNumbersRegion');
    const witnessesView = this.getChildView('witnessesRegion');
    if (dmsFileView && typeof dmsFileView.saveInternalDataToModel === 'function') dmsFileView.saveInternalDataToModel();
    if (witnessesView && typeof witnessesView.saveInternalDataToModel === 'function') witnessesView.saveInternalDataToModel();

    if (options.returnOnly) {
      return Object.assign(modelSaveData, internalSaveData);
    } else {
      this.model.set(modelSaveData);
    }
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      if (!childView) {
        return;
      }
      if (typeof childView.validateAndShowErrors !== "function") {
        return;
      }

      if (!childView.$el) {
        return;
      }
      if (!childView.$el.is(':visible')) {
        return;
      }

      is_valid = childView.validateAndShowErrors() & is_valid;
    }, this);

    return is_valid;
  },

  isDmsFilesSelected() {
    return !!this.dmsFileNumbersModel.getData();
  },

  clickDelete() {
    modalChannel.request('show:standard', {
      title: 'Remove Contravention',
      bodyHtml: `Are you sure you want to remove this contravention from your application? This will remove all data and files associated to this contravention.`,
      primaryButtonText: 'Delete',
      onContinueFn: (modalView) => {
        modalView.close();
        this.model.trigger('click:delete', this.model);
      }
    });
  },

  clickHelp(ev) {
    ev.preventDefault();
    this.getUI('help').trigger('click.rtb-help');
  },

  className() { return `step intake-claim ${this.model.get('cssClass')} ceu-contravention`; },

  regions: {
    estimatedAmountRegion: '.ceu-contravention__estimated-amount',
    largestAmountRegion: '.ceu-contravention__largest-amount',
    numOccurrencesRegion: '.ceu-contravention__num-occurrences',
    latestViolationDateRegion: '.ceu-contravention__violation-date',
    latestViolationDurationRegion: '.ceu-contravention__violation-duration',
    latestNoticeDateModel: '.ceu-contravention__notice-date',
    dmsFileNumbersQuestionRegion: '.ceu-contravention__dms-file-numbers-question',
    dmsFileNumbersRegion: '.ceu-contravention__dms-file-numbers',
    witnessesQuestionRegion: '.ceu-contravention__witnesses-question',
    witnessesRegion: '.ceu-contravention__witnesses',

    descriptionRegion: '.ceu-contravention__description',
    tenantsRegion: '.ceu-contravention__tenants',
    unitsRegion: '.ceu-contravention__units',
    evidenceRegion: '.ceu-contravention__evidence',
  },

  ui: {
    help: '.contravention-help',
    delete: '.evidence-claim-delete'
  },

  events: {
    'click @ui.help': 'clickHelp',
    'click @ui.delete': 'clickDelete'
  },

  onBeforeRender() {
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    if (this.showHideRules.estimatedAmount) this.showChildView('estimatedAmountRegion', new InputView({ model: this.estimatedAmountModel }));
    if (this.showHideRules.largestAmount) this.showChildView('largestAmountRegion', new InputView({ model: this.largestAmountModel }));
    if (this.showHideRules.numOccurrences) this.showChildView('numOccurrencesRegion', new InputView({ model: this.numOccurrencesModel }));
    if (this.showHideRules.latestViolationDate) this.showChildView('latestViolationDateRegion', new InputView({ model: this.latestViolationDateModel }));
    if (this.showHideRules.latestViolationDuration) this.showChildView('latestViolationDurationRegion', new InputView({ model: this.latestViolationDurationModel }));    
    if (this.showHideRules.latestNoticeDate) this.showChildView('latestNoticeDateModel', new InputView({ model: this.latestNoticeDateModel }));

    this.showChildView('dmsFileNumbersQuestionRegion', new PageItemView({
      stepText: this.dmsFileNumbersModel.get('displayTitle'),
      subView: new RadioView({ model: this.dmsFileNumbersModel }),
      forceVisible: true,
    }));

    this.showChildView('witnessesQuestionRegion', new PageItemView({
      stepText: this.witnessesModel.get('displayTitle'),
      helpHtml: `The Compliance and Enforcement Unit may contact these individuals to gather more information about this contravention or issue as a part of their investigation.`,
      subView: new RadioView({ model: this.witnessesModel }),
      forceVisible: true,
    }));

    this.showChildView('descriptionRegion', new Textarea({ model: this.descriptionModel }));
    
    if (this.tenantsCollection.length) {
      this.showChildView('tenantsRegion', new PageItemView({
        stepText: 'Please select any parties that were affected by this contravention or issue',
        subView: new Checkboxes({ collection: this.tenantsCollection }),
        forceVisible: true,
      }));
    }
    
    this.showChildView('unitsRegion', new PageItemView({
      stepText: 'Please select any rental units impacted by this contravention or issue',
      subView: new Checkboxes({ collection: this.unitsCollection }),
      forceVisible: true,
    }));
    
    if (!!this.dmsFileNumbersModel.getData()) {
      const fileNumCollection = this.model.getDmsFileNumberCollection();
      if (!fileNumCollection.length) this.model.addBlankDmsFile();
      this.showChildView('dmsFileNumbersRegion', new CeuDmsFilesView({
        ceuModel: this.model,
        collection: fileNumCollection
      }));
    }
    if (!!this.witnessesModel.getData()) {
      const witnessCollection = this.model.getWitnessCollection();
      if (!witnessCollection.length) this.model.addBlankWitness();
      this.showChildView('witnessesRegion', new CeuWitnessesView({
        ceuModel: this.model,
        collection: witnessCollection
      }));
    }
    
    this.showChildView('evidenceRegion', new DisputeEvidenceCollectionView({ collection: this.model.getEvidenceCollection() }))
    
    ViewMixin.prototype.initializeHelp(this, this.model.config.issueHelp, ['.step-description', '.evidence-item-container']);
  },

  template() {
    const claimIndexDisplay = this.model.collection && _.isNumber(this.model.collection.indexOf(this.model)) ? this.model.collection.indexOf(this.model)+1 : this.model.get('claim_item_number');
    const title = this.model.config.issueTitle;

    return <div className="evidence-claim-container-parent">
      <div className="evidence-claim-container container-with-border persist-area" data-header-extend="0">
      <div className="evidence-claim-header clearfix persist-header">
        <div className="evidence-claim-number">{claimIndexDisplay}</div>
        <div className="evidence-claim-title">
          <span>{title}</span>
          <span className="badge help-icon contravention-help">?</span>
        </div>
        <span className="evidence-claim-delete">
          <b className="evidence-delete-icon"></b>
          <span className="hidden-xs">Delete</span>
        </span>
      </div>
      <div className="evidence-claim-body clearfix">
        <div className="evidence-claim-details col-xs-12">

          {this.renderJsxInfo()}

          <div className="ceu-contravention__description"></div>
          
          <div className="ceu-contravention__tenants"></div>
          <div className="ceu-contravention__units"></div>

          {this.renderJsxDmsFileNumbersSection()}
          {this.renderJsxWitnessSection()}

          <div className="evidence-claim-evidence-section">
            <div className="section-header">Supporting evidence</div>
            <div className="ceu-contravention__evidence evidence-claim-evidence"></div>
          </div>
        </div>
      </div>
    </div>
  </div>;
  },

  renderJsxInfo() {
    return <div className="ceu-contravention__top-row">
      {this.showHideRules.estimatedAmount ? <div className="ceu-contravention__estimated-amount"></div> : null}
      {this.showHideRules.largestAmount ? <div className="ceu-contravention__largest-amount"></div> : null}
      {this.showHideRules.numOccurrences ? <div className="ceu-contravention__num-occurrences"></div> : null}
      {this.showHideRules.latestViolationDate ? <div className="ceu-contravention__violation-date"></div> : null}
      {this.showHideRules.latestViolationDuration ? <div className="ceu-contravention__violation-duration"></div> : null}
      {this.showHideRules.latestNoticeDate ? <div className="ceu-contravention__notice-date"></div> : null}
    </div>;
  },

  renderJsxDmsFileNumbersSection() {
    const showDmsFilesView = !!this.dmsFileNumbersModel.getData();
    return <>
      <div className="ceu-contravention__dms-file-numbers-question"></div>
      {showDmsFilesView ? <div className="ceu-contravention__dms-file-numbers"></div> : null}
    </>;
  },

  renderJsxWitnessSection() {
    const showWitnessView = !!this.witnessesModel.getData();
    return <>
      <div className="ceu-contravention__witnesses-question"></div>
      {showWitnessView ? <div className="ceu-contravention__witnesses"></div> : null}
    </>;
  },

});

_.extend(CeuContravention.prototype, ViewJSXMixin);
export default CeuContravention;
