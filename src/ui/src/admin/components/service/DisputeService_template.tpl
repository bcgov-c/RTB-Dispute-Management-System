<div class="dispute-notice-service-details-container <%= is_served === false ? 'not-served' : '' %>">
  <div class="dispute-notice-service-name">
    <span>
      <div class="dispute-notice-name-and-meta-data-wrapper">
        <div class="dispute-notice-name-wrapper">
          <% if (hasSubService) { %> 
            <span class="sub-service-icon-wrapper hidden-print"><b class="<%= subServiceIconClass %>"></b></span>
          <% } %>
            <div class="" tabindex="-1" data-toggle="popover" data-container="body" data-trigger="focus" title="<%= name %>" data-content="<%= name %>"><%= name %></div>
        </div>
        <% if(is_served !== null) { %>
        <div class="dispute-notice-meta-data">
          <div><%= modifiedDateText %></div>
          <div><%= modifiedByText %></div>
        </div>
        <% } %>
      </div>
      <div class="respondent-notice-delivery-icon-display hidden-print
      <%= is_served ? 'service-served-icon' : (is_served === null ? 'service-unknown-icon' : 'service-not-served-icon') %>
      <%= is_served !== null ? 'selected' : '' %>
      ">
    </div>
    </span>
  </div>

  <div class="respondent-notice-delivery-icons"></div>
  
  <% if (is_served === false) { %>
    <div class="respondent-notice-service-comment"></div>
  <% } %>
  
  <div>
    <div class="respondent-service-details">
      <div class="service-type"></div>
      <div class="respondent-notice-delivery-method"></div>
      <div class="respondent-notice-delivery-date"></div>
      <div class="respondent-notice-received-date"></div>
      <div class="respondent-notice-add-files-container <%= is_served ? '' : 'hidden-item' %>">
        <div class="respondent-notice-add-files">Edit Service Files</div>
        <p class="error-block"></span>
      </div>
    </div>

    <div class="">
      <% if (is_served !== false) { %>
        <div class="respondent-notice-service-comment"></div>
      <% } %>
      <div class="respondent-notice-files-list-display <%= uploadedFiles.length ? '' : 'hidden' %>">
        <span class="dispute-issue-evidence-files">
            <% _.escape.each(uploadedFiles, function(e_file, index) { %>
              <div class="dispute-issue-evidence-file <%= !e_file.isAccepted() ? '' : 'not-file-accepted' %>">
                <a href="javascript:;" data-file-id="<%= e_file.get('file_id') %>" class="filename-download"><%= e_file.get('file_name') %></a>
                <% if (e_file.get('file_size')) { %>
                    <span class="dispute-issue-evidence-filesize">(<%= Formatter.toFileSizeDisplay(e_file.get('file_size')) %>)</span>
                <% } %>
                <% if (index !== uploadedFiles.length - 1) { print('<span class="list-comma">, </span>'); } %>
              </div>
            <% }) %>
          </span>
      </div>
    </div>
  </div>
</div>
