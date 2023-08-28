/**
 * @fileoverview - View that allows for selecting from a list of arbs via two Include/Exclude buckets
 */
import Marionette from 'backbone.marionette';
import React from 'react';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import { toUserLevelAndNameDisplay } from '../user-level/UserLevel';
import IncludedIcon from '../../static/Icon_WS_Include.png';
import ExcludedIcon from '../../static/Icon_WS_Exclude.png';
import IncludeArrowIcon from '../../static/Icon_WS_ArrowInclude.png';
import ExcludeArrowIcon from '../../static/Icon_WS_ArrowExclude.png';
import './StaffSelect.scss';

const StaffView = Marionette.View.extend({
  /**
   * @param {*} excludeMode - TODO: unused?
   * @param {Boolean} disabled - prevents users from being moved between buckets 
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['excludeMode', 'disabled']);
  },

  clickUser() {
    if (this.disabled) return;
    this.model.set('_excluded', !this.model.get('_excluded'));
  },

  className: 'staff-list__item',
  
  template() {
    return <>
      <div dangerouslySetInnerHTML={{__html: toUserLevelAndNameDisplay(this.model, { displaySchedulerType: true, displayUserLevelIcon: true }) }}></div>
      <div className="staff-list__item__arrow" onClick={() => this.clickUser()}><img src={this.model.get('_excluded') ? IncludeArrowIcon : ExcludeArrowIcon} /></div>
    </>
  },
});

const StaffSelectCollection = Marionette.CollectionView.extend({
  template: _.noop,
  childView: StaffView,
  childViewOptions() {
    return {
      excludeMode: this.excludeMode,
      disabled: this.disabled
    };
  },
  className: 'staff-list__list',

  initialize(options) {
    this.mergeOptions(options, ['excludeMode', 'disabled']);
  },
});

const StaffSelect = Marionette.View.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['collection']);

    this.includesListEle = '.staff-list__includes > div';
    this.excludesListEle = '.staff-list__excludes > div';
    this.noSelectionError = false;
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.collection, 'change:_excluded', () => {
      this.excludeListVerticalScrollPosition = $(this.excludesListEle).scrollTop();
      this.includeListVerticalScrollPosition = $(this.includesListEle).scrollTop();
      this.noSelectionError = false;
      this.render();
    });

  },

  validateAndShowErrors() {
    const hasSelected = this.collection.some(model => !model.get('_excluded'));
    this.noSelectionError = !hasSelected;
    this.render();
    return hasSelected;
  },

  clickSetAllUserExcluded(isExcluded=false) {
    this.collection.forEach(c => c.set('_excluded', isExcluded, { silent: true }));
    this.render();
  },

  onRender() {
    this.showChildView('includeListRegion', new StaffSelectCollection({
      collection: this.collection,
      disabled: this.model.get('disabled'),
      filter(child) {
        return !child.get('_excluded');
      }
    }));

    this.showChildView('excludeListRegion', new StaffSelectCollection({
      collection: this.collection,
      disabled: this.model.get('disabled'),
      filter(child) {
        return child.get('_excluded');
      }
    }));

    if (this.excludeListVerticalScrollPosition) $(this.excludesListEle).scrollTop(this.excludeListVerticalScrollPosition);
    if (this.includeListVerticalScrollPosition) $(this.includesListEle).scrollTop(this.includeListVerticalScrollPosition);
  },

  className: '',

  regions: {
    includeListRegion: '.staff-list__includes',
    excludeListRegion: '.staff-list__excludes',
  },

  ui: {
    error: '.error-block',
  },

  template() {
    const numIncludedStaff = this.collection.filter(m => !m.get('_excluded')).length;
    const numExcludedStaff = this.collection.length - numIncludedStaff;
    const isDisabled = this.model.get('disabled');
    return <>
      <p>
        <span>Exclude any staff that you don't want hearings generated for</span>&nbsp;
        <span className="staff-list-container__info">
          <span class="calendar-header-userinfo-emergency">*emergency</span>&nbsp;
          <span class="calendar-header-userinfo-duty">*duty</span>
        </span>
      </p>

      <div className={`staff-list ${isDisabled?'disabled':''}`}>
        <div>
          <div className="staff-list__title success-green">
            <span><img src={IncludedIcon} />&nbsp;Included Staff ({numIncludedStaff})</span>
            {!isDisabled && numIncludedStaff !== this.collection.length ? <span className="general-link" onClick={() => this.clickSetAllUserExcluded(false)}>Include All</span> : null}
            
          </div>
          <div className="staff-list__includes"></div>
        </div>
        <div>
          <div className="staff-list__title error-red">
            <span><img src={ExcludedIcon} />&nbsp;Excluded Staff ({numExcludedStaff})</span>
            {!isDisabled && numExcludedStaff !== this.collection.length ? <span className="general-link" onClick={() => this.clickSetAllUserExcluded(true)}>Exclude All</span> : null}
          </div>
          <div className="staff-list__excludes"></div>
        </div>
      </div>
      {this.noSelectionError ? <p className="error-block">At least one staff member must be in the included staff list</p> : null}
    </>;
  },

});

_.extend(StaffSelect.prototype, ViewJSXMixin);
_.extend(StaffView.prototype, ViewJSXMixin);

export { StaffSelect }

