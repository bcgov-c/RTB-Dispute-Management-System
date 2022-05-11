
<div class="ari-page-content-title">Renovation Units</div>
<div class="ari-intake-unitCount"></div>

<div class="pfr-iu-units-container">
  <div class="step-description <%= hasUnitsSelected ? '' : 'hidden' %>">
    <span><%= claimTitleToUse %></span>
    <span><a role="button" class="<%= claimHelpHtml ? 'hidden-item' : '' %> badge help-icon">?</a></span>
  </div>
  <div id="pfr-iu-units"></div>
</div>

<div class="page-navigation-button-container">
  <button class="navigation option-button step-previous" type="submit">BACK</button>
  <button class="navigation option-button step-next hidden-item" type="submit">NEXT</button>
</div>
