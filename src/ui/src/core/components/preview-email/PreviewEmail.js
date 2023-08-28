/**
 * @fileoverview - Modal that displays the sent email html
 */
import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import EmailTemplateFormatter from '../email/EmailTemplateFormatter';
import templateEmailStyles from '../email/EmailTemplateStyles_template.tpl';
import PrintableIframe from '../printable-iframe/PrintableIframe';
import './PreviewEmail.scss';

const PICKUP_INSTRUCTIONS = `The following is your receipt of the documents you picked up from the Residential Tenancy Branch. For information privacy purposes, any personal information that was not provided as part of this submission may be abbreviated or partially hidden (**)`;

const PreviewEmail = Marionette.View.extend({
    /**
   * @param {EmailModel} emailModel 
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['emailModel']); 
    this.html = this.processHtmlBody();
  },

  processHtmlBody() {
    const htmlBody = this.emailModel.get('html_body');
    let htmlToUse = htmlBody;
    if (this.emailModel.isPickup()) {
      // Process any removable email links in print page body, and fail silently
      try {
        htmlToUse = EmailTemplateFormatter.getEmailContentFromHtml(htmlBody);
      } catch (err) { }
    }
    return htmlToUse;
  },

  print() {
    const printView = new PrintableIframe({
      printPageTitle: this.emailModel.get('subject'),
      printPageBody: this.html,
      instructionsText: this.emailModel.isPickup() ? PICKUP_INSTRUCTIONS : null
    });
    this.showChildView('printableIframe', printView);
    printView.print();
  },

  className: 'preview-email',
  
  regions: {
    printableIframe: '.preview-email-print-frame'
  },

  template() {
    return <div className={`preview-email__inner ${this.emailModel?.isPickup() ? 'preview-email-pickup' : 'preview-email-email'}`}>
      {this.emailModel.isPickup() ? <div className="preview-email__styles" dangerouslySetInnerHTML={{ __html: templateEmailStyles() }}></div> : null}
      <div dangerouslySetInnerHTML={{__html: this.html}}></div>
      <div className="preview-email-print-frame hidden"></div>
    </div>;
  },    
});

_.extend(PreviewEmail.prototype, ViewJSXMixin);
export default PreviewEmail;
