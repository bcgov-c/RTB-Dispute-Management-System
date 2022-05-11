
<%= TOU_template %>
<div id="p1-TOU"></div>

<div id="p1-PropertyType"></div>
<div id="p1-ManufacturedHomeType"></div>
<div id="p1-mhptaWarning" class="ari-intake-page-warning hidden-item">
  <span>Manufactured Home Park tenancies are not eligible to apply for a renovation application. Learn more&nbsp;<a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/ending-a-tenancy/renovictions">here</a>.</span>
</div>

<div id="p1-RentalAddress"></div>
<div id="out-of-bc-warning" class="ari-intake-page-warning hidden-item">
  <span>This address does not appear to be a valid British Columbia address. Check that the address is correct before you continue.</span>
</div>

<div id="p1-havePermitsQuestion"></div>
<div id="p1-havePermitsQuestion-warning" class="ari-intake-page-warning <%= showHavePermitsWarning ? '' : 'hidden-item' %>">
  <span>Your application may be dismissed if you are unable to provide evidence regarding permits or approvals for renovations or repairs that require vacant possession.</span>
</div>

<div id="p1-evictionsRequiredQuestion"></div>
<div id="p1-evictionsRequiredQuestion-warning" class="ari-intake-page-warning <%= showEvictionsRequiredWarning ? '' : 'hidden-item' %>">
  <span>Your application may be dismissed if you are unable to provide evidence that the renovations or repairs require vacant possession.</span>
</div>

<div class="page-navigation-button-container">
  <button class="navigation option-button step-next hidden-item" type="submit">NEXT</button>
</div>
