<% if (showThumbnails) { %>
  <div class="file-display-card">
    <div class="file-display-card-content">
      <div class="file-display-image-container">
        <img class="file-display-image" src="<%= LoaderImg %>" />
        <img class="file-display-image hidden" src="<%= file.getThumbnailURL() %>" />
      </div>
      <div class="file-display-card-description">
        <div class="file-display-card-description-wrapper <%= noControls ? 'file-display-card-description-no-controls' : '' %>" >
<% } %>
          <% if (showDelete) { %><img class="file-display-delete" src="<%= require('../../static/Icon_AdminPage_Delete.png') %>"/><% } %>
          <% if (showInfo) { %>
            <span class="file-display-info" tabindex="-1" data-toggle="popover" data-container="body" data-trigger="focus" title="<%= infoTitle %>" data-content="<%= infoDescription %>" >
              <img src="<%= require('../../static/Icon_Admin_Cmn_Info.png') %>"/>
            </span>
          <% } %>
          <% if (showModelType) { %><img class="file-display-model-type" src="<%= modelTypeIconUrl %>"/><% } %>
          <% if (showEdit) { %><img class="file-display-edit" src="<%= require('../../static/Icon_Admin_Cmn_Edit.png') %>"/><% } %>
          
          <span class="file-display-name <%= showFilenameDownload ? 'filename-download' : '' %>"><%= file_name %></span>
<% if (showThumbnails) { %>
        </div>
<% } %>
        <div class="file-display-card-created-wrapper">
          <span class="file-display-created">(<%= Formatter.toFileSizeDisplay(file_size) %>, <%= Formatter.toDateDisplay(modified_date) %>)</span>
        </div>
        <% if (!showThumbnails && showComma) { %>
          <span>, </span>
        <% } %>
<% if (showThumbnails) { %>
      </div>
    </div>
  </div>
<% } %>