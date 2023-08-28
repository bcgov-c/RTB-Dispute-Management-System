/**
 * @fileoverview - View that displays color coded hearing types for display above calendar views.
 */
import Marionette from 'backbone.marionette';
import React from 'react';
import HearingHoldSMLIcon from '../../static/Icon_HearingHold_SML.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const CalendarLegend = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  template() {
    return (
      <>
        <div className="hearings-calendar-legend-container">
          <div className="hearings-calendar-legend-text-and-color-container">
            <img className="hearings-calendar-legend-hold" src={HearingHoldSMLIcon}/>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-hold">On Hold</div>
          </div>

          <div className="hearings-calendar-legend-text-and-color-container">
            <div className="hearings-calendar-legend-f2f hearings-calendar-legend--light"></div>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-f2f">Face to Face</div>
          </div>
          
          <div className="hearings-calendar-legend-text-and-color-container">
            <div className="hearings-calendar-legend-emergency hearings-calendar-legend--red"></div>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-emergency">Emergency</div>
          </div>

          <div className="hearings-calendar-legend-text-and-color-container">
            <div className="hearings-calendar-legend-standard hearings-calendar-legend--green"></div>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-standard">Standard</div>
          </div>

          <div className="hearings-calendar-legend-text-and-color-container">
            <div className="hearings-calendar-legend-deferred hearings-calendar-legend--blue"></div>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-deferred">Deferred</div>
          </div>

          <div className="hearings-calendar-legend-text-and-color-container">
            <div className="hearings-calendar-legend-deferred hearings-calendar-legend--orange"></div>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-duty">Duty</div>
          </div>

          <div className="hearings-calendar-legend-text-and-color-container">
            <span className="hearing-calendar-legend-linked-container hearings-calendar-legend--grey"></span>
            <div className="hearing-calendar-legend-text hearing-calendar-legend-linked">Linked</div>
          </div>
        </div>
      </>
    )
  }
})

_.extend(CalendarLegend.prototype, ViewJSXMixin);
export default CalendarLegend;