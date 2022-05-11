import React from 'react';
import ModalBaseView from '../../modals/ModalBase';
import EvidenceReminderIcon from '../../../static/BIG_02OneArb.png'
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';
import './ModalEvidenceReminder.scss';

const ModalEvidenceReminder = ModalBaseView.extend({
  initialize() {
    this.template = this.template.bind(this);
  },

  ui() {
    return Object.assign(ModalBaseView.prototype.ui, {
      fadeIn: '.animation-content',
    });
  },

  onRender() {
    const ele = this.getUI('fadeIn');
    // Trigger a re-flow to restart animation
    ele.removeClass('util__fade-in');
    if (ele.length) ele[0].offsetLeft;
    ele.addClass('util__fade-in');
  },

  clickIUnderstand() {
    return this.trigger('continue');
  },

  template() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-body evidence-reminder-modal">
            
            <div className="animation-content">
              <span className="evidence-reminder-modal__title">Remember, more isn't always better</span>
              <img className="evidence-reminder-modal__img" src={EvidenceReminderIcon} />
              <p className="evidence-reminder-modal__description">Your case is assigned to one of 40 arbitrators who will decide the outcome of your case. Your arbitrator will consider <b>relevant evidence</b> from both sides during your hearing. Most hearings are completed within <b>one hour</b>.</p>
              <div className="evidence-reminder-modal__checkboxes">
                <p>All evidence should be:</p>
                <ul className="evidence-reminder-modal__list-items">
                  <li><b>Relevant</b> - be sure it relates directly to the case</li>
                  <li><b>Labelled</b> - give each evidence a descriptive name</li>
                  <li><b>New information</b> - avoid repeating information</li>
                </ul>
              </div>
            </div>
            
            <button className="evidence-reminder-modal__button btn btn-lg btn-primary btn-continue continue-button" onClick={() => this.clickIUnderstand()}>I understand</button>
          </div>
        </div>
      </div>
    )
  }
});

_.extend(ModalEvidenceReminder.prototype, ViewJSXMixin);
export default ModalEvidenceReminder;