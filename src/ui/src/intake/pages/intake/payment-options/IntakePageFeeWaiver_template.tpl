<div class="fee-waiver-page-description">
    <div class="fee-waiver-step1-header <%= currentStep === 1 ? '' : 'hidden-item' %>">
        <h3>Income Information</h3>
        <p>To qualify for a fee waiver, you must provide the following information to prove the inability to pay the fee.</p>

        <p>Can't provide this information?&nbsp;<a class="back-to-payment-options-link" href="javascript:;">Choose another option</a>.</p>
    </div>
    <div class="fee-waiver-step2-header <%= currentStep === 2 ? '' : 'hidden-item' %>">
        <h3>Supporting proof</h3>
        <% if (!hasFeeWaiverEvidencePending) { %>
        <p>You must now provide proof that supports the income information you provided. It is recommended that you provide proof now, but if you can't upload it right now you can submit it later online or in person at any Service BC Office or the Burnaby Residential Tenancy Branch Office. Keep in mind it must be received within three days of submitting your application or before the deadline for disputing a notice to end your tenancy expires (if applicable), whichever is earlier.</p>

        <p>Can't provide this?&nbsp;<a class="back-to-payment-options-link" href="javascript:;">Choose another payment option</a>.</p>
        <% } else { %>
            <p>You must now provide proof that supports the income information you provided. This proof must be received within 3 days of your application submission date or it will be abandoned.</p>

            <p>Can't provide this?&nbsp;<a class="back-to-payment-options-link" href="javascript:;">Choose another payment option</a>.</p>
      <% } %>
    </div>

    <div class="fee-waiver-step3-header <%= currentStep === 3 ? '' : 'hidden-item' %>">
        <h3>Confirm Income</h3>
        <p>Please confirm that the information that you have provided is accurate and complete, or&nbsp;<a class="back-to-payment-options-link" href="javascript:;">choose another payment option</a>.</p>
    </div>

</div>

<div class="fee-waiver-progress-container <%= currentStep < 2 ? 'hidden-item' : '' %>"></div>

<div class="fee-waiver-step1 <%= currentStep === 1 ? '' : 'hidden-item' %> ">
    <div class="step family-member-count-question"></div>
    <div class="step family-income-question"></div>
    <div class="step city-size-question"></div>
    <div class="step fee-waiver-accept"></div>
</div>

<div class="fee-waiver-step2 <%= currentStep === 2 ? '' : 'hidden-item' %>">
    <div class="income-evidence"></div>
</div>

<div class="fee-waiver-step3 <%= currentStep === 3 ? '' : 'hidden-item' %>">
    <div class="step fee-waiver-receipt-accept"></div>
</div>

<div class="page-navigation-button-container">
  <% if (!(currentStep === 2 && hasFeeWaiverEvidencePending)) { %>
    <button class="navigation option-button step-previous" type="submit">BACK</button>
  <% } %>
    <button class="navigation option-button step-next <%= currentStep === 1 ? 'step-next-disabled' : '' %>" type="submit">NEXT</button>
</div>
