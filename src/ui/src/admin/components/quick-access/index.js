import ModalQuickAccess from "./ModalQuickAccess";
import Radio from 'backbone.radio';

const isQuickAccessEnabled = (disputeModel) => true;

const showQuickAccessModalWithEditCheck = (disputeModel) => {
  if (!disputeModel) return;

  const openQuickAccessFn = () => Radio.channel('modals').request('add', new ModalQuickAccess({ model: disputeModel }));
  disputeModel.checkEditInProgressPromise().then(
    openQuickAccessFn,
    () => {
      disputeModel.showEditInProgressModalPromise().then(isAccepted => {
        if (isAccepted) {
          disputeModel.stopEditInProgress();
          openQuickAccessFn();
        }
      });
    });
};

export { ModalQuickAccess, showQuickAccessModalWithEditCheck, isQuickAccessEnabled };