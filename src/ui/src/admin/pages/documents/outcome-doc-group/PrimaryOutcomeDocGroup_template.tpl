<div class="primary-outcome-doc-group__top-row">
  <div class="">
    <label>File Number:</label>&nbsp;<%= fileNumber %>
  </div>
  <div class="primary-outcome-doc-group__primary-link general-link">Go to Primary file</div>
  <div class="primary-outcome-doc-group__date">
    <b class="dispute-outcome-doc-group-delivery-date-icon"></b>
    <label>Document Date:</label>&nbsp;<%= Formatter.toDateDisplay(doc_completed_date) || '-' %>
  </div>
</div>
<div class="primary-outcome-doc-group__docs clearfix">
  <% docGroupOutcomeFiles.forEach(function(outcomeDoc) { %>
    <% var file_id = outcomeDoc.get('file_id'); %>
    <% var file_model = file_id && fileModelLookup && fileModelLookup[file_id]; %>
    <div class="primary-outcome-doc-group__doc">
      <span class=""><%= outcomeDoc.getFileTitleDisplay() %>:</span>&nbsp;
      <div class="primary-outcome-doc-group__doc-file">
        <% if (file_model) { %>
          <div data-file-id="<%= file_id %>" class="primary-outcome-doc-group__file general-link"><%= file_model.get('file_name') %></div>
          <div class="primary-outcome-doc-group__file-size">(<%= Formatter.toFileSizeDisplay(file_model.get('file_size')) %>)</div>
        <% } else { %>
          <i>No document file uploaded</i>
        <% } %>
      </div>
    </div>
  <% }); %>
</div>
