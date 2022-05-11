<% if (optionData.length > 0 || defaultBlank) { %>
  <div class="<%= cssClass %>">
    <% if (displayTitle) { %>
      <span class="dropdown-display-title"><%= displayTitle %></span>        
    <% } %>
    <% if (labelText) { %>
      <label class="form-control-label"><%= labelText %></label>
    <% }%>
    <% if (customLink) { %>
      <label class="dropdown-model-custom-link-container">
        <a href="javascript:;" class="dropdown-model-custom-link"><%=customLink%></a>
      </label>
    <% } %>
    <% if (helpHtml) { %>
      <span><a role="button" class="badge help-icon">?</a></span>
    <% } %>
    <select <%= disabled ? 'disabled="disabled"' : '' %> class="form-control" <%= displayTitle ? 'style="display:inline-block;"' : '' %> >
    <% if(defaultBlank) { %>
      <option value="" <%= !value || value === "0" ? 'selected="selected"' : '' %> ></option>
    <% } %>
    <% _.escape.each(optionData, function(option) { %>
      <option value="<%= option.value %>" <%= (value === option.value)? 'selected="selected"' : '' %> >
        <%= option.text %>
      </option>
    <% }); %>
    </select>
    <% if (showRemovalButton) { %>
      <div class="dropdown-remove"></div>
    <% } %>
  </div>
<% } else { %>
  <i>[Warning] No options defined</i>
<% } %>
<p class="error-block"></p>
