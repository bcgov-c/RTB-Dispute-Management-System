<div class="review-applicant-title section-header">
  <div class="context-menu-title-container">
    <span class="context-menu-title"><%= titleDisplay %></span>
    <div class="<%= showAmendmentIcon ? '' : 'hidden' %> amendment-icon hidden-print"></div>
    <div class="visible-print"><%= showAmendmentIcon ? '&nbsp;- Amended' : null %></div>
    <div class="sub-service-icon-wrapper hidden-print">
      <div class="<%= showSubServiceIcon ? '' : 'hidden' %> <%= subServiceIconClass %> hidden-print"></div>
    </div>
    <div class="visible-print"><%= subServiceText ? '&nbsp;- ' + subServiceText : null %></div>
    <% if (showComplexityAndUrgency) { %>
    <div class="complexity-and-urgency-display hidden-print"><%= complexityAndUrgencyDisplay %></div>
    <% } %>
  </div>
  <div class="context-menu-icon-container hidden-print <%= isCollapsed ? 'collapsed' : '' %>">
    <div class="context-menu-icon edit-icon"></div>

    <% if (enableCollapse) { %>
      <div class="context-menu-icon collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></div>
    <% } %>
  </div>
</div>
<div class="context-menu hidden-print"></div>
<div class="wrapped-view-container"></div>
