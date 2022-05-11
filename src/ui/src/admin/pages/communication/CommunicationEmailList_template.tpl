<div class="standard-list-header <%= hasVisibleItems ? '' : 'hidden' %>">
  <div class="message-type-column"><%= typeText %></div>
  <div class="recipient-column"><%= recipientText %></div>
  <% if (isPickup) { %>
    <div class="email-created-column">Created</div>
  <% } %>
  <div class="subject-column"><%= subjectText %></div>
  <div class="attachments-column">Attachments</div>
  <div class="send-status-column"><%= sendStatusText %></div>
</div>

<div class="standard-list-items"></div>