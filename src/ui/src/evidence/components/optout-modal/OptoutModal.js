import Radio from 'backbone.radio';

const showDocumentOptOutModal = (onContinueFn) => {
  const modalChannel = Radio.channel('modals');
  modalChannel.request('show:standard', {
    title: 'Continue without providing documents?',
    bodyHtml: `
      <p>If you do not provide a copy of the original documents it will take longer for the Residential Tenancy Branch to process your request.</p>
      <p>Are you sure you would like to continue without providing a copy of the original documents? Press 'Cancel' to return to the form and provide the original documents or press 'Continue without documents' to proceed without providing the original documents.</p>
      `,
    cancelButtonText: 'Cancel',
    primaryButtonText: 'Continue without documents',
    modalCssClasses: 'dac__opt-out-modal',
    onContinue: onContinueFn
  });
};

export { showDocumentOptOutModal }