/**
 * @fileoverview - Top level container for the working schedule calendar
 */
import Marionette from 'backbone.marionette';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import BlockCalendarGrid from './BlockCalendarGrid';

const BlockCalendarView = Marionette.View.extend({
  
  initialize() {
    this.template = this.template.bind(this);

    // The draggable calendar should only work with daily blocks
    this.model.set('enableDailyBlocks', true);
    
    this.listenTo(this.model, 'calendar:render', this.render, this);
    this.listenTo(this.model, 'request:saved', this.render, this);
  },

  onBeforeRender() {
    // Re-render was called, view was not destroyed, and so the template didn't get re-rendered completely.
    // Calling React to manually unmount the DOM if this view is being re-rendered
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    this.showChildView('gridRegion', new BlockCalendarGrid({ model: this.model }));
  },

  className: `calendar--drag`,

  regions: {
    gridRegion: '.calendar--drag__grid'
  },

  template() {
    return <>
      <div className="calendar--drag__grid"></div>
    </>
  },
  
});

_.extend(BlockCalendarView.prototype, ViewJSXMixin);
export default BlockCalendarView;