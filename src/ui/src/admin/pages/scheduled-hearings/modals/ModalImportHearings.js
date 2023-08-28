import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';

import RadioModel from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';
import InputModel from '../../../../core/components/input/Input_model';
import FileModel from '../../../../core/components/files/File_model';
import InputView from '../../../../core/components/input/Input';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';

import ScheduledHearingsImporterModel from '../../../components/hearing/hearing-import/ScheduledHearingsImporter_model';
import ImportHearingProgressView from './ImportHearingProgress';

import error_report_template from './ScheduledHearingsImportErrorReport_template.tpl'
import template from './ModalImportHearings_template.tpl';

const CSV_UPLOADER_TEMPLATE = _.template(`
  <div class="add-files-container">
    <div class="file-upload-dropzone">
      <div class="file-upload-text-container">
        <span>Drag and drop .csv import file here or </span>
        <div class="btn btn-lg btn-primary btn-file-upload">
          <span class="">Select file</span>
          <input type="file" name="files[]">
        </div>
      </div>
    </div>
    <p class="add-files-error-block error-block"></p>
  </div>
`),
CSV_FILE_DISPLAY_TEMPLATE = _.template(`
  <div class="import-schedule-uploader-display">
    <div class="">
      <span class=""><%= file_name %></span><span class=""><%= file_size %></span>
    </div>
    <div><span class="import-scheduler-file-remove error-red clickable"><b class="glyphicon glyphicon-remove"></b> Cancel Import</span></div>
  </div>
`);


const modalChannel = Radio.channel('modals'),
  filesChannel = Radio.channel('files'),
  configChannel = Radio.channel('config'),
  loaderChannel = Radio.channel('loader'),
  Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  id: 'importHearings-modal',
  className: 'modal fade modal-rtb-default',

  attributes: {
    'data-backdrop': 'static',
    'data-keyboard': 'false'
  },

  ui: {
    duration: '.import-schedule-date-duration',
    close: '.close-x',
    cancel: '.btn-cancel',
    import: '.btn-continue',
    importCount: '.import-schedule-hearings-count',
    fileDisplay: '.import-schedule-uploader-display-container',
    uploaderRegion: '.import-schedule-uploader',
    removeFile: '.import-scheduler-file-remove',
    processingReport: '.import-schedule-processing-report-container',
    noteRegionContainer: '.import-schedule-note-container',
    
    preProgressView: '.import-schedule-container',
    progressViewRegion: '.import-progress-container'
  },

  regions: {
    typeRegion: '.import-schedule-type',
    startRegion: '.import-schedule-start-date',
    endRegion: '.import-schedule-end-date',
    uploaderRegion: '@ui.uploaderRegion',
    noteRegion: '.import-schedule-note',
    progressViewRegion: '@ui.progressViewRegion'
  },

  events: {
    'click @ui.cancel': 'close',
    'click @ui.close': 'close',
    'click @ui.import': 'clickImport',
    'click @ui.removeFile': 'clickRemoveFile'
  },

  clickImport() {
    if (this.importing) {
      return;
    }
    this.importing = true;
    this.typeModel.set('disabled', true);
    this.renderType();
    this.getUI('preProgressView').hide();

    $.scrollPageToTop();

    this.hearingImportModel.set({ import_note: this.processNoteModel.getData({parse: true}) });
    this.showChildView('progressViewRegion', new ImportHearingProgressView({
      parent: this,
      import_file_model: this.fileUploader.files.at(0),
      model: this.hearingImportModel
    }));

    // Timeout so view can be refreshed first
    setTimeout(_.bind(function() {
      const progressView = this.getChildView('progressViewRegion');
      progressView.startImportProcess();
    }, this), 1500);
    
  },

  clickRemoveFile() {
    this.fileUploader.files.resetCollection();
    this.startDateModel.set('disabled', false);
    this.endDateModel.set('disabled', false);
    this.render();
  },

  close() {
    modalChannel.request('remove', this);
  },

  initialize(options) {
    this.mergeOptions(options, ['importHearingsFile', 'hearingImportModel', 'startDate', 'endDate']);

    this.importing = false;
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.typeModel = new RadioModel({
      optionData: [{ text: 'Import New Schedule', value: 1 }, { text: 'View Import History', value: 2 }],
      valuesToDisable: [2],
      value: 1
    });

    this.startDateModel = new InputModel({
      inputType: 'date',
      labelText: 'First Day of Import',
      errorMessage: 'Enter the first day',
      allowFutureDate: true,
      value: this.startDate || null
    });

    this.endDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Last Day of Import (inclusive)',
      errorMessage: 'Enter the final day',
      allowFutureDate: true,
      value: this.endDate || null
    });

    this.processNoteModel = new TextareaModel({
      labelText: 'Import Note',
      required: false,
      cssClass: 'optional-input',
      max: configChannel.request('get', 'IMPORT_NOTE_MAX_LENGTH'),
      value: null
    });

    this.hearingsImporter = new ScheduledHearingsImporterModel();
  },

  setupListeners() {
    this.listenTo(this.startDateModel, 'change:value', this._updateDurationDisplay, this);
    this.listenTo(this.endDateModel, 'change:value', this._updateDurationDisplay, this);

    this.listenTo(this.hearingsImporter, 'import:success', this._showProcessingSuccess, this);
    this.listenTo(this.hearingsImporter, 'import:success import:fail', this._showProcessingReport, this);
  },

  _showProcessingReport(error_report) {
    const ERROR_REPORT_CODES = this.hearingsImporter.get('ERROR_REPORT_CODES');
    const error_report_html = error_report_template({
      error_rows: _.map(ERROR_REPORT_CODES, function(validation_msg, code) {
        const error_row = [validation_msg];
        if (_.has(error_report, code)) {
          error_row.push(`<span class="error-red">Error</span>`);
          error_row.push(`<span class="error-red">${_.map(error_report[code], function(error_msg) { return `<p>${error_msg}</p>`; }).join('')}</span>`);
        } else {
          error_row.push('Passed');
          error_row.push('-');
        }
        return error_row;
      })
    });

    loaderChannel.trigger('page:load:complete');
    this.getUI('processingReport').html(error_report_html).show();
  },

  _showProcessingSuccess(processing_report) {
    processing_report = processing_report || {};
    this.getUI('noteRegionContainer').show();
    this.getUI('import').show();
    this.getUI('importCount').html(`${processing_report.hearings_count} hearing${processing_report.hearings_count === 1?'':'s'} ready to import`).show();
  },

  _updateDurationDisplay() {
    const start_date = this.startDateModel.getData({parse: true}),
      end_date = this.endDateModel.getData({parse: true});

    let duration_display = '';
    if (start_date && end_date) {
      const day_duration = Moment(end_date).diff(Moment(start_date), 'days');
      duration_display = `${day_duration < 0 ? '<b class="glyphicon glyphicon-exclamation-sign"></b>&nbsp;' : ''}Duration: ${day_duration} day${day_duration === 1 ? '' : 's'}`;
      this.getUI('uploaderRegion').show();
    } else {
      this.getUI('uploaderRegion').hide();
    }
    this.getUI('duration').html(duration_display);
  },

  _toggleFileUploaderDisplay(file_model) {
    if (!file_model) {
      this.getUI('fileDisplay').html('').hide();
      this.getUI('uploaderRegion').show();
      return;
    }

    const file_display_html = CSV_FILE_DISPLAY_TEMPLATE({
      file_name: file_model.get('file_name'),
      file_size: Formatter.toFileSizeDisplay(file_model.get('file_size'))
    });

    this.getUI('fileDisplay').html(file_display_html).show();
    this.getUI('uploaderRegion').hide();
  },

  _switchToImportStartedDisplay() {
    const file_model = this.fileUploader.files.at(0);
    this._toggleFileUploaderDisplay(file_model);

    this.startDateModel.set('disabled', true);
    this.endDateModel.set('disabled', true);
    this.renderDates();
  },

  _checkAndStartImportProcess() {
    this._toggleFileUploaderDisplay();
    if (!this.fileUploader.files.length || !/\.csv$/.test(this.fileUploader.files.at(0).get('file_name'))) {
      modalChannel.request('show:standard', {
        title: 'Invalid Import File Type',
        bodyHtml: 'Schedule File Import only supports .csv format schedules',
        hideContinueButton: true,
        cancelButtonText: "Close"
      });
      this.fileUploader.files.resetCollection();
      return;
    }

  
    this._switchToImportStartedDisplay();

    loaderChannel.trigger('page:load');
    this.hearingsImporter.setDateRange(this.startDateModel.getData({parse: true}), this.endDateModel.getData({parse: true}));
    this.hearingsImporter.startProcessFileUploader(this.fileUploader);
  },

  onBeforeRender() {
    this.fileUploader = filesChannel.request('create:uploader', {
      child_template: CSV_UPLOADER_TEMPLATE,
      processing_options: {
        checkForDisputeDuplicates: false,
        maxNumberOfFiles: 1
      }
    });

    this.listenTo(this.fileUploader, 'change:files', this._checkAndStartImportProcess, this);
  },

  onRender() {
    this.renderType();
    this.renderDates();
    
    this.showChildView('uploaderRegion', this.fileUploader);
    this.showChildView('noteRegion', new TextareaView({ model: this.processNoteModel }));

    if (this.importHearingsFile) {
      const fileModel = new FileModel(this.fileUploader.file_creation_fn(this.importHearingsFile))
      this.fileUploader.files.add(fileModel);
      this._checkAndStartImportProcess();
    }
  },

  renderType() {
    this.showChildView('typeRegion', new RadioView({ model: this.typeModel }));
  },

  renderDates() {
    this.showChildView('startRegion', new InputView({ model: this.startDateModel }));
    this.showChildView('endRegion', new InputView({ model: this.endDateModel }));
  },

  templateContext() {
    return {
      datesProvided: this.startDateModel.getData({parse:true}) && this.endDateModel.getData({parse:true})
    };
  }

});
