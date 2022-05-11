
<div class="step-description evidence-info-heading">
  <p>Please review your information carefully to ensure it is accurate and complete. If you need to, go back and make changes. This information will be submitted to the Residential Tenancy Branch for validation and will be included in a package that you must serve to each tenant named in this application. Once you receive your notice package, you cannot update any information in this application. All evidence submitted to the Residential Tenancy Branch must also be provided to the named tenants of each unit.</p>
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
      <td class="review-label">Renovation Units:</td>
      <td><%= units.length %>&nbsp;<a href="#page/4" class="review-edit-button">edit</a></td>
    </tr>
    <tr>
      <td class="review-label">Renovation Unit Tenants:</td>
      <td><%= units.reduce(function(memo, unit) { return memo + Number(unit.get('selected_tenants') || 0); }, 0) %>&nbsp;<a href="#page/5" class="review-edit-button">edit</a></td>
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


<div class="review-renovation-units-container review-section clearfix">
  <div class="review-section-title">
    <span class="review-section-title-text">Renovation or Repair Units</span>
    <a href="#page/4" class="review-edit-button">edit</a>
  </div>

  <div class="review-information-body">
    <% units.forEach(function(unit) { %>
      <% var disputeClaim = getClaimForUnitFn(unit); %>
      <% var evidenceCollection = disputeClaim.get('dispute_evidences'); %>
      <div class="review-renovation-unit clearfix">
        <div>
          <span class="review-label"><%= unit.getUnitNumDisplay() %>:</span> <%= unit.getStreetDisplayWithDescriptor() %>
        </div>
        <div class="spacer-block-10"></div>
        <div>
          <%= disputeClaim.getDescription() %>
        </div>

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
    <% }) %>
  </div>

</div>


<div class="review-tenants-container review-section clearfix">
  <div class="review-section-title">
    <span class="review-section-title-text">Named Tenants and Associated Units</span>
    <a href="#page/5" class="review-edit-button">edit</a>
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

<div class="page-navigation-button-container">
  <button class="navigation option-button step-previous" type="button">BACK</button>
  <% if (hasConsented) { %>
    <button class="navigation option-button step-next" type="submit">SUBMIT</button>
  <% } %>
</div>
