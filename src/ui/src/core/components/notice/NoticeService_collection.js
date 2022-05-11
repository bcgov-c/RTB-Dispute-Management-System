import Radio from 'backbone.radio';
import ServiceCollection from '../service/Service_collection';
import NoticeServiceModel from './NoticeService_model';

const participantsChannel = Radio.channel('participants');

export default ServiceCollection.extend({
  model: NoticeServiceModel,
  
  comparator(model) {
    const RESPONDENT_OFFSET = 100000000;
    let order = 0;
    const participantId = model.get('participant_id');
    const participantModel = participantsChannel.request('get:participant', participantId);
    order = (participantModel && participantModel.isRespondent() ? RESPONDENT_OFFSET : 0) + model.get('participant_id');
    return order;
  }
});
