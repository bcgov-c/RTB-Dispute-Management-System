<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title><%= title %></title>
<style>

  .decision_content_container {
    width: 240mm;
    margin-left: auto;
    margin-right: auto;
    font-family: Arial, Helvetica, sans-serif !important;
    font-size: 16px;
  }
  .decision_content_container table {
    font-family: Arial, Helvetica, sans-serif !important;
    font-size: 16px;
  }  

  .tab { 
		margin-left: 20px;
	}

  .large_tab { 
		margin-left: 50px;
	}

  ul, ol {
    margin-top: 5px;
    margin-bottom: 5px
  }

  .layout_table {
    width: 100%;
  }

  .twocol_table > td {
    width: 50%;
  }

  .services_title {
    font-size: 22px;
    color: #595959;
  }
  .services_subtitle {
    color: #595959;
    font-size: 16px;
  }

  .services_subtitle_sm {
    color: #595959;
    font-size: 14px;
  }

	.bc_header_img {
		width: 320px;
		height: 80px;
	}

  .section_title {
    border-bottom: 1px solid #000; 
		font-size: 18px;
		padding:7px 0px 2px 5px;
    margin-bottom: 15px;
    color: #595959;
		font-weight: bold;
  }

  .section_subtitle {
    font-size: 16px;
    font-weight: bold; 
    color: #595959;
  }

  .section_subtitle2 {
    font-size: 16px;
	  font-weight: bold; 
    padding-bottom: 12px;
  }

  .doc_title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    text-decoration: underline;
  }

  .search_instructions {
    font-size: 14px;
  }

  .light_text {
    color: #6a6a6a;
  }

  .list_block {
    margin-top: 0;
    line-height: 18px;
  }

  .text_block {
    margin-bottom: 7px;
  }

  .text_block ul {
    margin-top: 0;
  }

  .list_block.list_end_block {
    margin-bottom: 0;
  }

  .align_right {
    text-align: right;
  }

  .bottom_spacer_sm {
    margin-bottom: 5px;
  }

  .signature_container {
    text-align: right;
  }

  .dms_page_break {
    page-break-before: always;
  }

  .DMS-ACT-SECTION p {
      font-size: 1em;
      padding: 0;
      margin-top: 0.35em;
      margin-bottom: 0.35em;
  }

  .DMS-ACT-SECTION p.para {
      display: block;
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 5em;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.para span.num {
      margin: 0 0 0 0;
      position: relative;
      left: 0;
  }

  .DMS-ACT-SECTION p.para span.holder {
      margin: 0 0 0 0;
      position: absolute;
      right: 7px;
      text-align: right;
      width: 200px;
  }

  .DMS-ACT-SECTION p.para.sandwich {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 7em;
      text-indent: 0;
  }

  .DMS-ACT-SECTION p.sub {
      display: block;
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 2.4em !important;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sub.secsandwich {
      display: block;
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 2.4em;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sub.secsandwich.nosubsecnum {
      display: block;
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 0.7em !important;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sub span.num {
      margin: 0 0 0 0;
      position: relative;
      left: 0;
  }

  .DMS-ACT-SECTION p.sub span.holder {
      margin: 0 0 0 0;
      position: absolute;
      right: 5px;
      text-align: right;
      width: 200px;
  }

  .DMS-ACT-SECTION p.para.oned1 {
      margin-left: 7em !important;
      text-indent: -2.65em;
  }

  .DMS-ACT-SECTION p.para.oned2 {
      margin-left: 7em !important;
      text-indent: -3.2em;
  }

  .DMS-ACT-SECTION p.subpara {
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 10em;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.subpara span.num {
      margin: 0 0 0 0;
      position: relative;
      left: 0;
  }

  .DMS-ACT-SECTION p.subpara span.holder {
      margin: 0 0 0 0;
      position: absolute;
      right: 7px;
      text-align: right;
      width: 200px;
  }

  .DMS-ACT-SECTION p.subpara.sandwich {
      text-indent: 0 !important;
  }

  .DMS-ACT-SECTION p.subpara.sub1.oned1 {
      margin-left: 9.9em !important;
      text-indent: -2.5em !important;
  }

  .DMS-ACT-SECTION p.subpara.oned1 {
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 9.8em;
      text-indent: -2.2em;
  }


  .DMS-ACT-SECTION p.subpara.sub1 {
      text-indent: -1.6em;
  }

  .DMS-ACT-SECTION p.subpara.sub2 {
      text-indent: -1.8em;
  }

  .DMS-ACT-SECTION p.subpara.sub3 {
      text-indent: -2em;
  }

  .DMS-ACT-SECTION p.subpara.sub4 {
      text-indent: -3.5em;
  }

  .DMS-ACT-SECTION p.sec {
      display: block;
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 2.5em;
      text-indent: -1.8em;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sec.nosubsecnum+ul.text-list {
      margin: 0 0 0 3.9em !important;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.sec.nosubsecnum+ul.bullet {
      margin: 0 0 0 4.7em !important;
  }

  .DMS-ACT-SECTION p.sec+ul.bullet {
      margin: 0 0 0 7em !important;
  }

  .DMS-ACT-SECTION p.sec+ul.text-list {
      margin: 0 0 0 6em !important;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.para+ul.bullet {
      margin: 0 0 0 11.7em !important;
  }

  .DMS-ACT-SECTION p.para+ul.text-list {
      margin: 0 0 0 10.7em !important;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p[align="left"]+ul.bullet {
      margin: -.8em 0 0 1em !important;
  }

  .DMS-ACT-SECTION p[align="left"]+ul.text-list {
      margin: -.8em 0 0 0.8em !important;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p[align="left"] strong em {
      letter-spacing: .04em;
  }

  .DMS-ACT-SECTION p.sec.oned1 {
      display: block;
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 2.5em !important;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sec.nosubsecnum {
      display: block;
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 0.6em !important;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sec.secText {
      display: block;
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 0.6em !important;
      text-indent: 0;
      text-align: left;
  }

  .DMS-ACT-SECTION p.sec span.secnum {
      margin: 0 0 0 0;
      position: relative;
      left: 0;
  }

  .DMS-ACT-SECTION p.sec.nosubsecnum span.secnum b {
      position: relative;
      right: -4px !important;
  }

  .DMS-ACT-SECTION p.sec span.secnum b {
      position: relative;
      right: -3px;
  }

  .DMS-ACT-SECTION p.sec b {
      font-size: 14px;
  }

  .DMS-ACT-SECTION p.sec span.secnumholder {
      margin: 0 0 0 0 !important;
      
      top: -2px;
      right: 7px;
      text-align: right !important;
      width: 200px;
  }

  .DMS-ACT-SECTION p.def {
      margin-left: 2.5em;
      text-indent: 0;
  }

  .DMS-ACT-SECTION p.def a[name="rule1-1subrule1"] {
      display: inline-block;
      margin: 0 0 0 0;
  }

  .DMS-ACT-SECTION p.def.sandwich {
      text-indent: 0 !important;
  }

  .DMS-ACT-SECTION p.defsandwich {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 5em;
  }

  .DMS-ACT-SECTION [class="sub 2"] {
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 2.5em !important;
      text-indent: -2.45em !important;
  }

  .DMS-ACT-SECTION p.sub.sandwich {
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 2.5em !important;
      text-indent: 0;
  }

  .DMS-ACT-SECTION [class="sub oned1"] {
      margin-top: 0.3em;
      margin-bottom: 0;
      margin-left: 2.5em !important;
      text-indent: -2.8em !important;
  }

  .DMS-ACT-SECTION p.subfirst {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 0em;
      text-indent: 0;
  }

  .DMS-ACT-SECTION p.schIndent1 {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 2em;
  }

  .DMS-ACT-SECTION p.schIndent1+ul.bullet {
      margin: 0 0 0 7em;
  }

  .DMS-ACT-SECTION p.schIndent1+ul.text-list {
      margin: 0 0 0 6.8em;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.schIndent2 {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 8em;
  }

  .DMS-ACT-SECTION p.schIndent2+ul.bullet {
      margin: 0 0 0 12em;
  }

  .DMS-ACT-SECTION p.schIndent2+ul.text-list {
      margin: 0 0 0 12.8em;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.schIndent3 {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 14em;
  }

  .DMS-ACT-SECTION p.schIndent3+ul.bullet {
      margin: 0 0 0 19em;
  }

  .DMS-ACT-SECTION p.schIndent3+ul.text-list {
      margin: 0 0 0 18.8em;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.schIndent4 {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 20em;
  }

  .DMS-ACT-SECTION p.schIndent4+ul.bullet {
      margin: 0 0 0 24.9em;
  }

  .DMS-ACT-SECTION p.schIndent4+ul.text-list {
      margin: 0 0 0 24.7em;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.schIndent5 {
      margin-top: 0.25em;
      margin-bottom: 0;
      margin-left: 26em;
  }

  .DMS-ACT-SECTION p.schIndent5+ul.bullet {
      margin: 0 0 0 31em;
  }

  .DMS-ACT-SECTION p.schIndent5+ul.text-list {
      margin: 0 0 0 30.8em;
      list-style: none !important;
      list-style-type: none !important;
  }

  .DMS-ACT-SECTION p.schLeftHang_1 {
      margin-left: 1em;
      text-indent: -1.1em;
  }

  .DMS-ACT-SECTION p.schLeftHang_2 {
      margin-left: 1em;
      text-indent: -1.6em;
  }

  .DMS-ACT-SECTION p.clause {
    margin-top: 0.1em;
    margin-bottom: 0;
    margin-left: 15em;
    text-indent: 0;
  }

  .DMS-ACT-SECTION p.clause span.num {
    margin: 0 0 0 0;
    position: relative;
    left: 0;
  }

  .DMS-ACT-SECTION p.clause span.holder {
    margin: 0 0 0 0;
    position: absolute;
    right: 7px;
    text-align: right;
    width: 200px;
  }

  .DMS-ACT-SECTION p.subclause {
    margin-top: 0.1em;
    margin-bottom: 0;
    margin-left: 18em;
  }

  .DMS-ACT-SECTION p.subclause span.num {
    margin: 0 0 0 0;
    position: relative;
    left: 0;
  }

  .DMS-ACT-SECTION p.subclause span.holder {
    margin: 0 0 0 0;
    position: absolute;
    right: 7px;
    text-align: right;
    width: 200px;
  }

  .DMS-ACT-SECTION section {
      text-align: left;
      padding-left: 2.5em;
      position: relative;
  }

  .DMS-ACT-SECTION span.aborig-stack {
      letter-spacing: -9px;
      padding-right: 3px;
  }

  .DMS-ACT-SECTION span.aborig-stack:after {
      letter-spacing: 0;
      padding-right: 3px;
  }

  .DMS-ACT-SECTION span.aborig-stack-cap {
      letter-spacing: -8px;
      padding-right: 9px;
  }

  .DMS-ACT-SECTION span.aborig-stack-cap span {
      text-decoration: none !important;
  }

  .DMS-ACT-SECTION span.aborig-stack-cap:after {
      letter-spacing: 8px;
      padding-right: 9px;
  }

  .DMS-ACT-SECTION .double-quotes {
      font-weight: bold !important;
      font-style: italic !important;
  }

  .DMS-ACT-SECTION .amd_text {
      font-size: 14px !important;
      font-weight: bold;
      font-style: italic;
  }

  .DMS-ACT-SECTION .inline-hnote {
      font-size: .8em;
      font-style: normal;
  }

  .DMS-ACT-SECTION .inline-hnote:before {
      content: "[";
  }

  .DMS-ACT-SECTION .inline-hnote:after {
      content: "]";
  }

  .DMS-ACT-SECTION .inline-descriptor {
      font-style: italic;
      font-weight: normal !important;
  }

  .DMS-ACT-SECTION .inline-descriptor:before {
      content: "[";
  }

  .DMS-ACT-SECTION .inline-descriptor:after {
      content: "]";
  }

  .DMS-ACT-SECTION .normal-font-style {
      font-weight: normal !important;
      font-style: normal;
  }

  .DMS-ACT-SECTION .normal-bold-style {
      font-weight: bold !important;
      font-style: normal;
  }

  .DMS-ACT-SECTION sup {
      position: relative;
      top: -2px;
      margin: 0 0 -10px 0 !important;
      padding: 0 0 0 0;
      line-height: 5px;
  }

</style>
</head>

<body>
<div class="decision_content_container">
  <div id="generated-header"></div>
  <div id="generated-hearing"></div>
  <div id="generated-search-instructions"></div>
  <div id="generated-doc-title"></div>
  <div id="generated-issues"></div>
  <div id="generated-service"></div>
  <div id="generated-prelim-matters"></div>
  <div id="generated-issues-decided"></div>
  <div id="generated-background"></div>
  <div id="generated-analysis"></div>
  <div id="generated-conclusion"></div>
  <div id="generated-order"></div>
  <div id="generated-sub-service"></div>
  <div id="generated-correction"></div>
  <div id="generated-clarification"></div>
  <div id="generated-review"></div>
  <div id="generated-search-instructions-footer"></div>
</div>
</body>
</html>
