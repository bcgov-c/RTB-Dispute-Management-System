import React from 'react';
import ModalBaseView from '../../modals/ModalBase';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import StepOneIcon from '../../../static/BIG_01WhatsNext.png';
import StepTwoIcon from '../../../static/BIG_02OneArb.png';
import StepThreeIcon from '../../../static/BIG_03OneHour.png';
import StepFourIcon from '../../../static/BIG_04Relevant.png';
import StepSelectedDot from '../../../static/BIG_DotSelected.png';
import StepNotSelectedDot from '../../../static/BIG_DotNotSelected.png';
import './ModalIntakeIssueIntervention.scss';

const STEP_ONE_TITLE = 'What\'s next?';
const STEP_TWO_TITLE = 'One Arbitrator';
const STEP_THREE_TITLE = 'One Hour';
const STEP_FOUR_TITLE = 'Relevant Evidence';

const STEP_ONE_TEXT = 'You may now add evidence to support your case, but first, here are some things you should know.';
const STEP_TWO_TEXT = 'Your case will be assigned to <b>one of 40 arbitrators</b>. Your arbitrator will <b>decide the outcome</b> of your case.';
const STEP_THREE_TEXT = 'Your arbitrator will consider <b>relevant evidence</b> from both sides during your hearing. Most hearings are completed within <b>one hour</b>.';
const STEP_FOUR_TEXT = '<b>Duplicate</b> or <b>unnecessary</b> evidence will not help your case. Each piece of evidence should provide <b>new relevant information</b>. Give your evidence clear file names and descriptions.';

const STEP_FOUR = 4;

const InterventionModal = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.currentStep = 1;
    this.stepObj = {
      1: {
        title: STEP_ONE_TITLE,
        description: STEP_ONE_TEXT,
        img: StepOneIcon
      },
      2: {
        title: STEP_TWO_TITLE,
        description: STEP_TWO_TEXT,
        img: StepTwoIcon
      },
      3: {
        title: STEP_THREE_TITLE,
        description: STEP_THREE_TEXT,
        img: StepThreeIcon
      },
      4: {
        title: STEP_FOUR_TITLE,
        description: STEP_FOUR_TEXT,
        img: StepFourIcon
      }
    };
  },

  onRender() {
    const ele = this.getUI('fadeIn');
    // Trigger a re-flow to restart animation
    ele.removeClass('util__fade-in');
    if (ele.length) ele[0].offsetLeft;
    ele.addClass('util__fade-in');
  },

  clickNext() {
    if (this.currentStep === STEP_FOUR) {
      return this.trigger('continue');
    }
    this.currentStep++;
    this.render();
  },

  id: 'intervention_modal',

  ui() {
    return Object.assign(ModalBaseView.prototype.ui, {
      fadeIn: '.animation-content',
    });
  },

  template() {
    const title = this.stepObj[this.currentStep].title;
    const description = this.stepObj[this.currentStep].description;
    const image = this.stepObj[this.currentStep].img;

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body intervention-modal">
            
            <div className="animation-content">
              <span className="intervention-modal__title">{title}</span>
              <img className="intervention-modal__img" src={image} />
              <span className="intervention-modal__text" dangerouslySetInnerHTML={{ __html: description }}></span>
            </div>

            <div className="intervention-modal__progress-icons">{this.getJsxStepSelectedDots()}</div>
            <div className="intervention-modal__button__container">
              <button className="btn btn-lg btn-primary btn-continue continue-button intervention-modal__button" onClick={() => this.clickNext()}>{this.currentStep === STEP_FOUR ? 'I understand' : 'Continue'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  },

  getJsxStepSelectedDots() {
    return [1,2,3,4].map((index) => {
      if (index === this.currentStep) return <img src={StepSelectedDot} />;
      else return <img src={StepNotSelectedDot} />;
    });
  }
})

_.extend(InterventionModal.prototype, ViewJSXMixin);
export default InterventionModal;