import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../context-container/ContextContainer';
import HearingView from './Hearing';

const disputeChannel = Radio.channel('dispute');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const hearingChannel = Radio.channel('hearings');
const notesChannel = Radio.channel('notes');
const sessionChannel = Radio.channel('session');
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
      { name: 'Edit Active Hearing', event: 'edit:current' },
      { name: 'View on Daily Schedule', event: 'view:schedule' },
      { name: 'View Hearing History', event: 'view:history' },
    ];
    const inactiveMenuState = [
      { name: 'Edit Past Hearing', event: 'edit:non:current' },
      { name: 'View on Daily Schedule', event: 'view:schedule' },
      { name: 'View Hearing History', event: 'view:history' },
    ];
    const isCurrentUserScheduler = sessionChannel.request('is:scheduler');
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
        disputeModel: disputeChannel.request('get')
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

  initialize(options) {
    this.mergeOptions(options, ['unitCollection', 'hearingRecordings']);
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
      hearingRecording: hearingRecordings?.[0]
    };
  }
});


export default Marionette.View.extend({
  template: _.template(`<div class="hearing-list"></div>`),

  regions: {
    hearingsListRegion: '.hearing-list'
  },

  initialize(options) {
    this.options = options;
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
  }

});
