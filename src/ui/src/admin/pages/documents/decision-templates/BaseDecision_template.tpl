<html>
<head>
<title>Put Document Title Here</title>
<style>
	div.content_container {
		width:240mm;
		font-family: Arial, Helvetica, sans-serif !important;
  	}
	
	body, table, td {
		font-family: Arial, Helvetica, sans-serif !important;
		font-size:17px;
		line-height:21px;
		padding:0px;
		margin:0px;
	}

  	* {
		font-family:Arial, Helvetica, sans-serif !important;
		font-size:17px;
		line-height:21px;
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
	
	p.services_title {
		color:#6d6d6d;
		font-size: 19px;
		margin:12px 0px 5px 0px;
	}
	
	p.organization_title {
		color:#6d6d6d;
		font-size: 14px;
		margin:0px 0px 0px 0px;
		line-height: 16px;
		font-style: italic;
	}
	
	p.document-title {
		font-size: 24; 
		font-weight: bold;
    line-height: 28px;
	}
	
	span.filenum_left_block {
	display:inline-block; 
	background-color:#ccc;
	}

	p.listitem {
		margin:5px 0px 0px 0px;
	}
	
	p.issue_listitem {
		margin:5px 0px 0px 0px;
	}
	
	p.issue_listitem_none {
		margin:5px 0px 0px 0px;
		font-color:#ccc;
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
	
	p.text_content_filenumber {
	margin:10px 0px 0px 0px;
	padding: 0px 0px 0px 0px;
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

	
	div.list_wrapper_twocol {
		margin:0px 0px 0px 30px;
	}
	
	div.list_wrapper {
		margin:0px 0px 0px 30px;
	}
	
	div.list-wrapper_topspace {
		margin:5px 0px 0px 30px;
	}
	
	ul.bullet_list {
		padding:0px;
		margin:0px 0px 0px 0px;	
	}
	
	ul.bullet_list li {
		padding:0px;
		margin:5px 0px 0px 10px;	
	}
	
	td.main_header {
		font-weight: bold; 
		font-size: 19px; 
	}
	
	td.sectiontitle_onecol {
		border-bottom:1px solid #ccc !important; 
		font-size: 18px;
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

  tr:last-child td.left_twocol,
  tr:last-child td.right_twocol { border-bottom: none !important; }
	
  
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
  
  img.decision_signature {
    max-width: 290px; 
    height: 175px;
  }

  div.decision_signature_wrapper {
    display: flex; 
    align-items: center; 
    height: 175px; 
    max-width: 320px
  }

  div.decision_signature_card {
    min-width: 280px; 
    max-width: 320px;
  }

</style>
</head>

<body>
<div class="content_container">

  <!-- This is the PDF/HTML Header Table - Swap out for Word Doc -->
  <div id="generated-header"></div>

  <!-- hearing info goes here -->
  <div id="generated-hearing"></div>

  <!-- included issues -->
  <div id="generated-issues"></div>

  <!-- service of notice section -->
  <div id="generated-service"></div>

  <!-- prelim matters section-->

  <!-- background section -->
  <div id="generated-background"></div>

  <!-- analysis section -->
  <div id="generated-analysis"></div>
  
  <!-- conclusion -->
  <div id="generated-conclusion"></div>

  <!-- order -->
  <div id="generated-order"></div>
  
</div>	<!-- end content_container -->
</body>
</html>
