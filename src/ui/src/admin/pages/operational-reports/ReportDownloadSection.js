import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import Dropdown from '../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import React from 'react';

const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');

const NO_DESCRIPTION_HTML = '<i>no description available</i>';

const ReportDownloadSection = Marionette.View.extend({

  /* View custom code */ 
  clickDownload() {
    if (!this.loadedReport) return;
    this.loadedReport.downloadHTML5();
  },

  /* Marionette View lifecycle / custom render methods */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['headerTitle', 'availableReports']);
    this.loadedReport = null;

    const hasReports = (this.availableReports || []).length;

    const userGroupDefaultValue = this.getDefaultUserGroupValue();
    this.userGroupModel = new DropdownModel({
      labelText: 'User Group',
      optionData: Object.entries(configChannel.request('get', 'OPERATIONAL_REPORT_USER_GROUP_DISPLAY')).map(([key, value]) => ({ text: value, value: String(key) }) ),
      disabled: false,
      value: userGroupDefaultValue,
    });

    const reportSelectOptions = this.getReportSelectOptions();
    this.reportSelectModel = new DropdownModel({
      labelText: 'Report',
      optionData: reportSelectOptions,
      disabled: !reportSelectOptions.length,
      defaultBlank: true,
      value: null
    });

    this.listenTo(this.reportSelectModel, 'change:value', (model) => {
      this.loadedReport = (model.getSelectedOption() || {})._report;
      this.render();
    });

    this.listenTo(this.userGroupModel, 'change:value', () => {
      const reportSelectOptions = this.getReportSelectOptions();
      this.reportSelectModel.set({ 
        optionData: reportSelectOptions,
        disabled: !reportSelectOptions.length
      });
      this.reportSelectModel.trigger('render');
    })
  },

  getDefaultUserGroupValue() {
    const currentUser = sessionChannel.request('get:user');

    if (currentUser.isAdminRole()) return String(configChannel.request('get', 'OP_REPORT_USER_ADMIN'));
    else if (currentUser.isInformationOfficer() || currentUser.isAdminRole()) return String(configChannel.request('get', 'OP_REPORT_USER_IO_OR_ADMIN'));
    else if (currentUser.isArbitrator()) return String(configChannel.request('get', 'OP_REPORT_USER_ARB'));
    else if (currentUser.isManagement()) return String(configChannel.request('get', 'OP_REPORT_USER_MANAGER'));
    else return null;
  },

  getReportSelectOptions() {
    const userGroupValue = this.userGroupModel.getData();
    return this.availableReports.filter(report => report.get('user_group') === userGroupValue || userGroupValue === String(configChannel.request('get', 'OP_REPORT_USER_ALL'))).map(report => ({ _report: report, value: String(report.id), text: report.get('title') }));
  },
  
  onRender() {
    this.showChildView('userGroupRegion', new Dropdown({ model: this.userGroupModel }));
    this.showChildView('reportSelectRegion', new Dropdown({ model: this.reportSelectModel }));
  },

  /* Template area */
  className: 'operational-report-download-container',
  regions: {
    reportSelectRegion: '.operational-report-download-dropdown',
    userGroupRegion: '.operation-report-user-group-dropdown'
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
                  onClick={this.clickDownload.bind(this)}>Download</button>
              </div>
            </div>
          </div>
          {this.renderJsxReportDescription()}
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
});

_.extend(ReportDownloadSection.prototype, ViewJSXMixin);
export default ReportDownloadSection;