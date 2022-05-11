<div class="message-type-column"><%= messageTypeToDisplay %></div>
<div class="recipient-column"><span><%= recipientDisplay %></span></div>
<% if (isPickup && !isUnsentDraft) { %>
  <div class="email-created-column"><%= Formatter.toDateAndTimeDisplay(created_date) %></div>
<% } %>
<div class="subject-column"><%= subject %></div>
<div class="attachments-column"><%= email_attachments && email_attachments.length ? email_attachments.length  : '-' %></div>
<div class="send-status-column">
<% if (isSentError) { %>
  <span class="email-sent-error"><%= statusToDisplay %></span>
<% } else { %>
  <span class="email-status-regular <%= isUnsentDraft ? 'email-status--unsent' : '' %>"><%= statusToDisplay %></span>
<% } %>

</div>
<div class="view-email-column hidden-print">
  <a href="" class="view-email-link">View</a>
  <% if (showDelete) { %>
    <div class="comm-delete-email-btn"></div>
  <% } %>
</div>