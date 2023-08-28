<%
var color, imgUrl;

if (evidence_status === 'later') {
  color = '#e09400';
  imgUrl = COMMON_IMAGE_ROOT + 'Icon_FeedbackReminder.png';
} else if (evidence_status === 'missing') {
  color = '#dc3030';
  imgUrl = COMMON_IMAGE_ROOT + 'Icon_FeedbackWarning.png';
} else if (evidence_status === 'provided') {
  color = '#139b39';
  imgUrl = COMMON_IMAGE_ROOT + 'Icon_FeedbackOK.png';
}
%>

<% if (color && imgUrl) { %>
  <table style="background-color: #fff; border: 0; color: <%= color %>; border-top: solid 5px #ffffff;border-right: solid 8px #ffffff;border-bottom: solid 5px #ffffff;border-left: solid 8px #ffffff; line-height: 22px;">
    <tr style="min-height:20px;line-height: 20px; padding: 2px 0px; display: table;">
      <td>
        <img height="20" width="20" style="display:table-cell;vertical-align:middle;" src="<%= imgUrl %>" />
      </td>
      <td style="border-left: solid 5px #ffffff;">
        <span style="display: table-cell;vertical-align:middle;font-size: 16px;">
          <% if (evidence_status === 'later') { %>
            <% if (!useShortMessages) { %><b>Reminder:</b> <% } %>Important information being provided later<% if (!useShortMessages) { %>.  Tip: provide important information as soon as possible!<% }%>
          <% } else if (evidence_status === 'missing') { %>
            <% if (!useShortMessages) { %><b>Warning:</b> <% } %>Missing important information!<% if (!useShortMessages) { %>  Tip: Provide important information or your application could be affected!<% } %>
          <% } else if (evidence_status === 'provided') { %>
            <% if (useShortMessages) { %>
              Important information provided
            <% } else { %>
              <b>Important information provided</b>.  Tip: Always provide clear descriptions and strong supporting evidence
            <% } %>
          <% } %>
        </span>
      </td>
    </tr>
  </table>
<% } %>