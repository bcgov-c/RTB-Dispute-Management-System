<div class="dispute-party-column left-column">
  <div class="review-participant-name-section">
    <div class="review-participant-type"></div>    
    <div class="participant-business-name <%= !isBusiness ? 'hidden-item' : '' %>"></div>

    <div class="review-applicant-name <%= isBusiness ? 'hidden-item' : '' %>">
      <div class="review-participant-first"></div>
      <div class="review-participant-last"></div>
    </div>

    <div class="review-applicant-contact-name <%= isBusiness ? '' : 'hidden-item' %>">
      <div class="review-participant-business-name"></div>
      <div class="review-participant-contact-first"></div>
      <div class="review-participant-contact-last"></div>
    </div>
  </div>

  <div class="review-participant-rent-unit"></div>
  <div class="review-participant-address"></div>

  <div class="review-participant-mail-address"></div>

  <!-- Contact section -->
  <div class="review-participant-email"></div>
  <div class="review-participant-daytime-phone"></div>
  <div class="review-participant-other-phone"></div>
  <div class="review-participant-fax"></div>
</div>

<div class="dispute-party-column right-column">

  <div class="review-participant-primary-contact">
    <label>Primary Contact:</label>&nbsp;<span><%= primaryContactDisplay %></span>
  </div>

  <div class="review-participant-status"></div>
  <div class="review-participant-contact-method"></div>
  <div class="review-participant-hearing-options-by"></div>
  <div class="review-participant-access-code <%= access_code ? '' : 'hidden-item' %>">
    <label>Access Code:</label>&nbsp;<span><%= access_code %></span>
  </div>
  <div class="">
    <label>Substituted Service:</label>&nbsp;<span><%= is_sub_service ? 'Yes (' + associatedSubServices.length + ')' : 'No' %></span>
  </div>

  <div class="review-participant-tou"></div>
  <div class="review-participant-tou-date"></div>
</div>