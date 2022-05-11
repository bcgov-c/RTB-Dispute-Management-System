import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './ImportHearingProgress_template.tpl';

const PROGRESS_POLL_INTERVAL_MS = 2000;
const IMPORT_PROGRESS_CODE_DISPLAY = {
  1: 'In Progress',
  2: 'Complete',
  3: 'Error'
};

const sessionChannel = Radio.channel('session'),
  filesChannel = Radio.channel('files'),
  scheduleManager = Radio.channel('schedule'),
  Formatter = Radio.channel('formatter').request('get');
export default Marionette.View.extend({
  template,
  className: 'import-schedule-progress-container',

  ui: {
    exit: '.btn-continue'
  },

  events: {
    'click @ui.exit': 'clickExit'
  },

  clickExit() {
    this.parent.close();
  },

  // Initialize this View with a non-api HearingImport model and an import_file_model
  initialize(options) {
    this.mergeOptions(options, ['parent', 'import_file_model']);
    
    this.loaderMsg = '1. Initializing import process';
    this.successMsg = null;
    this.errorMsg = null;
  },

  startImportProcess() {
    this.uploadScheduleFile();
  },

  uploadScheduleFile() {
    this.loaderMsg = '2. Uploading schedule file to server...';
    this.render();

    this.import_file_model.set('file_type', 5);
    filesChannel.request('create:file:common', this.import_file_model.toJSON())
    .done(common_file_model => {
      this.model.set('import_file_id', common_file_model.id);
      this.importHearings();
    }).fail(() => {
      this.errorMsg = 'Processing Error: Schedule file failed to import';
      this.isError = true;
      this.render();
    });
  },

  importHearings() {
    this.loaderMsg = '3. Creating import record... Please wait';
    this.render();

    scheduleManager.request('import', this.model)
      .done(() => {
        this.loaderMsg = '4. Generating schedule... Please wait';
        
        // Start the polling function, which will first run after PROGRESS_POLL_INTERVAL_MS milliseconds
        this.createImportProgressListener();

        // Handle the response from the initial import creation here
        this._handleHearingImportInfo();
      }).fail(() => {
        this.errorMsg = 'Processing Error: Hearing Import was unable to start successfully';
        this.isError = true;
        this.render();
      });
  },

  createImportProgressListener() {
    this.progress_poll_interval = setInterval(_.bind(function() {
      try {
        if (this.model.isProgressState() && !this.isError) {
          this._progressPollFn();
        } else {
          clearInterval(this.progress_poll_interval);
        }
      } catch(err) {
        this.errorMsg = 'Processing Error: Unexpected application error';
        this.isError = true;
        clearInterval(this.progress_poll_interval);
      }
    }, this), PROGRESS_POLL_INTERVAL_MS);
  },

  _progressPollFn() {
    scheduleManager.request('get:import', this.model)
      .done(() => this._handleHearingImportInfo())
      .fail(() => {
        this.errorMsg = `Processing Error: Unable to retrieve status of the hearing import`;
        this.isError = true;
      });
  },

  _handleHearingImportInfo() {
    if (this.model.isErrorState()) {
      this.errorMsg = 'Processing Complete with errors.  See Import Process Log for details';
    } else if (this.model.isSuccessState()) {
      this.successMsg = 'Processing Complete';
    }
    this.render();
  },


  templateContext() {
    const userDisplay = sessionChannel.request('get:user');
    const import_status = this.model.get('import_status');
    let statusDisplay = this.isError ? 'Error' : _.has(IMPORT_PROGRESS_CODE_DISPLAY, import_status) ? IMPORT_PROGRESS_CODE_DISPLAY[import_status] : '-';
    
    if (statusDisplay === 'Error') {
      statusDisplay = `<span class="error-red">${statusDisplay}</span>`;
    } else if (statusDisplay === 'Complete') {
      statusDisplay = `<span class="success-green">${statusDisplay}</span>`;
    }

    return {
      Formatter,
      userDisplay: userDisplay ? userDisplay.getDisplayName() : '-',
      fileNameDisplay: this.import_file_model ? this.import_file_model.get('file_name') : '',
      statusDisplay,
      errorMsg: this.errorMsg,
      successMsg: this.successMsg,
      loaderMsg: this.loaderMsg
    };
  }
});