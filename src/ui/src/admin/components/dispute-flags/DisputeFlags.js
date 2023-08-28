/**
 * @fileoverview - View that displays all flags associated to a primary or linked dispute.
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import DisputeFlagIcon from '../../static/Icon_DisputeFlag.png';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import DisputeFlagCollection from '../../../core/components/dispute-flags/DisputeFlag_collection';
import './DisputeFlags.scss';
import DisputeFlagsList from './DisputeFlagsList';

const flagsChannel = Radio.channel('flags');
const configChannel = Radio.channel('config');

const DisputeFlags = Marionette.View.extend({
  initialize() {
    this.template = this.template.bind(this);
    this.flags = new DisputeFlagCollection();
    this.linkedFlags = new DisputeFlagCollection();
    this.fetchDisputeFlags();

    this.listenTo(flagsChannel, 'update:flags', () => {
      this.fetchDisputeFlags();
    });
  },

  createSubViews() {
    this.disputeFlagListView = new DisputeFlagsList({ collection: this.flags});
    this.linkedDisputeFlagListView = new DisputeFlagsList({ collection: this.linkedFlags });
  },

  fetchDisputeFlags() {
    const flagList = flagsChannel.request('get');
    this.sortFlags(flagList);
    this.render();
  },

  sortFlags(flagList) {
    //Sorts flags into either linked or normal flag arrays, and checks for flags of the same type
    const linkedFlagsMap = new Map();// eslint-disable-line
    const flagsMap = new Map();// eslint-disable-line
    const subServiceFlagId = configChannel.request('get', 'FLAG_ID_SUB_SERVICE_REQUESTED');
    const isAmendment = configChannel.request('get', 'FLAG_ID_AMENDMENT');
    const flagConfig = configChannel.request('get', 'dispute_flags');

    flagList.forEach((flag) => {
      if(!flag.isActive()) return;
      const key = flag.getFlagId();

      if (flag.isLinked()) {
        if (flag.get('flag_type') === flagConfig[subServiceFlagId].flag_type || flag.get('flag_type') === flagConfig[isAmendment].flag_type) return;
        //if flag with matching flag_type is already in map, then add to count
        if (linkedFlagsMap.has(key)) linkedFlagsMap.get(key).count++;
        else linkedFlagsMap.set(key, Object.assign(flag, { count: 1 }));
      } else {
        if (flagsMap.has(key)) flagsMap.get(key).count++;
        else flagsMap.set(key, Object.assign(flag, { count: 1 }));
      }
    });

    this.linkedFlags.reset([...linkedFlagsMap.values()]);
    this.flags.reset([...flagsMap.values()]);
  },

  onBeforeRender() {
    this.createSubViews();
  },

  onRender() {
    if (!this.linkedFlags.length && !this.flags.length) return;

    if (this.flags.length) this.showChildView('disputeFlagList', this.disputeFlagListView);
    if (this.linkedFlags.length) this.showChildView('disputeFlagLinkedList', this.linkedDisputeFlagListView);
  },

  regions: {
    disputeFlagList: '.dispute-flags-list',
    disputeFlagLinkedList: '.dispute-flags-linked-list'
  },

  template() {
    if (!this.linkedFlags.length && !this.flags.length) return;

    return (
      <div className="dispute-flags-wrapper">
        <span className="dispute-flags-print-header">
          <span className="visible-print">Dispute Flags</span>
          <img className="dispute-flags-icon" src={DisputeFlagIcon} />
        </span>
        <div className="dispute-flags-list"></div>
        <div className="dispute-flags-linked-list"></div>
      </div>
    );
  },
});

_.extend(DisputeFlags.prototype, ViewJSXMixin);
export { DisputeFlags }