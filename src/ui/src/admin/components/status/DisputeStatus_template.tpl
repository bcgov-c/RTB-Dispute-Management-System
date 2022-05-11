<div class="dispute-party-column left-column">

  <div class="">
    <div class="review-status-icon status-icon-display-only review-status-stage-icon"></div>
    <div class="review-status-stage-container">
      <div class="review-stage-container">
        <div class="review-status-icon status-icon-edit-only review-status-stage-icon"></div>
        <div class="review-status-stage"></div>
      </div>
      <div class="review-status-container">
        <div class="review-status-icon status-icon-edit-only review-status-stage-icon"></div>
        <div class="review-status"></div>
      </div>
    </div>
  </div>

  <div class="" style="position:relative">
    <div class="review-status-icon status-icon-display-only review-status-owner-icon"></div>
    <div class="review-status-owner-display-container">
      <div class="review-status-owner-display">
        <label>Owner:</label>&nbsp;<span><%= ownerDisplay %></span>
      </div>
    </div>

    <div class="review-status-owner-edit-container">
      <div class="review-status-icon status-icon-edit-only review-status-owner-icon"></div>
      <div class="review-status-owner-container hidden-item"></div>
    </div>
  </div>

  <p class="error-block"></p>
</div>

<div class="dispute-party-column right-column">
  <div class="" style="position:relative">
    <div class="review-status-icon review-status-process-icon"></div>
    <div class="review-status-process-container">
      <div class="review-status-process"></div>
    </div>
  </div>
  <div class="" style="position:relative">
    <div class="review-status-icon review-status-override-icon"></div>
    <div class="review-status-override-container">
      <div class="review-evidence-override"></div>
    </div>
  </div>

  <div class="review-status-note <%= hasComment ? '' : 'review-status-note--empty' %>"></div>

</div>

<div class="quickstatus-container hidden">
  <div class="quickstatus-container-title">Quick status options</div>
  <div class="quickstatus-region"></div>
</div>
