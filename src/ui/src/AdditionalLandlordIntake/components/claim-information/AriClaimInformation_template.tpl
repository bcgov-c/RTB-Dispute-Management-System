<div class="evidence-claim-container-parent">
  <div class="evidence-claim-container container-with-border persist-area" data-header-extend="0">
      <div class="evidence-claim-header clearfix persist-header">
          <div class="evidence-claim-number"><%= claimIndexDisplay %></div>
          <div class="evidence-claim-title">
            <span><%= claim_title %></span>
            <span><a role="button" class="<%= helpHtml ? 'hidden-item' : '' %> badge help-icon">?</a></span>
          </div>
      </div>
      <div class="evidence-claim-body clearfix">
          <div class="evidence-claim-banner"></div>
          <div class="evidence-claim-details">
            <div class="evidence-claim-remedies"></div>
            <div class="col-xs-12 evidence-claim-remedy-totals-container clearfix">
              <div class="evidence-claim-remedy-totals">
                <div class="">Expenses:&nbsp;<b class="remedy-num-expenses"><%= numExpenses %></b></div>
                <div class="">Total:&nbsp;<b class="remedy-total"><%= displayTotal %></b></div>
              </div>
              <div class="evidence-claim-add-remedy-container">
                <div class="evidence-claim-add-remedy general-link">Add another expense</div>
              </div>
            </div>

            <div class="evidence-claim-evidence-section col-xs-12">
              <div class="section-header">Supporting evidence</div>
              <div class="evidence-claim-evidence"></div>
            </div>
          </div>
      </div>
  </div>
</div>
