<div class="" data-header-extend="15">
  <div class="participant-section section-header persist-header <%= noHeader ? 'hidden-item': '' %> ">
    <div>
      <%= partyName %>
    </div>
  </div>

  <div class="participant-unit-address">
    <div class=""><b><%= addressStreetDisplay %></b></div>
    <div class=""><%= addressWithoutStreetDisplay %></div>
  </div>
  <div class="spacer-block-10"></div>

  <div class="participant-type"></div>

  <div class="participant-business-name <%= !isBusiness ? 'hidden-item' : '' %>"></div>

  <div class="participant-name-section clearfix">
    <div class="participant-first-name col-sm-6"></div>
    <div class="participant-last-name col-sm-6"></div>
  </div>

  <div class="participant-email"></div>
  <div class="participant-phone-container clearfix">
    <div class="participant-daytime-phone"></div>
    <div class="participant-other-phone"></div>
    <div class="participant-fax-phone"></div>
  </div>

  <div class="row participant-use-mail-container clearfix">
    <div class="col-xs-12"><span>Is mail also sent to the above address?</span></div>
    <div class="participant-use-mail col-xs-12"></div>
  </div>

  <div class="participant-mailing-address <%= hasMailAddress ? '' : 'hidden-address' %>"></div>
</div>
