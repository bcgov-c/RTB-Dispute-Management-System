import ModalBlank from '../../../core/components/modals/modal-blank/ModalBlank';
import CheckboxCollectionView from '../../../core/components/checkbox/Checkboxes';
import CheckboxCollection from '../../../core/components/checkbox/Checkbox_collection';

export default ModalBlank.extend({

  initialize(options) {
    ModalBlank.prototype.initialize.call(this, options);
    this.onContinueFn = function() {
      if (this.validateAndShowErrors()) {
        ModalBlank.prototype.getOption.call(this, 'onContinueFn')(this);
      }
    };

    this.checkboxCollection = new CheckboxCollection(this.getOption('checkboxesData') || [], this.getOption('checkboxesOptions') || {});

    const maxSelectsAllowed = this.checkboxCollection.maxSelectsAllowed;
    this.checkboxCollection.on('change:checked', function() {
      const numSelected = this.checkboxCollection.where({ checked: true }).length;
      
      this.checkboxCollection.each(checkboxModel => {
        checkboxModel.set('disabled', maxSelectsAllowed && numSelected >= maxSelectsAllowed ? !checkboxModel.get('checked') : false, { silent: true });
      });
      
      // If there is a checkbox view, always re-render it
      //hide any error messages on click
      if (this.checkboxCollectionView && this.checkboxCollectionView.isRendered()) {
        this.checkboxCollectionView.render();
        //this.checkboxCollectionView.showErrorMessage("");
      }
    }, this);
  },

  validateAndShowErrors() {
    return this.checkboxCollectionView && this.checkboxCollectionView.isRendered() ? this.checkboxCollectionView.validateAndShowErrors() : true;
  },

  onRender() {
    this.checkboxCollectionView = new CheckboxCollectionView({
      collection: this.checkboxCollection
    });

    this.getUI('formGroups').append( this.checkboxCollectionView.render().el );
  }
});