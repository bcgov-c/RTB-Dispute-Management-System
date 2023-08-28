import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import SubServCCRTable from './SubServCCRTable';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const GeneratedDocOptionTwoView = Marionette.View.extend({ 
  initialize(options) {
    this.mergeOptions(options, ['isSubService', 'requestData', 'selectedCCRSubServId']);
    this.template = this.template.bind(this);

    this.requestCollection = this.requestData?.requestCollection;
    this.requestTitle = this.requestData?.requestTitle;
    this.initSubServiceId = this.selectedCCRSubServId ? this.selectedCCRSubServId : 
                            this.requestCollection.length ? this.requestCollection.at(0)?.id : 
                            null;
    this.setupListeners();
  },

  setupListeners() {
    this.listenTo(this.requestCollection, 'click:row', (rowId) => {
      this.initSubServiceId = rowId;
      this.getChildView('subServCCRTable').setActiveRowId(rowId);
      this.getChildView('subServCCRTable').render();
    });
  },

  onRender() {
    this.showChildView('subServCCRTable', new SubServCCRTable({ collection: this.requestCollection, isSubService: this.isSubService, initSubServiceId: this.initSubServiceId }));
  },

  regions: {
    subServCCRTable: '.sub-serv-ccr-table'
  },

  template() {
    return (
      <>
        <span>{this.requestData?.instructionTitle}:</span>
        <div className="sub-serv-ccr-table"></div>
      </>
    );
  }
});

_.extend(GeneratedDocOptionTwoView.prototype, ViewJSXMixin);
export default GeneratedDocOptionTwoView;