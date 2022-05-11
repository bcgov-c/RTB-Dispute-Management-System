import React from 'react';
import ModalBaseView from '../../modals/ModalBase';
import RadioModel from '../../radio/Radio_model';
import RadioView from '../../radio/Radio';
import CheckboxModel from '../../checkbox/Checkbox_model';
import CheckboxView from '../../checkbox/Checkbox';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './ModalArbRating.scss';

const HELP_LANGUAGE = {
  quality: `Evidence was relevant to the issue(s)`,
  quantity: `The amount of evidence was appropriate to the issue(s)`,
  organization: `Evidence was clearly labelled`,
};

const ArbRatingModal = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const optionData = ['Poor', 'Fair', 'Average', 'Good', 'Excellent'].map(function(text, index) { return { text, value: index+1 }; });

    this.qualityModel = new RadioModel({
      optionData,
      errorMessage: 'An answer is required',
      required: true,
      value: null,
    });

    this.quantityModel = new RadioModel({
      optionData,
      errorMessage: 'An answer is required',
      required: true,
      value: null,
    });

    this.organizationModel = new RadioModel({
      optionData,
      errorMessage: 'An answer is required',
      required: true,
      value: null,
    });

    this.skipRatingModel = new CheckboxModel({
      html: `Can't provide this? Check this box if there is a valid reason you cannot provide an applicant evidence assessment, e.g., no applicant evidence provided.`,
      checked: false,
    });
  },

  setupListeners() {
    this.listenTo(this.skipRatingModel, 'change:checked', (model, isChecked) => {
      const radioData = isChecked ? {
        required: false,
        disabled: true,
        value: null,
      } : {
        required: true,
        disabled: false,
      };
      this.qualityModel.set(radioData);
      this.quantityModel.set(radioData);
      this.organizationModel.set(radioData);

      this.render();
    });
  },

  submitAssessment() {
    if (!this.validateAndShowErrors()) return;

    const outcomeData = this.skipRatingModel.getData() ? {
      outcome_value1: null,
      outcome_value2: null,
      outcome_value3: null,
      outcome_comment: `SKIPPED BY USER`,
    } : {
      outcome_value1: this.qualityModel.getData(),
      outcome_value2: this.quantityModel.getData(),
      outcome_value3: this.organizationModel.getData(),
    };

    this.trigger('continue', outcomeData);
  },
  
  validateAndShowErrors() {
    const validateGroup = ['qualityRegion', 'quantityRegion', 'organizationRegion', 'skipRatingRegion'];
    let isValid = true;
    validateGroup.forEach(group => {
      const view = this.getChildView(group);
      isValid = view.validateAndShowErrors() && isValid;
    });
    return isValid;
  },

  className() {
    return `${ModalBaseView.prototype.className} arb-rating-modal`;
  },

  regions: {
    qualityRegion: '.arb-rating-modal__quality',
    quantityRegion: '.arb-rating-modal__quantity',
    organizationRegion: '.arb-rating-modal__organization',
    skipRatingRegion: '.arb-rating-modal__skip',
  },

  ui: {
    help: '.help-icon'
  },

  onRender() {
    this.showChildView('qualityRegion', new RadioView({ model: this.qualityModel }));
    this.showChildView('quantityRegion', new RadioView({ model: this.quantityModel }));
    this.showChildView('organizationRegion', new RadioView({ model: this.organizationModel }));
    this.showChildView('skipRatingRegion', new CheckboxView({ model: this.skipRatingModel }));


    this.getUI('help').popover();
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title">Evidence Assessment</h4>
        </div>
          <div className="modal-body">
            <p className="arb-rating-modal__description">Please rate the evidence associated with <b>applicant(s)</b> in this dispute:</p>
            <div className="arb-rating-modal__row">
              <div className="">
                {this.renderJsxTitleWithHelpIcon('Quality', HELP_LANGUAGE.quality)}
              </div>
              <div className="arb-rating-modal__quality"></div>
            </div>
            <div className="arb-rating-modal__row">
              <div className="">
                {this.renderJsxTitleWithHelpIcon('Quantity', HELP_LANGUAGE.quantity)}
              </div>
              <div className="arb-rating-modal__quantity"></div>
            </div>
            <div className="arb-rating-modal__row">
              <div className="">
                {this.renderJsxTitleWithHelpIcon('Organization', HELP_LANGUAGE.organization)}
              </div>
              <div className="arb-rating-modal__organization"></div>
            </div>

            <div className="arb-rating-modal__skip"></div>

            <div className="modal-button-container">
              <button className="btn btn-lg btn-standar btn-cancel" onClick={() => this.close()}>Do This Later</button>
              <button className="btn btn-lg btn-primary btn-continue continue-button" onClick={() => this.submitAssessment()}>Submit Assessment</button>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderJsxTitleWithHelpIcon(title, content) {
    return <>
      <span>{title}</span>
      <div title={title} data-content={content} className="badge help-icon" tabIndex="-1" data-toggle="popover" data-container="body" data-trigger="focus" data-placement="auto">?</div>
    </>;
  },

});
  
_.extend(ArbRatingModal.prototype, ViewJSXMixin);
export default ArbRatingModal;