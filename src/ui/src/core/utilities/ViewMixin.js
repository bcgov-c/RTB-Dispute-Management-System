// Provides some common behaviour for views to include
import Marionette from 'backbone.marionette';

export default Marionette.View.extend({
  defaultClass: '',
  className() {
    const modelClasses = this.model ? this.model.get('cssClass') : null;
    return (_.union([this.defaultClass], [this.getOption('extraClasses')], [modelClasses])).join(' ');
  },

  validateView(options={}) {
    console.debug("ValidateView on ", this);

    // Validate all child views
    let is_valid = true;
    _.each(this.regions, function(selector, region) {
      const childView = this.getChildView(region);
      if (!childView) {
        return;
      }
      if (childView.validateView && !childView.validateView(childView.serializeData())) {
        is_valid = false;
      }
    }, this);

    // Then validate self
    if (_.has(this, 'model') && this.model.isValid) {
      if (!this.model.isValid()) {
        this.showErrorMessage(this.model.validationError);
        is_valid = false;
      }
    }

    return is_valid;
  },

  // This should be defined by every class that wants to show error messages?
  showErrorMessage(errorMsg) {
    console.log(`[Warning] 'showErrorMessage' should have been subclassed by the implementing View`);
  },

  initializePopovers(view) {
    const negativeAmountClass = 'formatter-negative';
    const negativeAmountTitle = 'Negative Amount';
    const negativeAmountText = 'A bold red amount in brackets indicates a negative value, or an amount that is awarded againt the applicant on their file';
    const self = this;

    try {
      view.$(`.${negativeAmountClass}`).each(function() {
        self.initializePopover($(this), { title: negativeAmountTitle, content: negativeAmountText, trigger: 'hover', container: 'body'});
      });
    } catch (err) {
      console.log(err);
    }
  },

  initializePopover(targetEle, popoverData) {
    const content = (popoverData || {}).content;
    const popoverEle = content ? targetEle.popover(Object.assign({ html: true }, popoverData)) : targetEle.popover();
    return popoverEle;
  },

  initializeHelp(parent_view, content, ignore_eles) {
    if ($.trim(content) === "") {
      return;
    }
    const helpOpenClass = 'help-opened';
    const helpContainerClass = 'info-help-container';

    ignore_eles = ignore_eles || [];
    // In order of most specific to least, to make sure the most appropriate match happens
    const parentEleSelectors = [
      '.dar-step-three__payment-warning__wrapper',
      '.decision-search__issue',
      '.step-description',
      '.form-group',
      '.file-title-display-only-container',
      '.access-issue-body',
      '.access-issue-progress-bar-container',
      '.da-upload-add-evidence-line-container',
      '.da-notice-service-question-text-container',
      '.evidence-item-container',
      '.evidence-name',
      '.evidence-claim-details',
      '.evidence-claim-container-parent',
      '.intake-evidence-checkbox-component',
      '.intake-claim-checkbox-component',
      '.da-label',
      '.subserv__documents-to-serve',
      '.subserv__service-options',
      '.help-target',
      '.completeness-item',
      '.graph__table',
      '.graph__item',
      '.modal-graph__container'
    ];

    $.each(parent_view.$('.help-icon'), function() {
      const helpEle = $(this);

      // Skip any elements that are children of an ignore_ele.
      // These items will have to be initialized in their own view
      if (!_.isEmpty(ignore_eles) && _.any(ignore_eles, function(ignore_ele) { return helpEle.closest(ignore_ele).length > 0; })) {
        return;
      }

      // Make sure to show the help element icon (Needed for PageItem refresh)
      helpEle.removeClass('hidden-item');

      helpEle.off('click.rtb-help');
      helpEle.on('click.rtb-help', function() {
        const parentSelector = _.find(parentEleSelectors, function(selector) { return helpEle.closest(selector).length > 0; });

        if (!parentSelector) {
          console.log("[Warning] Couldn't find position to place help element", helpEle);
          // Show as popover here instead?
          // that.initialize_popovers(page_view, content);
          return false;
        }

        const parentEle = helpEle.closest(parentSelector);
        if (helpEle.hasClass('help-opened')) {
          const createdHelpElement = $(parentEle.find('.'+helpContainerClass)[0]);
          createdHelpElement.slideUp({duration: 400, complete: function() {
            $(this).remove();
            helpEle.removeClass(helpOpenClass);
          }});
        } else {
          helpEle.addClass(helpOpenClass);
          parentEle.prepend(`<div class="${helpContainerClass} clearfix"><div class="close-help"></div>${content}</div>`);
          const createdHelpElement = $(parentEle.find('.'+helpContainerClass)[0]);
          createdHelpElement.find('.close-help').on('click', function() {
            helpEle.trigger('click.rtb-help');
          });
          createdHelpElement.slideDown({duration: 400});
        }

        return false;
      });
    });
  }

});
