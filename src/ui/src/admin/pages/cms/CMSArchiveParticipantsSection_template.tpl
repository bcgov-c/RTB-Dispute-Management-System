<% _.escape.each(participants, function(participant, index) { %>
  <div class="cms-archive-generic-dispute-header cms-archive-dispute-info-header">
    <%= participantType + ' ' + String(index+1) %>
  </div>
  <div class="cms-archive-invididual-participant-container">
    <div class="cms-archive-dispute-information-left-column">
      <div class="">
        <label class="review-label">Last Name:</label>&nbsp;<span><%= participant.last_name %></span>
      </div>
      <div class="">
        <label class="review-label">First and Middle Name:</label>&nbsp;<span><%= participant.first_name %></span>
      </div>
      <% if (participantType === 'Agent') { %>
        <label class="review-label">Agent For:</label>&nbsp;
        <span>
          <%= participant.agent_for ? participant.agent_for : 'N/A' %>
        </span>
      <% } %>

      <div class="cms-archive-participant-address-information">
        <span>
          <%= participant.unit ? participant.unit : 'N/A' %>&nbsp;
          <%= participant.street_address ? participant.street_address : 'N/A' %>,&nbsp;
          <%= participant.city ? participant.city : 'N/A' %>
        </span>
      </div>
      <div class="cms-archive-participant-address-information <%= participant.mailing_address ? '' : 'hidden' %>">
        <div>
          <label class="review-label">Mailing Address:</label>
        </div>
        <div>
          <span><%= participant.mailing_address %></span>
        </div>
      </div>
      <div class="">
        <span>
          <%= participant.province ? participant.province : 'N/A' %>,&nbsp;
          <%= participant.country ? participant.country : 'N/A' %>,&nbsp;
          <%= participant.postal_code ? participant.postal_code : 'N/A' %>  
        </span>
      </div>
    </div>

    <div class="cms-archive-dispute-information-right-column">
      <div class="cms-archive-generic-column-final-row-space-separator">
        <label class="review-label">Preferred Contact Method:</label>&nbsp;<span>
          <% if (participant.preferred === 0) { %>
            Business Phone
          <% } else if (participant.preferred === 1) { %>
            Email
          <% } else if (participant.preferred === 2) { %>
            Home Phone
          <% } else { %>
            -
          <% } %>
        </span>
      </div>

      <div class="">
        <label class="review-label">Email:</label>&nbsp;<span><a href="mailto:<%= participant.email_address %>"><%= participant.email_address %></a></span>
      </div>
      <div class="">
        <label class="review-label">Daytime Phone:</label>&nbsp;<span>
          <%= (participant.daytime_area ? participant.daytime_area : '')+(participant.daytime_phone ? participant.daytime_phone : '') %></span>
      </div>
      <div class="">
        <label class="review-label">Other Phone:</label>&nbsp;
        <span><%= (participant.other_area ? participant.other_area : '')+(participant.other_phone ? participant.other_phone : '') %></span>
      </div>
      <div class="cms-archive-generic-column-final-row-space-separator">
        <label class="review-label">Fax Number:</label>&nbsp;
        <span><%= (participant.fax_area ? participant.fax_area : '')+(participant.fax_number ? participant.fax_number : '') %></span>
      </div>
      
      <div class="hidden">
        <label class="review-label">Commercial Landlord:</label>&nbsp;<span><%= participant.commercial_landlord === 0 ? 'Yes' : 'No' %></span>
      </div>        
    </div>
  </div>
<% }); %>