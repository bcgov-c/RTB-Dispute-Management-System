<% if (staticError) { %>
  <div class="static-error-warning"><%= staticError %></div>
  <div class="spacer-block-15"></div>
<% } %>
<% if (staticWarning) { %>
  <div class="warning"><%= staticWarning %></div>
<% } %>
<div class="step-description">
    <%= stepText %>
    <span class="<%= helpHtml ? '' : 'hidden-item' %>"><a role="button" class="badge help-icon">?</a></span>
</div>
<div class="page-item-child-view"></div>
