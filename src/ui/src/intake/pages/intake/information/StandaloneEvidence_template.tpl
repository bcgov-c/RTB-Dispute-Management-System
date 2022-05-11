<div class="standalone-evidence-header">
  <div class="section-header"><%= title %></div>
  <div class="standalone-evidence-banner"></div>
</div>

<div class="standalone-evidence-main">
  <div class=""><%= bodyHtml %></div>
  <% if (associated_claim_titles && associated_claim_titles.length) { %>
    <ul>
      <% _.escape.each(associated_claim_titles, function(claim_title) { %>
        <li><%= claim_title %></li>
      <% }) %>
    </ul>
  <% } %>
</div>

<div class="standalone-evidence">
  <div class="evidence-claim-evidence"></div>
  <div class="standalone-extra-container <%= showArrows ? '' : 'hidden' %>">
      <div class="standalone-evidence-date"></div>
      <div class="standalone-evidence-signed"></div>
  </div>
</div>