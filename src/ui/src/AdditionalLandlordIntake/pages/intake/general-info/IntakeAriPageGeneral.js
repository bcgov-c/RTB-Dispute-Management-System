import Radio from 'backbone.radio';
import IntakePageGeneralBase from './IntakePageGeneralBase';
import { ari_config } from './intake_general_page_config';
import template from './IntakeAriPageGeneral_template.tpl';

const disputeChannel = Radio.channel('dispute');
const geozoneChannel = Radio.channel('geozone');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

export default IntakePageGeneralBase.extend({
  template,

  pageItemsConfig: ari_config,

  regions() {
    return Object.assign({}, IntakePageGeneralBase.prototype.regions, {
      repairsInPastQuestion: '#p1-repairsInPastQuestion',
      repairsAllowedQuestion: '#p1-repairsAllowedQuestion',
      expectedRepairsQuestion: '#p1-expectedRepairsQuestion',
    });
  },

  ui() {
    return Object.assign({}, IntakePageGeneralBase.prototype.ui.call(this), {
      repairsInPastWarning: '#p1-repairsInPastQuestion-warning',
      repairsAllowedWarning: '#p1-repairsAllowedQuestion-warning',
      expectedRepairsWarning: '#p1-expectedRepairsQuestion-warning',
    });
  },

  createPageItems() {
    IntakePageGeneralBase.prototype.createPageItems.call(this);
    const rentalAddress = this.getPageItem('rentalAddress');
    if (rentalAddress) {
      rentalAddress.helpHtml = `If you are seeking an additional rent increase for more than one rental unit or site, please provide the street address of the residential property as you will be able to provide the address of the individual units later in the application process.`;
    }
  },

  showRepairsInPastWarning() {
    this._showOrHideWarning('repairsInPastWarning', true);
  },

  hideRepairsInPastWarning() {
    this._showOrHideWarning('repairsInPastWarning', false);
  },

  showRepairsAllowedWarning() {
    this._showOrHideWarning('repairsAllowedWarning', true);
  },

  hideRepairsAllowedWarning() {
    this._showOrHideWarning('repairsAllowedWarning', false);
  },

  showExpectedRepairsWarning() {
    this._showOrHideWarning('expectedRepairsWarning', true);
  },

  hideExpectedRepairsWarning() {
    this._showOrHideWarning('expectedRepairsWarning', false);
  },

  setupFlows() {
    const dispute = disputeChannel.request('get');
    const propertyType = this.getPageItem('propertyType');
    const manufacturedHomeType = this.getPageItem('manufacturedHomeType');
    const dispute_type_rta = configChannel.request('get', 'DISPUTE_TYPE_RTA');
    const dispute_type_mhpta = configChannel.request('get', 'DISPUTE_TYPE_MHPTA');
    const repairsInPastQuestion = this.getPageItem('repairsInPastQuestion');
    const repairsAllowedQuestion = this.getPageItem('repairsAllowedQuestion');
    const expectedRepairsQuestion = this.getPageItem('expectedRepairsQuestion');

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
        this.hideAndCleanPageItem('repairsInPastQuestion', options);
        this.hideAndCleanPageItem('repairsAllowedQuestion', options);
        this.hideAndCleanPageItem('expectedRepairsQuestion', options);

        this.hideRepairsInPastWarning();
        this.hideRepairsAllowedWarning();
        this.hideExpectedRepairsWarning();
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
      if (rentalAddress.stepComplete) {
        this.hideOutOfBCWarning();
        if (options && options.triggered_on_show) {
          this.showPageItem('repairsInPastQuestion', options);
        } else {
          // Perform a geozone lookup on the address, and only continue when that has returned
          loaderChannel.trigger('page:load');
          geozoneChannel.request('lookup:address', rentalAddress.getModel().getGeozoneAddressString({
            no_province: true,
            no_country: true
          }));
          this.listenToOnce(geozoneChannel, 'lookup:address:complete', function(geozone_val) {
            rentalAddress.getModel().set('geozone_id', geozone_val);
            if (geozone_val === configChannel.request('get', 'INVALID_GEOZONE_CODE')) {
              this.showOutOfBCWarning();
            }
            loaderChannel.trigger('page:load:complete');
            this.showPageItem('repairsInPastQuestion', options);
          }, this);
        }
      }
    }, this);

    this.listenTo(repairsInPastQuestion, 'itemComplete', function(options) {
      const answer = repairsInPastQuestion.getModel().get('question_answer');
      
      if (answer === "1") {
        this.showRepairsInPastWarning();
      } else {
        this.hideRepairsInPastWarning();
      }

      if (repairsInPastQuestion.stepComplete) {
        this.showPageItem('repairsAllowedQuestion', options);
      }
    }, this);


    this.listenTo(repairsAllowedQuestion, 'itemComplete', function(options) {
      const answer = repairsAllowedQuestion.getModel().get('question_answer');
      
      if (answer === "0") {
        this.showRepairsAllowedWarning();
        this.hideAndCleanPageItem('expectedRepairsQuestion', options);
        this.hideNextButton();
      } else {
        this.hideRepairsAllowedWarning();
        if (repairsAllowedQuestion.stepComplete) {
          this.showPageItem('expectedRepairsQuestion', options);
        }
      }

    }, this);


    this.listenTo(expectedRepairsQuestion, 'itemComplete', function(options) {
      const answer = expectedRepairsQuestion.getModel().get('question_answer');
      
      if (answer === "1") {
        this.showExpectedRepairsWarning();
      } else {
        this.hideExpectedRepairsWarning();
      }

      if (expectedRepairsQuestion.stepComplete) {
        this.showNextButton(options);
      }
    }, this);    
  },

  templateContext() {
    const repairsInPastQuestion = this.getPageItem('repairsInPastQuestion');
    const repairsAllowedQuestion = this.getPageItem('repairsAllowedQuestion');
    const expectedRepairsQuestion = this.getPageItem('expectedRepairsQuestion');

    return Object.assign({}, IntakePageGeneralBase.prototype.templateContext.call(this), {
      showRepairsInPastWarning: repairsInPastQuestion && repairsInPastQuestion.getModel().get('question_answer') === "1",
      showRepairsAllowedWarning: repairsAllowedQuestion && repairsAllowedQuestion.getModel().get('question_answer') === "0",
      showExpectedRepairsError: expectedRepairsQuestion && expectedRepairsQuestion.getModel().get('question_answer') === "1"
    });
  }
});
