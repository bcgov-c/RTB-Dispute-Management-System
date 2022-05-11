
import React from 'react';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import ViewMixin from '../../../utilities/ViewMixin';
import { routeParse } from '../../../../admin/routers/mainview_router';
import { ViewJSXMixin } from '../../../utilities/JsxViewMixin';

const SHOW_ALL_DROPDOWN_CODE = '0';
const SHOW_IO_DROPDOWN_CODE = '1';
const SHOW_OFFICE_DROPDOWN_CODE = '2';
const SHOW_ADJUDICATOR_DROPDOWN_CODE = '3';
const SHOW_ARB_DROPDOWN_CODE = '4';

const CompletenessItem = ViewMixin.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['collection', 'helpHtml', 'hideProbablyOk', 'selectedFilterValue']);
  },

  onRender() {
    this.initializeHelp(this, this.model.get('helpHtml'));
  },

  clickItem() {
    Backbone.history.navigate(routeParse(this.model.get('link'), this.model.get('disputeGuid')), { trigger: true });
    this.collection.trigger('close:modal');
  },

  isHiddenByFilter() {
    if (this.selectedFilterValue === SHOW_ALL_DROPDOWN_CODE) return false;

    return (
      (this.selectedFilterValue === SHOW_IO_DROPDOWN_CODE && !this.model.get('showIO')) ||
      (this.selectedFilterValue === SHOW_OFFICE_DROPDOWN_CODE && !this.model.get('showOffice')) ||
      (this.selectedFilterValue === SHOW_ADJUDICATOR_DROPDOWN_CODE && !this.model.get('showAdjudicator')) ||
      (this.selectedFilterValue === SHOW_ARB_DROPDOWN_CODE && !this.model.get('showArb'))
    )
  },

  isValueBoolean() {
    return typeof this.model.get('value') === 'boolean'; 
  },

  template() {
    const value = this.model.get('value');
    const showIO = this.model.get('showIO');
    const showAdmin = this.model.get('showAdjudicator');
    const showAdjudicator = this.model.get('showAdjudicator');
    const showArb = this.model.get('showArb');

    const shouldItemDisplay = this.hideProbablyOk ? value && !this.isHiddenByFilter() : !this.isHiddenByFilter();
    if (!shouldItemDisplay) return;
    
    const renderSubTitle = () => this.model.get('subTitle') ? <span className="completeness-check__item__sub-view"> - {this.model.get('subTitle')}</span> : null;
    const renderValue = () => {
      return value ? 
        <>
          <span className="completeness-check__item__require-attention">{this.isValueBoolean() ? 'True' : `Yes (${value})`}</span>
          {renderSubTitle()}
        </>
        : <span className="completeness-check__item__ok">{this.isValueBoolean() ? 'False' : 'No (0)'}</span>
    }

    return (
      <div className="completeness-item">
        <span className={`completeness-check__item__help-text ${this.model.get('helpHtml')  ? '' : 'hidden-item'} `}><a role="button" className="badge help-icon">?</a></span>
        <span>{this.model.get('title')}: {renderValue()}</span>
        <span className="completeness-check__item__view" onClick={() => this.clickItem()}>View</span>
      </div>
    );
  }
});

const CompletenessItems = Marionette.CollectionView.extend({
  template: _.noop,
  childView: CompletenessItem,
  emptyView: '<div></div>',

  childViewOptions() {
    return {
      collection: this.collection,
      hideProbablyOk: this.getOption('hideProbablyOk'),
      selectedFilterValue: this.getOption('selectedFilterValue')
    }
  }
});

_.extend(CompletenessItem.prototype, ViewJSXMixin);

export default CompletenessItems;