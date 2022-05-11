
<div class="step-description evidence-info-heading">
  <p>Please review your information carefully to ensure it is accurate and complete. If you need to, go back and make changes. This information will be submitted to the Residential Tenancy Branch for validation and will be included in a package that you must deliver to each named tenant to notify them of this application for an additional rent increase. Once your Notice of Dispute Resolution Proceeding has been provided, you cannot change the information in this application.</p>
</div>

<div class="review-general review-section clearfix">
  <div class="review-information-body">
    <table>
    <tr>
      <td class="review-label">Applicant type:</td>
      <td><%= applicantTypeDisplay %></td>
    </tr>
    <tr>
      <td class="review-label">Act:</td>
      <td><%= actTypeDisplay %></td>
    </tr>
    <tr>
      <td class="review-label">Total Specified Dwelling Units:</td>
      <td><%= units.length %>&nbsp;<a href="#page/4" class="review-edit-button">edit</a></td>
    </tr>
    <tr>
      <td class="review-label">Total Capital Expenditures:</td>
      <td><%= Formatter.toAmountDisplay(totalAmount) %>&nbsp;<a href="#page/5" class="review-edit-button">edit</a></td>
    </tr>
    <tr>
      <td class="review-label">Rent Increase Units:</td>
      <td><%= units.filter(function(unit) { return unit.hasSavedRentIncreaseData(); }).length %>&nbsp;<a href="#page/7" class="review-edit-button">edit</a></td>
    </tr>
    <tr>
      <td class="review-label">Rent Increase Tenants:</td>
      <td><%= units.reduce(function(memo, unit) { return memo + Number(unit.get('selected_tenants') || 0); }, 0) %>&nbsp;<a href="#page/8" class="review-edit-button">edit</a></td>
    </tr>
    </table>
  </div>
</div>

<div class="review-applicants-container review-section clearfix">
  <div class="review-section-title">
    <span class="review-section-title-text">Applicants&nbsp;<span class="subtitle">(that filed the dispute)</span></span>
    <a href="#page/2" class="review-edit-button">edit</a>
  </div>

  <div class="review-applicants">
    <% applicants.each(function(applicant, index) { %>
      <% var isPrimary = applicant.isPrimary(); %>
      <% var isBusiness = applicant.isBusiness(); %>
      <% var typeDisplay = PARTICIPANT_TYPE_DISPLAY[applicant.get('participant_type')]; %>
      <div class="clearfix">
        <div class="review-information-body clearfix">
          <div class="review-applicant-name-section row col-sm-12 <%= isBusiness ? 'review-business-name col-md-6' : '' %>">
            <% if (isPrimary) { %>
              <div class="review-applicant-primary col-xs-12 row">
                <span><strong>Primary applicant contact</strong></span>
              </div>
            <% } %>
            <div class="review-applicant-name col-xs-12 row">
              <span class="review-label"><%= isBusiness ? 'Business ' : ''%>Name:</span> <b><%= applicant.getDisplayName() %></b>
            </div>
            <div class="review-applicant-type col-xs-12 row">
              <span class="review-label">Type:</span> <span><%= typeDisplay %></span>
            </div>
            <% if (isPrimary) { %>
            <div class="review-applicant-hearing-by col-xs-12 row">
              <span class="review-label">Receive Notice of Dispute Resolution Proceeding package by:</span> <span><%= Formatter.toHearingOptionsByDisplay(applicant.get('package_delivery_method')) %></span>
            </div>
            <% } %>

            <% if (applicant.get('address')) { %>
              <div class="review-applicant-address col-xs-12 row">
                <%= applicant.getAddressString() %>
              </div>
            <% } %>

            <% if (applicant.get('mail_address')) { %>
              <div class="review-applicant-address col-xs-12 row">
                Mail: <%= applicant.getMailingAddressString() %>
              </div>
            <% } %>

          </div>

          <div class="review-applicant-contact-section row col-sm-12 <%= isBusiness ? 'review-business-contact col-md-6' : '' %>">
            <% if (isBusiness) { %>
              <div class="review-applicant-contact-name">
                <span class="review-label">Business Contact:</span>&nbsp;<b><%= applicant.getContactName() %></b>
              </div>
            <% }%>

            <% if (applicant.get('email')) { %>
              <div class="review-applicant-email col-xs-12 row">
                Email: <%= applicant.get('email') %>
              </div>
            <% }%>

            <% if (applicant.get('fax')) { %>
              <div class="review-applicant-fax col-xs-12 row">
                Fax: <%= applicant.get('fax') %>
              </div>
            <% }%>

            <% if (applicant.get('primary_phone')) { %>
              <div class="review-applicant-daytimePhone col-xs-12 row">
                Daytime Phone: <%= applicant.get('primary_phone') %>
              </div>
            <% }%>

            <% if (applicant.get('secondary_phone')) { %>
              <div class="review-applicant-otherPhone col-xs-12 row">
                Other Phone: <%= applicant.get('secondary_phone') %>
              </div>
            <% }%>
          </div>
        </div>
      </div>
    <% }) %>
  </div>
</div>


<div class="review-costs-container review-section clearfix">
  <div class="review-section-title">
    <span class="review-section-title-text">Capital Expenditures and Associated Units</span>
    <a href="#page/4" class="review-edit-button">edit</a>
  </div>

  <div class="review-costs">
    <% capitalCosts.each(function(cost, index) { %>
      <% var remedyModel = cost.getRemedyModel(); %>
      <% var completionDate = remedyModel && remedyModel.getFirstAssociatedDate(); %>
      <% costUnits = cost.getUnitIds(); %>
      <div class="clearfix review-cost-item">
        <div class="review-information-body clearfix">

          <div class="">
            <span class="review-label">Item Amount:</span>&nbsp;<b><%= Formatter.toAmountDisplay((remedyModel && remedyModel.getAmount()) || 0) %></b>
          </div>
          <div class="">
            <span class="review-label">Completion Date:</span>&nbsp;<b><%= completionDate ? Formatter.toDateDisplay(completionDate) : '-' %></b>
          </div>
          <div class="">
            <%= remedyModel && remedyModel.getFirstDescription() %>
          </div>
          

          <div class="ari-review-improvement-unit-container">
            <div class="">
              <span class="review-label">Specified Dwelling Units:</span>&nbsp;<%= costUnits.length %>
            </div>

            <% (costUnits || []).forEach(function(unitId) { %>
              <% var costUnit = units.findWhere({ unit_id: unitId }); %>
              <% if (!costUnit) { return; } %>
              <div class="">
                <span class="review-label"><%= costUnit.getUnitNumDisplay() %>:</span>&nbsp;<%= costUnit.getStreetDisplayWithDescriptor() %>
              </div>
            <% }) %>
          </div>
        </div>
      </div>
    <% }) %>

    <div class="review-cost-evidence-container">
      <% var options = { ignore_hidden: true }; %>
      <% var provided = evidenceCollection.getProvided(options); %>
      <% var provideLater = evidenceCollection.getProvideLater(options); %>
      <% var cantProvide = evidenceCollection.getCantProvide(options); %>
      
      <% if (provided && provided.length) { %>
        <div>
          <span class="review-label success-green">Evidence Provided:</span>
          <ul>
          <% (provided || []).forEach(function(evidence) { %>
            <li class=""><%= evidence.getTitle() %><%= evidence.get('files').length ? ' ('+evidence.get('files').length+' file'+(evidence.get('files').length===1?'':'s')+')' : '' %></li>
          <% }) %>
          </ul>
        </div>
      <% } %>

      <% if (provideLater && provideLater.length) { %>
        <div>
          <span class="review-label warning-yellow">Evidence Provided Later:</span>
          <ul>
          <% (provideLater || []).forEach(function(evidence) { %>
            <li class=""><%= evidence.getTitle() %></li>
          <% }) %>
          </ul>
        </div>
      <% } %>

      <% if (cantProvide && cantProvide.length) { %>
        <div>
          <span class="review-label error-red">Evidence Not Provided:</span>
          <ul>
          <% (cantProvide || []).forEach(function(evidence) { %>
            <li class=""><%= evidence.getTitle() %></li>
          <% }) %>
          </ul>
        </div>
      <% } %>
    </div>
  </div>
</div>


<div class="review-tenants-container review-section clearfix">
  <div class="review-section-title">
    <span class="review-section-title-text">Units and Tenants Subject to the Rent Increase</span>
    <a href="#page/7" class="review-edit-button">edit</a>
  </div>

  <div class="review-tenants review-information-body">
    <% units.forEach(function(unit) { %>

      <% unit.getParticipantIds().forEach(function(participantId, index) { %>
        <% var participantModel = participantsChannel.request('get:participant', participantId);
        if (!participantModel) {
          return;
        }
        %>
        <div class="">
          <div>
            <span class="review-label"><%= unit.getUnitNumDisplay() %>:</span> <%= unit.getStreetDisplayWithDescriptor() %>
          </div>
          <div>
            <span class="review-label">Tenant <%= Formatter.toLeftPad(index+1)%>:</span> <%= participantModel.getDisplayName() %> (<%= participantModel.getTypeDisplay() %>)
          </div>
        </div>
      <% }) %>
    <% }) %>
  </div>

</div>

<div class="review-consent-checkbox"></div>

<% if (hasConsented) { %>
  <div class="review-payment-container review-section clearfix">
    <div class="review-section-title">
      <span class="review-section-title-text">Application Filing Fee</span>
    </div>

    <div class="review-information-body">
  
      <% if (hasApprovedPayment) { %>
        <p>The filing fee of&nbsp;<b><%= Formatter.toAmountDisplay(existingFee.get('amount_due')) %></b>&nbsp;for this application has already been paid.</p>
      <% } else { %>
        <p>The filing fee is based on the number of units subject to the rent increase and must be paid before your application will be considered received. </p>

        <div class="review-fee-calculation">
          <table>
            <tr>
              <td class="review-label">Base application fee:</td><td><%= Formatter.toAmountDisplay(BASE_APPLICATION_FEE_AMOUNT) %></td>
            </tr>
            <tr>
              <td class="review-label">Additional per unit fee:</td><td><%= Formatter.toAmountDisplay(perUnitAmount) %></td>
            </tr>
            <tr>
              <td class="review-label">Total application fee:</td><td><b><%= Formatter.toAmountDisplay(calculatedFeeAmount) %></b></td>
            </tr>
          </table>
        </div>  
      <% } %>
    </div>
  </div>
<% } %>

<div class="page-navigation-button-container">
  <button class="navigation option-button step-previous" type="button">BACK</button>
  <% if (hasConsented) { %>
    <button class="navigation option-button step-next" type="submit">SUBMIT</button>
  <% } %>
</div>
