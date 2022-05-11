<div class="evidence-claim-container-parent">
    <div class="evidence-claim-container container-with-border persist-area" data-header-extend="0">
        <div class="evidence-claim-header clearfix persist-header">
            <div class="evidence-claim-number"><%= claimIndexDisplay %></div>
            <div class="evidence-claim-title">
              <span><%= claim_title %></span>
              <span><a role="button" class="<%= helpHtml ? 'hidden-item' : '' %> badge help-icon">?</a></span>
            </div>
            <span class="evidence-claim-delete"><div class="evidence-delete-icon"></div><span class="hidden-xs">Delete</span></span>
        </div>
        <div class="evidence-claim-body clearfix">
            <div class="evidence-claim-banner"></div>
            <div class="evidence-claim-details">

                <div class="evidence-claim-claim">
                  <div class="intake-claim">
                    <div class="claim-details">
                      <div class="clearfix">
                        <% if (useAmount) { %>
                          <div class="col-xs-12 col-sm-4 amount"></div>
                        <% } %>
                        <% if (useNoticeDueDate) { %>
                          <div class="col-xs-12 col-md-4 notice-due-date"></div>
                        <% } %>
                        <% if (useNoticeMethod) { %>
                          <div class="col-xs-12 col-md-4 notice-method"></div>
                        <% } %>
                      </div>
                      <div class="clearfix">
                        <div class="evidence-claim__rule-error error-block warning hidden-item"></div>
                        <% if (useTextDescription) { %>
                            <div class="col-xs-12 text-description"></div>
                        <% } %>
                      </div>
                    </div>
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
