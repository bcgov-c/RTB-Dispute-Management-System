<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">RI Dashboard (Rent Increase)</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">

      <div class="ari-dashboard-table-container">
        <div class="ari-dashboard-table-header-titles">
          <div class="ari-dashboard-table-units">
            <span class="ari-dashboard-table-header-title">Units / Tenants</span>
          </div>
          <div class="ari-dashboard-table-unit-costs <%= costCollection.length === 1 ? 'single-unit-costs' : '' %>">
            <span class="ari-dashboard-table-header-title">Application Units/Costs</span>
            <div class="ari-dashboard-table-section">
              <% costCollection.each(function(costModel, index) { %>
                <div class="ari-dashboard-table-unit-cost"></div>
              <% }) %>
            </div>
          </div>
          <div class="ari-dashboard-table-arb-awards-container">
            <span class="ari-dashboard-table-header-title">Arb Award Units/Costs</span>
            <div class="ari-dashboard-table-section">
              <% filteredRemedyModels.forEach(function() { %>
                <div class="ari-dashboard-table-arb-award"></div>
              <% }) %>
            </div>
          </div>
          <div class="ari-dashboard-table-ri-container">
            <span class="ari-dashboard-table-header-title">Rent Increase</span>
          </div>
        </div>
        <div class="ari-dashboard-table-header ari-dashboard-line">
          <div class="ari-dashboard-table-section ari-dashboard-table-units">
            <div class="ari-dashboard-table-unit">Unit</div>
            <div class="ari-dashboard-table-rent">Rent</div>
            <div class="ari-dashboard-table-tenants">Tenants</div>
            <div class="ari-dashboard-table-ri-unit">RI Unit?</div>
          </div>
          
          <div class="ari-dashboard-table-section ari-dashboard-table-unit-costs">
            <% costCollection.each(function(costModel, index) { %>
              <% var remedyModel = costModel.getRemedyModel(); %>
              <div class="ari-dashboard-table-unit-cost">
                <span><%= Formatter.toLeftPad(costModel.getCostId()) %>:</span>&nbsp;<span><%= remedyModel ? Formatter.toAmountDisplay(remedyModel.getAmount()) : '-' %></span>
              </div>
            <% }) %>
          </div>
          <div class="ari-dashboard-table-section ari-dashboard-table-arb-awards-container">
            <% filteredRemedyModels.forEach(function(remedyModel, index) { %>
              <% var awardedCostModel = awardedCostCollection.find(function(cost) { return cost.getRemedyId() === remedyModel.id; }); %>
              <div class="ari-dashboard-table-arb-award">
                <div class="ari-dashboard-table-arb-award-checkbox">
                  <span><%= awardedCostModel ? Formatter.toLeftPad(awardedCostModel.getCostId()) : Formatter.toLeftPad(index+1) %>:</span>&nbsp;<span><%= remedyModel && remedyModel.hasOutcome() ? Formatter.toAmountDisplay(remedyModel.getAwardedAmount()) : '<span class="error-red">Not Set</span>' %></span>
                </div>
                <div class="ari-dashboard-table-arb-award-calc">Assoc RI</div>
              </div>
            <% }) %>
          </div>
          
          <div class="ari-dashboard-table-section ari-dashboard-table-ri-container">
            <div class="ari-dashboard-table-ri-calc">Calc RI</div>
            <div class="ari-dashboard-table-ri-checkbox">RI Granted?</div>
          </div>
        </div>

        <div class="ari-dashboard-table-lines"></div>

        <div class="ari-dashboard-table-footer-container">
        </div>

      </div>

      <div class="ari-dashboard-note-container">
        <div class="ari-dashboard-note"></div>
      </div>

      <div class="modal-button-container">
        <span class="general-link ari-dashboard-download-decision">Download Decision.csv</span>
        <span class="general-link ari-dashboard-download-full">Download Full.csv</span>
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
        <button type="button" class="btn btn-lg btn-primary btn-continue">Save</button>
      </div>
    </div>
  </div>
</div>

