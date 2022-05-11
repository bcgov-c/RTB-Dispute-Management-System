import Radio from 'backbone.radio';

const modalChannel = Radio.channel('modals');

/**
 * DOM Utilities for different Questions types and scenarios
 */
export default {
  showConfirmClear(title, bodyHtml, onConfirmFn, onCancelFn) {
    title = (typeof title === 'string') ? title : '';
    bodyHtml = (typeof bodyHtml === 'string') ? bodyHtml : '';

    const modalPromise = modalChannel.request('show:standard:promise', {
      title: `Are You Sure?`,
      bodyHtml: `<p>Changing your answer to this question will clear any related information which depended on your original answer. If you are unsure that you want to change this answer, press Cancel.</b></p>`,
      primaryButtonText: 'Change Answer',
      onContinueFn: (modalView) => {
        modalView.close();

        if (typeof onConfirmFn === 'function') {
          onConfirmFn();
        }
      },
      onCancelFn: (modalView) => {
        modalView.close();

        if (typeof onCancelFn === 'function') {
          onCancelFn();
        }
      }
    });

    return modalPromise;
  },
};
