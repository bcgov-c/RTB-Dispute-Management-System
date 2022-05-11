<% if (!viewMode) { %>
<div class="hearing-participant-name-container">
  <div class="">
    <div class="hearing-participant-name-sub-container">
      <div class="hearing-participant-name">
        <%= displayNameInEdit %> <span class="hearing-participant-name-type <%= !isOther ? '' : 'hidden' %>">- <%= landlordOrTenant %></span>
      </div>
      <div class="hearing-participant-sub-info">
      </div>
    </div>
    <div class="<%= isOther && participation_comment ? '' : 'hidden-item' %>">
      <label>Note:</label>&nbsp;<span><%= participation_comment %></span>
    </div>
  </div>
</div>
<div class="hearing-participant-participated-container">
  <div class="hearing-participant-participation-icons"></div>
  <% if (!isSelectedUnserved) { %>
    <div class="hearing-participant-other-name-delete-icon"></div>
  <% } %>
</div>
<div class="hearing-participant-note-container">

  <div class="hearing-participant-note <%= isOther ? 'hidden-item' : '' %>"></div>
  <div class="hearing-participant-other-name-container <%= isOther ? '' : 'hidden-item' %>">
    <div class="hearing-participant-other-party-association"></div>
    <div class="hearing-participant-other-name"></div>
    <div class="hearing-participant-other-title"></div>
  </div>
</div>
<% } else { %>
  <div class="hearing-participant-name"><%= displayName %> <span class="hearing-participant-name-type">(<%= landlordOrTenant %>)</span></div>
  <div class="hearing-participant-type"><%= participantTypeDisplay %></div>
  <div class="hearing-participant-participation-icon-container hidden-print">
    <div class="<%= participation_status === 1 ? 'hearing-participant-participation-icon-yes selected' :
        (participation_status === 0 ? 'hearing-participant-participation-icon-no selected' : 'hearing-participant-participation-icon-unknown') %>"></div>
  </div>
  <span class="visible-print hearing-participant-hearing-attendance"><%= participation_status === 1 ? 'Hearing Attended' : 
    participation_status === 0 ? 'Hearing Not Attended' : 'Hearing Attendance Not Set' %></span>
  <div class="hearing-participant-comment <%= participation_comment ? '' : 'hidden-item' %>"><%= participation_comment %></div>
<% } %>
