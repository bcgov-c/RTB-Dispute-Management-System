import React from 'react';
import ModalBaseView from '../../../../core/components/modals/ModalBase';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import Radio_model from '../../../../core/components/radio/Radio_model';
import RadioView from '../../../../core/components/radio/Radio';

const PRELIM_NOTICE_TITLE = `Notice of Prehearing Conference`;
const NOTICE_TITLE = `Notice of Dispute Resolution Proceeding`;
const PRELIM_NOTICE_CODE = 1;
const NOTICE_CODE = 2;

const ModalSelectRentIncreaseNotice = ModalBaseView.extend({

  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['parentModel', 'noticeTypeDisplay']);
    this.createSubModels();
  },

  createSubModels() {
    this.typeModel = new Radio_model({
      optionData: [
        { value: PRELIM_NOTICE_CODE, text: PRELIM_NOTICE_TITLE },
        { value: NOTICE_CODE, text: NOTICE_TITLE }
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

    this.parentModel.trigger('click:continue', this.typeModel.getData()===PRELIM_NOTICE_CODE);
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
            <h4 className="modal-title">Select {this.noticeTypeDisplay || 'Generate'} Notice Option</h4>
            <div className="modal-close-icon-lg close-x"></div>
          </div>
          <div className="modal-body clearfix">
            <p>{this.noticeTypeDisplay ? `${this.noticeTypeDisplay} files have` : `This dispute file has`} the following notice generation options, please select one of the following:</p>

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

_.extend(ModalSelectRentIncreaseNotice.prototype, ViewJSXMixin);
export default ModalSelectRentIncreaseNotice;
