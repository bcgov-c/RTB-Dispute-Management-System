<label class="form-control-label <%= !labelText ? 'hidden': '' %>">
  <span><%= labelText %></span>
  <% if (helpHtml) { %>
    <span><a role="button" class="badge help-icon">?</a></span>
  <% } %>
</label>

<% if (showValidate) { %>
  <div class="">
<% } %>

<% if (disabled && !showInputEntry) { %>
  <div class="disabled-content disabled"><%= value %></div>
<% } else { %>
  <textarea rows="<%= displayRows %>" class="form-control <%= cssClass %>"
      maxlength="<%= max %>" <%= disabled ? 'disabled="true"' : '' %>
      <%= autofocus ? 'autofocus=true' : '' %>
  ><%= value %></textarea>
  <% if (countdown) { %>
    <div class="textarea-countdown">
      <span>Max <%= max %> characters (<span class="countdown-value"><%= max - (!value ? 0 : value.length) %></span>&nbsp;left)</span>
    </div>
  <% } %>

  <% if (showValidate) { %>
    </div><div class="validateContainer">
      <a href="#" class="option-button yes-no selected btn-validate">Accept</a>
    </div>
  <% } %>
<% } %>

<% if (!disabled) { %>
  <p class="error-block"></p>
<% } %>
