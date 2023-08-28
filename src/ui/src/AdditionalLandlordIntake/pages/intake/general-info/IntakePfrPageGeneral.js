import Radio from 'backbone.radio';
import IntakePageGeneralBase from './IntakePageGeneralBase';
import { pfr_config } from './intake_general_page_config';
import template from './IntakePfrPageGeneral_template.tpl';

const disputeChannel = Radio.channel('dispute');
const geozoneChannel = Radio.channel('geozone');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

export default IntakePageGeneralBase.extend({
  template,

  pageItemsConfig: pfr_config,

  regions() {
    return Object.assign({}, IntakePageGeneralBase.prototype.regions, {
      havePermitsQuestion: '#p1-havePermitsQuestion',
      evictionsRequiredQuestion: '#p1-evictionsRequiredQuestion',
    });
  },

  ui() {
    return Object.assign({}, IntakePageGeneralBase.prototype.ui.call(this), {
      havePermitsWarning: '#p1-havePermitsQuestion-warning',
      evictionsRequiredWarning: '#p1-evictionsRequiredQuestion-warning',
    });
  },

  createPageItems() {
    IntakePageGeneralBase.prototype.createPageItems.call(this);
    const rentalAddress = this.getPageItem('rentalAddress');
    if (rentalAddress) {
      rentalAddress.stepText = `What is the address of the rental unit or site where you are seeking possession for renovation?`;
      rentalAddress.helpHtml = `If you are seeking possession of more than one rental unit or site, please provide the street address of the residential property or manufactured home park as you will be able to provide the address of individual rental units/sites later in the application process.`;
    }
  },

  showHavePermitsWarning() {
    this._showOrHideWarning('havePermitsWarning', true);
  },

  hideHavePermitsWarning() {
    this._showOrHideWarning('havePermitsWarning', false);
  },

  showEvictionsRequiredWarning() {
    this._showOrHideWarning('evictionsRequiredWarning', true);
  },

  hideEvictionsRequiredWarning() {
    this._showOrHideWarning('evictionsRequiredWarning', false);
  },

  setupFlows() {
    const dispute = disputeChannel.request('get');
    const propertyType = this.getPageItem('propertyType');
    const manufacturedHomeType = this.getPageItem('manufacturedHomeType');
    const dispute_type_rta = configChannel.request('get', 'DISPUTE_TYPE_RTA');
    const dispute_type_mhpta = configChannel.request('get', 'DISPUTE_TYPE_MHPTA');
    const havePermitsQuestion = this.getPageItem('havePermitsQuestion');
    const evictionsRequiredQuestion = this.getPageItem('evictionsRequiredQuestion');

    const touRegion = this.getPageItem('touRegion');
    this.listenTo(touRegion, 'itemComplete', function(options) {
      if (touRegion.stepComplete) {
        this.showPageItem('propertyType', options);
      }
    }, this);

    this.listenTo(propertyType, 'itemComplete', function(options) {
      const answer = propertyType.getModel().getData();
      const manufacturedHomeAnswer = manufacturedHomeType.getModel().getData();
      animationChannel.request('clearElement', manufacturedHomeType.$el);
      if (answer === "1") { // If MHPTA property type
        // Check if they own home or not
        dispute.set('dispute_type', manufacturedHomeAnswer === "1" ? dispute_type_mhpta : dispute_type_rta);
        this.showPageItem('manufacturedHomeType', options);
      } else if (answer === "0") { // RTA
        dispute.set('dispute_type', dispute_type_rta);

        const manufacturedHomeTypeModel = this.getPageItem('manufacturedHomeType').getModel();
        manufacturedHomeTypeModel.set('question_answer', null);

        this.hideAndCleanPageItem('manufacturedHomeType', options);
        this.hideMhptaWarning();
        this.showPageItem('rentalAddress', options);
      }
    }, this);

    this.listenTo(manufacturedHomeType, 'itemComplete', function(options) {
      const answer = manufacturedHomeType.getModel().getData();
      if (answer === "1") {
        this.hideAndCleanPageItem('rentalAddress', options);
        this.hideAndCleanPageItem('havePermitsQuestion', options);
        this.hideAndCleanPageItem('evictionsRequiredQuestion', options);

        this.hideHavePermitsWarning();
        this.hideEvictionsRequiredWarning();
        this.hideNextButton();
        this.showMhptaWarning();
      } else {
        this.hideMhptaWarning();
        if (manufacturedHomeType.stepComplete) {
          this.showPageItem('rentalAddress', options);
        }
      }
    }, this);


    const rentalAddress = this.getPageItem('rentalAddress');
    this.listenTo(rentalAddress, 'itemComplete', function(options) {
      if (rentalAddress.stepComplete && !rentalAddress?.subView?.model?.get('addressIsValidated')) {
        this.showOutOfBCWarning();
      } else {
        this.hideOutOfBCWarning();
      }

      this.showPageItem('havePermitsQuestion', options);
    }, this);
    
    this.listenTo(havePermitsQuestion, 'itemComplete', function(options) {
      const answer = havePermitsQuestion.getModel().get('question_answer');
      
      if (answer === "0") {
        this.showHavePermitsWarning();
      } else {
        this.hideHavePermitsWarning();
      }

      if (havePermitsQuestion.stepComplete) {
        this.showPageItem('evictionsRequiredQuestion', options);
      }
    }, this);


    this.listenTo(evictionsRequiredQuestion, 'itemComplete', function(options) {
      const answer = evictionsRequiredQuestion.getModel().get('question_answer');
      
      if (answer === "0") {
        this.showEvictionsRequiredWarning();
      } else {
        this.hideEvictionsRequiredWarning();
      }

      if (evictionsRequiredQuestion.stepComplete) {
        this.showNextButton(options);
      }
    }, this);    
  },

  templateContext() {
    const havePermitsQuestion = this.getPageItem('havePermitsQuestion');
    const evictionsRequiredQuestion = this.getPageItem('evictionsRequiredQuestion');

    return Object.assign({}, IntakePageGeneralBase.prototype.templateContext.call(this), {
      showHavePermitsWarning: havePermitsQuestion && havePermitsQuestion.getModel().get('question_answer') === "0",
      showEvictionsRequiredWarning: evictionsRequiredQuestion && evictionsRequiredQuestion.getModel().get('question_answer') === "0",
    });
  }
});
