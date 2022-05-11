import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import './working-schedule.scss';

const WorkingScheduleDayLegendView = Marionette.View.extend({
  
  initialize() {
    this.template = this.template.bind(this);
  },

  className: `working-sched__day-legend`,
  template() {
    return <>
      <div className="working-sched__day-legend__top-row">
        <span className="">6:00AM</span>
        <span className="">9:00PM</span>
      </div>
      <div className="working-sched__day-legend__content-row">
        <div className="working-sched__day-legend__block">6-9</div>
        <div className="working-sched__day-legend__block--dark">9-12</div>
        <div className="working-sched__day-legend__block--dark">12-3</div>
        <div className="working-sched__day-legend__block--dark">3-6</div>
        <div className="working-sched__day-legend__block">6-9</div>
      </div>
    </>
  },
  
});

_.extend(WorkingScheduleDayLegendView.prototype, ViewJSXMixin);
export default WorkingScheduleDayLegendView;