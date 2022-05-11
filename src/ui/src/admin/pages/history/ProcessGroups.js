import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import StatusCollection from '../../../core/components/status/Status_collection';
import ProcessGroupView from './ProcessGroup';

const EmptyProcessGroupsView = Marionette.View.extend({
  className: 'standard-list-empty',
  template: _.template(`<div class="">No dispute status changes have occurred.</div>`),
});

const ProcessGroupCollectionView = Marionette.CollectionView.extend({
  emptyView: EmptyProcessGroupsView,
  childView: ProcessGroupView,
});

export default Marionette.View.extend({
  template: _.template('<div class="process-group-detail-list"></div>'),

  regions: {
    listRegion: '.process-group-detail-list'
  },

  initialize(options) {
    this.mergeOptions(options, ['statusCollection', 'processDetailsCollection']);
    
    const ascendingStatuses = (this.statusCollection.slice(0) || []).reverse();
    const disputeModel = this.model;

    const getStatusesForProcessDetail = (processDetail) => {
      const processDetailProcess = processDetail.get('associated_process');
      const startStatusId = processDetail.get('start_dispute_status_id');
      const associatedStatuses = [];
      let addStatuses = false;
      let breakLoop = false;
      
      ascendingStatuses.forEach((status) => {
        if (breakLoop) {
          return;
        }

        if (status.id === startStatusId) {
          addStatuses = true;
        }

        if (addStatuses) {
          if (status.get('process') === processDetailProcess) {
            associatedStatuses.push(status);
          } else {
            breakLoop = true;
          }
        }
      });

      return associatedStatuses;
    };


    const statusIdsAssociatedToProcessDetail = {};
    this.processGroupCollection = new Backbone.Collection(
      this.processDetailsCollection.map( (processDetail, index) => {
        const statuses = getStatusesForProcessDetail(processDetail);
        // Add statuses used to list
        statuses.forEach(status => statusIdsAssociatedToProcessDetail[status.id] = true);
        return {
          isCurrentProcess: index === 0,
          disputeModel,
          statusCollection: new StatusCollection(statuses),
          processDetailModel: processDetail
        };
      })
    );


    // Handle case where no process details exist. This should only occur on migrated files or when no process change yet
    if (!this.processGroupCollection.length) {
      // Create a stub placeholder if none were loaded.  This will happen on Migrated disputes
      this.processGroupCollection.add({
        isCurrentProcess: true,
        disputeModel,
        statusCollection: new StatusCollection(this.statusCollection.models),
        processDetailModel: null
      });
    } else {
      // Otherwise, make sure all statuses made it into a process group, and if not, make adjustments
      
      // Find out if any statuses at the beginning of time were missed.
      // NOTE: Any statuses missed between process details will be ignored
      const reversedStatuses = this.statusCollection.models.reverse();
      const missedStatusesToAdd = [];
      let breakReverseLoop = false;
      reversedStatuses.forEach(status => {
        if (breakReverseLoop) {
          return;
        }
  
        if (!statusIdsAssociatedToProcessDetail[status.id]) {
          missedStatusesToAdd.push(status);
        } else {
          breakReverseLoop = true;
        }
      });
  
      const firstProcessGroup = this.processGroupCollection.at(-1);
      const firstProcessDetailModel = firstProcessGroup.get('processDetailModel');

      // If there are any missed statuses with a different process than the first process group,
      // then create a new dummy group and add the statuses to it instead
      if (firstProcessDetailModel && _.any(missedStatusesToAdd, missedStatus => firstProcessDetailModel.get('associated_process') !== missedStatus.get('process'))) {
        this.processGroupCollection.add({
          isCurrentProcess: false,
          disputeModel,
          statusCollection: new StatusCollection(missedStatusesToAdd),
          processDetailModel: null
        });
      } else {
        firstProcessGroup.get('statusCollection').add(missedStatusesToAdd, { silent: true });
      }
    }
  },

  onRender() {
    this.showChildView('listRegion', new ProcessGroupCollectionView({ collection: this.processGroupCollection }));
  }
});