<div class="page-section-title-container clearfix">
  <div class="page-section-title"><%= sectionTitle %></div>
  
  <% if (enableCollapse) { %>
    <span class="dispute-section-title-add collapse-icon <%= isCollapsed ? 'collapsed' : '' %>"></span>
  <% } %>
  <span class="visible-print email-section-filter">&nbsp;<%= selectedEmailFilter %></span>
  <% if (showAddEmail) { %>
    <div class="subpage-header-action-container">
      <div class="subpage-header-action-icon comm-add-email-btn dispute-section-title-add">
        <div class="">New Email / Pickup</div>
      </div>
    </div>
  <% } %>
</div>

<% if (!disableTypeFilter && !isCollapsed) { %>
  <div class="general-filters-row comm-section-filters-container clearfix <%= hasEmails ? '' : 'hidden' %>">
    <div id="comm-email-type-filters"></div>  
  </div>
<% } %>

<div class="comm-email-list"></div>
