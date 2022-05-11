<div class="composer-section-content-h3-container composer-section-issues-header">
  <div class="composer-section-content-h3">Dispute Issues</div>
</div>
  
<div class="composer-section-content-block">
  <% if (!dispute_claims.isEmpty()) { %>
    <div class="composer-section-content-block composer-section-issues-section-title composer-section-content-h4">This hearing was convened in response to the following issues and requests for orders</div>
    <div class="composer-section-content-block">
    <% dispute_claims.each(function(dispute_claim) { %>
      <div class="">
        <%= dispute_claim.getClaimTitle() %>
        <%= dispute_claim.isMonetaryIssue() ? '('+Formatter.toAmountDisplay(dispute_claim.getAmount(), true)+')' : '' %>
      </div>
    <% }) %>
    </div>
  <% } %>

  <% if (!_.escape.isEmpty(removedDisputeClaims)) { %>
    <div class="composer-section-content-block composer-section-issues-section-title composer-section-content-h4">The following issues were withdrawn, amended or severed (removed) by the arbitrator in the hearing and will not be addressed in this decision</div>
    <div class="composer-section-content-block">
    <% _.escape.each(removedDisputeClaims, function(dispute_claim) { %>
      <% var remedyModel = dispute_claim.getApplicantsRemedy() %>
      <div class=""><%= dispute_claim.getClaimTitle() %>:&nbsp;<strong><%= getRemovalTextFn(dispute_claim) %></strong></div>
      <ul class=""><li><%= remedyModel.get('remedy_status_reason') %></li></ul>
    <% }) %>
    </div>
  <% } %>

  <% if (!_.escape.isEmpty(remainingDisputeClaims)) { %>
    <div class="composer-section-content-block composer-section-issues-section-title composer-section-content-h4">This decision is based on the following remaining issues</div>
    <div class="composer-section-content-block">
    <% _.escape.each(remainingDisputeClaims, function(dispute_claim) { %>
      <div class="">
        <%= dispute_claim.getClaimTitle() %>
        <%= dispute_claim.isMonetaryIssue() ? '('+Formatter.toAmountDisplay(dispute_claim.getAmount(), true)+')' : '' %>
      </div>
    <% }) %>
    </div>
  <% } %>
</div>
