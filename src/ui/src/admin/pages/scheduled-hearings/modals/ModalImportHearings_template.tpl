<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">Import Schedule</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      <div class="import-schedule-type"></div>

      <!-- Pre-upload progress UI state -->
      <div class="import-schedule-container">
        <div class="import-schedule-info-container">
          <div class="import-schedule-info-dates-container">
            <div class="import-schedule-start-date"></div>
            <div class="import-schedule-end-date"></div>
            <div class="import-schedule-date-duration"></div>
          </div>
          <div class="import-schedule-file-container">
            <div class="import-schedule-uploader-display-container hidden-item"></div>
            <div class="import-schedule-uploader <%= datesProvided ? '' : 'hidden-item' %>"></div>
          </div>
        </div>

        <div class="import-schedule-processing-report-container hidden-item"></div>

        <div class="import-schedule-note-container hidden-item">
          <div class="import-schedule-note"></div>
        </div>
        <div class="">
          <div class="modal-button-container">
            <span class="import-schedule-hearings-count"></span>
            <button type="button" class="btn btn-lg btn-primary btn-continue hidden-item">
              Start Import
            </button>
          </div>
        </div>
      </div>

      <!-- Used as a region for in-progress view -->
      <div class="import-progress-container"></div>

    </div>
  </div>
</div>
