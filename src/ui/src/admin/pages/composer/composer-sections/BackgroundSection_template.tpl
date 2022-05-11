<div class="composer-section-content-h3-container composer-section-background-header">
  <div class="composer-section-content-h3">Background and Evidence</div>
</div>

<div class="composer-section-content-editor">
  <div class="composer-section-content-block">
    <% if (hasTenancyAgreement) { %>
      A tenancy agreement that was <%= signedByDisplay %>, with an effective start date of <%= Formatter.toDateDisplay(dispute.get('tenancy_agreement_date')) %>, was entered into evidence.
    <% } else { %>
      As no tenancy agreement was provided, the terms of the tenancy are based on the submissions of the parties.
    <% } %>
  </div>

  <div class="composer-section-content-block">
    A tenancy <% if (dispute.get('tenancy_start_date')) {print('started on '+Formatter.toDateDisplay(dispute.get('tenancy_start_date'))) } %> with <%= isMonthlyRentInterval ? 'a monthly' : '' %> rent of
    <%= Formatter.toAmountDisplay(dispute.get('rent_payment_amount')) %> due on the <%= rentPaymentIntervalDisplay %>
    <%
      if (dispute.get('security_deposit_amount')) {
        print((dispute.get('pet_damage_deposit_amount') ? '': 'and ')+'with a security deposit of ' + Formatter.toAmountDisplay(dispute.get('security_deposit_amount')))
      }
      if (dispute.get('pet_damage_deposit_amount')) {
        print('and with a pet damage deposit of '+Formatter.toAmountDisplay(dispute.get('pet_damage_deposit_amount')))
      }
    %>.
    <% if (dispute.get('tenancy_ended')) {
      print('The tenancy ended on '+Formatter.toDateDisplay(dispute.get('tenancy_end_date'))+'.')
    } %>
  </div>

  <div class="composer-section-content-block">
    Evidence section requirements to be described later.
  </div>

</div>
    