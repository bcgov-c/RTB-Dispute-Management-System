import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import EvidenceView from './CeuEvidence';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import template from './CeuEvidenceCollection_template.tpl';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const EvidenceCollectionView = Marionette.CollectionView.extend({
  childView: EvidenceView,

  validateAndShowErrors() {
    let is_valid = true;
    this.children.each(function(childView) {
      if (typeof childView.validateAndShowErrors !== "function") {
        console.log(`[Warning] No validation function defined for child view`, childView);
        return;
      }
      is_valid = childView.validateAndShowErrors() & is_valid;
    });
    
    return is_valid;
  }
});


export default Marionette.View.extend({
  template,

  ui: {
    add: '.add-other-evidence'
  },

  regions: {
    collectionRegion: '.evidence-list'
  },

  events: {
    'click @ui.add': 'clickAddOther'
  },

  clickAddOther() {
    const EVIDENCE_METHOD_UPLOAD_NOW = String(configChannel.request('get', 'EVIDENCE_METHOD_UPLOAD_NOW'));
    const added_model = this.collection.createBlankEvidence({
      title: '',
      evidence_id: configChannel.request('get', 'EVIDENCE_CODE_OTHER_ISSUE'),
      category: configChannel.request('get', 'EVIDENCE_CATEGORY_ISSUE'),
      file_method: EVIDENCE_METHOD_UPLOAD_NOW,
      helpHtml: ' ',
      
      e_is_other_evidence: true,
    });
    added_model.get('selectedActionPicklist').set('value', EVIDENCE_METHOD_UPLOAD_NOW, { silent: true });

    const modalAddFiles = new ModalAddFiles({
      model: added_model,
      files: added_model.get('files'),
      filePackageId: null,
      noUploadOnSave: true,
      hideDescription: true,
      isDescriptionRequired: false,
    });

    let userSaved = false;
    this.stopListening(modalAddFiles);
    this.listenTo(modalAddFiles, 'save:complete', function() {
      userSaved = true;
      this.render();
      loaderChannel.trigger('page:load:complete');
    }, this);

    this.listenTo(modalAddFiles, 'removed:modal', function() {
      if (!userSaved) {
        this.collection.remove(added_model);
        this.render();
      }
    }, this);

    modalChannel.request('add', modalAddFiles);
  },

  onRender() {
    this.showChildView('collectionRegion', new EvidenceCollectionView({ collection: this.collection }));
  },

  validateAndShowErrors() {
    return this.getChildView('collectionRegion').validateAndShowErrors();
  }

});
