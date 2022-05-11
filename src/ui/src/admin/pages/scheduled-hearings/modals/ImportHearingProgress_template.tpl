<div class="import-schedule-progress-file-display"><%= fileNameDisplay %></div>

<div class="import-schedule-progress-note"><%= import_note %></div>

<div class="import-schedule-progress-loader-container">
  <% if (errorMsg) { %>
    <div class="import-schedule-progress-msg error-red"><%= errorMsg %></div>
  <% } else if (successMsg) { %>
      <div class="import-schedule-progress-msg success-green"><%= successMsg %></div>
  <% } else { %>
    <div class="import-schedule-progress-loader-msg"><%= loaderMsg %></div>
  <% } %>
</div>

<div class="import-schedule-progress-info-container">

  <div class="">
    <div>
      <label class="review-label">Import ID:</label>&nbsp;<span><%= hearing_import_id ? hearing_import_id : '-' %></span>
    </div>
    <div>
      <label class="review-label">Import File ID:</label>&nbsp;<span><%= import_file_id ? import_file_id : '-' %></span>
    </div>
    <div>
      <label class="review-label">Import Status:</label>&nbsp;<span><%= statusDisplay ? statusDisplay : '-' %></span>
    </div>
  </div>

  <div class="">
    <div>
      <label class="review-label">Import Started:</label>&nbsp;<span><%= import_start_datetime ? Formatter.toDateAndTimeDisplay(import_start_datetime) : '-' %></span>
    </div>
    <div>
      <label class="review-label">Import Completed:</label>&nbsp;<span><%= import_end_datetime ? Formatter.toDateAndTimeDisplay(import_end_datetime) : '-' %></span>
    </div>
    <div>
      <label class="review-label">Initiated By:</label>&nbsp;<span><%= userDisplay %></span>
    </div>
  </div>

</div>

<div class="import-schedule-progress-log-container">
  <div class="import-schedule-progress-log-header">Import Process Log</div>
  <div class="import-schedule-progress-log"><%= import_process_log %></div>
</div>

<div class="modal-button-container">
  <button type="button" class="btn btn-lg btn-primary btn-continue <%= successMsg || errorMsg ? '' : 'hidden-item' %>">Exit</button>
</div>