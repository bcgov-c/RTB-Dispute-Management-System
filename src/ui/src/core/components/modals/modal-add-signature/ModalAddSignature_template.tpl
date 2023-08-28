<div class="modal-dialog">
  <div class="modal-content clearfix">
    <div class="modal-header">
      <h4 class="modal-title">Add / Edit Signature File</h4>
      <div class="modal-close-icon-lg close-x"></div>
    </div>
    <div class="modal-body clearfix">
      
      <div class="file-upload"></div>
      <div class="signature-upload-error"><%= uploadError %></div>
      <div class="signature-wrapper hidden">
        <div class="file-cropper-image-container">
          <div class="signature-cropper-buttons hidden">
            <div class="signature-cropper-button-group">
              <button class="btn btn-cropper" type="button" id="signature-cropper-zoom-in">
                <span class="glyphicon glyphicon-zoom-in"></span> 
              </button>
              <button class="btn btn-cropper" type="button" id="signature-cropper-zoom-out">
                <span class="glyphicon glyphicon-zoom-out"></span>
              </button>
            </div>
    
            <div class="signature-cropper-button-group">
              <button class="btn btn-cropper" id="signature-cropper-move-left">
                <span class="glyphicon glyphicon-arrow-left"></span>
              </button>
              <button class="btn btn-cropper" id="signature-cropper-move-right">
                <span class="glyphicon glyphicon-arrow-right"></span>
              </button>
              <button class="btn btn-cropper" id="signature-cropper-move-up">
                <span class="glyphicon glyphicon-arrow-up"></span>
              </button>
              <button class="btn btn-cropper" id="signature-cropper-move-down">
                <span class="glyphicon glyphicon-arrow-down"></span>
              </button>
            </div>
    
            <div class="signature-cropper-button-group">
              <button class="btn btn-cropper btn-reverse" id="signature-cropper-rotate-left">
                <span class="glyphicon glyphicon-repeat"></span>
              </button>
              <button class="btn btn-cropper" id="signature-cropper-rotate-right">
                <span class="glyphicon glyphicon-repeat"></span>
              </button>
            </div>
          </div>
          <img class="file-cropper-image" src="<%= cropperImage %>"/>
          <span class="signature-cropper-info"></span>
        </div>
        <div class="signature-inputs">
          <div class="signature-user hidden"></div>
          <div class="signature-file-name-wrapper">
            <div class="signature-file-name"></div>
            <span class="signature-file-extension"><%= fileExtension %></span>
          </div>
          <div class="signature-document-title"></div>
          <div class="file-description"></div>
        </div>
      </div>
      <span class="signature-cropper-error"></span>
      <div class="button-row">
        <div class="float-right">
          <button id="addFilesClose" type="button" class="btn btn-lg btn-default btn-cancel cancel-button"> Cancel </button>
          <button id="addFilesSave" url="" type="button" class="btn btn-lg btn-primary btn-continue continue-button hidden">
            <span class="regular-text">Add Document</span>
            <span class="xs-text hidden-item">Add Document</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>