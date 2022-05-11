
<div class="unit-rent-increase <%= isChecked ? 'unit-rent-increase--open' : '' %>">
  <div class="unit-rent-increase-checkbox"></div>
  <div class="<%= isChecked ? '' : 'hidden-item' %> unit-rent-increase-content clearfix">

    <div class="step step-description">What is the current monthly rent and number of tenants on the tenancy agreement?</div>
    
    <div class="unit-rent-increase-content-inputs">
      <div class="unit-rent-increase-monthly-rent"></div>
      <div class="unit-rent-increase-tenants"></div>
      <div class="validateContainer hidden-xs">
        <button class="unit-rent-increase-validate-btn option-button selected btn-validate btn-disabled">Accept</button>
        <div class="error-block"></div>
      </div>
    </div>
    <div class="validateContainer visible-xs">
      <button class="unit-rent-increase-validate-btn option-button selected btn-validate btn-disabled">Accept</button>
      <div class="error-block"></div>
    </div>
  </div>
</div>