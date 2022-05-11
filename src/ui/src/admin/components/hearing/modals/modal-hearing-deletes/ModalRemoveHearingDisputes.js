import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalDeleteHearingViewMixin from './ModalBaseDeleteHearingMixin';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');

const ModalRemoveHearingDisputesView = Marionette.View.extend({
  id: 'removeHearingDisputes_modal',

  initialize() {
    this.isAdjourned = false;
    this.checkAdjourned();
  },

  checkAdjourned() {
    loaderChannel.trigger('page:load');
    hearingChannel.request('check:adjourned', this.model)
    .then(isAdjourned => {
      this.isAdjourned = isAdjourned;
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    })
  },

  clickContinue() {
    const onClose = () => {
      // No need to refresh again, we already should have fetched the model by this point
      this.trigger('save:complete');
      this.close();
    };
    const showInvalidHearingStateModal = () => {
      this.$el.hide();
      hearingChannel.request('show:invalid:modal').finally(() => onClose());
    };
    const onStateCheckError = () => {
      // There was an API error, stop loading and close this modal
      this.trigger('save:complete');
      this.close();
      loaderChannel.trigger('page:load:complete');
    };

    this.model.withStateCheck(
      () => {
        if (!this.model.getDisputeHearings().length) {
          this.trigger('save:complete');
          this.close();
        }

        this.model.deleteAllDisputeHearings().done(() => {
          this.trigger('save:complete');
          this.close();
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.DISPUTEHEARINGS.DELETE');
          handler(err);
        });
      },
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  onRender() {
    this.mixin_onRender(this.isAdjourned);
  },

  templateContext() {
    const useSingular = this.model.getDisputeHearings().length === 1;
    return {
      titleText: `Remove Dispute${useSingular ? '' : 's'}`,
      instructionsText: `Are you sure you would like to remove ${useSingular ? 'the associated dispute' : 'all associated disputes'} from this hearing?  This action cannot be undone.`,
      continueButtonText: `Remove${useSingular ? '' : ' All'}`
    };
  }
});

_.extend(ModalRemoveHearingDisputesView.prototype, ModalDeleteHearingViewMixin);
export default ModalRemoveHearingDisputesView;