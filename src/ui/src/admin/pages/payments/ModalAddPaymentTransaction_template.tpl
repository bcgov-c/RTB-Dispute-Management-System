<div id="addFee_modal" class="modal modal-rtb-default" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Add Transaction</h4>
          <div class="modal-close-icon-lg close-x"></div>
        </div>
        <div class="modal-body">
          <div class="addTransaction-method"></div>
          <div class="addTransaction-status"></div>
          <div class="addTransaction-amount"></div>

          <div class="addTransaction-container addTransaction-online-container <%= isOnline ? '' : 'hidden-item' %>">
            <div class="addTransaction-card"></div>
            <div class="addTransaction-transaction-approval"></div>
            <div class="addTransaction-transaction-id"></div>
          </div>

          <div class="addTransaction-container addTransaction-office-container <%= isOffice ? '' : 'hidden-item' %>">
            <div class="addTransaction-office-idir"></div>
          </div>

          <div class="addTransaction-container addTransaction-fee-waiver-container <%= isFeeWaiver ? '' : 'hidden-item' %>">
            <div class="addTransaction-family-count"></div>
            <div class="addTransaction-family-income"></div>
            <div class="addTransaction-city"></div>

            <div class="spacer-block-5"></div>
            <div class="addTransaction-hardship"></div>
            <div class="addTransaction-hardship-details"></div>
          </div>

          <div class="row">
            <div class="pull-right" style="width:100%;text-align:right;">
              <button id="addTransactionCancel" type="button" class="btn btn-lg btn-default btn-cancel">
                <span>Cancel</span>
              </button>
              <button id="addTransactionSave" type="button" class="btn btn-lg btn-primary btn-continue">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  