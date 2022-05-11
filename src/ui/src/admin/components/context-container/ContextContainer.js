/**
 *
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import Backbone from 'backbone';
import { routeParse } from '../../routers/mainview_router';
import ContextMenuView from './ContextMenu';
import NoteCollectionView from '../../components/note/Notes';
import template from './ContextContainer_template.tpl';

const DEFAULT_MENU_STATE_NAME = 'default';
const CONTEXT_MENU_ICON_SELECTOR = '.edit-icon';
const NOTE_COUNT_SELECTOR = '.note-count';
const CONTEXT_MENU_TITLE_SELECTOR = '.context-menu-title';
const context_container_with_notes_wrapper_html = `
<div class="has-notes-column"></div>
<div class="notes-column hidden-print"><div>`;
const notes_buttons_html = `
<div class="context-menu-icon notes-icon notes-view-icon <%= notesCount ? '' : 'hidden' %>">
  <span class="notes-view note-count"><%= notesCount %></span>
</div>
<div class="context-menu-icon notes-icon notes-add-icon"></div>
`;

const amendmentsChannel = Radio.channel('amendments');
const noticeChannel = Radio.channel('notice');
const participantChannel = Radio.channel('participants');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');

const ContextContainerWithNotesView = Marionette.View.extend({
  template: _.template(context_container_with_notes_wrapper_html),
  className: 'context-container-with-notes',

  regions: {
    contentRegion: '.has-notes-column',
    notesRegion: '.notes-column'
  },

  ui: {
    contentMain: '.has-notes-column',
    contentNotes: '.notes-column',
    notesAdd: '.notes-add-icon',
    notesView: '.notes-view-icon',
    notesEmpty: '.notes-empty-div'
  },

  events: {
    'click @ui.notesAdd': 'clickAddNotes',
    'click @ui.notesView': 'clickViewNotes',
    'click @ui.notesEmpty': 'clickCloseNotes'
  },

  clickCloseNotes() {
    this.clickViewNotes();
  },

  initialize(options) {
    this.mergeOptions(options, ['wrappedContextContainerView', 'notes', 'noteCreationData', 'showComplexityAndUrgency']);
    if (!options.model) {
      this.model = this.wrappedContextContainerView.model;
    }
    this.stopListening(this.notes, 'refresh:notes');
    this.listenTo(this.notes, 'refresh:notes', function() {
      this.$(NOTE_COUNT_SELECTOR).text(this.notes.length);
      if (this.notes.length) {
        this.$('.notes-view-icon').removeClass('hidden');
      }
      const notesView = this.getChildView('notesRegion');
      notesView.render();
    }, this);

    this.stopListening(this.notes, 'hide:edit');
    this.listenTo(this.notes, 'hide:edit', function() {
      if (this.notes.length === 1 && this.notes.at(0).isNew()) {
        this.clickViewNotes();
      }
      // We have cancelled from one empty one
      // If we press cancel when showing notes, hide the panel
    }, this);
  },

  clickAddNotes() {
    // If no active note, add one
    const edit_models = this.notes.where({ mode: 'edit' });
    const focusCurrentNoteFn = () => {
      if (this.notes.length) this.notes.at(0).trigger('focus');
    };
    if (!edit_models || !edit_models.length) {
      this.notes.add(this.noteCreationData, {at: 0});
    }
    if (this._notesAreHidden()) {
      this.$(CONTEXT_MENU_TITLE_SELECTOR).css({'max-width': '800px'});
      this.getUI('contentNotes').css('right', '-350px').animate({right: '0'}, {duration: 600});
      this.getUI('contentMain').css('padding-right', '0').animate({'padding-right': '350px'}, {duration: 600, complete: focusCurrentNoteFn});
    } else {
      focusCurrentNoteFn();
    }

  },

  clickViewNotes() {
    const self = this;
    if (this._notesAreHidden()) {
      this.$(CONTEXT_MENU_TITLE_SELECTOR).css({'max-width': '800px'});
      this.getUI('contentNotes').css('right', '-350px').animate({right: '0px'}, {duration: 600});
      this.getUI('contentMain').css('padding-right', '0').animate({'padding-right': '350px'}, {duration: 600, complete: function() {
      
      }});
    } else {
      this.getUI('contentNotes').animate({'right': '-350px'}, {duration: 600} );
      this.getUI('contentMain').animate({'padding-right': '0'}, {duration: 600, complete: function() {
        self.$(CONTEXT_MENU_TITLE_SELECTOR).css({'max-width': '1200px'});
      }});
    }
  },

  _notesAreHidden() {
    return this.getUI('contentNotes').css('right') !== '0px';
  },

  renderClickableDiv() {
    const context_menu_ele = this.$('.notes-list-container');
    context_menu_ele.after(_.template(`<div class="notes-empty-div"></div>`))
    this.$('.notes-list-container, .notes-empty-div').wrapAll(_.template(`<div class="notes-wrapper"></div>`))
  },


  renderNotesButtons() {
    // NOTE: Notes are placed relative to the context menu icon
    const context_menu_ele = this.$(CONTEXT_MENU_ICON_SELECTOR);
    context_menu_ele.after(_.template(notes_buttons_html)({
      notesCount: this.notes.length
    }));
  },

  onRender() {
    this.showChildView('contentRegion', this.wrappedContextContainerView);
    this.renderNotesButtons(CONTEXT_MENU_ICON_SELECTOR);
    this.showChildView('notesRegion', new NoteCollectionView({
      collection: this.notes,
      childViewOptions: {
        autofocus: false
      }
    }));
    this.renderClickableDiv();
  }
});


/**
 * This view
 * @class
 * @augments Marionette.View
 */
const ContextContainerView =  Marionette.View.extend({
  template,
  tagName: 'div',
  className() {
    return `context-container ${this.viewState ? this.viewState : ''} ${this.getOption('cssClass') || ''}`;
  },

  /**
   * @type {admin.components.context-container.ContextMenuView}
   */
  contextMenu: null,
  viewState: null,

  regions: {
    menuRegion: '.context-menu',
    wrappedViewRegion: '.wrapped-view-container'
  },

  ui: {
    menu: CONTEXT_MENU_ICON_SELECTOR,
    amendmentIcon: '.amendment-icon',
    subServiceIcon: '.sub-service-icon-wrapper'
  },

  events: {
    'click @ui.menu': 'clickMenu',
    'click @ui.amendmentIcon': 'clickAmendmentIcon',
    'click @ui.subServiceIcon': 'clickSubServiceIcon'
  },

  clickAmendmentIcon() {
    if (this.model && this.model.get('dispute_guid')) {
      if (this.amendmentTypeToUse) {
        amendmentsChannel.request('show:modal:view', this.amendmentTypeToUse);
      } else {
        Backbone.history.navigate(routeParse('notice_item', this.model.get('dispute_guid')), { trigger: true, replace: false });
      }
    } else {
      console.log(`[Warning] No valid dispute model found, can't navigate to notice page.`)
    }
  },

  clickSubServiceIcon() {
    if (this.model) {
      this.model.trigger('open:subservice');
    } else {
      console.log(`[Warning] No valid participant model found, can't open manage substituted service modal.`)
    }
  },

  // Add events here
  clickMenu() {
    if (!this.contextMenu) {
      return;
    }
    
    if (_.isFunction(this.onMenuOpenFn) && !this.contextMenu.isOpen()) {
      // If we receive a funct
      $.when(this.onMenuOpenFn()).done(() => {
        this.contextMenu.toggleOpen();
      });
    } else {
      this.contextMenu.toggleOpen();
    }
  },

  // Initialize the component values
  initialize(options) {
    this.mergeOptions(options, ['wrappedView', 'disputeModel', 'contextRender', 'titleDisplay', 'amendmentTypeToUse', 'showSubServiceIcon', 'showComplexityAndUrgency',
      'onMenuOpenFn', 'menu_states', 'menu_events', 'menu_title', 'menu_model', 'menu_help_fn', 'menu_options', 'displayOnly', 'cssClass']);

    if (!options.model) {
      this.model = this.wrappedView.model;
    }

    if (!this.displayOnly) {
      this.setupListenersOnWrappedView();
    }
  },

  updateMenu(menuStates) {
    if (menuStates) {
      this.menu_states = menuStates;
    }

    const isMenuOpen = this.contextMenu.isOpen();
    this.renderMenu();

    if (isMenuOpen) {
      this.contextMenu.open({ no_animate: true });
    }
  },

  setupListenersOnWrappedView() {
    this.stopListening(this.wrappedView, 'menu:click');
    this.listenTo(this.wrappedView, 'menu:click', this.menuEventTriggered, this);

    // When wrapped view renders, always set it to default state
    this.stopListening(this.wrappedView, 'dom:refresh');
    this.listenTo(this.wrappedView, 'dom:refresh', () => {
      this._changeViewStateTo('view');
      this.switchMenuStateTo('default');
    });

    this.stopListening(this.wrappedView, 'contextRender');
    this.listenTo(this.wrappedView, 'contextRender', (options) => {
      if (this.contextRender) {
        this.contextRender(this, this.wrappedView, options);
      }
    });

    this.stopListening(this.wrappedView, 'contextRender:menu');
    this.listenTo(this.wrappedView, 'contextRender:menu', this.updateMenu, this);
  },

  createContextMenu() {
    const initial_menu_options = _.has(this.menu_states, DEFAULT_MENU_STATE_NAME) ? this.menu_states[DEFAULT_MENU_STATE_NAME] : [],
      model_to_use = this.menu_model ? this.menu_model : this.wrappedView.model;

    this.contextMenu = new ContextMenuView(_.extend({
      displayOnly: this.displayOnly,
      model: model_to_use,
      menu_options: initial_menu_options,
      menu_title: this.menu_title ? this.menu_title : `${this.titleDisplay} ID ${model_to_use.id}`,
      help_fn: this.menu_help_fn,
    }, this.menu_options));

    this._setupMenuEventDelegation();
  },

  _setupMenuEventDelegation() {
    this.listenTo(this.contextMenu, 'menu:click', function(event_name) {
      this.menuEventTriggered(event_name);
    }, this);
  },
  
  menuEventTriggered(event_name, options={}) {
    const isEdit = _.has(this.menu_events, event_name) ? this.menu_events[event_name].isEdit : false;
    const handleEditViewModeFn = () => {
      return new Promise((resolve, reject) => {
        if (!isEdit || !this.disputeModel || !_.isFunction(this.disputeModel.checkEditInProgressPromise)) {
          resolve();
          return;
        }

        this.disputeModel.checkEditInProgressPromise().then(() => {
          this.disputeModel.startEditInProgress(this.model);
          resolve();
        }, reject);
      });
    };

    handleEditViewModeFn().then(
      () => {
        // This will try to run a matching event on the wrapped view.
        // If none exists, or if the triggeredMethod doesn't explicitly return false, if will try to perform any defaults.
        if (options.open) this.openMenu({ no_animate: true })

        const method_return = this.wrappedView.triggerMethod(`menu:${event_name}`);
        if (method_return !== false) {
          this._menuEventPerformDefault(event_name);
        }
      }, () => this.disputeModel.showEditInProgressModalPromise());
    
  },

  _menuEventPerformDefault(event_name) {
    if (!_.has(this.menu_events, event_name)) {
      return;
    }
    

    const viewMode = this.menu_events[event_name].view_mode;
    if (viewMode) {
      this._changeViewStateTo(viewMode);
    }

    if (this.menu_events[event_name].next) {
      this.switchMenuStateTo(this.menu_events[event_name].next);
    }

    if (this.menu_events[event_name].reset) {
      this.resetWrappedView();
    }
  },

  openMenu(options) {
    if (this.contextMenu) {
      this.contextMenu.open(options);
    }
  },

  // Force close the menu
  closeMenu(options) {
    if (this.contextMenu) {
      this.contextMenu.close(options);
    }
  },

  switchMenuStateTo(menu_state_name) {
    //this.wrappedView.triggerMethod();
    if (!_.has(this.menu_states, menu_state_name)) {
      return;
    }
    this.contextMenu.updateMenu(this.menu_states[menu_state_name]);
  },

  _changeViewStateTo(view_state) {
    if (this.viewState) {
      this.$el.removeClass(this.viewState);
    }
    this.viewState = view_state;
    this.$el.addClass(this.viewState);
  },

  resetWrappedView() {
    this.wrappedView.resetModelValues();
    this._changeViewStateTo('view');
    this.wrappedView.render();
    this.contextMenu.open({ no_animate: true });

    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }
  },

  getSubServRequestStatusImgClass() {
    if (!this.showSubServiceIcon) return;
    
    const model_to_use = this.menu_model ? this.menu_model : this.wrappedView.model
    const participantModel = participantChannel.request('get:participant', model_to_use.id);
    if (!participantModel) return;

    const subServiceList = noticeChannel.request('get:subservices');
    const subServiceModel = subServiceList.find(subService => subService.get('service_to_participant_id') === participantModel.id);
    if (!subServiceModel) return;

    return subServiceModel.getRequestStatusImgClass();
  },

  getSubServiceTypeText() {
    const model_to_use = this.menu_model ? this.menu_model : this.wrappedView.model
    const participantModel = participantChannel.request('get:participant', model_to_use.id);
    if (!participantModel) return;

    const subServiceList = noticeChannel.request('get:subservices');
    const subServiceModel = subServiceList.find(subService => subService.get('service_to_participant_id') === participantModel.id);
    if (!subServiceModel) return;

    return subServiceModel.getSubServiceTypeText();
  },

  getComplexityAndUrgencyDisplay() {
    if (!this.disputeModel) return;

    let complexityClass = '';
    if (this.disputeModel.get('dispute_complexity') === configChannel.request('get', 'COMPLEXITY_SIMPLE')) complexityClass = 'dispute-complexity-basic-icon';
    else if (this.disputeModel.get('dispute_complexity') === configChannel.request('get', 'COMPLEXITY_STANDARD')) complexityClass = 'dispute-complexity-standard-icon';
    else if (this.disputeModel.get('dispute_complexity') === configChannel.request('get', 'COMPLEXITY_COMPLEX')) complexityClass = 'dispute-complexity-specialized-icon';

    return (
      `<div class="complexity-and-urgency-display-wrapper">
        <div class="${complexityClass}" ></div> ${this.disputeModel.get('dispute_complexity') ? `<span class="dispute-complexity-text">${Formatter.toComplexityDisplay(this.disputeModel.get('dispute_complexity'))}</span>` : ''}
        <div class="dispute-urgency-icon"></div> ${Formatter.toUrgencyDisplay(this.disputeModel.get('dispute_urgency'), { urgencyColor: true } )}</span>
      </div>`
    );
  },

  onBeforeRender() {
    if (this.wrappedView.isRendered()) {
      this.detachChildView('wrappedViewRegion');
    }

    // If we are re-rendering the context container of the model we were editing, then edit mode will end because we render as view by default
    if (this.disputeModel && this.disputeModel.checkEditInProgressModel(this.model)) {
      this.disputeModel.stopEditInProgress();
    }
  },

  onRender() {
    this.renderMenu();

    this.wrappedView.render();
    this.setupListenersOnWrappedView();
    this.showChildView('wrappedViewRegion', this.wrappedView);
  },

  renderMenu() {
    this.createContextMenu();
    this.showChildView('menuRegion', this.contextMenu);
  },

  templateContext() {
    return {
      titleDisplay: this.titleDisplay,
      showAmendmentIcon: !!this.amendmentTypeToUse,
      showSubServiceIcon: this.showSubServiceIcon,
      subServiceIconClass: this.getSubServRequestStatusImgClass(),
      subServiceText: this.getSubServiceTypeText(),
      showComplexityAndUrgency: this.showComplexityAndUrgency,
      complexityAndUrgencyDisplay: this.getComplexityAndUrgencyDisplay()
    };
  }
});


export default {
  /**
   * @param {Marionette.View} context_container_data.wrappedView - The Marionette.View to be wrapped inside the context container and context menu.
   * @param {Object} [context_container_data.displayOnly] - Just show the menu, don't setup listeners
   * @param {Object} [context_container_data.titleDisplay] - The title to use for the container.
   * @param {string} [context_container_data.cssClass] - Optional class to apply to each child's top level
   * @param {Object} [context_container_data.menu_states] - The hash of menu states and
   * @param {Object} [context_container_data.menu_events] - The hash of event name to
   * @param {string} [context_container_data.menu_model] - The model to use for the menu.  Menu title will be derived from this model's values.
   * If this model is not provided, menu will receive the model from wrappedView.
   * @param {string} [context_container_data.menu_title] - The menu title.  Will override any other values.
   * @param {Function} [contextRender] -  a function that will be run whenever "contextRender" event is triggered on the wrapped view
   *
   * @returns {ContextContainerView} - The new ContextContainerView that was created to wrap the passed in view.
   */
  withContextMenu(context_container_data) {
    return new ContextContainerView(context_container_data);
  },

  /**
   * @param {ContextContainerView} context_container_data.wrappedContextContainerView - The ContextContainerView that is to be wrapped and have notes added.
   * @param {Object} context_container_data.notes - The NoteCollection for this
   * @param {Object} context_container_data.noteCreationData - The hash of data that new notes will be created with.
   *
   * @returns {ContextContainerWithNotesView} - The new ContextContainerView that was created to wrap the passed in view.
   */
  withContextMenuNotes(context_container_data) {
    return new ContextContainerWithNotesView(context_container_data);
  },

  // Also export the classes in case they need to be referenced, eg. in childView field of a Marionette.CollectionView
  ContextContainerView,
  ContextContainerWithNotesView,
};
