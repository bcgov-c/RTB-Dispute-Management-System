<div class="persist-area" data-header-extend="15">
  <div class="participant-section section-header persist-header <%= noHeader ? 'hidden-item': '' %> ">
    <div>
      <%= partyName %>
      <span class="participant-delete-icon general-delete-icon <%= isFinalPersonBusiness ? 'hidden-item' : '' %>"></span>
    </div>
  </div>
  <div class="participant-wrapper">
    <div class="participant-type"></div>

    <div class="participant-business-name <%= !isBusiness ? 'hidden-item' : '' %>"></div>

    <div class="participant-name-section clearfix">
      <div class="participant-first-name col-sm-6"></div>
      <div class="participant-last-name col-sm-6"></div>
    </div>

    <div class="participant-known-contact-container <%= enableKnownContact ? '' : 'hidden' %>"></div>
      <div class="spacer-block-10"></div>
      <div class="participant-known-contact"></div>
      <div class="spacer-block-10"></div>
    </div>

    <% if (knownContactWarningHtml) { %>
      <div class="participant-known-contact-warning error-block warning"><%= knownContactWarningHtml %></div>
    <% } %>

    <div class="<%= showAddressEntry ? '' : 'hidden' %>">
      <div class="participant-use-dispute-address-container <%= hideAddressLink ? 'hidden' : '' %>">
        <span class="participant-use-dispute-address-text">Use&nbsp;<span class="participant-use-dispute-address"><%= disputeAddressString %></span></span>
      </div>
      <div class="participant-address"></div>
      <% if (enableUnitType) { %>
        <div class="participant-address-unit-container">
          <div class="participant-address-unit-radio"></div>
          
          <div class="<%= showRentalUnit ? '' : 'hidden' %>">
            <div class="step-description">Please provide a description of the unit (i.e., basement suite, upper home, lower home, etc.)</div>
            <div class="participant-address-unit-type"></div>
          </div>
        </div>
      <% } %>

      <div class="row participant-use-mail-container clearfix">
        <div class="col-xs-12"><span>Is mail also sent to the above address?</span></div>
        <div class="participant-use-mail col-xs-12"></div>
      </div>
      <div class="participant-mailing-address <%= hasMailAddress ? '' : 'hidden-address' %>"></div>
    </div>
    
    <div class="participant-showhide-email <%= showEmailEntry ? '' : 'hidden' %>">
      <div class="participant-email"></div>
    </div>

    <div class="participant-phone-container participant-showhide-phone clearfix <%= showPhoneEntry ? '' : 'hidden' %>">
      <div class="participant-daytime-phone"></div>
      <div class="participant-other-phone"></div>
      <div class="participant-fax-phone"></div>
    </div>

    <div class="participant-hearing-options-by <%= enablePackageMethod ? '' : 'hidden' %>"></div>

  </div>

</div>
