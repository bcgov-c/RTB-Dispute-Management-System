<% if (!useFlatLayout) { %>
  <div class="streetContainer <%= useBootstrapStyles ? 'col-xs-12' : '' %>"></div>
  <% if (!useDefaultProvince) { %>
      <div class="provinceContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-6 col-sm-push-6' : '' %>"></div>
      <div class="countryDropdownContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-6 col-sm-pull-6' : '' %>"></div>
      <div class="countryTextContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-8' : '' %>"></div>
  <% } %>
  <div class="cityContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-8' : '' %>"></div>
  <div class="postalCodeContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-4' : '' %>"></div>
  <% if (useDefaultProvince) { %>
    <div class="provinceContainer <%= useBootstrapStyles ? 'col-xs-12 col-sm-8' : '' %>" style="margin-top:3px;">
      <label>British Columbia, Canada</label>
    </div>
  <% } %>

  <% if (showValidate === true) { %>
  <div class="validateContainer <%= useBootstrapStyles ? 'col-xs-12' + (useDefaultProvince? 'col-sm-4' : '') : '' %>">
    <button class="option-button selected btn-validate btn-disabled">Accept</button>
  </div>
  <% } %>
  <div class="address-error error-block <%= useBootstrapStyles ? 'col-xs-12' : '' %>"></div>
<% } else if (useFlatLayout) { %>
  <div class="streetContainer"></div>
  <div class="cityContainer"></div>
  <% if (!useDefaultProvince) { %>
    <div class="provinceContainer"></div>
    <div class="countryDropdownContainer"></div>
    <div class="countryTextContainer"></div>
  <% } %>
  <div class="postalCodeContainer"></div>
<% } %>