<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><%= title %></title>
<style>
	div.pdf_container {
		width:240mm;
		font-family: Myriad Pro, Arial, Helvetica, sans-serif !important;
  	}
	
	body, table, td {
		font-family: Myriad Pro, Arial, Helvetica, sans-serif !important;
		font-size:16px;
		line-height:16px;
		padding:0px;
		margin:0px;
	}

  	* {
		font-family: Myriad Pro, Arial, Helvetica, sans-serif !important;
		font-size:16px;
		line-height:16px;
		padding:0px;
		margin:0px;
    }
	
	div.spacer_min {
		line-height:10px;
	}
	
	div.spacer_sml {
		line-height:20px;
	}
	
	div.spacer_med {
		line-height:30px;
	}
	
	div.spacer_lrg {
		line-height:40px;
	}
	
	p {
		padding:0px;
		margin:0px;
	}
	
	.organization_title {
		font-size: 18px;
		margin:20px 0px 2px 0px;
	}
  	.organization_subtitle {
		font-size: 14px;
	}
	
	p.document_title {
		font-size: 24px;
		font-weight: bold;
    line-height: 28px;
	}

	p.listitem {
		margin:5px 0px 0px 0px;
  }
  
  .listitem-hearingdetails {
    margin-left: 25px;
  }
	
	p.issue_listitem {
		margin:5px 0px 0px 0px;
	}
	
	p.issue_listitem_none {
		margin:5px 0px 0px 0px;
		color:#ccc;
		font-style: italic;
	}
	
	
	p.issue_listtitle {
		margin:15px 0px 0px 0px;
		font-weight:bold;
	}
	
	p.pregap_listitem {
		margin:15px 0px 0px 0px;
	}
	
	p.text_content {
		margin:10px 0px 0px 0px;
	}
	
	p.rtbtext_content {
		margin:0px;
		padding:10px !important;
		background-color: #f1f1f1;
	}
	
	p.list_header {
		margin:10px 0px 0px 0px;
	}
	
	p.evidence_text_content {
		margin:5px 0px 5px 0px;
	}

	
	div.list_wrapper {
		margin:0px 0px 0px 30px;
	}
	
	ul.bullet_list {
		padding:0px;
		margin:0px;	
	}
	
	ul.bullet_list li {
		padding:0px;
		margin:5px 0px 0px 10px;	
	}
	
	td.main_header {
		font-weight: bold; 
		font-size: 17px; 
	}
	
	td.sectiontitle_onecol {
		border-bottom:1px solid #ccc !important; 
		font-size: 15px;
		padding:7px 0px 2px 0px; 
		font-weight: bold; 
		
	}
	
	td.issuetitle_onecol {
		background-color: #f1f1f1; 
		padding: 5px 10px 5px 10px !important; 
		border-top: 4px solid #bebebe !important; 
		line-height:19px;
	}
	
	td.othertitle_onecol {
		background-color: #f1f1f1; 
		padding: 5px 10px 5px 10px !important;  
		line-height:19px;
		font-weight:bold;
	}

	td.left_twocol {
		width:50%;
		vertical-align: top;
		padding:5px 0px 5px 0px;
		margin:5px 0px 5px 0px;
	}
	
	
	td.right_twocol {
		width:50%;
		vertical-align: top;
		padding:5px 0px 5px 0px;
		margin:5px 0px 5px 0px;
	}
	
	table.evidence_item {
		margin-left:10px;
	}
	
	td.evidence_header {
		border-bottom:1px solid #ccc !important; 
		padding:20px 0px 2px 0px; 
		font-weight: bold; 
	}
	
	td.evidence_item {
		border-bottom:1px solid #eaeaea !important; 
		padding:5px 0px 5px 0px; 
	}
	
	td.evidence_context {
		padding-top:10px;
	}
	
	td.rtbcontacttitle_onecol {
		color: #fff; 
		padding:7px 7px 5px 10px !important; 
		height: 35px;
		font-weight: bold; 
		font-size: 16px; 
		background-color: #808080; 
	}
	
	td.rtbcontact_instructions {
		background-color: #f1f1f1; 
		padding:10px;
		margin:0px;
		border-bottom:1px solid #ccc; 
	}
	
	td.rtbleft_twocol {
		border-bottom:1px solid #fff; 
		background-color: #f1f1f1; 
		width:20%;
		vertical-align: top;
		padding:5px 0px 5px 10px;
	}
	
	
	td.rtbright_twocol {
		border-bottom:1px solid #fff; 
		background-color: #f1f1f1; 
		width:80%;
		vertical-align: top;
		padding:5px 0px 5px 5px;
	}
	
	span.non_bold {
		font-weight: normal !important;
	}

	.staff-title {
		font-size: 18px;
	}

	.staff-subtitle {
		font-size: 14px;
	}

	.checkbox-label {
		line-height: 26px;
	}

	input[type=checkbox] {
		
	}

	.custom-checkbox {
		font-family: Wingdings !important;
	}
	.custom-checkbox2 {
		font-family: Wingdings 2 !important;
	}

	.title-table {
		margin:0 auto;
		border: 1px solid #b0b0b0;
	}

	.bc-title-container {
		text-align: center;
		height: 120px;
	}

	.bc-title {
		font-size: 21px;
	}

	.bc-img {
		width: 200px;
		height: 55px;
	}

	.ceu-title-container {
		background-color: #3b4e6e;
		color: #fff;
		font-size: 18px;
		text-align: center;
		height: 40px;
		border-top: 1px solid #b0b0b0;
	}

</style>
</head>

<body>
  <%= bodyHtmlString %>
</body>
</html>
