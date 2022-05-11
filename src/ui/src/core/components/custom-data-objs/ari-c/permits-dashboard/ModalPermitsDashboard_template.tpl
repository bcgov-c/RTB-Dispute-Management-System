<div class="modal-dialog">
  <div class="modal-content">
    <div class="modal-header">
      <h4 class="modal-title">Permits List</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body">

      <div class="ari-dashboard-table-container">
        
        <div class="ari-dashboard-table-header permits-dashboard-line">
          <div class="ari-dashboard-table-unit">
            <div class="general-link">
              Units<% if (currentSortCode === UNIT_SORT_CODE) { %> <img src="<%= SortIcon %>" /> <% } %>
            </div>
          </div>
          
          <div class="ari-dashboard-table-tenants">
            <div class="">Tenants</div>
          </div>

          <div class="permits-dashboard-has-permits">
            <div class="">Permits?</div>
          </div>

          <div class="permits-dashboard-permit-id">
            <div class="general-link">
              Permit ID<% if (currentSortCode === PERMIT_ID_SORT_CODE) { %> <img src="<%= SortIcon %>" /> <% } %>
            </div>
          </div>

          <div class="permits-dashboard-permit-date">
            <div class="general-link">
              Permit Date<% if (currentSortCode === PERMIT_DATE_SORT_CODE) { %> <img src="<%= SortIcon %>" /> <% } %>
            </div>
          </div>

          <div class="permits-dashboard-permit-by">
            <div class="">Issued By</div>
          </div>

          <div class="permits-dashboard-description">
            <div class="">Permit Description</div>
          </div>
        </div>

        <div class="ari-dashboard-table-lines"></div>

        <div class="ari-dashboard-table-footer-container">
          <div class="ari-dashboard-table-unit">
            <span>Units:</span>&nbsp;<span><%= numUnits || 0 %></span>
          </div>
          <div class="ari-dashboard-table-tenants">
            <span>Tenants:</span>&nbsp;<span><%= numTenants || 0 %></span>
          </div>
          <div class="permits-dashboard-has-permits"></div>
          <div class="permits-dashboard-permit-id">
            <span>Unique:</span>&nbsp;<span><%= numUniquePermits || 0 %></span>
          </div>
          
        </div>

      </div>

      <div class="ari-dashboard-note-container">
        <div class="ari-dashboard-note"></div>
      </div>

      <div class="modal-button-container">
        <span class="general-link ari-dashboard-download-decision">Download.csv</span>
        <button type="button" class="btn btn-lg btn-default btn-cancel cancel-button">Close</button>
        <button type="button" class="btn btn-lg btn-primary btn-continue">Save</button>
      </div>
    </div>
  </div>
</div>

