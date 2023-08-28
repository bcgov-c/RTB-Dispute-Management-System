/**
 * View wrapper for HearingParticipation that displays clickable actions that relate to hearing participation. Becomes enabled when hearing tools is selected.
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { HearingParticipation } from './HearingParticipation';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './HearingParticipationHearingTools_template.tpl';

const disputeChannel = Radio.channel('dispute');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');

export default Marionette.View.extend({
  template,
  className: 'hearing-tools-container',

  ui: {
    hearingParticipation: '.hearing-participation-container',
    edit: '.hearing-tools-edit',
    add: '.hearing-tools-add',
    markAll: '.hearing-tools-mark-all',
    markNone: '.hearing-tools-mark-none',
    reset: '.hearing-tools-reset',
    cancel: '.hearing-tools-save-controls-cancel',
    save: '.hearing-tools-save-controls-save'
  },

  regions: {
    hearingParticipationRegion: '@ui.hearingParticipation'
  },

  events: {
    'click @ui.hearingParticipation': 'clickBody',
    'click @ui.edit': 'clickEdit',
    'click @ui.cancel': 'clickCancel',
    'click @ui.save': 'clickSave',

    'click @ui.add': 'clickAdd',
    'click @ui.markAll': 'clickMarkAll',
    'click @ui.markNone': 'clickMarkNone',
  },

  clickBody() {
    if (this.isViewMode() && this.hasHearingParticipations) {
      this.clickEdit();
    }
  },

  clickEdit() {
    if (!this.disputeModel) {
      this.renderInEditMode();
      return;
    }

    this.disputeModel.checkEditInProgressPromise().then(
      () => {
        this.disputeModel.startEditInProgress(this.model);
        this.renderInEditMode();
      },
      () => {
        this.disputeModel.showEditInProgressModalPromise()
      });
  },

  clickAdd() {
    const participationView = this.getChildView('hearingParticipationRegion');
    if (participationView) {
      participationView.clickAddOther();
    }
  },

  _clickMarkAllParticipations(isAttended) {
    this.model.getParticipations().forEach(hearingP => {
      if (hearingP.isOther()) return;
      hearingP.trigger('ui:attendence:set', isAttended ? 1 : 0);
    });
  },

  clickMarkAll() {
    this._clickMarkAllParticipations(true);
  },

  clickMarkNone() {
    this._clickMarkAllParticipations(false);
  },

  clickCancel() {
    this.model.getParticipations().add(this.participationsToDelete, { merge: true });
    this.model.resetHearingParticipations();
    this.participationsToDelete = [];
    this.renderInViewMode();
  },

  clickSave() {
    const hearingParticipationView = this.getChildView('hearingParticipationRegion');
    if (!hearingParticipationView || !hearingParticipationView.isRendered()) {
      console.log(`[Warning] Hearing Participation is not rendered, can't save`);
      return;
    }

    if (!hearingParticipationView.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length > 0) {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', { is_page_item: true });
      }
      return;
    }

    hearingParticipationView.saveInternalSaveDataToHearingModel();

    loaderChannel.trigger('page:load');
    const hearingParticipationPromise = () => new Promise((res, rej) => {
      return Promise.all(this.participationsToDelete.map(p => p.destroy()))
        .then(() => this.model.saveHearingParticipations())
        .then(res, generalErrorFactory.createHandler('ADMIN.PARTICIPATION.SAVE', rej));
    });
    const hearingPromise = () => new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, generalErrorFactory.createHandler('ADMIN.HEARING.SAVE', rej)));
    
    hearingParticipationPromise().then(hearingPromise).finally(() => {
      this.participationsToDelete = [];
      this.renderInViewMode();
      loaderChannel.trigger('page:load:complete');
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'unitCollection']);

    this.disputeModel = disputeChannel.request('get');
    this.mode = this.mode || 'participation-view';
    this.hasHearingParticipations = this.model.getParticipations().length;
    this.participationsToDelete = [];
    this.setupListeners();
  },

  setupListeners() {
    this.stopListening(this.model.getParticipations(), 'remove', this.handleParticipantRemove);
    this.listenTo(this.model.getParticipations(), 'remove', this.handleParticipantRemove, this);
  },

  handleParticipantRemove(model) {
    if (model.isOther() && !this.participationsToDelete.find(m => m.id === model.id)) this.participationsToDelete.push(model);
  },

  renderInViewMode() {
    this.mode = 'participation-view';

    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }
    this.render();
  },

  renderInEditMode() {
    this.mode = 'participation-edit';
    if (this.disputeModel) {
      this.disputeModel.startEditInProgress(this.model);
    }
    this.render();
  },

  isViewMode() {
    return this.mode === 'participation-view';
  },

  onRender() {
    this.showChildView('hearingParticipationRegion', new HearingParticipation({
      viewMode: this.isViewMode(),
      model: this.model,
      unitCollection: this.unitCollection
    }));
  },

  templateContext() {
    return {
      mode: this.mode,
      hasHearingParticipations: this.hasHearingParticipations
    };
  }

});