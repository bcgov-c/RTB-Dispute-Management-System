<% if (!hidden) { %>
<div class="clearfix intake-checkbox-component <%= cssClass %> <%= disabled ? 'disabled' : '' %>">
  <label class="form-control-label checkbox-title">
    <input type="checkbox" <%= checked ? 'checked="checked"' : '' %> <%= disabled ? 'disabled="disabled"' : '' %>  />
    <span>
      <%= html %>
      <% if (helpHtml) { %>
        <span class="<%= helpHtml ? '' : 'hidden-item' %>"><a role="button" class="badge help-icon">?</a></span>
      <% } %>
    </span>
  </label>
  <p class="error-block"></p>
</div>
<% }%>
