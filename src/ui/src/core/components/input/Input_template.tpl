<div class="<%= !labelText ? 'hidden' : '' %>">
  <label class="form-control-label <%= customLink ? 'input-has-link' : '' %>"><%= labelText %></label>
  <% if (subLabel) { %>
    <span class="input-placeholder"><%= subLabel %></span>
  <% } else if (customLink || secondCustomLink) { %>
    <label class="input-model-custom-link-container">
      <% if (customLink) { %>
        <a href="javascript:;" class="input-model-custom-link"><%= customLink %></a>
      <% } %>
      <% if (customLink && secondCustomLink) { print(' - '); } %>
      <% if (secondCustomLink) { %>
        <a href="javascript:;" class="input-model-second-custom-link"><%= secondCustomLink %></a>
      <% } %>
    </label>
  <% } %>
  <% if (helpHtml) { %>
    <span><a role="button" class="badge help-icon">?</a></span>
  <% } %>
</div>
<div class="intake-input-component-input-container">
<% if (displayTitle) { %>
  <span class="input-display-title"><%= displayTitle %></span>
<% } %>
<% if (showValidate) { %>
<div class="row input-group-container">
    <div class="<%= validateButtonWrap ? 'col-xs-12 col-sm-12' : 'col-xs-12 col-sm-8' %>">
<% } %>
<% if (inputType === 'date') { %>
  <div class="input-group <%= disabled ? 'disabled' :'' %>">
    <span class="input-group-addon <%= disabled ? 'cursor-disabled' : 'clickable' %>"><span class="glyphicon glyphicon-calendar"></span></span>
    <input autocomplete="off" name="<%= name %>" type="<%= isMobile ? 'date' : 'text' %>"  class="form-control" value="<%= value %>"
      <%= allowFutureDate ? '' : 'max="'+Moment().format(getDateFormat())+'"' %> <%= minDate ? 'min="'+Moment(minDate).format(getDateFormat())+'"' : '' %>
      <%= disabled? 'disabled="disabled"' : '' %> <%= autofocus? 'autofocus' : '' %>
    />
  </div>
<% } else if (inputType === 'time') { %>
  <div class="input-group <%= disabled ? 'disabled' :'' %>">
    <span class="input-group-addon <%= disabled ? 'cursor-disabled' : 'clickable' %>"><span class="glyphicon glyphicon-time"></span></span>
    <input autocomplete="off" name="<%= name %>" type="text" class="form-control"
      <%= disabled? 'disabled="disabled"' : '' %> <%= autofocus? 'autofocus' : '' %>
    />
  </div>
  <% } else if (inputType === 'currency') { %>
  <div class="input-group">
    <span class="input-group-addon">$</span>
    <input autocomplete="off" name="<%= name %>" class="form-control <%= disabled? 'disabled' : '' %>" value="<%= _.escape.escape(value) %>"
      <%= maxLength? 'maxLength=' + maxLength : '' %>
      <%= disabled? 'disabled="disabled"' : '' %> />
  </div>
<% } else { %>
  <input <%= inputType === 'password' ? ' type="password" ' : '' %> <%= inputType === 'phone'? 'type="tel" pattern="\\d*"':'' %> name="<%= name %>" class="form-control" value="<%= value %>" <%= maxLength? 'maxLength=' + maxLength : '' %>
  <%= disabled? 'disabled="disabled"' : '' %> <%= autofocus? 'autofocus' : '' %>
  <%= placeholder ? 'placeholder="'+placeholder+'"' : '' %>
  <%= autocomplete ? '' : 'autocomplete="off"' %> />
<% } %>

<% if (showValidate) { %>
  </div>
  <div class="validateContainer col-xs-12 col-sm-4">
      <button class="option-button selected btn-validate btn-disabled">Accept</button>
  </div>
</div>
<% } %>
</div>
<p class="error-block"></p>
