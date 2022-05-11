<div class="intake-remedy-separator"></div>
<div class="clearfix">
  <% if (remedyUseAmount) { %>
    <div class="col-xs-12 col-sm-4 amount"></div>
  <% } %>
  <% if (remedyUseAssociatedDate) { %>
    <div class="col-xs-12 col-md-4 notice-due-date"></div>
  <% } %>
</div>
<% if (warning) { %>
  <div class="ari-remedy-warning warning error-block"><%= warning %></div>
<% } %>
<div class="ari-remedy-text-description-container clearfix">
  <% if (remedyUseTextDescription) { %>
      <div class="text-description"></div>
  <% } %>

  <% if (showDelete) { %>
    <span class="evidence-claim-delete remedy-delete-button"><div class="evidence-delete-icon"></div></span>
  <% } %>
</div>
