<div class="import-schedule-processing-report">
  <div class="import-errors-header-row">
    <div class="">Validation</div>
    <div class="">Result</div>
    <div class="">Details</div>
  </div>
  <div class="import-errors-content">

    <% _.escape.each(error_rows, function(error_row) { %>
      <div class="import-errors-content-row">
        <% _.escape.each(error_row, function(error_col) { %>
          <div class=""><%= error_col %></div>
        <% }) %>
      </div>
    <% }) %>
  </div>
</div>