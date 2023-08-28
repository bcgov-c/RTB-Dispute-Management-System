import Backbone from 'backbone';
import Radio from 'backbone.radio';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import CeuPage from '../../../components/page/CeuPage';
import PageItemView from '../../../../core/components/page/PageItem';
import IntakeCeuDataParser from '../../../../core/components/custom-data-objs/ceu/IntakeCeuDataParser';
import CeuContraventions from './CeuContraventions';

const disputeChannel = Radio.channel('dispute');
const applicationChannel = Radio.channel('application');
const animationChannel = Radio.channel('animations');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');

const IntakeCeuPageContraventionInfo = CeuPage.extend({
  
  initialize() {
    CeuPage.prototype.initialize.call(this, arguments);

    this.template = this.template.bind(this);

    IntakeCeuDataParser.parseFromCustomDataObj(this.model);
    this.contraventions = IntakeCeuDataParser.getContraventionCollection();

    this.createPageItems();
    this.setupListeners();

    applicationChannel.trigger('progress:step', 7);
  },

  getPageApiUpdates() {
    const keysToSkip = ['e_is_other_evidence'];

    const contraventionsData = this.getChildView('contraventionsRegion')?.subView?.saveInternalDataToModel({ returnOnly: true });
    const hasUpdatesFn = (keyMatchObj={}, objToMatch={}) => {
      if (!keyMatchObj && !objToMatch) return;
      let _hasUpdates = false;
      Object.keys(keyMatchObj).forEach(key => {
        if (_hasUpdates || keysToSkip.indexOf(key) !== -1) return;
        
        if (Array.isArray(keyMatchObj[key]) && Array.isArray(objToMatch[key])) {
          _hasUpdates = keyMatchObj[key].length !== objToMatch[key].length ||
            _.any(keyMatchObj[key], (arr, arrInd) => hasUpdatesFn(arr, objToMatch[key].at(arrInd)));
        } else if (String(keyMatchObj[key]) !== String(objToMatch[key])) {
          _hasUpdates = true;
        }
      });
      return _hasUpdates;
    };
    
    const hasUnsavedChanges = _.any(contraventionsData, (c, index) => hasUpdatesFn(c, this.contraventions.at(index).toJSON()));
    return hasUnsavedChanges ? { hasUpdates: true } : {};
  },

  getRoutingFragment() {
    return 'page/7';
  },

  // Create all the models and page items for this intake page
  createPageItems() {
    this.addPageItem('contraventionsRegion', new PageItemView({
      stepText: null,
      subView: new CeuContraventions({ collection: this.contraventions }),
      forceVisible: true
    }));
  },

  setupListeners() {
    this.listenTo(this.contraventions, 'click:delete', (model) => {
      loaderChannel.trigger('page:load');
      // Removing the model from collection will also update the collection view
      this.contraventions.remove(model);

      // Now save removal change to server and model
      IntakeCeuDataParser.setContraventionCollection(this.contraventions);
      this.model.updateJSON(IntakeCeuDataParser.toJSON());
      this.model.save(this.model.getApiChangesOnly()).done(() => {
        loaderChannel.trigger('page:load:complete');
        if (this.contraventions.length === 0) {
          IntakeCeuDataParser.setContraventionCollection(this.contraventions);
          const modalView = modalChannel.request('show:standard', {
            title: 'No Remaining Contraventions',
            bodyHtml: `All contraventions removed, you will be returned to the selection page.`,
            hideContinueButton: true,
            cancelButtonText: 'Close',
          });
          this.listenTo(modalView, 'removed:modal', () => {
            applicationChannel.trigger('progress:step:complete', 5);
            Backbone.history.navigate('page/6', { trigger: true, replace: false })
          });
        }
      }).fail(this.createPageApiErrorHandler(this));
    });
  },

  updateClaimWarning() {
    const claimPageItem = this.getPageItem('claims');
    const claimCollection = claimPageItem.getCollection();

    if (claimCollection.isTotalOverLimit()) {
      this.getUI('claimWarning').removeClass('hidden-item');
    } else {
      this.getUI('claimWarning').addClass('hidden-item');
    }
  },

  previousPage() {
    Backbone.history.navigate('#page/6', {trigger: true});
  },

  nextPage() {
    loaderChannel.trigger('page:load');
    
    const isPageValid = this.validatePage();
    this.validateDmsFileNumbers().then(() => {
      if (!isPageValid) {
        loaderChannel.trigger('page:load:complete');
        return this.scrollToFirstError();
      }

      IntakeCeuDataParser.parseFromCustomDataObj(this.model);
      
      const contraventionsView = this.getChildView('contraventionsRegion');
      contraventionsView.subView.saveInternalDataToModel();
      IntakeCeuDataParser.setContraventionCollection(this.contraventions);
      this.model.updateJSON(IntakeCeuDataParser.toJSON());
      
      this.model.save(this.model.getApiChangesOnly()).done(() => {
        applicationChannel.trigger('progress:step:complete', 7);
        Backbone.history.navigate('#page/8', {trigger: true});
      }).fail(this.createPageApiErrorHandler(this));

    }, () => {
      loaderChannel.trigger('page:load:complete');
      this.scrollToFirstError();
    });
  },

  scrollToFirstError() {
    const visible_error_eles = this.$('.error-block:not(.warning):visible').filter(function() { return $.trim($(this).html()) !== ""; });
    if (visible_error_eles.length === 0) {
      console.log(`[Warning] Page not valid, but no visible error message found`);
    } else {
      animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {force_scroll: true, is_page_item: true});
    }
  },

  validateDmsFileNumbers() {
    const promises = [];
    const contraventionsView = this.getPageItem('contraventionsRegion') || [];
    contraventionsView?.subView?.getChildren().forEach(c => {
      if (!c.isDmsFilesSelected()) return Promise.resolve();
      c.model?.getDmsFileNumberCollection()?.forEach(fileNum => {
        if (!fileNum.get('c_dms_file_number')) return;
        const newPromise = new Promise((res, rej) => {
          disputeChannel.request('check:filenumber', fileNum.get('c_dms_file_number'))
            .done((response={}) => {
              if (!response.validated) {
                fileNum.trigger('error:filenumber');
                rej();
              } else {
                res();
              }
            // If check fails, have it fail silently and continue
            }).fail(res)
        });
        promises.push(newPromise);
      });
    });

    return Promise.all(promises);
  },

  className: `${CeuPage.prototype.className} intake-ceu-p7`,

  regions: {
    contraventionsRegion: '.intake-ceu-p7__contraventions'
  },

  ui() {
    return _.extend({}, CeuPage.prototype.ui, {
      claimWarning: '.claim-total-warning'
    });
  },

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      const region = this.showChildView(regionName, itemView);
      const view = region.currentView;
      if (view.stepComplete) {
        this.showPageItem(regionName, {no_animate: true});
      }
    }, this);
  },

  template() {
    return <>
      <div className="step-description evidence-info-heading">
        <p>Please enter information for each of the contraventions or issues that you selected in the previous step. To change the contraventions that you selected, press Back.</p>
      </div>
    
      <div className="intake-ceu-p7__contraventions step claim-evidence-container"></div>
     
      <div className="page-navigation-button-container">
        <button className="navigation option-button step-previous" type="button">BACK</button>
        <button className="navigation option-button step-next" type="submit">NEXT</button>
      </div>
    </>;
  },
});

_.extend(IntakeCeuPageContraventionInfo.prototype, ViewJSXMixin);
export default IntakeCeuPageContraventionInfo;
