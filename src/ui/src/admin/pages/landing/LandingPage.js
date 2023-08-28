import React from 'react';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './LandingPage.scss';
import SiteInfoPage from './SiteInfoPage';
import GeneralReportsPage from './GeneralReportsPage';
import ArbReportsPage from './ArbReportsPage';
import AdjudicatorReportsPage from './AdjudicatorReportsPage';
import IOReportsPage from './IOReportsPage';

const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');

const DROPDOWN_CODE_GENERAL_REPORTS_VIEW = '0';
const DROPDOWN_CODE_SITE_LINKS_VIEW = '1';
const DROPDOWN_CODE_ARB_REPORTS_VIEW = '2';
const DROPDOWN_CODE_ADJUDICATOR_REPORTS_VIEW = '3';
const DROPDOWN_CODE_IO_REPORTS_VIEW = '4';

const REPORTING_ALLOWED_SYSTEM_USERS_ALL = "ALL";

const LandingPage = PageView.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const currentUser = sessionChannel.request('get:user');

    const REPORTING_ALLOWED_SYSTEM_USER_IDS = configChannel.request('get', 'REPORTING_ALLOWED_SYSTEM_USER_IDS');
    const hasGeneralReportsAccess = REPORTING_ALLOWED_SYSTEM_USER_IDS === REPORTING_ALLOWED_SYSTEM_USERS_ALL 
      || REPORTING_ALLOWED_SYSTEM_USER_IDS?.includes?.(currentUser?.id);
    
    const ARB_REPORTING_ALLOWED_SYSTEM_USER_IDS = configChannel.request('get', 'ARB_REPORTING_ALLOWED_SYSTEM_USER_IDS');
    const hasArbReportsAccess = ARB_REPORTING_ALLOWED_SYSTEM_USER_IDS === REPORTING_ALLOWED_SYSTEM_USERS_ALL 
    || ARB_REPORTING_ALLOWED_SYSTEM_USER_IDS?.includes?.(currentUser?.id);

    const ADJUDICATOR_REPORTING_ALLOWED_SYSTEM_USER_IDS = configChannel.request('get', 'ADJUDICATOR_REPORTING_ALLOWED_SYSTEM_USER_IDS');
    const hasAdjudicatorReportsAccess = ADJUDICATOR_REPORTING_ALLOWED_SYSTEM_USER_IDS === REPORTING_ALLOWED_SYSTEM_USERS_ALL 
    || ADJUDICATOR_REPORTING_ALLOWED_SYSTEM_USER_IDS?.includes?.(currentUser?.id);

    const IO_REPORTING_ALLOWED_SYSTEM_USER_IDS = configChannel.request('get', 'IO_REPORTING_ALLOWED_SYSTEM_USER_IDS');
    const hasIOReportsAccess = IO_REPORTING_ALLOWED_SYSTEM_USER_IDS === REPORTING_ALLOWED_SYSTEM_USERS_ALL 
    || IO_REPORTING_ALLOWED_SYSTEM_USER_IDS?.includes?.(currentUser?.id);

    const optionData = [
      hasGeneralReportsAccess ? { text: 'Intake screening and wait times', value: DROPDOWN_CODE_GENERAL_REPORTS_VIEW } : {},
      hasArbReportsAccess ? { text: 'Level2 Arbitrator General Performance', value: DROPDOWN_CODE_ARB_REPORTS_VIEW } : {}, 
      hasAdjudicatorReportsAccess ? { text: 'Adjudicator General Performance', value: DROPDOWN_CODE_ADJUDICATOR_REPORTS_VIEW } : {},
      hasIOReportsAccess ? { text: 'Information Officer General Performance', value: DROPDOWN_CODE_IO_REPORTS_VIEW } : {},
      { text: 'Site links and build version', value: DROPDOWN_CODE_SITE_LINKS_VIEW },
    ].filter(obj => Object.keys(obj).length);
    

    this.landingViewDropdown = new DropdownModel({
      labelText: '',
      optionData,
      value: hasGeneralReportsAccess ? DROPDOWN_CODE_GENERAL_REPORTS_VIEW :  
        hasAdjudicatorReportsAccess ?  DROPDOWN_CODE_ADJUDICATOR_REPORTS_VIEW :
        hasArbReportsAccess ? DROPDOWN_CODE_ARB_REPORTS_VIEW : 
        hasIOReportsAccess ? DROPDOWN_CODE_IO_REPORTS_VIEW : 
        DROPDOWN_CODE_SITE_LINKS_VIEW,
      disabled: !hasGeneralReportsAccess && !hasArbReportsAccess && !hasAdjudicatorReportsAccess && !hasIOReportsAccess
    });
  },

  setupListeners() {
    this.listenTo(this.landingViewDropdown, 'change:value', () => this.render());
  },

  clickRefresh() {
    this.render();
  },

  onRender() {
    this.showChildView('viewSelectRegion', new DropdownView({ model: this.landingViewDropdown }));

    if (this.landingViewDropdown.getData() === DROPDOWN_CODE_SITE_LINKS_VIEW) {
      this.showChildView('siteInfoRegion', new SiteInfoPage());
    } else if (this.landingViewDropdown.getData() === DROPDOWN_CODE_GENERAL_REPORTS_VIEW) {
      this.showChildView('generalReportsRegion', new GeneralReportsPage());
    } else if (this.landingViewDropdown.getData() === DROPDOWN_CODE_ARB_REPORTS_VIEW) {
      this.showChildView('arbReportsRegion', new ArbReportsPage());
    } else if (this.landingViewDropdown.getData() === DROPDOWN_CODE_ADJUDICATOR_REPORTS_VIEW) {
      this.showChildView('adjReportsRegion', new AdjudicatorReportsPage());
    } else if (this.landingViewDropdown.getData() === DROPDOWN_CODE_IO_REPORTS_VIEW) {
      this.showChildView('ioReportsRegion', new IOReportsPage());
    }
  },

  regions: {
    viewSelectRegion: '.landing-page__view-select',
    siteInfoRegion: '.landing-page__site-info',
    generalReportsRegion: '.landing-page__general-reports',
    arbReportsRegion: '.landing-page__arb-reports',
    adjReportsRegion: '.landing-page__adj-reports',
    ioReportsRegion: '.landing-page__io-reports'
  },

  template() {
    return (
      <div className="landing-page">
        <div className="dms-logo-container">
          <div className="dms-logo"></div>
          <div className="dispute-overview-header landing-page__header">
            <span className="landing-page__view-select__text">Welcome View:</span>
            <div className="landing-page__view-select"></div>
            <div className="landing-page__current-date">{Formatter.toLastModifiedTimeDisplay(Moment())}</div>
            <div className="dispute-overview-header-icon header-refresh-icon" onClick={() => this.clickRefresh()}></div>
          </div>
        </div>
        { this.renderJsxChartsView() }
        { this.renderJsxSiteLinksView() }
        { this.renderJsxArbReportsView() }
        { this.renderJsxAdjReportsView() }
        { this.renderJsxIoReportsView() }
      </div>
    )
  },

  renderJsxChartsView() {
    if (this.landingViewDropdown.getData() !== DROPDOWN_CODE_GENERAL_REPORTS_VIEW) return;

    return <div className="landing-page__general-reports"></div>
  },

  renderJsxSiteLinksView() {
    if (this.landingViewDropdown.getData() !== DROPDOWN_CODE_SITE_LINKS_VIEW) return;

    return <div className="landing-page__site-info"></div>
  },

  renderJsxArbReportsView() {
    if (this.landingViewDropdown.getData() !== DROPDOWN_CODE_ARB_REPORTS_VIEW) return;

    return <div className="landing-page__arb-reports"></div>
  },

  renderJsxAdjReportsView() {
    if (this.landingViewDropdown.getData() !== DROPDOWN_CODE_ADJUDICATOR_REPORTS_VIEW) return;

    return <div className="landing-page__adj-reports"></div>
  },

  renderJsxIoReportsView() {
    if (this.landingViewDropdown.getData() !== DROPDOWN_CODE_IO_REPORTS_VIEW) return;

    return <div className="landing-page__io-reports"></div>
  }
});

_.extend(LandingPage.prototype, ViewJSXMixin);
export default LandingPage;