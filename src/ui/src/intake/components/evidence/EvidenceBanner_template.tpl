<% if (evidence_status === 'later') { %>
  <div style="background-color: #fff; border: 0; color: #e09400; padding: 5px 8px 5px 8px; line-height: 22px;">
    <div style="min-height: 28px; line-height: 20px; padding: 2px 0px; display: table-cell; display: flex; align-items: center;">
      <img style="margin-right: 10px" src="<%= COMMON_IMAGE_ROOT + 'Icon_FeedbackReminder.png' %>" />
      <span style="top: 3px; position: relative; font-size: 16px;"><% if (!useShortMessages) { %><b>Reminder:</b> <% } %>Important information being provided later<% if (!useShortMessages) { %>.  Tip: provide important information as soon as possible!<% }%></span>
    </div>
  </div>
<% } else if (evidence_status === 'missing') { %>
  <div style="padding: 5px 8px 5px 8px; line-height: 22px; background-color: #fff; border: 0; color: #dc3030;">
    <div style="min-height: 28px; line-height: 20px; padding: 2px 0px; display: table-cell; display: flex; align-items: center;">
      <img style="margin-right: 10px;" src="<%= COMMON_IMAGE_ROOT + 'Icon_FeedbackWarning.png' %>"/>
      <span style="position: relative; top: 3px; font-size: 16px"><% if (!useShortMessages) { %><b>Warning:</b> <% } %>Missing important information!<% if (!useShortMessages) { %>  Tip: Provide important information or your application could be affected!<% } %></span>
    </div>
  </div>
<% } else if (evidence_status === 'provided') { %>
  <div style="background-color: #fff; border: 0; color: #139b39; padding: 5px 8px 5px 8px; line-height: 22px;">
    <div style="min-height: 28px; line-height: 20px; padding: 2px 0px; display: table-cell; display: flex; align-items: center;">
      <img style="margin-right: 10px;" src="<%= COMMON_IMAGE_ROOT + 'Icon_FeedbackOK.png' %>"/>
      <% if (useShortMessages) { %>
        <span style="position: relative; top: 3px; font-size: 16px">Important information provided</span>
      <% } else { %>
        <span style="position: relative; top: 3px; font-size: 16px"><b>Important information provided</b>.  Tip: Always provide clear descriptions and strong supporting evidence</span>
      <% } %>
    </div>
  </div>
<% } %>