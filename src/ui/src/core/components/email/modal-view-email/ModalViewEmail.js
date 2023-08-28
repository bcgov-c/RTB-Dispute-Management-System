/**
 * @fileoverview - Modal that wraps the PreviewEmail View in order to display the email html. Also displays attachments and email info.
 */
import React from 'react';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import EmailPreviewView from '../../preview-email/PreviewEmail';
import ModalBaseView from '../../modals/ModalBase';
import FileCollection from '../../files/File_collection';
import FileListJsx from '../../../../core/components/files/file-list/FileListJsx';
import './ModalViewEmail.scss';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');
const emailsChannel = Radio.channel('emails');
const modalChannel = Radio.channel('modals');

const ModalViewEmail = ModalBaseView.extend({
  className: `${ModalBaseView.prototype.className} modalViewEmail`,
  
  regions : {
    emailPreview: '.modal-view-email__email-content',
    attachmentFilesRegion: '.modal-view-email-attachment-files',
  },

  close() {
    ModalBaseView.prototype.close.call(this);
  },

  clickFilename(fileModel) {
    fileModel.download();
  },

  /**
   * @param {EmailModel} emailModel
   */

  initialize(options) {
    this.mergeOptions(options, ['emailModel']);
    this.template = this.template.bind(this);

    this.participant = participantsChannel.request('get:participant', this.emailModel.get('participant_id'));
    this.attachmentFilesCollection = new FileCollection();
    this.invalidAttachments = [];
    this.emailModel.getAttachments().forEach(attachment => {
      const loadedFile = attachment.getFileModel();
      if (!loadedFile?.id) {
        this.invalidAttachments.push(attachment);
      } else {
        this.attachmentFilesCollection.add(loadedFile);
      }
    });

    if (this.invalidAttachments.length) {
      this.listenToOnce(this, 'shown:modal', () => {
        this.$el.hide();
        const modalView = modalChannel.request('show:standard', {
          title: 'Email Attachment Files Could Not Be Loaded',
          bodyHtml: `<p>Some email attachment files could not be shown on the email.  This could be due to the attached file being removed from the dispute, or from a linked file.</p>
            <p>The following file IDs could not be loaded:</p>
            <ul>
              ${this.invalidAttachments.map(f => `<li>${f.get('file_id') || f.get('common_file_id')}</li>`)}
            </ul>
          `,
          hideCancelButton: true,
          primaryButtonText: `Continue`,
          onContinueFn(_modalView) { _modalView.close() }
        });
        this.listenTo(modalView, 'removed:modal', () => {
          this.$el.show();
        });
      });
    }
  },

  onRender() {
    this.showChildView('emailPreview', new EmailPreviewView({ emailModel: this.emailModel }));

    loaderChannel.trigger('page:load:complete');
  },

  template() {
    const showMissingFilesWarning = this.invalidAttachments.length;

    return (
      <>
        <div className="modal-dialog">
          <div className="modal-content clearfix">
            <div className="modal-header">
              <h4 className="modal-title">View Email / Pickup</h4>
              <div className="modal-close-icon-lg close-x"></div>
            </div>

            <div className="modal-body">
                <div className="email-modal-divider"></div>

                <div className="modal-view-email__content-wrapper">
                  <div>
                    <span className="general-modal-label">Subject:</span>&nbsp;<span className="general-modal-value">{this.emailModel.get('subject')}</span>
                  </div>
                  <div>
                    <span className="general-modal-label">Recipient:</span>&nbsp;<span className="general-modal-value">
                      { (this.emailModel.isPickup() && this.participant) ? this.participant.getMessageRecipientDisplayHtml({ no_icons: true, no_email: true }) :
                      (this.emailModel.get('email_to')) ? <a href={`mailto:${this.emailModel.get('email_to')}`}>{this.emailModel.get('email_to')}</a> :
                      '-'
                      }
                    </span>
                  </div>
                  <div className=" modal-view-email-attachment-container">
                    <span className="general-modal-label">Attachments:&nbsp;</span>
                    <span>{FileListJsx(this.attachmentFilesCollection, this.clickFilename)}</span>
                  </div>
                  { showMissingFilesWarning ? <p className="modal-view-email-attachment-files-warning">Some email files could not be loaded and are not shown</p> : null }
                </div>

                <div className="modal-view-email__content-wrapper">
                  <div>
                    <div className="modal-view-email__email-content"></div>
                  </div>
                </div>


                  <div className="modal-button-container">
                  <button type="button" className="btn-cancel btn btn-lg btn-default btn-standard btn-primary">Close</button>
                  </div>
                
            </div>
          </div>
        </div>
      </>
    )
  },
});

_.extend(ModalViewEmail.prototype, ViewJSXMixin);
export default ModalViewEmail;