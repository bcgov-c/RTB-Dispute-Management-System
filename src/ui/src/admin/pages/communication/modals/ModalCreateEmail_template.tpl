<div class="modal-dialog">
  <%= emailStyleHtml %>

  <div class="modal-content">

    <div class="modal-header">
      <h4 class="modal-title">Create Email / Pickup</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>

    <div class="modal-body">

      <div class="modalEmail-top-container"></div>

      <div class="modalEmail-message-container">
        <span class="modalEmail-content-label">Message</span>

        <div class="modalEmail-content-container <%= editorDisabled ? 'disabled' : '' %>">
          <div style="padding-top: 10px; padding-left: 14px;	padding-bottom: 10px; background-color: #003366; border-bottom: 1px solid #fcba19;" align="left">
            <p style="font-size:18px; font-weight:normal; color:#FFF; padding: 0px 0px 0px 0px; 	margin: 0px; font-style: normal;">
              <img style="position:relative; top:2px; width:95px; height:65px; -ms-interpolation-mode: bicubic;" src="<%= COMMON_IMAGE_ROOT + 'BCLogoBlue.jpg'%>" alt="BC Logo" width="95" height="65" />
              <span>Residential Tenancies</span>
            </p>
          </div>

          <div class="modalEmail-email-content"></div>

          <div class="container-padding footer" align="left">
            <hr style=
            "display:block; height:1px; border:0px; border-top:1px solid #dedede; margin:0px 0px 10px 0px; padding:0px;" />


            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0px; font-size: 15px; margin-top: 0px; padding:15px; max-width:980px; width:100%;">
              <tbody>
                <tr>
                  <td colspan="2" style="margin-bottom:5px; color: #989898;	font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;">
                  <strong>British Columbia Residential Tenancy Branch</strong></td>
                </tr>

                <tr>
                  <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src=
                  "<%= COMMON_IMAGE_ROOT + 'Icon_ContactEmailsmlGry.jpg' %>"
                  width="20" height="20" /></td>

                  <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="mailto:hsrto@gov.bc.ca" style=
                  "color:#989898;">hsrto@gov.bc.ca</a>- Evidence cannot be sent by
                  email</td>
                </tr>

                <tr>
                  <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src=
                  "<%= COMMON_IMAGE_ROOT + 'Icon_ContacPhonelSmlGry.jpg' %>"
                  width="20" height="20" /></td>

                  <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;">1-800-665-8779 - Do not call this number for
                  your dispute resolution hearing</td>
                </tr>

                <tr>
                  <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src=
                  "<%= COMMON_IMAGE_ROOT + 'Icon_ContactMailSmlGry.jpg' %>"
                  width="20" height="20" /></td>

                  <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href=
                  "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies" style=
                  "color:#989898;">Residential tenancy web site</a></td>
                </tr>

                <tr>
                  <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src=
                    "<%= COMMON_IMAGE_ROOT + 'Icon_ContactOfficSmlGry.png' %>"
                  width="20" height="20" /></td>

                  <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc"
                  style="color:#989898;">Service BC Locations</a></td>
                </tr>

                <tr>
                  <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src=
                    "<%= COMMON_IMAGE_ROOT + 'Icon_ContactUploadSmlGry.png' %>"
                  width="20" height="20" /></td>

                  <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="{dispute_access_url}" style=
                  "color:#989898;">Dispute Access Site</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div style="height:10px; padding:4px 4px 4px 10px; background-color:#38598a;"></div>
          </div>
        </div>
      </div>

      <div class="modalEmail-bottom-container">
        <div class="">
          <div class="modalEmail-due-filter"></div>
          <div class="modalEmail-response-due-date"></div>
          <div class="modalEmail-response-due-time"></div>
        </div>

        <div class="">
          <div class="modalEmail-followup-task"></div>
          <div class="modalEmail-assignee-position"></div>
          <div class="modalEmail-assignee-name"></div>
        </div>
      </div>

      <div class="modal-button-container">
        <button type="button" id="emailSaveDontSend" class="btn btn-lg btn-primary btn-continue">
          <span>Save DON'T Send</span>
        </button>
        <button type="button" id="emailCancel" class="btn btn-lg btn-default btn-cancel">
          Cancel
        </button>
        <button type="button" id="saveSend" class="btn btn-lg btn-primary btn-continue">
          <span>Save and SEND</span>
        </button>
      </div>

    </div>

  </div>
</div>
