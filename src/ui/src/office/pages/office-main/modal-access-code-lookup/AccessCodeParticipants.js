import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const EmptyAccessCodeParticipantItemView = Marionette.View.extend({
  tagName: 'div',
  className: 'standard-list-empty',
  template: _.template(`<div class="">No participants available.</div>`)
});

const AccessCodeParticipantItem = Marionette.View.extend({
  initialize(options) {
    this.template = this.template.bind(this);
  },

  clickParticipantAccessCode() {
    this.model.trigger('login:participant', this.model);
  },

  template() {
    return (
      <div className="access-code-lookup__participant">
        <div className="">
          <span className="review-label">User Initials:</span>&nbsp;<span>{this.model.get('name_abbreviation')}</span>
        </div>
        <div className="">
          <span className="review-label">Email Address:</span>&nbsp;<span>{this.model.get('email_hint')}</span>
        </div>
        <div className="">
          <span className="review-label">Phone Number:</span>&nbsp;<span>{this.model.get('primary_phone_hint')}</span>
        </div>
        <div className="">
          <span className="general-link" onClick={() => this.clickParticipantAccessCode()}>Log in as this participant</span>
        </div>
      </div>
    );
  }
});

_.extend(AccessCodeParticipantItem.prototype, ViewJSXMixin);

const AccessCodeParticipantListView = Marionette.CollectionView.extend({
  template: _.noop,
  childView: AccessCodeParticipantItem,
  emptyView: EmptyAccessCodeParticipantItemView,
});

_.extend(AccessCodeParticipantListView.prototype, ViewJSXMixin);
export default AccessCodeParticipantListView