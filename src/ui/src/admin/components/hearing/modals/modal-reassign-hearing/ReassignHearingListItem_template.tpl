<div class="reassignHearing-search-result-scheduled"><%= scheduledCount %></div>
<div class="reassignHearing-search-result-primary"><%= primaryFileNumberDisplay ? primaryFileNumberDisplay : '-' %></div>
<div class="reassignHearing-search-result-owner"><%= ownerDisplay %></div>
<div class="reassignHearing-search-result-priority <%= 'hearing-legend-' + hearing_priority + '-text' %>"><%= Formatter.toUrgencyDisplay(hearing_priority) %></div>
<div class="reassignHearing-search-result-code"><%= conference_bridge_id %></div>
<div class="reassignHearing-search-result-select">
  <div class="clickable">Reassign to this owner</div>
</div>
