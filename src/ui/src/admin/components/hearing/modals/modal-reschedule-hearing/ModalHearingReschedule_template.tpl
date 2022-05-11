<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Reschedule Hearing</h4>
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
    
      <p class="modal-body-description">Use the search to find and select an open hearing to move the current hearing disputes to.</p>

      <div class="addHearing-filter-priority-container">
        <span><strong>Include Hearing Urgencies:</strong></span>
        <div class="addHearing-filter-priority"></div>
      </div>

      <div class="addHearing-filter-arbLevels-container">
        <span><strong>Include Arbitrator Levels:</strong></span>
        <div class="addHearing-filter-arbLevels"></div>
      </div>

      <div class="addHearing-filters-row">
        <div class="addHearing-filter-min-date"></div>
        <div class="addHearing-filter-min-start-time"></div>
        <div class="addHearing-filter-max-date"></div>
        <div class="addHearing-filter-staff"></div>

        <div class="addHearing-search-btn"></div>
      </div>

      <div class="addHearing-search-results-container">
        <div class="addHearing-search-results"></div>

        <div class="show-more-disputes-container">
          <div class="show-more-disputes addHearing-search-results-load-more <%= showLoadMore ? '' : 'hidden' %>">Show more</div>
        </div>
      </div>

      <div class="modal-button-container">
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</div>
  