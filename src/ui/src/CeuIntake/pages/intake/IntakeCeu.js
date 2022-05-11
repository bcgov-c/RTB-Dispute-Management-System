import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import MenuCollection from '../../components/menu/Menu_collection';
import MenuView from '../../components/menu/Menu';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import IntakeCeuPageGeneral from './ceu-general/IntakeCeuPageGeneral';
import IntakeCeuPageApplicants from './ceu-applicants/IntakeCeuPageApplicants';
import IntakeCeuPageApplicantOptions from './ceu-applicant-options/IntakeCeuPageApplicantOptions';
import IntakeCeuPageRespondents from './ceu-respondents/IntakeCeuPageRespondents';
import IntakeCeuPageUnits from './ceu-units/IntakeCeuPageUnits';
import IntakeCeuPageContraventions from './ceu-contraventions/IntakeCeuPageContraventions';
import IntakeCeuPageContraventionInfo from './ceu-contraventions/IntakeCeuPageContraventionInfo';
import IntakeCeuPageReview from './ceu-review/IntakeCeuPageReview';
import IntakeCeuPageReceipt from './ceu-receipt/IntakeCeuPageReceipt';

const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');

const IntakeCeu = Marionette.View.extend({
  id: "intake-content-container",

  regions: {
    menuRegion: {
      el: '#menu-region',
      replaceElement: true
    },
    intakeRegion: '#intake-content'
  },

  initialize(options={}) {
    this.template = this.template.bind(this);
    if (!options || !options.parent) {
      console.debug('[Warning] IntakeView needs parent reference');
    }
    this.parent = options.parent;
    
    this.menuCollection = new MenuCollection([
      { step: 1, text: 'General' },
      { step: 2, text: 'Your Information' },
      { step: 3, text: 'Contact Information' },
      { step: 4, text: 'Respondent(s)' },
      { step: 5, text: 'Rental Unit(s)' },
      { step: 6, text: 'Contravention(s)' },
      { step: 7, text: 'Details & Evidence' },
      { step: 8, text: 'Review & Submit' },
      { step: 9, text: 'Confirmation' },
    ]);
  },

  onRender() {
    menuChannel.trigger('enable:mobile');
    const menuView = new MenuView({ collection: this.menuCollection });
    this.showChildView('menuRegion', menuView);

    // Initiailze headers for all future pages, once we have the intake-content loaded
    this.$el.initializeFloatingHeaders();
  },

  _showIntakeStep(intakeStepViewClass, step_number) {
    // Clear any running animations on the page, as we are switching
    animationChannel.request('clear');

    // Clear any loaders
    loaderChannel.trigger('page:load:complete');

    this.parent.showIntakeView();

    // Refresh the menu
    this.menuCollection.setActiveStep(step_number);

    this.getChildView('menuRegion').render();

    // Get active CEU data model
    const newView = new intakeStepViewClass({
      model: this.parent.getActiveCeuModel()
    });
    this.showChildView('intakeRegion', newView);
  },


  // Routing functions
  showIntakeCeuGeneral() {
    this._showIntakeStep(IntakeCeuPageGeneral, 1);
  },

  showIntakeCeuApplicants() {
    this._showIntakeStep(IntakeCeuPageApplicants, 2);
  },

  showIntakeCeuApplicantOptions() {
    this._showIntakeStep(IntakeCeuPageApplicantOptions, 3);
  },

  showIntakeCeuRespondents() {
    this._showIntakeStep(IntakeCeuPageRespondents, 4);
  },

  showIntakeCeuUnits() {
    this._showIntakeStep(IntakeCeuPageUnits, 5);
  },

  showIntakeCeuContraventions() {
    this._showIntakeStep(IntakeCeuPageContraventions, 6);
  },

  showIntakeCeuContraventionInfo() {
    this._showIntakeStep(IntakeCeuPageContraventionInfo, 7);
  },

  showIntakeCeuReview() {
    this._showIntakeStep(IntakeCeuPageReview, 8);
  },

  showIntakeCeuReceipt() {
    this._showIntakeStep(IntakeCeuPageReceipt, 9);
  },

  handleRouterLogin() {

  },


  /* Intake router uses these functions to check page in progress */
  getPageApiUpdates() {
    const intakeView = this.getChildView('intakeRegion');

    if (!intakeView || !intakeView.$el.is(':visible')) {
      return [];
    } else {
      return intakeView.getPageApiUpdates();
    }
  },

  getCurrentViewRoutingFragment() {
    const intakeView = this.getChildView('intakeRegion');
    return intakeView && typeof intakeView.getRoutingFragment === 'function' ? intakeView.getRoutingFragment() : null;
  },

  cleanupPageInProgress() {
    const intakeView = this.getChildView('intakeRegion');
    return intakeView && typeof intakeView.cleanupPageInProgress === 'function' ? intakeView.cleanupPageInProgress() : null;
  },

  template() {
    return <>
      <div id="menu-region"></div>
      <div id="intake-content"></div>
    </>;
  }

});


_.extend(IntakeCeu.prototype, ViewJSXMixin);
export default IntakeCeu;
