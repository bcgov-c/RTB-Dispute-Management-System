<div class="evidence-claim-container-parent">
  <div class="evidence-claim-container container-with-border persist-area" data-header-extend="0">
    <div class="evidence-claim-header clearfix persist-header">
        <div class="evidence-claim-number"><%= unitName %></div>
        <div class="evidence-claim-title">
          <span><%= '' %></span>
        </div>
        <span class="evidence-claim-delete"><div class="evidence-delete-icon"></div><span class="hidden-xs">Delete</span></span>
    </div>
    <div class="evidence-claim-body clearfix">
      <div class="evidence-claim-banner"></div>

      <div class="evidence-claim-details">

        <div class="pfr-unit-section">
          <div class="participant-address"></div>
          <div class="participant-use-mail"></div>
          <div class="participant-mailing-address <%= hasUnitType ? '' : 'hidden-address' %>"></div>

          <div class="pfr-unit-tenants step-description"></div>

          <div class="pfr-unit-has-permits step-description"></div>
          <div class="pfr-unit-permits step-description"></div>
        </div>


        <div class="evidence-claim-claim">
          <div class="intake-claim">
            <div class="claim-details">
              <div class="clearfix">
                <% if (useTextDescription) { %>
                  <div class="col-xs-12 text-description pfr-unit-description"></div>
                <% } %>
              </div>
            </div>
          </div>
        </div>

        <div class="evidence-claim-evidence-section col-xs-12">
          <div class="section-header">Supporting evidence</div>
          <div class="error-block warning pfr-unit-evidence-warning">
            If you have one complete evidence package prepared for service to the respondents for each unit:
            <ul class="sublist">
              <li>Upload a single evidence package under Unit 1, under&nbsp;<i>Proof Vacancy is required</i>, and make a note in "Details and description" to indicate the package is a bulk submission </li>
              <li>Answer questions for each unit about permits and provide descriptions related to renovations</li>
              <li>If evidence is requested for other units, select, "I will upload it later"</li>
            </ul>
          </div>
          <div class="evidence-claim-evidence"></div>
        </div>
      </div>
    </div>
  </div>

</div>
