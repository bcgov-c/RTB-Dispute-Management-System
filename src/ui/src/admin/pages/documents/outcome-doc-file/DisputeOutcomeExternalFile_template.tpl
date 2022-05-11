<% if (file_model) { %>
  <div class="dispute-issue-evidence-content">
    
    <span class="dispute-issue-evidence-files">
      <div class="dispute-issue-evidence-file <%= !file_model.isAccepted() ? '' : 'not-file-accepted' %>">
        <a href="javascript:;" data-file-id="<%= file_model.get('file_id') %>" class="filename-download"><%= trimFileNamesTo ? file_model.getTrimmedName(trimFileNamesTo) : file_model.get('file_name') %></a>
        <% if (file_model.get('file_size')) { %>
            <span class="dispute-issue-evidence-filesize">(<%= Formatter.toFileSizeDisplay(file_model.get('file_size')) %>)</span>
        <% } %>
      </div>
    </span>

    <div class="dispute-issue-evidence-submitted-info">
      <span><%= Formatter.toUserDisplay(file_model.get('created_by')) %></span>
      &nbsp;-&nbsp;
      <span><%= Formatter.toDateDisplay(file_model.get('created_date')) %></span>
    </div>
  </div>

  <div class="outcome-external-file-delete-btn clickable"></div>
<% } %>