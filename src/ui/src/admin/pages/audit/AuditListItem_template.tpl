<div class="audit-item-header"><%=audit_log_id%></div>
<div class="audit-type-header <%=typeClass%>"><%=httpRequestDisplay%></div>
<div class="audit-change-header"><%=apiNameDisplay%></div>
<div class="audit-user-role-header"><%=userRoleDisplay%></div>
<div class="audit-change-by-header"><%=changeByDisplay ? changeByDisplay : '- '%></div>
<div class="audit-date-header"><%=Formatter.toDateAndTimeDisplay(submitted_date)%></div>
<div class="audit-view-details-header"><div class="view-audit-log">View Detail</div></div>