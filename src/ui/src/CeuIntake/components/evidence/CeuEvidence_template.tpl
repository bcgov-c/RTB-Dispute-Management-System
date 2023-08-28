<div class="col-sm-10 col-md-8 col-lg-7 evidence-item clearfix">
  <div class="evidenceActionSelector <%= selected_action ? 'hidden-item' : '' %>"></div>

  <% if (selected_action) { %>
    <div class="evidence-name <%= required ? '' : 'optional-input' %>" >
      <label><%= titleDisplay %></label>
      <% if (helpHtml) { %>
        <span><a role="button" class="badge help-icon">?</a></span>
      <% } %>
    </div>

    <div class="evidence-action-selected">
    <% if (selected_action === '100' && files) { %>
      <span class="action-success"></span>
      <a class="edit-evidence-link">edit</a>
      <div class="action-links">
        <span class="files-info">(<%= files.length %> file<%=(files.length === 1)?'':'s'%>, <%= filesSize %>, <%= filesModifiedDate %>)</span>
      </div>
    <% } else { %>
      <span class="<%= file_method_class %>"><span><%= EVIDENCE_METHODS_DISPLAY[selected_action] %></span></span>
      <div class="action-links">&nbsp;-&nbsp;
        <span class="<%= link_name ? '' : 'hidden-item' %>"><a class="selected-action-link"><%= link_name %></a>&nbsp;|&nbsp;</span>
        <span><a class="selected-action-change-link">change</a></span>
        <% if (isIssueCustom) { %>
          <span>|&nbsp;<a class="other-evidence-delete-link">delete</a></span>
        <% } %>
      </div>
    <% } %>
    </div>
  <% } %>
  <p class="error-block"></p>

  <div class="<%= isIssueCustom ? '' : 'hidden-item' %>"></div>
</div>
