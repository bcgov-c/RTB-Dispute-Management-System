import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './working-schedule.scss';

const EDIT_TOOL_CONFIGS = {
  HEAR: 1,
  DUTY: 2,
  WRIT: 3,
  BLK: 4,
  VAC: 100,
  OTH: 102,
  EDIT: -99,
  REMOVE: -98,
  POWER_EDIT: -97,
};

const EDIT_TOOL_COLOUR_CLASSES = {
  [EDIT_TOOL_CONFIGS.HEAR]: '--hear',
  [EDIT_TOOL_CONFIGS.DUTY]: '--duty',
  [EDIT_TOOL_CONFIGS.WRIT]: '--writ',
  [EDIT_TOOL_CONFIGS.VAC]: '--vac',
  [EDIT_TOOL_CONFIGS.BLK]: '--blk',
  [EDIT_TOOL_CONFIGS.OTH]: '--oth',
  [EDIT_TOOL_CONFIGS.EDIT]: '--edit',
  [EDIT_TOOL_CONFIGS.REMOVE]: '--remove',
  [EDIT_TOOL_CONFIGS.POWER_EDIT]: '--power-edit',
}

const LANGUAGE = {
  [EDIT_TOOL_CONFIGS.HEAR]: {
    TITLE: `Hearing Time`,
    SUBTITLE: `Avail for Hearings`,
  },
  [EDIT_TOOL_CONFIGS.DUTY]: {
    TITLE: `Duty Time`,
    SUBTITLE: `Reserved for Duty`,
  },
  [EDIT_TOOL_CONFIGS.WRIT]: {
    TITLE: `Writing Time`,
    SUBTITLE: `Reserved for Writing`,
  },
  [EDIT_TOOL_CONFIGS.VAC]: {
    TITLE: `Vacation Time`,
    SUBTITLE: `Vacation Time`    
  },
  [EDIT_TOOL_CONFIGS.BLK]: {
    TITLE: `Other Work Time`,
    SUBTITLE: `Working Time`,
  },
  [EDIT_TOOL_CONFIGS.OTH]: {
    TITLE: `Other Time Off`,
    SUBTITLE: `Non-Working Time`
  },
};

const WorkingScheduleEditToolsView = Marionette.View.extend({
  
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['selectedItemId', 'undoHandler', 'disabled', 'enablePowerEdit']);

    this.listenTo(this.undoHandler, 'update', this.render, this);
  },

  getLanguageDataForSelectedTool() {
    return LANGUAGE[this.selectedItemId] || null;
  },

  getButtonClass(buttonTypeId) {
    return `working-sched__edit-tools__button ${this.selectedItemId === buttonTypeId ? 'selected' : ''}`
  },

  onButtonClick(newSelection) {
    if (this.selectedItemId === newSelection) return;

    this.selectedItemId = newSelection;
    this.render();
  },

  onUndoClick() {
    if (!this.undoHandler.hasUndo()) return;
    this.undoHandler.trigger('apply:latest');
  },

  onBeforeRender() {
    this.model.set('_selectedEditToolId', this.selectedItemId);
  },
  
  className: 'working-sched__edit-tools-container',

  template() {
    if (this.disabled) return <>The current period does not allow schedule editing.</>;

    const numUndos = this.undoHandler.getNumUndos();
    return <>
        {this.renderJsxPowerEdit()}
        <div className={`working-sched__edit-tools${this.getOption('disabled')?'--disabled':''}`}>
        {
          // Hide Undo functionality for the first SM release
          /*<div className={`working-sched__edit-tools--undo working-sched__edit-tools__button ${this.undoHandler.hasUndo() ? 'selected':''}`} onClick={() => this.onUndoClick()}>
            <div className="working-sched__edit-tools__button__title">Undo Last</div>
            <div className="working-sched__edit-tools__button__icon"></div>
            {numUndos ? <span className="working-sched__edit-tools__button__icon__badge">{numUndos}</span> : null}
          </div>*/
        }
        <div className={`working-sched__edit-tools--edit ${this.getButtonClass(EDIT_TOOL_CONFIGS.EDIT)}`} onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.EDIT)}>
          <div className="working-sched__edit-tools__button__title">Edit</div>
          <div className="working-sched__edit-tools__button__icon"></div>
        </div>
        <div className={`working-sched__edit-tools--remove ${this.getButtonClass(EDIT_TOOL_CONFIGS.REMOVE)}`} onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.REMOVE)}>
          <div className="working-sched__edit-tools__button__title">Remove</div>
          <div className="working-sched__edit-tools__button__icon"></div>
        </div>
        {this.renderJsxButtonGroups()}
      </div>
    </>
  },

  renderJsxPowerEdit() {
    if (!this.enablePowerEdit) return;
    return <div className={`working-sched__edit-tools--power-edit-container ${this.getOption('disabled')?'--disabled':''}`}>
      <div className={`working-sched__edit-tools--power-edit ${this.getButtonClass(EDIT_TOOL_CONFIGS.POWER_EDIT)}`} onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.POWER_EDIT)}>
        <div className="working-sched__edit-tools__button__title">Power Edit</div>
        <div className="working-sched__edit-tools__button__icon"></div>
      </div>
    </div>
  },

  renderJsxButtonGroups() {
    const getColourClassFn = (buttonTypeId) => (
      EDIT_TOOL_COLOUR_CLASSES && EDIT_TOOL_COLOUR_CLASSES[buttonTypeId] ? EDIT_TOOL_COLOUR_CLASSES[buttonTypeId] : ''
    );
    const colourClass = getColourClassFn(this.selectedItemId);
    const isButtonGroupSelected = [
      EDIT_TOOL_CONFIGS.HEAR,
      EDIT_TOOL_CONFIGS.DUTY,
      EDIT_TOOL_CONFIGS.WRIT,
      EDIT_TOOL_CONFIGS.VAC,
      EDIT_TOOL_CONFIGS.BLK,
      EDIT_TOOL_CONFIGS.OTH
    ].indexOf(this.selectedItemId) !== -1;
    
    return <div className={`working-sched__edit-tools__multi-button-area ${isButtonGroupSelected ? 'selected' : ''}`}>
      <div className="working-sched__edit-tools__button__title">Add/Set</div>
      <div className="working-sched__edit-tools__multi-button-area__content">
        <div className={`working-sched__edit-tools__button--large ${isButtonGroupSelected && colourClass ? `working-sched__edit-tools${colourClass}` : ''}`}>
          <div className="working-sched__edit-tools__button__icon"></div>
          {this.renderJsxButtonPaletteText(isButtonGroupSelected)}
        </div>
        <div className="working-sched__edit-tools__button-group">
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--hear"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.HEAR)}>HEAR</div>
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--duty"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.DUTY)}>DUTY</div>
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--writ"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.WRIT)}>WRIT</div>
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--vac"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.VAC)}>VAC</div>
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--blk"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.BLK)}>OWT</div>
          <div className="working-sched__edit-tools__button--small working-sched__edit-tools--oth"
              onClick={() => this.onButtonClick(EDIT_TOOL_CONFIGS.OTH)}>OTO</div>
        </div>
      </div>
    </div>;
  },

  renderJsxButtonPaletteText(isButtonGroupSelected=false) {
    const languageData = this.getLanguageDataForSelectedTool();
    const title = isButtonGroupSelected && languageData.TITLE ? languageData.TITLE : 'Not Selected';
    const subtitle = isButtonGroupSelected && languageData.SUBTITLE ? languageData.SUBTITLE : 'Select option ->';
    return <div>
      <div className="working-sched__edit-tools__button-title">{title}</div>
      <div className="working-sched__edit-tools__button-subtitle">{subtitle}</div>
    </div>
  },
  
});

_.extend(WorkingScheduleEditToolsView.prototype, ViewJSXMixin);
export { WorkingScheduleEditToolsView, EDIT_TOOL_CONFIGS, EDIT_TOOL_COLOUR_CLASSES };