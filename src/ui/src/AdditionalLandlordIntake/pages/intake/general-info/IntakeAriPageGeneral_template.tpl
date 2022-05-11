
<%= TOU_template %>
<div id="p1-TOU"></div>

<div id="p1-PropertyType"></div>
<div id="p1-ManufacturedHomeType"></div>
<div id="p1-mhptaWarning" class="ari-intake-page-warning hidden-item">
  <span>Manufactured Home Park tenancies are not eligible to apply for a rent increase through this application. Learn more&nbsp;<a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases/additional-rent-increase">here</a>.</span>
</div>

<div id="p1-RentalAddress"></div>
<div id="out-of-bc-warning" class="ari-intake-page-warning hidden-item">
  <span>This address does not appear to be a valid British Columbia address. Check that the address is correct before you continue.</span>
</div>

<div id="p1-repairsInPastQuestion"></div>
<div id="p1-repairsInPastQuestion-warning" class="ari-intake-page-warning <%= showRepairsInPastWarning ? '' : 'hidden-item' %>">
  <span>The capital expenditure must be incurred within the past 18-month period to be eligible for an additional rent increase. Learn more&nbsp;<a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases/additional-rent-increase">here</a>.</span>
</div>

<div id="p1-repairsAllowedQuestion"></div>
<div id="p1-repairsAllowedQuestion-warning" class="ari-intake-page-warning <%= showRepairsAllowedWarning ? '' : 'hidden-item' %>">
  <span>Capital expenditures must meet the criteria to be eligible for an additional rent increase. Learn more&nbsp;<a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/during-a-tenancy/rent-increases/additional-rent-increase">here</a>.</span>
</div>

<div id="p1-expectedRepairsQuestion"></div>
<div id="p1-expectedRepairsQuestion-warning" class="ari-intake-page-warning <%= showExpectedRepairsError ? '' : 'hidden-item' %>">
  <span>Capital expenditures cannot be expected to recur within the next 5 years.</span>
</div>

<div class="page-navigation-button-container">
  <button class="navigation option-button step-next hidden-item" type="submit">NEXT</button>
</div>
