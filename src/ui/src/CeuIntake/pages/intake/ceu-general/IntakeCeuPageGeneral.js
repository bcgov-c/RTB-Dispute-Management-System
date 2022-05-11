import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import Checkbox_model from '../../../../core/components/checkbox/Checkbox_model';
import PageItemView from '../../../../core/components/page/PageItem';
import Question_model from '../../../../core/components/question/Question_model';
import Checkbox from '../../../../core/components/checkbox/Checkbox';
import Question from '../../../../core/components/question/Question';
import CeuPage from '../../../components/page/CeuPage';
import CEU_TOU_template from './CEU_TOU_template.tpl';

const touLinkClass = 'accepted-terms-link';

const applicationChannel = Radio.channel('application');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

const IntakeCeuPageGeneral = CeuPage.extend({
  
  initialize(options) {
    CeuPage.prototype.initialize.call(this, options);
    this.template = this.template.bind(this);
    
    this.INTAKE_URL = configChannel.request('get', 'INTAKE_URL') || '#';
    this.RTA_CODE = configChannel.request('get', 'CEU_TYPE_RTA');
    this.MHPTA_CODE = configChannel.request('get', 'CEU_TYPE_MHPTA');

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    this.savedJsonData = IntakeCeuDataParser.toJSON();

    this.createPageItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 1);
  },

  getPageApiUpdates() {
    const currentData = this.getApiSaveData();
    let hasUpdates = false;
    Object.keys(currentData).forEach(key => {
      if (hasUpdates) return;
      if (String(currentData[key]) !== String(this.savedJsonData[key])) hasUpdates = true;
    });

    return hasUpdates ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/1';
  },

  createPageItems() {
    this.first_view_id = 'touRegion';
    
    const step1HasProgress = this.savedJsonData.g_accepted_tou;

    this.touModel = new Checkbox_model({
      html: `<span class="accepted-terms-content">I have read and understood the Residential Tenancy Branch's Compliance and Enforcement Unit online systems </span><span class="${touLinkClass}">Terms of Use</span>`,
      disabled: !!step1HasProgress,
      checked: !!step1HasProgress,
      required: true,
      ignoredLinkClass: touLinkClass,
    });
    this.addPageItem('touRegion', new PageItemView({
      stepText: null,
      subView: new Checkbox({ model: this.touModel }),
      stepComplete: this.touModel.isValid()
    }));


    this.propertyModel = new Question_model({
      optionData: [{ name: 'property-type-rta', value: this.RTA_CODE, cssClass: 'option-button property-type-rta', text: 'A home, suite, hotel, apartment, or independent living care home' },
          { name: 'property-type-mhpta', value: this.MHPTA_CODE, cssClass: 'option-button property-type-mhpta', text: 'A site in a manufactured home park, RV park or extended stay camp site' }],
      question_answer: this.savedJsonData.g_complaint_type === this.MHPTA_CODE || this.savedJsonData.g_owns_home === false ? this.MHPTA_CODE : this.savedJsonData.g_complaint_type,
    });
    this.addPageItem('propertyRegion', new PageItemView({
      stepText: 'What type of rental unit(s) are associated to this complaint?',
      helpHtml: 'To confirm that the Compliance and Enforcement Unit has authority to investigate your complaint, visit <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/compliance-and-enforcement">our website</a>. <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Contact the Residential Tenancy Branch</a> if you have questions about the type of rental unit.',
      subView: new Question({ model: this.propertyModel }),
      stepComplete: this.propertyModel.isValid()
    }));

    this.ownsHomeModel = new Question_model({
      optionData: [{ name: 'tenancy-address-confirm-no', value: false, cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'tenancy-address-confirm-yes', value: true, cssClass: 'option-button yes-no', text: 'YES'}],
      question_answer: this.savedJsonData.g_owns_home ? true :
        (this.savedJsonData.g_owns_home === false ? false : null),
    });
    this.addPageItem('ownsHomeRegion', new PageItemView({
      stepText: 'Does the tenant own the manufactured home or RV on the rented site?',
      helpHtml: `This determines which law applies to the tenancy. If the tenant owns the manufactured home or RV and rents the site the home sits on, the <i>Manufactured Home Park Tenancy Act</i> applies. If the tenant rents the manufactured home or RV, the <i>Residential Tenancy Act</i> applies.`,
      subView: new Question({ model: this.ownsHomeModel }),
      stepComplete: this.ownsHomeModel.get('question_answer') !== null,
    }));


    // Q2 RTB Matter
    this.rtbMatterModel = new Question_model({
      optionData: [{ name: 'rtb-matter-confirm-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'rtb-matter-confirm-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      question_answer: this.savedJsonData.g_complaint_rtb_matter === true ? '0' : null,
      warningValidator: (questionAnswer) => {
        if (questionAnswer === "1") {
          return `<p>The Compliance and Enforcement Unit does not award monetary or possession orders.</p>
            <p>Orders for possession or money can be obtained through the Residential Tenancy Branch by <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online">applying for dispute resolution</a>.</p>
            <p>Residential Tenancy Branch orders are enforced through the Provincial Courts. Learn more about <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/serving-and-enforcing-orders">enforcing orders</a>.</p>
          `;
        }
      }
    });
    this.addPageItem('rtbMatterRegion', new PageItemView({
      stepText: `<div style="float:left;width:calc(100% - 35px);">Are you looking for any of the following?
        <ul>
          <li>A monetary order for compensation or loss associated to the rental unit(s)/site(s)</li>
          <li>An order of possession for the rental unit(s)/site(s)</li>
          <li>Assistance in enforcing awarded monetary or possession order(s)</li>
        </ul>
      </div>`,
      helpHtml: `<p>Orders for possession or money can be obtained through the Residential Tenancy Branch by <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online">applying for dispute resolution</a>.</p>
        <p>Residential Tenancy Branch orders are enforced through the Provincial Courts. Learn more about <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/solving-problems/dispute-resolution/after-the-hearing/serving-and-enforcing-orders">enforcing orders</a>.</p>`,
      subView: new Question({ model: this.rtbMatterModel }),
      stepComplete: this.rtbMatterModel.get('question_answer') !== null,
    }));

    // Q3 CEU Matter
    this.ceuMatterModel = new Question_model({
      optionData: [{ name: 'ceu-matter-confirm-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'ceu-matter-confirm-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      question_answer: this.savedJsonData.g_complaint_rtb_matter === true ? '1' : null,
      warningValidator: (questionAnswer) => {
        if (questionAnswer === "0") {
          return `If this complaint does not meet the criteria set out in the British Columbia tenancy laws, the Compliance and Enforcement Unit will not open an investigation file. If you have any questions, contact the <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/contact-the-residential-tenancy-branch">Residential Tenancy Branch</a>.`
        }
      }
    });
    this.addPageItem('ceuMatterRegion', new PageItemView({
      stepText: `Is this complaint about an action causing a major health, safety or housing concern, or an intentional, repeated or continuous action contravening <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/calculators-and-resources/the-law">British Columbia tenancy laws</a>?`,
      helpHtml: `Examples of serious contraventions of <a class="static-external-link" href="javascript:;" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/calculators-and-resources/the-law">British Columbia tenancy laws</a> may include:
      <ul>
        <li>Denying access to a rental unit or site</li>
        <li>Not completing emergency repairs after being ordered to do so</li>
        <li>Significantly damaging a rental unit or site</li>
      </ul>`,
      subView: new Question({ model: this.ceuMatterModel }),
      stepComplete: this.ceuMatterModel.get('question_answer') !== null,
    }));

    // Q4 Emergency
    this.emergencyModel = new Question_model({
      optionData: [{ name: 'emergency-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'emergency-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      question_answer: this.savedJsonData.g_complaint_is_emergency === true ? '1' :
        this.savedJsonData.g_complaint_is_emergency === false ? '0' : null,
      warningValidator: (questionAnswer) => {
        if (questionAnswer === "1") {
          return `<p>Choosing this option could expedite the assessment process on this complaint. If this complaint does not meet the above criteria, it will be closed and you may resubmit a standard complaint, losing your current position in the queue.</p>
          <p>You may also consider filing for a dispute resolution hearing <a class="static-external-link" href="javascript:;" url="${this.INTAKE_URL}">here</a>.</p>`
        }
      }
    });
    this.addPageItem('emergencyRegion', new PageItemView({
      stepText: `Is this complaint about immediate danger to health, safety, housing or the rental property?`,
      helpHtml: `If there is immediate threat to personal safety, contact your local police.<br/>Examples of emergencies are, the landlord has blocked access to the rental unit/site or a restriction of power or water must be imminent or ongoing and the tenant must still be occupying the rental unit/site. Or the tenant has threated or significantly put the landlord's property or safety at risk.`,
      subView: new Question({ model: this.emergencyModel }),
      stepComplete: this.emergencyModel.get('question_answer') !== null,
    }));

    // Q4 Emerg Confirm
    this.emergencyConfirmModel = new Question_model({
      optionData: [{ name: 'emergency-confirm-no', value: "0", cssClass: 'option-button yes-no', text: 'NO'},
          { name: 'emergency-confirm-yes', value: "1", cssClass: 'option-button yes-no', text: 'YES'}],
      question_answer: this.savedJsonData.g_complaint_is_emergency === true ? '1' :
        this.savedJsonData.g_complaint_is_emergency === false ? '0' : null,
    });
    this.addPageItem('emergencyConfirmRegion', new PageItemView({
      stepText: `Read the above carefully. Confirm that there is an immediate danger to health, safety, housing or the rental property? If this complaint does not meet the above criteria (see the help text), it will be closed.`,
      subView: new Question({ model: this.emergencyConfirmModel }),
      stepComplete: this.emergencyConfirmModel.get('question_answer') !== null,
    }));

    // Q5 Complaint type
    const CEU_SUB_TYPE_LANDLORD = configChannel.request('get', 'CEU_SUB_TYPE_LANDLORD');
    const CEU_SUB_TYPE_TENANT = configChannel.request('get', 'CEU_SUB_TYPE_TENANT');
    this.complainantTypeModel = new Question_model({
      optionData: [{ name: 'applicant-type-landlord', value: CEU_SUB_TYPE_LANDLORD, cssClass: 'option-button applicant-type-landlord', text: 'A landlord or the property manager'},
          { name: 'applicant-type-tenant', value: CEU_SUB_TYPE_TENANT, cssClass: 'option-button applicant-type-tenant', text: 'A tenant'}],
      question_answer: this.savedJsonData.g_complaint_sub_type === null ? null : this.savedJsonData.g_complaint_sub_type,
      unselectDisabled: IntakeCeuDataParser.getApplicantCollection()?.length || IntakeCeuDataParser.getSubmitterCollection()?.length,
    });
    this.addPageItem('complainantTypeRegion', new PageItemView({
      stepText: `Who is the complaint against?`,
      helpHtml: `Choose the person or business who is causing the issues or contravening the B.C. Tenancy laws. They are referred to as the respondent.`,
      subView: new Question({ model: this.complainantTypeModel }),
      stepComplete: this.complainantTypeModel.get('question_answer') !== null,
    }));
  },

  setupFlows() {   
    const touRegion = this.getPageItem('touRegion');
    this.listenTo(touRegion, 'itemComplete', function(options) {
      if (touRegion.stepComplete) {
        this.getUI('pageWarning').show();
        this.showPageItem('propertyRegion', options);
      }
    }, this);

    const propertyRegion = this.getPageItem('propertyRegion');
    this.listenTo(propertyRegion, 'itemComplete', function(options) {
      const answer = this.propertyModel.getData();
      if (answer === this.MHPTA_CODE) {
        this.showPageItem('ownsHomeRegion', options);
      } else if (answer === this.RTA_CODE) {
        this.ownsHomeModel.set('question_answer', null);
        this.hideAndCleanPageItem('ownsHomeRegion', options);
        this.showPageItem('rtbMatterRegion', options);
      }
    }, this);

    const ownsHomeRegion = this.getPageItem('ownsHomeRegion');
    this.listenTo(ownsHomeRegion, 'itemComplete', function(options) {
      if (ownsHomeRegion.stepComplete) {
        this.showPageItem('rtbMatterRegion', options);
      }
    }, this);

    const rtbMatterRegion = this.getPageItem('rtbMatterRegion');
    this.listenTo(rtbMatterRegion, 'itemComplete', function(options) {
      const answer = this.rtbMatterModel.getData();
      if (answer === "0") {
        this.showPageItem('ceuMatterRegion', options);
      } else if (answer === "1") {
        this.hideAndCleanPageItem('ceuMatterRegion', options);
        this.hideAndCleanPageItem('emergencyRegion', options);
        this.hideAndCleanPageItem('emergencyConfirmRegion', options);
        this.hideAndCleanPageItem('complainantTypeRegion', options);
        this.hideNextButton();
      }
    }, this);

    const ceuMatterRegion = this.getPageItem('ceuMatterRegion');
    this.listenTo(ceuMatterRegion, 'itemComplete', function(options) {
      const answer = this.ceuMatterModel.getData();
      if (answer === "1") {
        this.showPageItem('emergencyRegion', options);
      } else if (answer === "0") {
        this.hideAndCleanPageItem('emergencyRegion', options);
        this.hideAndCleanPageItem('emergencyConfirmRegion', options);
        this.hideAndCleanPageItem('complainantTypeRegion', options);
        this.hideNextButton();
      }
    }, this);

    const emergencyRegion = this.getPageItem('emergencyRegion');
    this.listenTo(emergencyRegion, 'itemComplete', function(options) {
      const answer = this.emergencyModel.getData();
      if (answer === "1") {
        this.showPageItem('emergencyConfirmRegion', options);
      } else if (answer === "0") {
        this.showPageItem('complainantTypeRegion', options);
        this.hideAndCleanPageItem('emergencyConfirmRegion', options);
        this.emergencyModel.trigger('render');
      }
    }, this);

    const emergencyConfirmRegion = this.getPageItem('emergencyConfirmRegion');
    this.listenTo(emergencyConfirmRegion, 'itemComplete', function(options) {
      const answer = this.emergencyConfirmModel.getData();
      if (answer === "1") {
        this.showPageItem('complainantTypeRegion', options);
      } else if (answer === "0") {
        this.emergencyModel.set('question_answer', "0");
      }
    }, this);

    const complainantTypeRegion = this.getPageItem('complainantTypeRegion');
    this.listenTo(complainantTypeRegion, 'itemComplete', function(options) {
      if (complainantTypeRegion.stepComplete) {
        this.showNextButton(options);
      }
    }, this);
  },

  getApiSaveData() {
    return {
      g_complaint_type: this.propertyModel.getData() === this.MHPTA_CODE && this.ownsHomeModel.getData() ? this.MHPTA_CODE : this.RTA_CODE,
      g_complaint_sub_type: this.complainantTypeModel.getData(),
      g_complaint_is_emergency: this.emergencyModel.getData() === '1',
      g_owns_home: this.propertyModel.getData() === this.MHPTA_CODE ? !!this.ownsHomeModel.getData() : null,

      g_accepted_tou: true,
      g_complaint_rtb_matter: true,
      g_complaint_meets_criteria: true,
      g_complaint_urgency_rating: 0,
    };
  },

  nextPage() {
    if (!this.validatePage()) {
      const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }


    loaderChannel.trigger('page:load');

    const saveData = this.getApiSaveData();
    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    const existingData = IntakeCeuDataParser.toJSON();
    IntakeCeuDataParser.setJSON(Object.assign({}, existingData, saveData));

    this.model.updateJSON(IntakeCeuDataParser.toJSON());
    
    this.model.save(this.model.getApiChangesOnly()).done(() => {
      applicationChannel.trigger('progress:step:complete', 1);
      Backbone.history.navigate('#page/2', {trigger: true});
    }).fail(this.createPageApiErrorHandler(this, { forceLogout: true }));
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView)
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  className: `${CeuPage.prototype.className} intake-ceu-p1`,

  regions() {
    return Object.assign({}, CeuPage.prototype.regions, {
      touRegion: '.intake-ceu-p1__tou',
      propertyRegion: '.intake-ceu-p1__property',
      ownsHomeRegion: '.intake-ceu-p1__owns-home',
      
      rtbMatterRegion: '.intake-ceu-p1__rtb-matter',
      ceuMatterRegion: '.intake-ceu-p1__ceu-matter',
      emergencyRegion: '.intake-ceu-p1__emergency',
      emergencyConfirmRegion: '.intake-ceu-p1__emergency-confirm',
      complainantTypeRegion: '.intake-ceu-p1__complaint-type',
    });
  },

  ui() {
    return Object.assign({}, CeuPage.prototype.ui, {
      touContents: '.info-help-container',
      pageWarning: '.intake-ceu-p1__warning',
    });
  },

  events() {
    return _.extend({}, CeuPage.prototype.events, {
      [`click .${touLinkClass}`]: 'clickTermsOfUseLink',
    });
  },

  clickTermsOfUseLink(e) {
    e.preventDefault();
    const touContentsEle = this.getUI('touContents');

    if (touContentsEle.hasClass('help-opened')) {
      touContentsEle.slideUp({duration: 400, complete: function() {
        touContentsEle.removeClass('help-opened');
      }});
    } else {
      touContentsEle.addClass('help-opened');
      touContentsEle.find('.close-help').on('click', _.bind(this.clickTermsOfUseLink, this));
      touContentsEle.slideDown({duration: 400});
    }
  },

  template() {
    return <>
      <div dangerouslySetInnerHTML={{__html: CEU_TOU_template() }}></div>
      <div className="intake-ceu-p1__tou"></div>

      <p className={`${this.touModel.getData()?'':'hidden-item'} intake-ceu-p1__warning error-block warning`}>Incomplete complaints will not be saved. Once you start a complaint, you must complete it or all information will be lost.</p>
      <p className={`${this.touModel.getData()?'':'hidden-item'} intake-ceu-p1__warning error-block warning`}>The Compliance and Enforcement Unit (CEU) is not an alternative to the RTB Dispute Resolution Process and does not mediate or resolve disputes between landlords and tenants. However, in the most serious cases the CEU can start an investigation without an application being made for a hearing.</p>

      <div className="intake-ceu-p1__property"></div>
      <div className="intake-ceu-p1__owns-home"></div>

      <div className="intake-ceu-p1__rtb-matter"></div>
      <div className="intake-ceu-p1__ceu-matter"></div>
      <div className="intake-ceu-p1__emergency"></div>
      <div className="intake-ceu-p1__emergency-confirm"></div>

      <div className="intake-ceu-p1__complaint-type"></div>

      <div className="page-navigation-button-container">
        <button className="navigation option-button step-next hidden-item" type="submit">NEXT</button>
      </div>
    </>
  }
});

_.extend(IntakeCeuPageGeneral.prototype, ViewJSXMixin);
export default IntakeCeuPageGeneral;
