import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import viewFileGif from '../../static/Icon_ViewFileAnimated.gif';
import './ModalIVDInfo.scss';

const ModalModalIVDInfo = ModalBaseView.extend({
  id: "ivdInfo_modal",

  initialize() {
    this.template = this.template.bind(this);
  },

  template() {
    return (
      <div className="modal-ivd-info">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">View Your Dispute File Details</h4>
              <div className="modal-close-icon-lg close-x" onClick={() => this.close()}></div>
            </div>
            <div className="modal-body clearfix">
              <p>Did you know that you can now view your:</p>
              <div className="modal-ivd-info__bullets-wrapper">
                <div className="modal-ivd-info__left-container">
                  <ul>
                    <li>dispute application</li>
                    <li>all applicant submitted evidence</li>
                    <li>hearing details </li>
                    <li>dispute notices</li>
                  </ul>
                </div>
                <div className="modal-ivd-info__right-container">
                  <ul>
                    <li>status and records of all submitted requests</li>
                    <li>email records</li>
                    <li>decisions and orders </li>
                  </ul>
                </div>
              </div>
              <img className="modal-ivd-info__img" src={viewFileGif} />
              <p>To access the dispute file details, click the "View file" link beside the file number.</p>
              <p>
                This view only access is available on all submitted and paid applications to the Residential Tenancy Branch and is viewable up to 6 months after the dispute file has been closed or withdrawn. It is not visible on files that have been returned for you to update due to errors or issues with your file.
              </p>
              <div className="button-row">
                <div className="pull-right">
                  <button type="button" className="btn btn-lg btn-default btn-cancel" onClick={() => this.close()}><span>Close</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

_.extend(ModalModalIVDInfo.prototype, ViewJSXMixin);
export default ModalModalIVDInfo;