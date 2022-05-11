import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../routers/mainview_router';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import DisputeAmendmentsView from '../amendments/DisputeAmendments';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const loaderChannel = Radio.channel('loader');
const disputeChannel = Radio.channel('dispute');

const ModalAmendmentsView = ModalBaseView.extend({
  /**
   * @param {Backbone.Collection} amendmentCollection -
   * @param {Number} amendmentType - 
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['amendmentCollection', 'amendmentType']);
  },

  onRender() {
    this.showChildView('amendmentsRegion', new DisputeAmendmentsView({
      collection: this.amendmentCollection,
      enableTypeFilter: true,
      initialType: this.amendmentType,
      enableUnlinkedIcon: true,
    }));

    setTimeout(() => loaderChannel.trigger('page:load:complete'), 15);
  },

  navigateToNotice() {
    loaderChannel.trigger('page:load');
    this.close();
    Backbone.history.navigate(routeParse('notice_item', disputeChannel.request('get:id')), { trigger: true, replace: false });
    return false;
  },

  id: 'modalAmendmentsView',
  regions: {
    amendmentsRegion: '.modal-amendments-view'
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">Recorded Amendments</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body">
            <div className="">
              The following amendments have been recorded on this file.  Use the drop down to view the different categories.  You can view all amendments, their notices, and manage unlinked amendments in the <span className="general-link" onClick={() => this.navigateToNotice()}>Notice View</span>
            </div>
            <div className="modal-amendments-view"></div>
            <div className="modal-button-container">
              <button type="button" className="btn btn-lg btn-cancel" onClick={this.close.bind(this)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

_.extend(ModalAmendmentsView.prototype, ViewJSXMixin);
export default ModalAmendmentsView;
