<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Add New Hearing</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">
      <div class="addHearing-dispute-info">
        <div>
          <label class="review-label">File Number:</label>&nbsp;<span><strong><%= dispute.get('file_number') %></strong></span>
        </div>
        <div>
          <label class="review-label">Dispute Priority:</label>&nbsp;<span><%= Formatter.toUrgencyDisplay(dispute.get('dispute_urgency'), { urgencyColor: true }) %></span>
        </div>
        <div>
          <label class="review-label">Dispute Complexity:</label>&nbsp;<span><%= complexityDisplay %></span>
        </div>
      </div>

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

    </div>
  </div>
</div>
