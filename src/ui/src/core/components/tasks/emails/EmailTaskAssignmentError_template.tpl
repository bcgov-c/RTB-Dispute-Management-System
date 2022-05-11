<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- So that mobile will display zoomed in -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
  <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
  <title></title>

  <style type="text/css">
	body {
		margin: 0;
		padding: 0;
		-ms-text-size-adjust: 100%;
		-webkit-text-size-adjust: 100%;
		font-family: Arial;
		background: #F0F0F0;
	}
	table {
		border-spacing: 0;
	}
	table td {
		border-collapse: collapse;
	}
	.hidemobile {
		display: inline-block;
	}
	.showmobile {
		display: none;
	}
	.container-padding {
		padding: 12px !important;
	}
	table {
		mso-table-lspace: 0pt;
		mso-table-rspace: 0pt;
	}
	img {
		-ms-interpolation-mode: bicubic;
	}
	.content {
		padding: 20px 24px 12px 24px;
		background-color: #FFF;
		color: #374550;
	}
	.content a {
		color: #1268b5;
		text-decoration: underline;
	}
	.content a:hover, a:focus {
		text-decoration: underline;
	}
	p.body-title {
		font-size: 16px;
    line-height: 21px;
		font-weight: bold;
		padding: 0px;
		margin: 20px 0px 10px 0px;
	}
	p.body-text {
    font-size: 16px;
    line-height: 21px;
		text-align: left;
		color: #666;
		padding: 0px 0px 0px 0px;
		margin: 0px 0px 10px 0px;
	}
	table.body-table {
		border: solid 1px #dedede;
    	border-collapse: collapse;
    	border-spacing: 0;
		margin-top: 15px;
		color: #666;
		font-size: 15px;
		width:100%; 
	}  
	table.body-table td {
		border: solid 1px #dedede;
    	border-collapse: collapse;
    	border-spacing: 0;
		padding: 5px;
	}  


	@media screen and (max-width: 500px) {
		body {
			padding-left: 0px !important; padding-right: 0px !important;
		}	
		td.email-content {
			padding: 20px 10px 12px 10px; background-color: #FFF; color: #374550; font-size:16px; 
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
  <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor=  "#F0F0F0" style="margin:0px auto; background-color: #F0F0F0; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"> 
    <tr>
      <td align="center" valign="top" bgcolor="#F0F0F0" style=
      "background-color: #F0F0F0;">
        <table border="0" cellpadding="0" cellspacing="0" class="container" style="margin-top:0px; width:100%; max-width:960px; background-color: #FFF;">
          <tr>
            <td style="padding-top: 10px; padding-left: 14px;	padding-bottom: 10px; background-color: #222834; border-bottom: 2px solid #5269ac;" align="left">
              <p style="font-size:18px; font-weight:normal; color:#FFF; padding: 0px 0px 0px 0px; 	margin: 0px; font-style: normal;">
				  <img style="position:relative; top:2px; width:209px; height:67px; -ms-interpolation-mode: bicubic;" src="https://dev-dms.tenancydispute.gov.bc.ca/Common/img/DMSLogo_EmailDarkHeader.png" alt="BC Logo" width="209" height="67" />
				</p>
            </td>
          </tr>

          <tr>
            <td style="height: 25px; padding: 4px 4px 4px 14px; background-color: #e3e3e3;	color: #606e80;	font-size: 14px; font-style: normal;">
              <p>System Issue Email </p>
            </td>
          </tr>

          <tr>
            <td class="email-content" align="left" style="padding:20px;">

			<h1 class="" style="font-size: 16px; font-weight: bold; padding: 0px; margin: 0px 0px 10px 0px;">Issue with task auto assignment</h1>
				
			<p class="body-text" style="font-size: 15px; line-height: 21px;text-align: left; color: #666;padding: 0px 0px 0px 0px;margin: 0px 0px 10px 0px;"> A task was created without an owner (unassigned)  because a valid ID for the internal assigned staff member in the DMS configuration file is not correct&nbsp;   Please validate that the user ID listed below is valid and active in DMS.&nbsp; The details of the failed task assignment are included below for reference:</p> 
			
			<p class="body-text" style="font-size: 15px; line-height: 20px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Failed User Id: </span>&nbsp; <strong><%= userId %></strong></p>
			<p class="body-text" style="font-size: 15px; line-height: 20px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Task associated to: </span>&nbsp;<%= associatedTo %></p>
			<p class="body-text" style="font-size: 15px; line-height: 21px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Task File Number: </span>&nbsp;<%= fileNumber %></p>
			<p class="body-text" style="font-size: 15px; line-height: 20px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Date: </span>&nbsp;<%= dateTime %></p>
			<p class="body-text" style="font-size: 15px; line-height: 20px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Source Site: </span>&nbsp;<%= sourceSite %></p>
			<p class="body-text" style="font-size: 15px; line-height: 20px;text-align: left; color: #0F0F0F;padding: 0px 0px 0px 0px;margin: 0px 0px 5px 0px;"> <span class="ep-label" style="padding:0px 5px 0px 0px; color:#727272; font-size:15px;">Submitter Access Code: </span>&nbsp;<%= accessCode %></p>
			
			  
			  
          	<hr style="display:block; height:1px; border:0px; border-top:1px solid #dedede; margin:40px 0px 0px 0px; padding:0px;" />
			<p class="body-text" style="font-size: 15px; line-height: 20px;	text-align: left; color: #666;	padding: 10px 0px 0px 0px;	margin: 0px 0px 0px 0px;">This is an automatically generated email.  Please do not reply to this message.</p>
          </td>
        </tr>
        <tr>
        	<td style="height:10px; padding:4px 4px 4px 10px; background-color:#222834;"> 		
        	</td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>