
import React from 'react';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import ModalBaseView from '../ModalBase';
import DropdownView from '../../dropdown/Dropdown';
import DropdownModel from '../../dropdown/Dropdown_model';
import CheckboxView from '../../checkbox/Checkbox';
import CheckboxModel from '../../checkbox/Checkbox_model';
import CompletenessItems from './CompletenessItems';
import CompletenessModel from './Completeness_model';
import config_completeness from './completeness_check_config';
import { routeParse } from '../../../../admin/routers/mainview_router';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import SuccessAnimation from '../../../static/DMS_BlueCompleteCheckAnim_sml.gif';
import './ModalCompletenessCheck.scss';

const sessionChannel = Radio.channel('session');

const SHOW_ALL_DROPDOWN_CODE = '0';
const SHOW_IO_DROPDOWN_CODE = '1';
const SHOW_OFFICE_DROPDOWN_CODE = '2';
const SHOW_ADJUDICATOR_DROPDOWN_CODE = '3';
const SHOW_ARB_DROPDOWN_CODE = '4';

const ModalCompletenessCheck = ModalBaseView.extend({ 
  id: "completenessCheck_modal",

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['incompleteItems']);

    this.generalDisputeItemsCollection = new Backbone.Collection();
    this.documentAndDeliveryItemsCollection = new Backbone.Collection();
    this.hearingOutcomeItemsCollection = new Backbone.Collection();
    this.populateCompletenessCollections();

    this.allCompleteTimer = null;
    
    this.createSubModels();
    this.createListeners();
  },

  createSubModels() {
    this.filterDropdownModel = new DropdownModel({
      labelText: 'Selected Validation',
      optionData: [
        { text: 'None - Show all items', value: SHOW_ALL_DROPDOWN_CODE },
        { text: 'IO Intake Screening', value: SHOW_IO_DROPDOWN_CODE },
        { text: 'Office Admin General', value: SHOW_OFFICE_DROPDOWN_CODE },
        { text: 'Adjudicator General', value: SHOW_ADJUDICATOR_DROPDOWN_CODE },
        { text: 'Arbitrator General', value: SHOW_ARB_DROPDOWN_CODE },
      ],
      value: this.getFilterDefaultValue()
    });

    this.hideProbablyOkCheckboxModel = new CheckboxModel({
      html: 'Hide no issues detected',
      checked: true,
    });
  },

  createListeners() {
    this.listenTo(this.hideProbablyOkCheckboxModel, 'change:checked', () => this.clearTimerAndRender());
    this.listenTo(this.filterDropdownModel, 'change:value', () => this.clearTimerAndRender());

    this.listenTo(this.generalDisputeItemsCollection, 'close:modal', () => this.close());
    this.listenTo(this.documentAndDeliveryItemsCollection, 'close:modal', () => this.close());
    this.listenTo(this.hearingOutcomeItemsCollection, 'close:modal', () => this.close());
  },

  clearTimerAndRender() {
    clearTimeout(this.allCompleteTimer);
    this.render();
  },

  clickView() {
    Backbone.history.navigate(routeParse('hearing_item', this.model.get('disputeGuid')), { trigger: true });
    this.close();
  },

  populateCompletenessCollections() {
    Object.entries(this.incompleteItems).forEach(([key, value]) => {
      const configItem = config_completeness[key];
      if (!configItem) return;

      const completenessModel = new CompletenessModel({
        disputeGuid: this.model.id,
        title: configItem.title,
        subTitle: configItem.sub_title,
        helpHtml: configItem.help,
        link: configItem.link,
        value,
        showIO: configItem.show_io,
        showOffice: configItem.show_office,
        showAdjudicator: configItem.show_adjudicator,
        showArb: configItem.show_arb,
      });

      if (config_completeness.generalDisputeItems.includes(key)) this.generalDisputeItemsCollection.add(completenessModel);
      else if (config_completeness.documentAndDeliveryItems.includes(key)) this.documentAndDeliveryItemsCollection.add(completenessModel);
      else if (config_completeness.hearingOutcomeItems.includes(key)) this.hearingOutcomeItemsCollection.add(completenessModel);
    });
  },

  isGeneralDisputeItemsComplete() {
    return !this.shouldItemsDisplay(this.generalDisputeItemsCollection);
  },

  isDocumentAndDeliveryItemsComplete() {
    return !this.shouldItemsDisplay(this.documentAndDeliveryItemsCollection);
  },

  isHearingOutcomeItemsComplete() {
    return !this.shouldItemsDisplay(this.hearingOutcomeItemsCollection);
  },

  shouldItemsDisplay(collection) {
    const hideProbablyOkSelected = this.hideProbablyOkCheckboxModel.getData();
    return collection.some(model => {
      return hideProbablyOkSelected ? (model.get('value') && !this.isHiddenByFilter(model)) : !this.isHiddenByFilter(model);
    });
  },

  isHiddenByFilter(model) {
    const activeFilter = this.filterDropdownModel.getData();
    if (activeFilter === SHOW_ALL_DROPDOWN_CODE) return false;

    return (
      (activeFilter === SHOW_IO_DROPDOWN_CODE && !model.get('showIO')) ||
      (activeFilter === SHOW_OFFICE_DROPDOWN_CODE && !model.get('showOffice')) ||
      (activeFilter === SHOW_ADJUDICATOR_DROPDOWN_CODE && !model.get('showAdjudicator')) ||
      (activeFilter === SHOW_ARB_DROPDOWN_CODE && !model.get('showArb'))
    )
  },

  getFilterDefaultValue() {
    const currentUser = sessionChannel.request('get:user');
    if (currentUser.isInformationOfficer()) return SHOW_IO_DROPDOWN_CODE;
    else if (currentUser.isAdminRole()) return SHOW_OFFICE_DROPDOWN_CODE;
    else if (currentUser.isAdjudicator()) return SHOW_ADJUDICATOR_DROPDOWN_CODE;
    else if (currentUser.isArbitrator()) return SHOW_ARB_DROPDOWN_CODE;
    else SHOW_ALL_DROPDOWN_CODE;
  },

  onRender() {
    this.showChildView('filterDropdownRegion', new DropdownView({ model: this.filterDropdownModel }));
    this.showChildView('hideProbablyOkCheckboxRegion', new CheckboxView({ model: this.hideProbablyOkCheckboxModel }));

    if (!this.isGeneralDisputeItemsComplete()) {
      this.showChildView('generalDisputeCompletenessItemsRegion', new CompletenessItems({ 
        collection: this.generalDisputeItemsCollection, 
        hideProbablyOk: this.hideProbablyOkCheckboxModel.getData(), 
        selectedFilterValue: this.filterDropdownModel.getData() 
      }));
    }

    if (!this.isDocumentAndDeliveryItemsComplete()) {
      this.showChildView('documentAndDeliveryCompletenessItemsRegion', new CompletenessItems({
        collection: this.documentAndDeliveryItemsCollection, 
        hideProbablyOk: this.hideProbablyOkCheckboxModel.getData(), 
        selectedFilterValue: this.filterDropdownModel.getData() 
      }));
    }

    if (!this.isHearingOutcomeItemsComplete()) {
      this.showChildView('hearingOutcomesCompletenessItemRegion', new CompletenessItems({
        collection: this.hearingOutcomeItemsCollection, 
        hideProbablyOk: this.hideProbablyOkCheckboxModel.getData(), 
        selectedFilterValue: this.filterDropdownModel.getData() 
      }));
    }
  },

  regions: {
    filterDropdownRegion: '.completeness-check__dropdown',
    hideProbablyOkCheckboxRegion: '.completeness-check__hide-probably-ok',
    generalDisputeCompletenessItemsRegion: '.general-dispute-completeness-items',
    documentAndDeliveryCompletenessItemsRegion: '.document-and-delivery-completeness-items',
    hearingOutcomesCompletenessItemRegion: '.hearing-outcomes-completeness-items',
  },

  template() {
    return (
      <div className="completeness-check">
        <div className="modal-dialog bulk-upload-documents">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Dispute File Information Validation</h4>
              <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
            </div>
            <div className="modal-body clearfix">
              <div className="bulk-upload-documents__body">
                <p>
                  You can select a validation below to run a specific completeness check. The completeness check you are seeing now was selected automatically based on your user role or a trigger from the dispute file. 
                  To see all checked items choose the 'None - Show all items' option and deselect the 'Hide no issues detected' checkbox.
                </p>

                <div className="completeness-check__filters">
                  <div className="completeness-check__dropdown"></div>
                  <div className="completeness-check__hide-probably-ok"></div>
                  <div className="completeness-check__legend">Legend: <span className="completeness-check__legend__require-attention">could require attention</span> - <span className="completeness-check__legend__ok">no issues detected</span></div>
                </div>

                <div className="completeness-check__general-items">
                  {this.renderJsxGeneralDisputeItems()}
                  {this.renderJsxDocumentAndDeliveryItems()}
                  {this.renderJsxHearingOutcomeItems()}
                  {this.renderJsxAllItemsComplete()}
                </div>
              </div>

              <div className="button-row">
                <div className="pull-right">
                  <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Ignore Incomplete Warnings and Exit</span></button>
                </div>
              </div>
          </div>
          </div>
        </div>
      </div>
    )
  },

  renderJsxGeneralDisputeItems() {
    if (this.isGeneralDisputeItemsComplete()) return;
    return <>
      <div className="completeness-check__general-items__header">General dispute file items</div>
      <div className="general-dispute-completeness-items"></div>
    </>
  },

  renderJsxDocumentAndDeliveryItems() {
    if (this.isDocumentAndDeliveryItemsComplete()) return;
    return <>
      <div className="completeness-check__general-items__header">Document and delivery items</div>
      <div className="document-and-delivery-completeness-items"></div>
    </>
  },

  renderJsxHearingOutcomeItems() {
    if (this.isHearingOutcomeItemsComplete()) return;
    return <>
      <div className="completeness-check__general-items__header">Hearing outcome items</div>
      <div className="hearing-outcomes-completeness-items"></div>
    </>
  },

  renderJsxAllItemsComplete() {
    if (!this.isGeneralDisputeItemsComplete() || !this.isDocumentAndDeliveryItemsComplete() || !this.isHearingOutcomeItemsComplete()) return;
    this.allCompleteTimer = setTimeout(() => this.close(), 4000);
    return <div className="completeness-check__success__wrapper">
      <img className="completeness-check__success" src={`${SuccessAnimation}?t=${Math.random()}`} alt="Success" />
      <span className="completeness-check__success__text">No incomplete items in selected validation</span>
    </div>
  },

});

_.extend(ModalCompletenessCheck.prototype, ViewJSXMixin);
export default ModalCompletenessCheck;
