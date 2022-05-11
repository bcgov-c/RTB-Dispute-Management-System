<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="format-detection" content="telephone=no">
	<title></title>
<style type="text/css">
	table td {
		border-collapse: collapse; font-size:<%=FONT_SIZE_PX%>px;
	}
	span {
		font-size:<%=FONT_SIZE_PX%>px;
	}
	td.email-content {
		padding: 20px 24px 12px 24px; background-color: #FFF; color: #374550; font-size:<%=FONT_SIZE_PX%>px; 
	}
	.email-content h1 {
		font-size:21px; margin:20px 0px 4px 0px; 
	}
	.email-content h2 {
		color:#414141; font-size:18px; margin:20px 0px 4px 0px; 
	}
	.email-content p {
		color:#414141; 	font-size:<%=FONT_SIZE_PX%>px; line-height:20px;
	}
	.email-content  a {
		color: #1268b5;
		text-decoration: underline;
	}
	.email-content a:hover, a:focus {
		text-decoration: underline;
	}
	.email-content hr {
		margin:10px 10px 18px 10px; border:none; height:1px; background-color:#ccc;
	}
	.ep-table-wrapper {
		margin-top:25px;
		margin-bottom:25px;
	}

	.receipt-container__content__buttons, .receipt-container__thank-you { display: none; }
	
	
	@media screen and (max-width: 700px) {
		
		td.ep-single-column-left {
			width:40% !important;
		}
		td.ep-single-column-right {
			width:60% !important;
		}
	}

	@media screen and (max-width: 500px) {
		body {
			padding-left: 0px !important; padding-right: 0px !important;
		}	
		td.email-content {
			padding: 20px 10px 12px 10px; background-color: #FFF; color: #374550; font-size:16px; 
		}
		td.file-package-id {
			display: block !important;
			width:100% !important;
		}
		td.ep-single-column-left {
			display: block !important;
			width:100% !important;
		}
		td.ep-single-column-right  {
			display: block !important;
			width:100% !important;
			padding-bottom:13px !important;
		}
		td.ep-two-column-item {
			display: block !important;
			width:100% !important;
		}
		td.ep-two-column-sub-item {
			display: block !important;
			width:100% !important;
		}
		td.ep-contact-item {
			display: block !important;
			width:100% !important;
			border-bottom:none !important;
		}
		td.ep-contact-method {
			display: block !important;
			width:100% !important;
			padding-bottom:10px !important;
		}
		.showmobile {
			display: inline-block;
		}
		.hidemobile {
			display: none;
		}
	}
</style>
</head>
	
<body bgcolor="#F0F0F0" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" style="border-spacing:0px; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; font-family: Arial; background: #F0F0F0;">
  <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor=  "#F0F0F0" style="margin:0px auto; background-color: #F0F0F0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"> <tr> <td align="center" valign="top" style= "background-color: #F0F0F0;"> 
    <table border="0" cellpadding="0" cellspacing="0" class="container" style="margin-top:0px; width:100%; max-width:960px; background-color: #FFF;"> <tr>
      <td style="padding-top: 10px; padding-left: 14px;	padding-bottom: 10px; background-color: #003366; border-bottom: 1px solid #fcba19;" align="left">
        <p style="font-size:18px; font-weight:normal; color:#FFF; padding: 0px 0px 0px 0px; 	margin: 0px; font-style: normal;">
          <img style="position:relative; top:2px; width:95px; height:65px; -ms-interpolation-mode: bicubic;" src="<%= COMMON_IMAGE_ROOT + 'BCLogoBlue.jpg' %>" alt="BC Logo" width="95" height="65" /> <span>Residential Tenancies</span> </p>
      </td> </tr>
      <tr><td style="height: 25px; padding: 2px 4px 2px 14px; background-color: #38598a;	color: #e2e9f3;	font-size: 15px; font-style: normal;">
        <p><%= 'Transaction Receipt - Do not reply' %></p>
      </td> </tr>
      <tr> <td class="email-content" align="left" style="padding:10px 20px 10px 20px;">			
        <%= emailBody %>
      </td></tr>
      <tr> <td class="container-padding footer" style="padding:10px" align="left"> <hr style="display:block; height:1px; border:0px; border-top:1px solid #dedede; margin:0px 0px 10px 0px; padding:0px;" />
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0px; font-size: 15px; margin:0px; max-width:980px; width:100%;"> <tbody>
          <tr> <td colspan="2" style="margin-bottom:5px; color: #989898;font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"> <strong>British Columbia Residential Tenancy Branch</strong></td> </tr>
          <tr>
            <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src= "<%= COMMON_IMAGE_ROOT + 'Icon_ContactEmailsmlGry.png' %>" width="20" height="20" /></td>
            <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="mailto:hsrto@gov.bc.ca" style= "color:#989898;">hsrto@gov.bc.ca</a>- Evidence cannot be sent by email</td>
          </tr>
          <tr>
            <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src= "<%= COMMON_IMAGE_ROOT + 'Icon_ContactPhonelSmlGry.png' %>" width="20" height="20" /></td>
            <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;">1-800-665-8779 - Do not call this number for your dispute resolution hearing</td>
          </tr>
          <tr>
            <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src= "<%= COMMON_IMAGE_ROOT + 'Icon_ContactMailSmlGry.png' %>" width="20" height="20" /></td>
            <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href= "https://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies" style= "color:#989898;">Residential tenancy web site</a></td>
          </tr>
          <tr>
            <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src= "<%= COMMON_IMAGE_ROOT + 'Icon_ContactOfficeSmlGry.png' %>" width="20" height="20" /></td>
            <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/citizens-services/servicebc" style="color:#989898;">Service BC Locations</a></td>
          </tr>
          <tr>
            <td width="30" valign="top"><img style="-ms-interpolation-mode: bicubic;" src= "<%= COMMON_IMAGE_ROOT + 'Icon_ContactUploadDASmlGry.png' %>" width="20" height="20" /></td>
            <td style="color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px;"><a href="{dispute_access_url}" style= "color:#989898;">Dispute Access Site</a></td>
          </tr>
        </tbody> </table> <!--/end footer content table -->
      </td> </tr>
      <tr> <td style="height:10px; padding:4px 4px 4px 10px; background-color:#38598a;"> </td> </tr>
    </table><!--/600px container --> </td> </tr></table><!--/100% background wrapper-->
  </body>
</html>
