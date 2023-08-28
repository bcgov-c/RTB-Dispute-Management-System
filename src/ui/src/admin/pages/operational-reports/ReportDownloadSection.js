import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import React from 'react';
import Dropdown from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { FormBuilder } from '../../../core/components/form-builder/FormBuilder';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const NO_DESCRIPTION_HTML = '<i>no description available</i>';

const ReportDownloadSection = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['headerTitle', 'availableReports', 'enableParamEntry']);
    this.loadedReport = null;
    this.showParameterForm = false;
    
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const currentUser = sessionChannel.request('get:user');
    const OPERATIONAL_REPORT_USER_GROUP_DISPLAY = configChannel.request('get', 'OPERATIONAL_REPORT_USER_GROUP_DISPLAY');
    const toDropdownOption = (code) => {
      const value = String(configChannel.request('get', code)||'');
      return { value, text: OPERATIONAL_REPORT_USER_GROUP_DISPLAY[value] };
    };
    const isSuperUser = currentUser.isSuperUser();
    const isOtherRole = currentUser.isOtherRole();
    const isManagement = currentUser.isManagement();
    const canAccessIO = currentUser.isInformationOfficer() || currentUser.isAdminRole() ||
        isManagement || isOtherRole || isSuperUser;
    const canAccessArb = currentUser.isArbitrator() || isManagement || isOtherRole || isSuperUser;
    const canAccessManager = isManagement || isOtherRole || isSuperUser;
    const canAccessSystem = isSuperUser;
    const getDefaultUserGroupValue = () => {
      if (currentUser.isSuperUser()) return configChannel.request('get', 'OP_REPORT_USER_ADMIN');
      else if (currentUser.isInformationOfficer() || currentUser.isAdminRole()) return configChannel.request('get', 'OP_REPORT_USER_IO_OR_ADMIN');
      else if (currentUser.isArbitrator()) return configChannel.request('get', 'OP_REPORT_USER_ARB');
      else if (currentUser.isManagement()) return configChannel.request('get', 'OP_REPORT_USER_MANAGER');
      else return configChannel.request('get', 'OP_REPORT_USER_ALL');
    };

    this.userGroupModel = new DropdownModel({
      labelText: 'User Group',
      optionData: [
        toDropdownOption('OP_REPORT_USER_ALL'),
        ...(canAccessIO ? [toDropdownOption('OP_REPORT_USER_IO_OR_ADMIN')] : []),
        ...(canAccessArb ? [toDropdownOption('OP_REPORT_USER_ARB')] : []),
        ...(canAccessManager ? [toDropdownOption('OP_REPORT_USER_MANAGER')] : []),
        ...(canAccessSystem ? [toDropdownOption('OP_REPORT_USER_ADMIN')] : [])
      ],
      disabled: false,
      value: String(getDefaultUserGroupValue()||''),
    });

    const reportSelectOptions = this.getReportSelectOption();
    this.reportSelectModel = new DropdownModel({
      labelText: 'Report',
      optionData: reportSelectOptions,
      disabled: !reportSelectOptions.length,
      defaultBlank: true,
      value: null
    });
  },

  setupListeners() {
    this.listenTo(this.reportSelectModel, 'change:value', (model) => {
      this.loadedReport = (model.getSelectedOption() || {})._report;
      if (!!this.enableParamEntry && this.loadedReport?.get('jsonData')) {
        this.showParameterForm = true;
        try {
          this.builder = new FormBuilder({ jsonString: this.loadedReport.get('parameter_config') });
        } catch (err) {
          alert(`Error parsing JSON parameter report form:\n${err}`);
        }
      } else {
        this.showParameterForm = false;
      }
      this.render();
    });

    this.listenTo(this.userGroupModel, 'change:value', () => {
      const reportSelectOptions = this.getReportSelectOption();
      this.reportSelectModel.set({ 
        optionData: reportSelectOptions,
        disabled: !reportSelectOptions.length
      });
      this.reportSelectModel.trigger('render');
    });
  },

  getReportSelectOption() {
    const userGroupValue = this.userGroupModel.getData();
    return this.availableReports.filter(report => report.get('user_group') === Number(userGroupValue))
      .map(report => ({ _report: report, value: String(report.id),
        text: `${report.get('title')} (${report.isExcelReport() ? 'Excel' : 'csv'})` }));
  },

  clickDownload() {
    if (!this.loadedReport || !this.validateAndShowErrors()) return;
    
    let downloadParams = null;
    if (this.loadedReport.get('jsonData')) {
      const formResponses = this.getChildView('reportParamFormRegion')?.getData();
      downloadParams = formResponses?.map(({ value }) => value);
    }
    this.loadedReport.download(downloadParams);

    // TODO: Print params during dev; to be removed
    console.log(`Download params: `, downloadParams);
  },

  validateAndShowErrors() {
    const isValid = this.showParameterForm ? this.getChildView('reportParamFormRegion')?.validateAndShowErrors() : true;
    return isValid;
  },
  
  onRender() {
    this.showChildView('userGroupRegion', new Dropdown({ model: this.userGroupModel }));
    this.showChildView('reportSelectRegion', new Dropdown({ model: this.reportSelectModel }));

    if (this.showParameterForm && this.builder) {
      this.showChildView('reportParamFormRegion', this.builder.createFormView(''));
    }
  },

  /* Template area */
  className: 'operational-report-download-container',
  regions: {
    reportSelectRegion: '.operational-report-download-dropdown',
    userGroupRegion: '.operation-report-user-group-dropdown',
    reportParamFormRegion: '.operational-report-params-form',
  },

  template() {
    return (
      <>
        <div className="operational-report-download-header review-applicant-title section-header">{this.headerTitle}</div>
        <div className="operational-report-download-body">
          <div className="">
            <div className="operational-report-download-dropdown-container">
              <div className="operation-report-user-group-dropdown"></div>
              <div className="operational-report-download-dropdown"></div>
              <div className="operational-report-download-btn">
                <button className={`btn btn-standard ${this.loadedReport ? '' : 'disabled'}`}
                  disabled={!this.loadedReport}
                  onClick={() => this.clickDownload()}>Download</button>
              </div>
            </div>
          </div>
          {this.renderJsxReportDescription()}
          {this.renderJsxReportParams()}
        </div>
      </>
    );
  },

  renderJsxReportDescription() {
    if (!this.loadedReport) return;
    const reportDescriptionDisplay = this.loadedReport.get('description') || NO_DESCRIPTION_HTML;
    return <div className="operational-report-download-description" dangerouslySetInnerHTML={{__html: reportDescriptionDisplay}}></div>;
  },

  renderJsxReportDataDictionary() {
    if (!this.loadedReport) return;
    const dataDictionaryDisplay = this.loadedReport.get('html_data_dictionary') || NO_DESCRIPTION_HTML;
    return (
      <div className="operational-report-dictionary-container">
        <div className="operational-report-dictionary-label">Data Dictionary</div>
        <div dangerouslySetInnerHTML={{__html: dataDictionaryDisplay}}></div>
      </div>
    );
  },

  renderJsxReportParams() {
    return <div className="operational-report-params-container">
      {this.showParameterForm ? <div className="operational-report-params-form"></div> : null}
    </div>
  },
});

_.extend(ReportDownloadSection.prototype, ViewJSXMixin);
export default ReportDownloadSection;