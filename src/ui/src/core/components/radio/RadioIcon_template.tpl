<% if(optionData.length > 0) { %>
  <div class="<%= cssClass %>" style="display: inline-block;">
    <% _.escape.each(optionData, function(option) { %>
      <div data-val="<%= option.value %>" class="radio-icon
            <%= disabled ? 'disabled' : ''%>
            <%= option.iconClass %>
            <%= value === option.value ? 'selected' : ''%>
            <%= isSingleViewMode && value !== option.value ? 'hidden' : ''%>
        ">
        <%= option.iconText %>
      </div>
    <% }); %>
  </div>
<% } else { %>
  <i>no options defined....</i>
<% } %>
<p class="error-block"></p>
  