<% if (evidence_status === 'later') { %>
  <div class="evidence-claim-warning-later">
    <div>
      <span><% if (!useShortMessages) { %><b>Reminder:</b> <% } %>Important information being provided later<% if (!useShortMessages) { %>.  Tip: provide important information as soon as possible!<% }%></span>
    </div>
  </div>
<% } else if (evidence_status === 'missing') { %>
  <div class="evidence-claim-warning-missing">
    <div>
      <span><% if (!useShortMessages) { %><b>Warning:</b> <% } %>Missing important information!<% if (!useShortMessages) { %>  Tip: Provide important information or your application could be affected!<% } %></span>
    </div>
  </div>
<% } else if (evidence_status === 'provided') { %>
  <div class="evidence-claim-warning-provided">
    <div>
      <% if (useShortMessages) { %>
        <span>Important information provided</span>
      <% } else { %>
        <span><b>Important information provided</b>.  Tip: Always provide clear descriptions and strong supporting evidence</span>
      <% } %>
    </div>
  </div>
<% } %>