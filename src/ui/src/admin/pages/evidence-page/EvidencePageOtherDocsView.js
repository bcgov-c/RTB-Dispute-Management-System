import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputeEvidenceContainer from '../../components/dispute-claim/DisputeEvidenceContainer';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const disputeChannel = Radio.channel('dispute');

const EvidencePageOtherDocsView = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['showThumbnails', 'evidenceFilePreviewFn', 'unitCollection', 'fileDupTranslations']);
  },

  regions: {
    generalFormsRegion: '.evidence-other-doc__forms__general',
    paymentFormsRegion: '.evidence-other-doc__forms__payment',
    legacyFormsRegion: '.evidence-other-doc__forms__legacy',
  },

  onRender() {
    const dispute = disputeChannel.request('get');
    const defaultEvidenceViewOptions = {
      showArrows: true,
      showArbControls: false,
      showThumbnails: this.showThumbnails,
      showDetailedNames: true,
      evidenceFilePreviewFn: this.evidenceFilePreviewFn,
      unitCollection: this.unitCollection,
      fileDupTranslations: this.fileDupTranslations,
      hideDups: this.hideDups,
    };
    this.showChildView('generalFormsRegion', new DisputeEvidenceContainer(Object.assign({
      title: this.model.get('generalTitle'),
      collection: this.model.get('generalCollection'),
      collapseHandler: SessionCollapse.createHandler(dispute, 'Evidence', 'otherdocs', 'general'),
    }, defaultEvidenceViewOptions)));
    
    this.showChildView('paymentFormsRegion', new DisputeEvidenceContainer(Object.assign({
      title: this.model.get('paymentTitle'),
      collection: this.model.get('paymentCollection'),
      collapseHandler: SessionCollapse.createHandler(dispute, 'Evidence', 'otherdocs', 'payment'),
    }, defaultEvidenceViewOptions)));

    this.showChildView('legacyFormsRegion', new DisputeEvidenceContainer(Object.assign({
      title: this.model.get('legacyTitle'),
      collection: this.model.get('legacyCollection'),
      collapseHandler: SessionCollapse.createHandler(dispute, 'Evidence', 'otherdocs', 'legacy'),
    }, defaultEvidenceViewOptions)));
  },

  template() {
    return <div className="evidence-other-doc">
      <div className="evidence-other-doc__forms__general"></div>
      <div className="evidence-other-doc__forms__payment"></div>
      <div className="evidence-other-doc__forms__legacy"></div>
    </div>
  },
});

_.extend(EvidencePageOtherDocsView.prototype, ViewJSXMixin);
export default EvidencePageOtherDocsView;
