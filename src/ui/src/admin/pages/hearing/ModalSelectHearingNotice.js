/**
 * @fileoverview - Modal to select the type of hearing notice to be generated. Currently only available for ARI-C and PFR disputes
 */
import React from 'react';
import ModalBaseView from '../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import Radio_model from '../../../core/components/radio/Radio_model';
import RadioView from '../../../core/components/radio/Radio';
import { HEARING_NOTICE_GENERATE_TYPES } from '../../../core/components/hearing/Hearing_model';

const PRELIM_NOTICE_TITLE = `Hearing Notice - Follow-up to Prehearing`;
const ADJOURNED_NOTICE_TITLE = `Hearing Notice - Adjourned Hearing`;

const ModalSelectHearingNotice = ModalBaseView.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['parentModel']);
    this.createSubModels();
  },

  createSubModels() {
    this.typeModel = new Radio_model({
      optionData: [
        { value: HEARING_NOTICE_GENERATE_TYPES.FOLLOWUP, text: PRELIM_NOTICE_TITLE },
        { value: HEARING_NOTICE_GENERATE_TYPES.ADJOURNED, text: ADJOURNED_NOTICE_TITLE }
      ],
      value: null,
      required: true
    });
  },

  onRender() {
    this.showChildView('typeRegion', new RadioView({ model: this.typeModel }));
  },


  clickContinue() {
    if (!this.getChildView('typeRegion').validateAndShowErrors()) return;
    this.parentModel.trigger('click:continue', this.typeModel.getData());
    this.close();
  },

  id: 'selectionModal',
  
  regions : {
    typeRegion: '.selectionModal__type'
  },

  template() {
    return <div>
      <div className="modal-dialog">
        <div className="modal-content clearfix">
          <div className="modal-header">
            <h4 className="modal-title">Select Generate Hearing Notice Option</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            <p>This dispute file has the following hearing notice generation options, please select one of the following:</p>

            <div className="selectionModal__type"></div>
            
            <div className="modal-blank-buttons pull-right">
              <button type="button" className="btn btn-lg btn-default btn-cancel cancel-button">
                <span className="">Cancel</span>
              </button>
              <button type="button" className="btn btn-lg btn-primary btn-continue continue-button" onClick={() => this.clickContinue()}>
                <span className="">Generate Selected</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
  },
});

_.extend(ModalSelectHearingNotice.prototype, ViewJSXMixin);
export default ModalSelectHearingNotice;
