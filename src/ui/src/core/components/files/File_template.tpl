<% if (upload_status === 'ready' && !display_mode) { %>
  <div class="file-rename-container">
    <div class="file-rename"></div>
  </div>
  <div class="file-rename-display-container">
    <div class="file-rename-display-name <%= hasBeenRenamed ? COLOR_GRAY_CLASS_NAME : '' %>">
      <span><%= file_display_name %></span>
      <b class="glyphicon glyphicon-pencil <%= hasBeenRenamed ? '' : 'hidden' %>"></b>
    </div>
    <div class="file-rename-display-size"><%= fileSize %></div>
    <div class="file-rename-display-status file-success">ready to upload</div>
  </div>
  <div class="file-rename-remove file-remove-container">
    <div class="file-remove"></div>
  </div>
<% } else if (upload_status === 'uploaded' && editable && !display_mode) { %>
  <div class="file-rename-container">
    <div class="file-rename"></div>
  </div>
  <div class="file-rename-display-container">
    <div class="file-rename-display-name <%= hasBeenRenamed ? COLOR_GRAY_CLASS_NAME : '' %>">
      <span><%= file_display_name %></span>
      <b class="glyphicon glyphicon-pencil <%= hasBeenRenamed ? '' : 'hidden' %>"></b>
    </div>
    <div class="file-rename-display-size"><%= fileSize %></div>
    <div class="file-rename-display-status file-success">uploaded</div>
    <% if (showDelete) { %>
      <div class="file-delete-container">
        <div class="file-delete"></div>
      </div>
    <% } %>
  </div>
<% } else { %>
  <div class="file-display-container">
    <div class="file-name-size-status-progress-container">
      <div class="file-name-and-size">
        <div class="file-added-name">
          <% if (upload_status === 'uploaded' && !display_mode) { %>
            <a href="javascript:;" class="filename-download"><%= file_name %></a>
          <% } else { %>
            <%= file_name %>
          <% } %>
        </div>
        <div class="file-added-size"><%= fileSize %></div>
      </div>
      <div class="file-status-and-upload">
        <div class="file-added-status">
          <% if (error_state) { %>
            <span class="file-error"><%= error_message %></span>
          <% } else { %>
            <span class="file-success"><%= upload_status %></span>
          <% } %>
        </div>
        <div class="file-upload-progress-container <%= error_state ? 'hidden' : '' %>">
          <% if (upload_status === 'uploading' || upload_status === 'downloading' || true) { %>
            <div class="file-progress-bar-container processing-file-uploading-loader">
              <div class="file-progress-bar"></div>
            </div>
          <% } %>
        </div>
      </div>
    </div>
    <% if (upload_status === 'uploaded' && showDelete) { %>
      <div class="file-delete-container">
        <div class="file-delete"></div>
      </div>
    <% } else if (upload_status === 'ready') { %>
      <div class="file-remove-container">
        <div class="file-remove"></div>
      </div>
    <% } %>
  </div>
<% } %>
