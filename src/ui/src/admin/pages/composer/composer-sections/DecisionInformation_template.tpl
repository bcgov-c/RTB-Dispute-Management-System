
<div class="">
  <div class="composer-section-content-header">
    <div class="composer-section-content-h1">Dispute Resolution Services</div>

    <div class="composer-section-content-header-subtext">
      <div class="">Residential Tenancy Branch</div>
      <div class="">Office of Housing and Construction Standards</div>
    </div>
  </div>
  
  <div class="composer-section-content-logo"></div>
</div>

<div class="composer-section-content-block">
  <div class="composer-section-content-h2">Decision</div>
  <div class="">
    <span>File Number(s):</span>&nbsp;<span><%= fileNumberDisplay %></span>
  </div>
  <div class="">
    <span>Decision Date:</span>&nbsp;<b><%= decisionDateDisplay %></b>
  </div>
</div>

<div class="composer-section-content-block">
  <div class="">In the matter of the Residential Tenancy Act, SBC 2002, c. 78, as amended,&nbsp;<b>between</b></div>
  <div class="composer-section-decision-information-parties composer-section-content-flex">
    <div class="composer-section-content-column">
      <div class="">Applicant(s) -&nbsp;<b><%= dispute.isLandlord() ? 'Landlord' : 'Tenant' %></b></div>
      <ul class="">
      <% _.escape.each(applicantsDisplay, function(applicantDisplay) { %>
        <li class=""><%= applicantDisplay %></li>
      <% }) %>
      </ul>
    </div>

    <div class="composer-section-content-column">
      <div class="">Respondent(s) -&nbsp;<b><%= dispute.isLandlord() ? 'Tenant' : 'Landlord' %></b></div>
      <ul class="">
      <% _.escape.each(respondentsDisplay, function(respondentDisplay) { %>
        <li class=""><%= respondentDisplay %></li>
      <% }) %>
      </ul>
    </div>
  </div>
  <% if (!isDocPublic) { %>
    <div class="">Regarding the rental unit located at:&nbsp;<b><%= addressDisplay %></b></div>
  <% } %>
</div>