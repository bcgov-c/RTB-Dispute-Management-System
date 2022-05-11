<!-- Required attributes: ownerNameDisplay, dialCodeDisplay, webPortalLoginDisplay, hearingPriorityDisplay -->
<div class="hearing-display-owner-container">
  <div class="hearing-arbitrator-title-display">
    <div class="hearing-arbitrator-title"><%= ownerNameDisplay ? ownerNameDisplay : 'Not Assigned' %></div>
    <div class="hearing-arbitrator-icon"></div>
    <div class="hearing-arbitrator-info-container">
      <div class="">
        <label class="review-label">Moderator Access Code:</label>&nbsp;<span><%= dialCodeDisplay ? '<b>'+dialCodeDisplay.replace(/#$/, '')+'</b>' : '-' %></span>
      </div>
      <div class="">
        <label class="review-label">Conference Number:</label>&nbsp;<span><%= webPortalLoginDisplay ? '<b>'+webPortalLoginDisplay+'</b>' : '-' %></span>
      </div>
      <div class="">
        <label class="review-label">Priority:</label>&nbsp;</b><span class="<%= 'hearing-legend-' + hearingPriorityDisplay.toLowerCase() + '-text' %>"><%= hearingPriorityDisplay %></span>
        <% if (isReserved) { %> <span class="hearing-on-hold-view">On Hold</span> <% } %>
        <% if (isAdjourned) { %> <div class="hearing-adjourned-wrapper"><div class="hearing-adjourned-icon"></div><span class="hearing-adjourned-display">Adjourned</span></div><% } %>
      </div>
    </div>
  </div>
</div>
