<div class="" data-header-extend="15">
  <div class="participant-section section-header persist-header">
    <div>
      <%= unitName %>
      <span class="participant-delete-icon general-delete-icon"></span>
    </div>
  </div>
  
  <div class="participant-use-dispute-address-container">
    <span class="participant-use-dispute-address-text">Use Main Postal Code&nbsp;<span class="participant-use-dispute-address"><%= disputePostalCode %></span></span>
  </div>
  <div class="participant-address"></div>

  <div class="participant-use-mail"></div>

  <div class="participant-mailing-address <%= hasUnitType ? '' : 'hidden-address' %>"></div>
</div>
