import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import AddressView from '../../../../core/components/address/Address';
import DoubleSelectorView from '../../../../core/components/double-selector/DoubleSelector';
import PageItemView from '../../../../core/components/page/PageItem';
import RadioView from '../../../../core/components/radio/Radio';
import Checkboxes from '../../../../core/components/checkbox/Checkboxes';
import Question from '../../../../core/components/question/Question';
import Input from '../../../../core/components/input/Input';
import CeuEvidence from '../../../components/evidence/CeuEvidence';

const DATE_WARNING_MSG = `You have entered a move out date that is over two years ago. The CEU may not have jurisdiction and may not be able to assist with this matter. If you decide to continue with this matter, be aware that issues that occurred more than two years ago may not be considered.`;

const configChannel = Radio.channel('config');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const IntakeCeuUnit = Marionette.View.extend({
  
  initialize(options) {
    this.mergeOptions(options, ['baseName', 'enableUnitType']);
    this.template = this.template.bind(this);

    this.baseName = this.baseName || 'Rental Unit/Site';
    this.unitName = this.baseName;
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.model.get('hasUnitTypeModel'), 'change:value', (model, value) => {
      const mailingAddressView = this.getChildView('unitTypeRegion');
      
      if (mailingAddressView && mailingAddressView.isRendered()) {
        mailingAddressView.triggerMethod( value ? 'show' : 'hide', { no_animate: true });
      }
    });

    this.listenTo(this.model.get('hasCurrentTenant'), 'change:question_answer', (model, value) => {
      const tenancyEndDateView = this.getChildView('tenancyEndDateRegion');
      tenancyEndDateView.getModel().set('required', !value);
      tenancyEndDateView.triggerMethod( value === 0 ? 'show' : 'hide', { no_animate: true });
    });

    this.listenTo(this.model.get('hasTenancyAgreement'), 'change:question_answer', (model, value) => {
      const tenancyAgreementUploadView = this.getChildView('tenancyAgreementUploadRegion');
      tenancyAgreementUploadView.triggerMethod( value ? 'show' : 'hide', { no_animate: true });
    });

    this.listenTo(this.model.get('tenancyEndDate'), 'change:value', model => this.checkAndShowDateWarning(model));

    if (this.model.collection) {
      // Any time a model is added or removed, refresh all views in collection to ensure correct header numbering
      this.listenTo(this.model.collection, 'update', () => this.render());
    }
  },

  checkAndShowDateWarning() {
    const tenancyEndDateModel = this.model.get('tenancyEndDate');
    const CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS = configChannel.request('get', 'CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS') || 0;
    if (!CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS) return;
    const date = tenancyEndDateModel.isValid() && tenancyEndDateModel.getData({ parse: true });
    const isDatePastLimitation = date ? Moment(date).add(CEU_ISSUE_LATEST_OCCURRENCE_MAX_YEARS, 'years').isBefore(Moment(), 'days') : false;
    if (isDatePastLimitation) {
      this.getUI('dateWarning').html(DATE_WARNING_MSG).show();
    } else {
      this.getUI('dateWarning').html('').hide();
    }
  },

  clickDelete() {
    modalChannel.request('show:standard', {
      title: 'Delete Rental Unit',
      bodyHtml: `<p>Are you sure you want to delete rental unit ${this.unitName}? Any information that you have entered will be deleted?</p>`,
      primaryButtonText: 'Delete',
      onContinueFn: (modalView) => {
        modalView.close();
        this.model.trigger('click:delete', this.model);
      },
    });
  },

  showErrorMessage(participant_error) {
    console.info(`[Info] participant object error`, participant_error);
  },

  validateAndShowErrors() {
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      let childView = this.getChildView(region);
      if (!childView) {
        return;
      }
      if (childView instanceof PageItemView) {
        childView = childView.subView;
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

      is_valid = childView.validateAndShowErrors() && is_valid;
    }, this);

    return is_valid;
  },

  onBeforeRender() {
    const collection = this.model.collection;
    const unitIndex = collection ? collection.indexOf(this.model) : -1;
    const displayIndex = unitIndex !== -1 ? unitIndex + 1 : '';
    this.unitName = `${this.baseName} ${Formatter.toLeftPad(displayIndex, '0', 2)}`;

    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },
  

  onRender() {
    this.showChildView('addressRegion', new AddressView({ model: this.model.get('addressModel') }));
    
    this.renderPageItem('hasUnitTypeRegion', new PageItemView({
      stepText: 'If the rental unit is part of a larger residential property with a shared address, does it have a unique unit identifier (i.e., basement, upper, lower, coach house, etc.)?',
      subView: new RadioView({ model: this.model.get('hasUnitTypeModel') }),
      helpHtml: 'This might mean a basement suite, room rental, upper home, lower home, coach house or laneway.'
    }), this.enableUnitType);

    
    this.renderPageItem('unitTypeRegion', new PageItemView({
      stepText: 'Please provide a description of the unit (i.e., basement suite, upper home, lower home, etc.)',
      subView: new DoubleSelectorView({ model: this.model.get('rentDescriptionModel') })
    }), this.enableUnitType && this.model.isSharedAddressSelected());

    this.renderPageItem('numTenantsRegion', new PageItemView({
      stepText: `How many people live or lived in the unit/site?`,
      subView: new Input({ model: this.model.get('numTenantsModel') }),
    }), true);

    this.renderPageItem('tenantsRegion', new PageItemView({
      stepText: this.model.get('applicantSelectText'),
      subView: new Checkboxes({ collection: this.model.get('participantCheckboxes') }),
      helpHtml: this.model.get('applicantSelectHelp'),
    }), this.model.get('selectableTenants')?.length);

    this.renderPageItem('tenancyEndedRegion', new PageItemView({
      stepText: 'Is there at least one tenant associated to this complaint still living in the unit?',
      subView: new Question({ model: this.model.get('hasCurrentTenant') })
    }), true);

    this.renderPageItem('tenancyEndDateRegion', new PageItemView({
      stepText: 'When did the last tenant associated with this complaint move out of this rental unit/site?',
      subView: new Input({ model: this.model.get('tenancyEndDate') })
    }), this.model.get('r_tenancy_ended'));

    this.renderPageItem('tenancyAgreementRegion', new PageItemView({
      stepText: 'Do you have a copy of the tenancy agreement?',
      subView: new Question({ model: this.model.get('hasTenancyAgreement') }),
      helpHtml: `Accepted file formats include text, PDF, Word, or a photo (JPEG or PNG).`,
    }), true);
    this.renderPageItem('tenancyAgreementUploadRegion', new PageItemView({
      stepText: 'Please upload a copy of the tenancy agreement',
      subView: new CeuEvidence({
        model: this.model.get('tenancyAgreementEvidence'),
      })
    }), this.model.get('r_has_tenancy_agreement'));

    // Do a dummy scroll in order to make sure floating headers are correct on re-renders
    this.$el.closest('.persist-area').scroll();

    // Trigger the show/hide handlers again to ensure correct view state
    this.model.get('hasUnitTypeModel').trigger('change:value', this.model.get('hasUnitTypeModel'), this.model.get('hasUnitTypeModel').get('value'));
    this.model.get('hasCurrentTenant').trigger('change:question_answer', this.model.get('hasCurrentTenant'), this.model.get('hasCurrentTenant').get('question_answer'));
    this.model.get('hasTenancyAgreement').trigger('change:question_answer', this.model.get('hasTenancyAgreement'), this.model.get('hasTenancyAgreement').get('question_answer'));

    if (!this.model.get('hasCurrentTenant').getData({ parse: true })) this.checkAndShowDateWarning();
  },

  renderPageItem(regionId, pageItem, showItem=false) {
    this.showChildView(regionId, pageItem);
    if (showItem && pageItem) {
      pageItem.triggerMethod('show', { no_animate: true });
    }
  },

  className: 'intake-participant',

  regions: {
    addressRegion: '.participant-address',
    hasUnitTypeRegion: '.participant-use-mail',
    unitTypeRegion: '.participant-mailing-address',
    tenantsRegion: '.intake-ceu-unit__tenants',
    numTenantsRegion: '.intake-ceu-unit__num-tenants',
    tenancyEndedRegion: '.intake-ceu-unit__tenancy-ended',
    tenancyEndDateRegion: '.intake-ceu-unit__tenancy-end-date',
    tenancyAgreementRegion: '.intake-ceu-unit__ta-question',
    tenancyAgreementUploadRegion: '.intake-ceu-unit__ta-upload',
  },

  ui: {
    delete: '.participant-delete-icon',
    dateWarning: '.intake-ceu-unit__tenancy-end-date__warning',
  },

  events: {
    'click @ui.delete': 'clickDelete'
  },

  template() {
    const hasUnitType = this.model.isSharedAddressSelected();
    const showTenantSelect = this.model.get('selectableTenants')?.length;
    
    return <div className="intake-ceu-unit" data-header-extend="15">
      <div className="participant-section section-header persist-header">
        <div>
          {this.unitName}
          <span className="participant-delete-icon general-delete-icon"></span>
        </div>
      </div>
      
      <div className="participant-address"></div>

      <div className="participant-use-mail"></div>
      <div className={`participant-mailing-address ${hasUnitType ? '' : 'hidden-address'}`}></div>

      <div className="intake-ceu-unit__num-tenants"></div>
      <div className="intake-ceu-unit__tenants-container">
        <div className="intake-ceu-unit__tenants"></div>
        {showTenantSelect ? <a className="general-link" href="#page/2">{this.model.get('applicantSelectLinkText')}</a> : null}
      </div>

      <div className="intake-ceu-unit__tenancy-ended"></div>
      <div className="intake-ceu-unit__tenancy-end-date"></div>
      <div className="intake-ceu-unit__tenancy-end-date__warning error-block warning hidden-item"></div>

      <div className="intake-ceu-unit__ta-question"></div>
      <div className="intake-ceu-unit__ta-upload"></div>
    </div>
  },
  
});

_.extend(IntakeCeuUnit.prototype, ViewJSXMixin);
export default IntakeCeuUnit;
