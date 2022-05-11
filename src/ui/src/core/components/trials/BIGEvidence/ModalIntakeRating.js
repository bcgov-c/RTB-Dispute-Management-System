import React from 'react';
import ModalBaseView from '../../modals/ModalBase';
import RadioModel from '../../radio/Radio_model';
import RadioView from '../../radio/Radio';
import TextareaModel from '../../textarea/Textarea_model';
import TextareaView from '../../textarea/Textarea';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './ModalIntakeRating.scss';

const IntakeRatingModal = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.createSubModels();
  },

  createSubModels() {
    this.feedbackChoiceModel = new RadioModel({
      optionData: [
        { text: 'Very Satisfied', value: 5 },
        { text: 'Satisfied', value: 4 },
        { text: 'Neutral', value: 3 },
        { text: 'Unsatisfied', value: 2 },
        { text: 'Very Unsatisfied', value: 1 }
      ],
      errorMessage: 'An answer is required',
      required: true,
      value: null,
    });

    this.enterFeedbackModel = new TextareaModel({
      cssClass: 'optional-input',
      labelText: '<b>Optional:</b> Provide suggestions to help us improve this online system. This information will not be included or visible in your dispute file, and you will not be contacted about this feedback.',
      displayRows: 3,
      countdown: true,
      max: 500,
    })
  },

  submitFeedback() {
    const isValid = this.getChildView('feedbackChoiceRegion').validateAndShowErrors()
      // Run both always using unary &
      & this.getChildView('enterFeedbackRegion').validateAndShowErrors();   
    if (!isValid) return;

    this.trigger('continue', {
      outcome_value1: this.feedbackChoiceModel.getData(),
      outcome_string1: this.enterFeedbackModel.getData()
    });
  },

  regions: {
    feedbackChoiceRegion: '.intake-rating-modal__feedback',
    enterFeedbackRegion: '.intake-rating-modal__enter-feedback'
  },

  ui() {
    return Object.assign(ModalBaseView.prototype.ui, {
      fadeIn: '.animation-content',
    });
  },

  onRender() {
    this.showChildView('feedbackChoiceRegion', new RadioView({ model: this.feedbackChoiceModel }));
    this.showChildView('enterFeedbackRegion', new TextareaView({ model: this.enterFeedbackModel }));

    const ele = this.getUI('fadeIn');
    // Trigger a re-flow to restart animation
    ele.removeClass('util__fade-in');
    if (ele.length) ele[0].offsetLeft;
    ele.addClass('util__fade-in');
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body intake-rating-modal">
            
            <div className="animation-content">
              <span className="intake-rating-modal__title">Before you go!</span>
              <p className="intake-rating-modal__description">How satisfied are you with your experience using this online service to submit your application for dispute resolution?</p>
              <div className="intake-rating-modal__feedback"></div>
              <div className="intake-rating-modal__enter-feedback"></div>
            </div>

            <button className="btn btn-lg btn-primary btn-continue continue-button" onClick={() => this.submitFeedback()}>Submit Feedback</button>
          </div>
        </div>
      </div>
    );
  }

});
  
_.extend(IntakeRatingModal.prototype, ViewJSXMixin);
export default IntakeRatingModal;