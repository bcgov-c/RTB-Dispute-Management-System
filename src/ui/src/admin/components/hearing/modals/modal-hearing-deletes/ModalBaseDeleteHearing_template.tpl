<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title"><%= titleText %></h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">

      <div class="modalBaseDeleteHearing-date-owner-container">
        <div class="">
          <div class="modalBaseDeleteHearing-date-info"></div>
          <div class="modalBaseDeleteHearing-link-info"></div>
        </div>
        <div class="modalBaseDeleteHearing-owner-info"></div>
      </div>
      
      <p class="modal-body-description"><%= instructionsText %></p>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
        <button type="button" class="btn btn-lg btn-default btn-primary btn-continue"><%= continueButtonText %></button>
      </div>
    </div>
  </div>
</div>
