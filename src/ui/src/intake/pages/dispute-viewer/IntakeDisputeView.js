import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import MenuCollection from '../../components/menu/Menu_collection'
import MenuView from '../../components/menu/Menu';
import IntakeDisputeFileView from './IntakeDisputeFileView';
import IntakeDisputePayments from './IntakeDisputePayments';
import './IntakeDispute.scss';
import IntakeDisputeHearingsView from './IntakeDisputeHearingsView';
import IntakeDisputeNoticesView from './IntakeDisputeNoticesView';
import IntakeDisputeSubmittedRequests from './IntakeDisputeSubmittedRequests';
import IntakeDisputeEmailsView from './IntakeDisputeEmailsView';
import IntakeDecisionsAndOrdersView from './IntakeDecisionsAndOrdersView';
import IntakeDisputeEvidenceView from './IntakeDisputeEvidenceView';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import Backbone from 'backbone';

const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const disputeChannel = Radio.channel('dispute');
const hearingChannel = Radio.channel('hearings');
const noticeChannel = Radio.channel('notice');
const documentsChannel = Radio.channel('documents');
const emailsChannel = Radio.channel('emails');
const paymentsChannel = Radio.channel('payments');
const participantsChannel = Radio.channel('participants');

const MENU_DISPUTE = 1;
const MENU_EVIDENCE = 2;
const MENU_HEARINGS = 3;
const MENU_NOTICES = 4;
const MENU_REQUESTS = 5;
const MENU_EMAILS = 6;
const MENU_DOCUMENTS = 7;
const MENU_PAYMENTS = 8;

const MENU_CONFIG = {
  [MENU_DISPUTE]: {
    text: `Dispute Application`,
    route: `view`,
  },
  [MENU_EVIDENCE]: {
    text: `Applicant Evidence`,
    route: 'view/evidence'
  },
  [MENU_HEARINGS]: {
    text: `Hearings`,
    route: `view/hearings`,
  },
  [MENU_NOTICES]: {
    text: 'Dispute Notices',
    route: `view/notices`,
  },
  [MENU_REQUESTS]: {
    text: 'My Requests',
    route: `view/requests`,
  },
  [MENU_EMAILS]: {
    text: 'Emails',
    route: 'view/emails'
  },
  [MENU_DOCUMENTS]: {
    text: 'Decisions and Orders',
    route: 'view/documents'
  },
  [MENU_PAYMENTS]: {
    text: 'Payments',
    route: 'view/payments'
  }
};

const IntakeDisputeView = Marionette.View.extend({
  id: "intake-content-container",

  regions: {
    menuRegion: {
      el: '#menu-region',
      replaceElement: true
    },
    intakeRegion: '#intake-content'
  },

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['parent']);
    this.menuCollection = new MenuCollection(Object.keys(MENU_CONFIG).map(id => ({
      disabled: false,
      step: id,
      text: MENU_CONFIG[id]?.text,
      route: MENU_CONFIG[id]?.route,
    })));
    this.updateMenuState();
  },

  updateMenuState() {
    const isNonParticipatory = disputeChannel.request('get')?.checkProcess(2);
    const hasEvidence = true;
    const hasHearings = hearingChannel.request('get')?.length
    const hasNotices = noticeChannel.request('get:all').filter(notice => notice.get('notice_delivered_to') && !notice.isAmendmentNotice() && participantsChannel.request('get:participant', notice.get('notice_delivered_to'))?.isApplicant())?.length;
    const hasHearingNotices = hearingChannel.request('get')?.filter(hearing => hearing.getHearingNoticeFileDescription())?.length;
    const hasRequests = noticeChannel.request('get:subservices').filter(participant => participantsChannel.request('get:participant', participant.get('service_by_participant_id'))?.isApplicant())?.length ||
      documentsChannel.request('get:requests').filter(participant => participantsChannel.request('get:participant', participant.get('submitter_id'))?.isApplicant())?.length;
    const hasEmails = emailsChannel.request('get:all')?.length;
    const hasDecisionDocs = documentsChannel.request('get:all')?.filter(doc => doc.isCompleted() && doc.getOutcomeFiles().filter(docFile => docFile.getDeliveries().filter(delivery => delivery.get('is_delivered'))))?.length;
    const hasPayments = paymentsChannel.request('get:fees')?.length;

    this.menuCollection.forEach(menuItem => {
      // Enable all menu items for selection
      
      if (menuItem.get('step') === String(MENU_DISPUTE)
        || (menuItem.get('step') === String(MENU_EVIDENCE) && hasEvidence)
        || (menuItem.get('step') === String(MENU_HEARINGS) && (hasHearings && !isNonParticipatory))
        || (menuItem.get('step') === String(MENU_NOTICES) && (hasNotices || hasHearingNotices))
        || (menuItem.get('step') === String(MENU_REQUESTS) && hasRequests)
        || (menuItem.get('step') === String(MENU_EMAILS) && hasEmails)
        || (menuItem.get('step') === String(MENU_DOCUMENTS) && hasDecisionDocs)
        || (menuItem.get('step') === String(MENU_PAYMENTS) && hasPayments)
      ) {
        menuItem.set({ visited: true });
      }
    });
  },

  async refreshDataAndRenderView() {
    loaderChannel.trigger('page:load');
    try {
      const disputeGuid = disputeChannel.request('get')?.id;
      await applicationChannel.request('load:ivd:data', disputeGuid);
      Backbone.history.loadUrl(Backbone.history.fragment);
    } catch {
      const errorHandler = generalErrorFactory.createHandler('INTAKE.DVIEW.LOAD.DISPUTE', () => loaderChannel.trigger('page:load:complete'));
      errorHandler();
    }
    loaderChannel.trigger('page:load:complete');
  },

  canAccessDisputeView() {
    const dispute = disputeChannel.request('get');
    return dispute && !dispute.checkStageStatus(0);
  },

  showIntakeDisputeViewDispute() {
    this.showIntakeDisputeView(IntakeDisputeFileView, MENU_DISPUTE);
  },

  showIntakeDisputeViewEvidence() {
    this.showIntakeDisputeView(IntakeDisputeEvidenceView, MENU_EVIDENCE)
  },

  showIntakeDisputeViewHearings() {
    this.showIntakeDisputeView(IntakeDisputeHearingsView, MENU_HEARINGS);
  },

  showIntakeDisputeViewNotices() {
    this.showIntakeDisputeView(IntakeDisputeNoticesView, MENU_NOTICES);
  },

  showIntakeDisputeViewRequests() {
    this.showIntakeDisputeView(IntakeDisputeSubmittedRequests, MENU_REQUESTS);
  },

  showIntakeDisputeViewEmails() {
    this.showIntakeDisputeView(IntakeDisputeEmailsView, MENU_EMAILS);
  },

  showIntakeDisputeViewDocuments() {
    this.showIntakeDisputeView(IntakeDecisionsAndOrdersView, MENU_DOCUMENTS);
  },

  showIntakeDisputeViewPayments() {
    this.showIntakeDisputeView(IntakeDisputePayments, MENU_PAYMENTS);
  },

  showIntakeDisputeView(viewClass, stepId) {
    // Clear any running animations on the page, as we are switching
    animationChannel.request('clear');

    // Clear any loaders
    loaderChannel.trigger('page:load:complete');

    this.parent.showIntakeDisputeView();

    // Refresh the menu
    this.updateMenuState();
    this.menuCollection.setActiveStep(`${stepId}`, { single: true });
    this.getChildView('menuRegion').render();

    // TODO: What default data to pass to sub-views here??
    // Any, or is it all through channels?
    const newView = new viewClass({ pageTitle: stepId, refreshDataAndRenderView: this.refreshDataAndRenderView });
    this.showChildView('intakeRegion', newView);
  },

  onRender() {
    menuChannel.trigger('enable:mobile');

    const menuView = new MenuView({
      collection: this.menuCollection,
      showFileNumber: true,
    });
    this.showChildView('menuRegion', menuView);

    // Initialize headers for all future pages, once we have the intake-content loaded
    this.$el.initializeFloatingHeaders();
  },

  template() {
    return <>
      <div id="menu-region"></div>
      <div id="intake-content"></div>
    </>
  },

});

_.extend(IntakeDisputeView.prototype, ViewJSXMixin);
export default IntakeDisputeView;
