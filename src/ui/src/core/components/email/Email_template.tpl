
<% if (widgetMode) { %>
  <div class="component-email-input-slide-container <%= floatDir %>">
    <div class="component-email-input-slide <%= floatDir %>">
      <div class="component-email-icon <%= iconClass ? iconClass : '' %>"></div>
      <div class="component-email-input-container hidden">
        <div class="component-email-input"></div> 
        <div class="component-email-buttons">
          <div class="component-email-buttons-cancel"></div>
          <div class="component-email-buttons-ok"></div>
        </div>
      </div>
      <div class="component-email-label"><%= labelText %></div>
    </div>

    <div class="component-email-sending-slide <%= floatDir %> hidden"></div>
    <div class="component-email-result-slide <%= floatDir %> hidden">
      <div class="component-email-result-success">
        <% if (floatDir === 'float-left') { %>
          <div class="component-email-success-icon <%= floatDir %>"></div>
          <div class="component-email-success-text <%= floatDir %>">Email sent</div>
        <% } else { %>
          <div class="component-email-success-text <%= floatDir %>">Email sent</div>
          <div class="component-email-success-icon <%= floatDir %>"></div>
        <% } %>
      </div>
      <div class="component-email-result-fail hidden">
          <% if (floatDir === 'float-left') { %>
            <div class="component-email-fail-icon <%= floatDir %>"></div>
            <div class="component-email-fail-text <%= floatDir %>">There was a problem sending email</div>
          <% } else { %>
            <div class="component-email-fail-text <%= floatDir %>">There was a problem sending email</div>
            <div class="component-email-fail-icon <%= floatDir %>"></div>
          <% } %>
        </div>
    </div>
  </div>
<% } else { %>
  <div class="component-email-input"></div> 
<% } %>