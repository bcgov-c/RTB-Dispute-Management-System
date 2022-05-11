import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';

const PrintableIframe = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['printPageTitle', 'printPageBody', 'instructionsText']);

    // Process any hyperlinks in print page body, and fail silently
    try {
      const html = $('<div>').append($(this.printPageBody));
      html.find(`a`).each(function() {
        const url = $(this).attr('href');
        $(this).text(`${$(this).text()} [${url}]`);
      });
      this.printPageBody = html.html();
    } catch (err) {
      //
    }
  },

  print() {
    const printFrame = this.getUI('printFrame');
    const printFrameWindow = printFrame[0].contentWindow;

    if (this.isPrintPopulated) {
      printFrameWindow.focus();
      printFrameWindow.printSelf();
    } else {
      // Add HTML body
      const html = this.getPrintHtml(true);
      printFrame[0].contentDocument.write(html);

      // Add CSS manually as next step - required for iframes
      const head = printFrame.contents().find("head");
      const css = this.getPrintStylesHtml();
      $(head).append(css);

      printFrame[0].onload = function() {
        printFrame[0].onload = null;
        // Define print method within frame context
        printFrameWindow.eval(`function printSelf() {
          focus();
          var result = document.execCommand('print', false, null);
          if (!result) {
            focus();
            print();
          }
        }`);
        printFrameWindow.focus();
        printFrameWindow.printSelf();
      };
      // Close iframe and start print
      printFrame[0].contentDocument.close();

      this.isPrintPopulated = true;
    }
  },

  getPrintHtml(bodyOnly=false) {
    return `${!bodyOnly ? `<html lang="en">
      <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta content="width=device-width, initial-scale=1" name="viewport"><!-- So that mobile will display zoomed in -->
        <meta content="IE=edge" http-equiv="X-UA-Compatible"><!-- enable media queries for windows phone 8 -->
        <meta content="telephone=no" name="format-detection"><!-- disable auto telephone linking in iOS -->
        <title></title>
        ${this.getPrintStylesHtml()}
      </head>
  ` : ''}
      <body style="border-spacing:0px; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; font-family: Arial, Helvetica, sans-serif; font-size:16px; line-height:21px; background: #FFF; color:#292929;">
        <div class="print-page-top-container">
          <div class="print-page-logo">
              <img src="${require('../../../core/static/Header_BCLogo_White.png')}" width="120" />
          </div>
          <div class="print-page-title-container">
            <span class="print-page-sub-title">Residential Tenancy Branch</span>
            <span class="print-page-title">${this.printPageTitle}</span>
          </div>
        </div>
        ${this.instructionsText ? `<div style="margin: 10px 0">${this.instructionsText}</div>` : ''}
        ${this.printPageBody}
      </body>
    ${!bodyOnly ? '</html>' : ''}`;
  },

  getPrintStylesHtml() {
    return `<style type="text/css">
          body { margin: 0; padding: 0; color:#292929; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; font-family: Arial, Helvetica, sans-serif; background: #F0F0F0; } 
          table { border-spacing: 0; } 
          table td { border-collapse: collapse; } 
          .hidemobile { display: inline-block; } 
          .showmobile { display: none!important; }  
          table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; } 
          img { -ms-interpolation-mode: bicubic; } 
          td .header { padding-top: 10px; padding-left: 14px; padding-bottom: 10px; background-color: #003366; border-bottom: 1px solid #fcba19; } 
          td .subheader { height: 25px; padding: 4px 4px 4px 14px; background-color: #38598a; color: #e2e9f3; font-size: 15px; font-style: normal; } 
          td .subheader .p { color: #e2e9f3; font-size: 15px; padding: 0px 0px 0px 0px; margin: 0px; font-style: normal; }  
          table.footer-items { border-collapse: separate; border-spacing: 0px; font-size: 15px; margin-top: 15px; } 
          .footer a { color: #aaaaaa !important; text-decoration: underline; } 
          td.footer { margin:0px; padding-top:5px; } 
          td.footer-text { color: #989898; font-weight: normal; font-size: 14px !important; margin: 0px; padding: 2px 0px 3px 0px; } 
          a:link { color: #aaaaaa !important; text-decoration: underline; } 
          a:visited { color: #aaaaaa !important; text-decoration: underline; } 
          a:hover { color: #aaaaaa !important; text-decoration: underline; } 
          a:active { color: #aaaaaa !important; text-decoration: underline; } 
          .hidden-print { display: none!important; }
          @media screen and (max-width: 500px) { 
            .showmobile { display: inline-block; } 
            .hidemobile { display: none; }
          }
          
          @media print {
            @page {
              size: A4 portrait;
              max-height:100%;
              max-width:100%;
            }
            html, body{ width:100%; margin:0; padding:0; }
            body { background-color: #fff !important; }
          
            /* Common */
            .general-link { text-decoration: none; color: #337ab7!important; }
            table { break-inside: avoid; }
            
            button { display: none!important; }
          
            .print-page-top-container { display: flex!important; height: 110px!important; margin: 20px 0px; }
            .print-page-logo {height: 100px!important; width: 120px!important; }
            .print-page-title-container { width: 100%; margin: 0 0 0 30px; align-self: center; }
            .print-page-sub-title { font-size: 18px; float: left; margin-bottom: 0px; width: 100%; }
            .print-page-title { font-size: 20px; font-weight: bold; }

            .visible-email { display: none !important; }
          }
          
          @media print and (color) {
            * { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
      </style>`;
  },

  ui: {
    printFrame: '#printFrame',
  },

  template() {
    return <iframe id="printFrame" name="printFrame" className="hidden hidden-print" height="0" width="0" src="about:blank"></iframe>;
  }

});

_.extend(PrintableIframe.prototype, ViewJSXMixin);
export default PrintableIframe;