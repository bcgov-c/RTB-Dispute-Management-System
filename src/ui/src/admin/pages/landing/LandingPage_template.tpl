<div class="dms-logo-container">
  <div class="dms-logo"></div>
</div>

<table>

  <tr>
    <td class ="landing-page-label">Site</td>
    <td><%= runModeDisplay + (isCmsOnlyMode ? ' - CMS Viewer' : '') %></td>
   </tr>
   <tr>
    <td class ="landing-page-label">Site Build Date</td>
    <td><%= Formatter.toDateAndTimeDisplay(Moment(BUILD_INFO.BUILD_DATE)) %></td>
  </tr>
  <tr>
    <td class ="landing-page-label">Special Instructions</td>
    <td><%= isCmsOnlyMode ? 'This is a development site which should be used ONLY for viewing loaded CMS data.  If you are trying to reach the DMS test site, contact Hive1 for assistance.' :
      isDev ? 'This is a development site and is not intended for non-developer usage.' :
      isStaging ? 'This is a development and testing site and is intended to be used only by RTB staff.'
      : '-' %>
    </td>
   </tr>
  <tr>
  <tr>
    <td class ="landing-page-label">Intake URL</td>
    <td>
      <%
        if (isCmsOnlyMode || !INTAKE_URL) { print('-'); }
        else if (isSiteminder) { print('<span>'+INTAKE_URL+'</span><span style="margin-left:10px;">(for BCeID, use a separate browser)</span>');
        } else { %>
          <a class="static-external-link" href="javascript:;" url="<%= INTAKE_URL %>"><%= INTAKE_URL %></a>
        <% } %>
    </td>
   </tr>
  <tr>
  <tr>
    <td class ="landing-page-label">Dispute Access URL</td>
    <td>
      <% if (isCmsOnlyMode || !DISPUTE_ACCESS_URL) {
        print('-');
      } else { %>
        <a class="static-external-link" href="javascript:;" url="<%= DISPUTE_ACCESS_URL %>"><%= DISPUTE_ACCESS_URL %></a>
      <% }  %>
    </td>
   </tr>
  <tr>
  <tr>
    <td class ="landing-page-label">Office Submission URL</td>
    <td>
      <% if (isCmsOnlyMode || !OFFICE_SUBMISSION_URL) {
        print('-');
      } else { %>
        <a class="static-external-link" href="javascript:;" url="<%= OFFICE_SUBMISSION_URL %>"><%= OFFICE_SUBMISSION_URL %></a>
      <% }  %>
    </td>
   </tr>

  <tr>
    <td class ="landing-page-label">Mid-Tier API URL</td>
    <td><%= API_ROOT_URL || '-' %></td>
   </tr>

  <% if (isAdmin && isDev && !isCmsOnlyMode) { %>
    <tr>
      <td class="landing-page-label">Test Data</td>
      <td><a class="test-create-users-link" href="javascript:;">Create Users Utility</a></td>
    </tr>
  <% } %>
</table>

<div class="spacer-block-30"></div>

<div class="jsx-below-me"></div>
<div id="test-jsx"></div>
<div class="jsx-above-me"></div>
