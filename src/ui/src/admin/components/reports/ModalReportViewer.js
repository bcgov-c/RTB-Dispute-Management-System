import React from 'react';
import Radio from 'backbone.radio';
import { FormBuilder } from "../../../core/components/form-builder/FormBuilder";
import ModalBaseView from "../../../core/components/modals/ModalBase"
import RadioView from "../../../core/components/radio/Radio";
import Radio_model from "../../../core/components/radio/Radio_model";
import { ViewJSXMixin } from "../../../core/utilities/JsxViewMixin";
import ReportResultsTable from './ReportResultsTable';
import { GraphTable_model } from '../graph/Graph_model';
import './ModalReportViewer.scss';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');

const ModalReportViewer = ModalBaseView.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['availableReports', 'reportContents', 'modalDescription', 'showReportTitles', 'useFormBuilder']);

    if (this.availableReports?.length < 1) {
      alert('[Error] Invalid report configuration');
      return this.destroy();
    }
    this.formBuilder = null;
    this.graphModel = null;

    this.selectedReport = null;
    this.hasSearched = false;
    this.hasReportResults = false;
    this.createSubModels();
    this.setupListeners();
    this.selectedReport = this.availableReports?.[0];
    if (this.useFormBuilder) {
      this.selectReport();
    } else {
      this.hasReportResults = true;
      this.submitForm();
    }
  },

  createSubModels() {
    this.reportSelectRadio = new Radio_model({
      optionData: this.availableReports?.map(report => ({ value: report.id, text: report.get('title'), _report: report })),
      disabled: this.availableReports?.length < 2,
      value: this.availableReports?.[0]?.id,
    });
  },

  setupListeners() {
    // Clickable links in reports navigate away from the page - make sure to auto-close the modal in this case
    window.onbeforeunload = () => {
      try {
        this?.close();
      } catch (err) {}
    };

    this.listenTo(this.reportSelectRadio, 'change:value', (model) => {
      this.selectedReport = model.getSelectedOption()?._report;
      this.selectReport();
      this.render();
    });
  },

  selectReport() {
    try {
      this.formBuilder = new FormBuilder({ jsonString: this.selectedReport.get('parameter_config') });
    } catch (err) {
      alert(`Error parsing JSON parameter report form:\n${err}`);
    }
  },

  className() {
    return `${ModalBaseView.prototype.className} report-viewer-modal`;
  },

  regions: {
    reportSelectRadioRegion: '.report-viewer-modal__select',
    reportParamFormRegion: '.report-viewer-modal__form-params',
    reportFormResultsRegion: '.report-viewer-modal__form-results',
  },

  async submitForm() {
    if (!this.validateAndShowErrors() && this.useFormBuilder) return;
    loaderChannel.trigger('page:load');

    this.graphModel = null;
    // TODO: This should be in some sort of report central method
    let downloadParams = null;
    if (this.useFormBuilder && this.selectedReport.get('jsonData')) {
      const formResponses = this.getChildView('reportParamFormRegion')?.getData();
      downloadParams = formResponses?.map(({ value }) => value);
    }
    
    const reportContents = this.reportContents ? this.reportContents : await this.selectedReport?.load(downloadParams);
    this.hasSearched = true;
    if (reportContents) {
      this.graphModel = new GraphTable_model({
        reportModel: this.selectedReport,
        reportContents,
      });
    } else if (reportContents !== '') {
      generalErrorFactory.createHandler('ADMIN.ADHOC_REPORT.LOAD')({});
    }
    
    loaderChannel.trigger('page:load:complete');
    this.render();
  },

  validateAndShowErrors() {
    const isValid = this.getChildView('reportParamFormRegion')?.validateAndShowErrors();
    return isValid;
  },

  onBeforeRender() {
    this.hasReportResults = this.hasSearched && this.graphModel?.validate();
  },

  onRender() {
    if (this.availableReports?.length > 1) {
      this.showChildView('reportSelectRadioRegion', new RadioView({ model: this.reportSelectRadio }));
    }

    if (this.useFormBuilder) {
      this.renderReportInputs();
    }

    this.renderReportResults();
  },

  renderReportInputs() {
    const title = this.showReportTitles ? this.selectedReport.get('title') : '';
    const formView = this.formBuilder.createFormView(title);
    this.listenTo(formView, 'input:enter', () => {
      this.submitForm();
    });
    this.showChildView('reportParamFormRegion', formView);
  },

  renderReportResults() {
    if (this.hasReportResults) {
      this.showChildView('reportFormResultsRegion', new ReportResultsTable({ model: this.graphModel }));
    }
  },

  template() {
    const modalTitle = `View Report Results`;
    return <>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{modalTitle}</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            { this.modalDescription?.length ? 
              <p>
                { this.modalDescription }
              </p>
              : null 
            }
            <div className="report-viewer-modal__select"></div>
            {this.renderFormParams()}
            {this.renderJsxReportResults()}
          </div>
        </div>
      </div>
    </>
  },

  renderFormParams() {
    if (!this.useFormBuilder) return;
    
    return (
      <div className="report-viewer-modal__form-params__container">
        <div className="report-viewer-modal__form-params"></div>
        <div className="report-viewer-modal__form-params__submit">
          <div className="btn btn-standard btn-default btn-primary report-viewer-modal__form-params__submit-btn"
            onClick={() => this.submitForm()}>View Results</div>
        </div>
      </div>
    )
  },

  renderJsxReportResults() {
    return <div className="report-viewer-modal__form-results__container">
      {this.hasReportResults ?<div className="report-viewer-modal__form-results"></div> :
        this.hasSearched ? <div className="report-viewer-modal__form-results__error error-block">No results found</div>
        : null
      }
    </div>;
  },


});


_.extend(ModalReportViewer.prototype, ViewJSXMixin);
export default ModalReportViewer;