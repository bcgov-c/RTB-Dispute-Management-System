<% if(optionData.length > 0) { %>
<div class="radio <%= cssClass %>" style="display: inline-block;">
  <% if (displayTitle) { %>
    <span class="radio-display-title"><%= displayTitle %></span>
  <% } %>
  <% _.escape.each(optionData, function(option) { %>
    <label class="<%= isValueDisabledFn(option.value) ? 'disabled' : option.cssClass %>">
      <input type="radio" name="<%= option.name || name %>" value="<%= option.value %>" <%= (value === option.value)? 'checked="checked"' : '' %>>
      <span><%= option.text %></span>
      <% if (typeof option.subtext === 'string') { %>
      <br />
      <span class="subtext"><small><%= option.subtext %></small></span>
      <% } %>
    </label>
    <% if (option.separatorHtml) { %>
      <%= option.separatorHtml %>
    <% } %>
  <% }); %>
</div>
<% } else { %>
  <i>no options defined....</i>
<% } %>
<p class="error-block"></p>
