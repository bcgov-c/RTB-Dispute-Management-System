<div class="composer-section-content-h3-container composer-section-notice-header">
  <div class="composer-section-content-h3">Service of Notice</div>
</div>
  
<div class="composer-section-content-block">
  <% if (dispute.isCrossApp()) { %>
    <div class="composer-section-content-h5">
      <b>File number: <%= dispute.get('file_number') %></b><span>(<%= dispute.isLandlord()?'Landlord':'Tenant' %> Application)</span>
    </div>
  <% } %>

  <% if (notices.isEmpty()) { %>
    <div class="">There are currently no notices on this dispute file</div>
  <% } %>
  <% notices.each(function(notice) { %>
    <div class="composer-section-content-block composer-section-content-h4">
      Notice of Dispute Resolution Proceeding dated&nbsp;<b><%= 'TODO:UseGeneratedDate' %></b>
    </div>

    <ul class="composer-section-content-block">
    <% notice.getServices().each(function(service) { %>
      <li class="">
        <%= toNoticeServiceDisplayFn(service) %>
      </li>
    <% }) %>
    </ul>
  <% }) %>

  <% if (dispute.isCrossApp()) { %>
    <div class="composer-section-content-h5">
      <b>File number <%= dispute.get('file_number') %></b><span>(<%= dispute.isLandlord()?'Landlord':'Tenant' %> Application)</span>
    </div>

    <% if (!cross_app_notices || cross_app_notices.isEmpty()) { %>
      <div class="">There are currently no notices on this dispute file</div>
    <% } else { %>

      <% cross_app_notices.each(function(notice) { %>
        <div class="composer-section-content-block composer-section-content-h4">
          Notice of Dispute Resolution Proceeding dated&nbsp;<b><%= 'TODO:UseGeneratedDate' %></b>
        </div>

        <ul class="composer-section-content-block">
        <% notice.getServices().each(function(service) { %>
          <li class="">
            <%= toNoticeServiceDisplayFn(service) %>
          </li>
        <% }) %>
        </ul>
      <% }) %>

    <% } %>
  <% } %>
</div>
  