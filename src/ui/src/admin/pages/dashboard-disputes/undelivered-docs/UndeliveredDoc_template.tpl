<div class="undelivered-doc-dispute">
  <a class="undelivered-doc-dispute-link" href="#dispute/<%= dispute_guid %>/documents"><%= file_number %></a>
</div>
<div class="undelivered-doc-creation"><%= Formatter.toDateDisplay(delivery_creation) %></div>
<div class="undelivered-doc-process"><%= Formatter.toProcessDisplay(process) %></div>
<div class="undelivered-doc-status <%= statusColourClass %>"><%= Formatter.toStatusDisplay(dispute_status) %></div>
<div class="undelivered-doc-total"><%= total_undelivered %></div>
<div class="undelivered-doc-priority">
  <div class="undelivered-doc-priority-icon <%= priorityIconClass %>"></div>
</div>
<div class="undelivered-doc-email"><%= email_not_delivered_count ? email_not_delivered_count : '-' %></div>
<div class="undelivered-doc-pickup"><%= pickup_not_delivered_count ? pickup_not_delivered_count : '-' %></div>
<div class="undelivered-doc-mail"><%= mail_not_delivered_count ? mail_not_delivered_count : '-' %></div>
<div class="undelivered-doc-other"><%= custom_not_delivered_count ? custom_not_delivered_count : '-' %></div>