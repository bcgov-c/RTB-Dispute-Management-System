
<div class="composer-section-content-h3-container composer-section-hearing-attendance-header">
  <div class="composer-section-content-h3">Conducted Hearing(s) and Attendance</div>
</div>
  
<div class="composer-section-content-block">
  <div class="composer-section-content-h4">
    Participatory Hearing:&nbsp;<b><%= hearingDateDisplay %></b>&nbsp;at&nbsp;<b><%= hearingTimeDisplay %></b>
  </div>

  <div class="composer-section-content-block composer-section-content-flex">
    <div class="composer-section-content-column">
      <div class="">Attending on behalf of the&nbsp;<b><%= dispute.isLandlord() ? 'Landlord' : 'Tenant' %></b></div>
      <ul class="">
      <% _.escape.each(applicantParticipationsDisplay, function(applicantDisplay) { %>
        <li class=""><%= applicantDisplay %></li>
      <% }) %>
      </ul>
    </div>

    <div class="composer-section-content-column">
      <div class="">Attending on behalf of the&nbsp;<b><%= dispute.isLandlord() ? 'Tenant' : 'Landlord' %></b></div>
      <ul class="">
      <% _.escape.each(respondentParticipationsDisplay, function(respondentDisplay) { %>
        <li class=""><%= respondentDisplay %></li>
      <% }) %>
      </ul>
    </div>
  </div>
</div>