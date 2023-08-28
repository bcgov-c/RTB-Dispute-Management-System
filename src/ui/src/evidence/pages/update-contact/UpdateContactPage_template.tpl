<div class="dac__contact__dispute-overview"></div>


<div class="dac__page-header-container">
  <div class="dac__page-header">
    <span class="dac__page-header__icon dac__icons__menu__evidence"></span>
    <span class="dac__page-header__title">
      <% if (isInitialLogin) { %>
        Please validate your contact information
      <% } else { %>
        Update contact information
      <% } %>
    </span>
  </div>
</div>

<div class="spacer-block-20"></div>
<div class="dac__contact__page-instructions">
  <b><%= isApplicant ? 'Applicant' : 'Respondent' %> <%= isLandlord ? 'Landlord' : 'Tenant' %>: Initials <%= participantInitials %></b> 
  &nbsp;(Access Code <%= accessCode %>)
</div>
<div class="spacer-block-30"></div>
<div class="dac__contact__page-instructions">
  <% if (isInitialLogin) { %>
  As this is the first time you have used our systems, please take a moment to provide your contact information.
  <% } else { %>
    Provide your contact information.
  <% } %>
</div>

<div class="<%= isInitialRespondentLogin ? '' : 'hidden' %>">
  <%= TOU_template %>
  <div class="dac__contact__tou"></div>
</div>

<div class="da-update-contact-form-groups">
  <div class="da-update-contact-email-address-container">
    <div class="da-update-contact-email-address"></div>
    <div class="hidden-sm hidden-md hidden-lg da-update-contact-remove-email <%= isEmailRemoved || !savedEmailVal ? 'hidden' : '' %>">
      <div class="dac__icons__trash"></div>
    </div>
    <div class="da-update-contact-email-provide-message da-update-contact-message-text">
      <% if (savedEmailVal) { %>
        <span class="success-green">Enter a new email to update it.</span>
      <% } else if (isEmailRemoved && !currentEmailVal) { %>
        <span class="error-red">Email Removed</span>
      <% } else if (participant.get('no_email') !== 0 && !participant.get('email')) { %>
        <div class="dac__icons__exclamation"></div>
        <div class="warning-yellow">Please provide an email address.</div>
      <% } else { %>
        <span class="info-gray">Not Provided (optional)</span>
      <% } %>

    </div>
    <div class="hidden-xs da-update-contact-remove-email da-update-contact-message-text <%= isEmailRemoved || !savedEmailVal ? 'hidden' : ''%>">
      <div class="dac__icons__trash"></div>
      <div class="error-red">Remove Email</div>
    </div>
  </div>

  <div class="da-update-contact-daytime-phone-container">
    <div class="da-update-contact-daytime-phone"></div>
    <div class="da-update-contact-daytime-phone-message da-update-contact-message-text">
      <% if (participant.get('primary_phone')) { %>
        <span class="success-green">Enter a new number to update it.</span>
      <% } %>
    </div>
  </div>

  <div class="da-update-contact-other-phone-container">
    <div class="da-update-contact-other-phone-sub-container">
      <div class="da-update-contact-other-phone"></div>
      <div class="hidden-sm hidden-md hidden-lg da-update-contact-remove-other-phone <%= isOtherPhoneRemoved || !savedOtherPhoneVal ? 'hidden' : '' %>">
        <div class="dac__icons__trash"></div>
      </div>
    </div>
    <div class="other-phone-message da-update-contact-message-text">
      <% if (savedOtherPhoneVal) { %>
        <span class="success-green">Enter a new number to update it.</span>
      <% } else if (isOtherPhoneRemoved && !currentOtherPhoneVal) { %>
        <span class="error-red">Other Phone Removed</span>
      <% } else { %>
        <span class="info-gray">Not Provided (optional)</span>
      <% } %>
    </div>
    <div class="hidden-xs da-update-contact-remove-other-phone da-update-contact-message-text <%= isOtherPhoneRemoved || !savedOtherPhoneVal ? 'hidden' : ''%>">
      <div class="dac__icons__trash"></div>
      <div class="error-red">Remove Phone</div>
    </div>
  </div>

  <div class="da-update-contact-fax-container">
    <div class="da-update-contact-fax-sub-container">
      <div class="da-update-contact-fax"></div>
      <div class="hidden-sm hidden-md hidden-lg da-update-contact-remove-fax <%= isFaxRemoved || !savedFaxVal ? 'hidden' : '' %>">
        <div class="dac__icons__trash"></div>
      </div>
    </div>

    <div class="da-update-contact-fax-message da-update-contact-message-text">
        <% if (savedFaxVal) { %>
          <span class="success-green">Enter a new number to update it.</span>
        <% } else if (isFaxRemoved && !currentFaxVal) { %>
          <span class="error-red">Fax Removed</span>
        <% } else { %>
          <span class="info-gray">Not Provided (optional)</span>
        <% } %>
    </div>
    <div class="hidden-xs da-update-contact-remove-fax da-update-contact-message-text <%= isFaxRemoved || !savedFaxVal ? 'hidden' : ''%>">
      <div class="dac__icons__trash"></div>
      <div class="error-red">Remove Fax</div>
    </div>
  </div>
</div>

<div class="spacer-block-20"></div>
<div class="dac__contact__page-instructions">
  Let us know the best way to contact you and send you information.
</div>

<div class="da-update-contact-form-groups">
  <div class="da-update-contact-method-container">
    <div class="da-update-contact-preferred-contact-method"></div>
    <div class="da-update-contact-message-text">
      <% if (showContactPreferenceMethod) { %>
        <div class="dac__icons__exclamation"></div><span class="warning-yellow">We recommend email for the best communication.</span>
      <% }  %>
    </div>
  </div>
</div>

<div class="da-update-contact-confirm-email-container <%= showConfirmEmail ? '' : 'hidden-item' %>">
  <div class="spacer-block-20"></div>
  <p class="<%= isInitialRespondentLogin ? '' : 'hidden' %>">
    You will be receiving e-mails directly from the Residential Tenancy Branch with important information and documents. 
    It is important to check your Junk e-mail folders and add noreply.rtb@gov.bc.ca to your preferred contacts when possible.
  </p>
  <div class="dac__contact__page-instructions">Please enter your email address again</div> 
  <div class="da-update-contact-confirm-email"></div>
</div>

<p id="da-update-contact-page-error" class="error-block"></p>

<div class="spacer-block-30"></div>
<div class="dac__page-buttons">
  <button type="button" class="btn btn-lg btn-cancel da-update-contact-cancel <%= isInitialLogin ? 'hidden' : ''%>">Cancel</button>
  <button type="button" class="btn btn-lg btn-cancel btn-skip <%=isInitialLogin ? '' : 'hidden'%>">Skip</button>
  <button type="button" class="btn btn-lg btn-standard da-update-contact-submit-btn">Submit Changes</button>
</div>
<div class="spacer-block-10"></div>
