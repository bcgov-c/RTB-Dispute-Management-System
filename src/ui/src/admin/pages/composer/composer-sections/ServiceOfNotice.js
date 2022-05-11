import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { routeParse } from '../../../routers/mainview_router';
import ComposerSectionView from '../../../components/composer/ComposerSection';
import template from './ServiceOfNotice_template.tpl';

const disputeChannel = Radio.channel('dispute'),
  configChannel = Radio.channel('config'),
  noticeChannel = Radio.channel('notice'),
  Formatter = Radio.channel('formatter').request('get');

export default ComposerSectionView.extend({
  className: `${ComposerSectionView.prototype.className} composer-section-hearing-attendance`,
  
  outcomeDocContentType() {
    return configChannel.request('get', 'OUTCOME_DOC_CONTENT_TYPE_SERVICE_OF_NOTICE');
  },
  title: 'Section 3: Service of Notice',
  hasRefresh: true,
  notice_service_displays: {
    1: 'by posting on the door',
    2: 'in mail slot or box',
    3: 'by registered mail',
    4: 'by regular mail',
    5: 'in person',
    6: 'by fax',
    7: 'by another method'
  },

  _toNoticeServiceDisplay(dispute, service) {
    const isLandlord = dispute.isLandlord(),
      isServed = service.get('is_served'),
      isDeemed = service.get('service_date_used') !== 1,
      dateToUse = service.get(service.get('service_date_used') === 1 ? 'service_date' : 'received_date');

    let serviceDisplay = '';
    serviceDisplay += `The ${isLandlord? 'landlord':'tenant'} `;
    serviceDisplay += `${isServed? 'provided undisputed documentary' : 'failed to provide appropriate'} evidence and I, the arbitrator am `;
    serviceDisplay += `${isServed? '' : '<b>not</b>'} satisfied that ${isLandlord? 'Tenant' : 'Landlord'} (${service.get('participant_id')}) was `;
    serviceDisplay += `${isDeemed ? 'deemed ': ''}served `;
    if (isServed) {
      serviceDisplay += `${service.get('service_method') && this.notice_service_displays[service.get('service_method')] ?
          this.notice_service_displays[service.get('service_method')] : ''} on ${Formatter.toDateDisplay(dateToUse)}`;
    }
    return serviceDisplay;
  },

  generateFn() {
    const dispute = disputeChannel.request('get'),
      dfd = $.Deferred(),
      self = this;
    
    this._getNotices(dispute).done(function(noticeObject) {
      console.log(noticeObject);
      dfd.resolve(
        template({
          toNoticeServiceDisplayFn: _.bind(self._toNoticeServiceDisplay, self, dispute),
          isLandlord: dispute.isLandlord(),
          dispute,
          notices: noticeObject.dispute_notices,
          cross_app_notices: noticeObject.cross_app_dispute_notices
        })
      );
    }).fail(function() {
      console.log("[Error] Couldn't get active hearing for ", dispute);
      dfd.reject("<b><i>ERROR LOADING HEARING INFORMATION</i></b>");
    });

    return dfd.promise();
  },

  _getNotices(dispute) {
    const dfd = $.Deferred();

    $.whenAll(
      noticeChannel.request('load:dispute:notices', dispute.get('dispute_guid')),
      dispute.isCrossApp() ? noticeChannel.request('load:dispute:notices', dispute.get('cross_app_dispute_guid')) : () => {}
    ).done(function(noticeCollection, crossAppNoticeCollection) {
      dfd.resolve({
        dispute_notices: noticeCollection,
        cross_app_dispute_notices: crossAppNoticeCollection
      });
    }).fail(function() {
      alert(`[Error] Unable to load notices`);
      dfd.reject();
    });

    return dfd.promise();
  },

  links: [{
    text: 'Edit Notice',
    actionFn() {
      Backbone.history.navigate(routeParse('notice_item', disputeChannel.request('get:id')), { trigger: true });
    }
  },
  {
    text: 'Edit Cross App Notice',
    actionFn() {
      Backbone.history.navigate(routeParse('notice_item', disputeChannel.request('get:id')), { trigger: true });
    }
  }]
});