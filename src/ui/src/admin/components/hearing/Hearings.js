/**
 * @fileoverview - Main dispute hearings page view. Displays all past, future, and on hold hearings for a dispute.
 */
import Backbone from 'backbone';
import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../context-container/ContextContainer';
import SessionCollapse from '../session-settings/SessionCollapseHandler';
import HearingView from './Hearing';
import { routeParse } from '../../routers/mainview_router';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import HearingHoldIcon from '../../static/Icon_HearingHold_LRG.png';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import HearingCollection from '../../../core/components/hearing/Hearing_collection';

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const notesChannel = Radio.channel('notes');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const EmptyHearingsView = Marionette.View.extend({
  tagName: 'div',
  template: _.template(`
  <div class="hearings-title-container--empty page-section-title-container">
    <span class="page-section-title">Hearings</span>
  </div>
  <div class="hearing-item standard-list-empty">No hearings are currently assigned to this dispute file</div>
  `)
});

const HearingsView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: ContextContainer.ContextContainerWithNotesView,
  emptyView: EmptyHearingsView,

  buildChildView(child, ChildViewClass, childViewOptions){
    const options = _.extend({model: child}, childViewOptions);

    if (ChildViewClass === EmptyHearingsView) {
      return new ChildViewClass(childViewOptions);
    }

    const hearingsLength = child.collection ? child.collection.length : 0;
    const hearingNumber = hearingsLength + 1 - (options.childIndex ? options.childIndex : (child.collection ? child.collection.indexOf(child) : 0));
    const activeMenuState = [      
      { name: 'Reassign (exchange)', event: 'reassign' },
      { name: 'Reschedule', event: 'reschedule' },
      { name: 'Cancel (unassign)', event: 'unassign' },
      { name: 'Edit Linking', event: 'edit:linked' },
      { name: 'Edit Hearing', event: 'edit:current' },
      { name: 'Daily Schedule', event: 'view:schedule' },
      { name: 'Hearing History', event: 'view:history' },
      // Hearing Notice can only be removed from the file where it was provided
      ...(child.getHearingNoticeFileDescription() ? [{ name: 'Remove Hearing Notice', event: 'remove:hearing:notice' }] : []),
    ];
    const inactiveMenuState = [
      { name: 'Edit Hearing', event: 'edit:non:current' },
      { name: 'View on Daily Schedule', event: 'view:schedule' },
      { name: 'View Hearing History', event: 'view:history' },
    ];
    const isCurrentUserScheduler = sessionChannel.request('is:scheduler');
    const disputeModel = disputeChannel.request('get');
    // Create the child view instance
    const view = ContextContainer.withContextMenuNotes({
      wrappedContextContainerView: ContextContainer.withContextMenu({
        wrappedView: new HearingView(options),
        titleDisplay: `Hearing ${Formatter.toLeftPad(hearingNumber, '0', 2)}`,
        menu_title: `Hearing ID ${child.id}`,
        menu_states: {
          default: isCurrentUserScheduler ? (child.isActive() ? activeMenuState : inactiveMenuState) : [],
          edit_current: [{ name: 'Save', event: 'save:current'}, {name: 'Cancel', event: 'cancel'}],
          edit_non_current: [{ name: 'Save', event: 'save:non:current' }, {name: 'Cancel', event: 'cancel'}],
        },
        menu_events: {
          'edit:current': {
            view_mode: 'active-edit',
            next: 'edit_current',
            isEdit: true
          },
          'edit:non:current': {
            view_mode: 'inactive-edit',
            next: 'edit_non_current',
            isEdit: true
          },
          cancel: {
            next: 'default',
            reset: true
          }
        },
        menu_help_fn: () => {
          const helpRulesToShow = [
            `Hearing changes and hearing schedule changes can only be made by users with the correct scheduler permissions`,
            `Past hearings cannot be modified, only the notes can be changed.`
          ];
          modalChannel.request('show:standard', {
            title: 'General Hearing Rules',
            bodyHtml: `<p class="menu-help-warning-modal">The following rules affect the options available to hearings:<ul>`
              + `${_.map(helpRulesToShow, rule => `<li>${rule}</li>`).join('')}`
              + `</ul></p>`,
            hideContinueButton: true,
            cancelButtonText: 'Close'
          });
        },
        disputeModel,
        collapseHandler: SessionCollapse.createHandler(disputeModel, 'Hearings', 'hearings', child.id),
      }),
      notes: notesChannel.request('get:hearing', child.id),
      noteCreationData: {
        mode: 'edit',
        note_linked_to: configChannel.request('get', 'NOTE_LINK_HEARING'),
        note_link_id: child.id,
        note: null
      }
    });
    return view;
  },

  /**
   * @param {UnitCollection} unitCollection
   * @param {FileCollection} hearingRecordings - .wav file containing recording of past hearing
   * @param {HearingCollection} onHoldHearings - hearings that have been put on hold and associated to the loaded Dispute
   */
  initialize(options) {
    this.mergeOptions(options, ['unitCollection', 'hearingRecordings', 'onHoldHearings']);
    this.listenTo(this.collection, 'update', this.render);
  },

  childViewOptions(model, index) {
    const hearingRecordings = this.hearingRecordings.filter(file => {
      if (!model.id) return;
      const filename = file.get('file_name') || '';
      return filename.substr(0, filename.indexOf('_')) === String(model.id);
    });

    return {
      childIndex: index+1,
      unitCollection: this.unitCollection,
      hearingRecordings: hearingRecordings,
      onHoldHearings: this.onHoldHearings
    };
  }
});


const Hearings = Marionette.View.extend({

  regions: {
    hearingsListRegion: '.hearing-list'
  },

  initialize(options) {
    this.options = options;
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['onHoldHearings']);
    this.onHoldHearingsCollection = new HearingCollection(this.onHoldHearings.available_hearings);
    this.totalOnHoldHearings = this.onHoldHearings?.total_available_records;
  },

  async cancelHoldHearing(hearingModel) {
    return new Promise((res, rej) => hearingChannel.request('cancel:reserved', hearingModel?.id).then(() => {
      this.onHoldHearingsCollection.remove(hearingModel);
      res();
    }, generalErrorFactory.createHandler('HEARING.CANCEL.RESERVATION', rej)));
  },

  async clickCancelHold(hearingModel) {
    loaderChannel.trigger('page:load');
    this.cancelHoldHearing(hearingModel)
      .finally(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
  },

  async clickBookHold(hearingModel) {
    loaderChannel.trigger('page:load');
    const disputeGuid = hearingModel.get('hearing_reserved_dispute_guid');
    await this.cancelHoldHearing(hearingModel)
    await hearingModel.createDisputeHearing({ dispute_guid: disputeGuid });
    await hearingModel.checkAndUpdateLinkType()
      .catch(err => {
        generalErrorFactory.createHandler('ADMIN.DISPUTEHEARING.SAVE', () => {
          hearingModel.resetDisputeHearings();
        })(err);
      });
    this.collection.trigger('hearings:refresh');
  },

  clickViewHearing(hearingModel) {
    const hearingStartDate = Moment(hearingModel.get('hearing_start_datetime')).format('YYYY-MM-DD');
    Backbone.history.navigate(routeParse('scheduled_hearings_daily_param_item', null, hearingStartDate), { trigger: true });    
  },

  onRender() {
    // save scroll position
    this.showChildView('hearingsListRegion', new HearingsView(this.options));

    clearInterval(this.interval);
    // Have the hearings analyze themselves
    const activeHearing = this.collection.getActive();
    if (activeHearing) {
      this.interval = setInterval(() => {
        if (!activeHearing.isActive()) {
          clearInterval(this.interval);
          this.render();
        }
      }, 30000);
    }
  },

  onDestroy() {
    clearInterval(this.interval);
  },

  renderHearingToolsRegions() {
    const hearingsListView = this.getChildView('hearingsListRegion');
    if (hearingsListView && hearingsListView.children) {
      hearingsListView.children.each(function(hearingView) {
        if (!hearingView.wrappedContextContainerView || !hearingView.wrappedContextContainerView.wrappedView) {
          return;
        }
        const view = hearingView.wrappedContextContainerView.wrappedView;
        view.model.resetHearingParticipations();
        hearingChannel.request('update:participations', view.model);
        view.renderHearingToolsRegions();
      });
    }
  },

  template() {
    return (
      <>
        { this.renderJsxOnHoldHearings() }
        <div className="hearing-list"></div>
      </>
    );
  },

  renderJsxOnHoldHearings() {
    const isSchedulerUser = sessionChannel.request('is:scheduler');
    if (!this.totalOnHoldHearings >= 1) return;

    const latestHearing = hearingChannel.request('get:latest');
    const isFutureHearing = latestHearing?.isActive();    
    return (
      this.onHoldHearingsCollection.map((hearing) => <div className="info-banner-with-icon-container">
        <img src={HearingHoldIcon} />&nbsp;
        <span>
          <b>On hold hearing:&nbsp;</b> 
          {Moment(hearing.get('hearing_start_datetime')).format('LLLL')},&nbsp;{Formatter.toUserDisplay(hearing.get('hearing_owner'))}
          {isSchedulerUser ?
            <>
              &nbsp;-
              &nbsp;<span className="general-link general-link" onClick={() => this.clickViewHearing(hearing)}>View on daily schedule</span>
              <span className="hold-hearings-separator"></span>
              <span className="general-link" onClick={() => this.clickCancelHold(hearing)}>Cancel hold</span>
              {isFutureHearing ? null : <span className="hold-hearings-separator"></span>}
              {isFutureHearing ? null : <span className="general-link" onClick={() => this.clickBookHold(hearing)}>Book hold hearing</span>}
            </>
          : null}
        </span>
      </div>)
    );
  }

});
_.extend(Hearings.prototype, ViewJSXMixin);
export default Hearings;
