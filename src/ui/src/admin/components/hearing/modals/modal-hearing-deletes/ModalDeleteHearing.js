/** @fileoverview - Modal that displays hearing information and deletes hearing upon continue click*/
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalDeleteHearingViewMixin from './ModalBaseDeleteHearingMixin';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const loaderChannel = Radio.channel('loader');

const ModalDeleteHearingView = Marionette.View.extend({
  id: 'deleteHearing_modal',

  clickContinue() {
    loaderChannel.trigger('page:load');


    const onCompleteFn = () => {
      this.trigger('save:complete');
      this.close();
    };

    this.model.destroy()
      .done(() => onCompleteFn())
      .fail(err => {
        loaderChannel.trigger('page:load:complete')
        const handler = generalErrorFactory.createHandler('ADMIN.HEARING.SAVE', () => onCompleteFn());
        handler(err);
      });
  },

  onRender() {
    this.mixin_onRender();
  },

  templateContext() {
    return {
      titleText: 'Delete Hearing',
      instructionsText: 'Are you sure you want to delete this hearing? This action cannot be undone.',
      continueButtonText: 'Delete'
    };
  }

});

_.extend(ModalDeleteHearingView.prototype, ModalDeleteHearingViewMixin);
export default ModalDeleteHearingView;