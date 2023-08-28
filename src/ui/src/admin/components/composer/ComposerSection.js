/**
 * @fileoverview - Not used
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './ComposerSection_template.tpl';

const EDITOR_SELECTOR = '.composer-section-content-editor';

const modalChannel = Radio.channel('modals');

export default Marionette.View.extend({
  template,
  className: 'composer-section-component',

  ui: {
    link: '.composer-section-link',
    refresh: '.composer-section-link-refresh'
  },

  events: {
    'click @ui.link': 'clickLink',
    'click @ui.refresh': 'clickRefresh',
  },


  clickLink(e) {
    const ele = $(e.currentTarget),
      index = ele.data('index');

    try {
      // Run associated link action function in scope of this ComposerSectionView
      _.bind(this.links[index].actionFn, this)();
    } catch (err) {
      console.log(`[Warning] Couldn't find link for `, e);
    }
  },

  showWarningModalForGeneratedContentReplace() {
    modalChannel.request('show:standard', {
      title: 'Replace with generated content?',
      bodyHtml: 'If you reset this to generated content any information that you modified will be lost.  Are you sure?',
      onContinueFn: _.bind(function(modal) {
        modal.close();
        const self = this;
        this.isLoading = true;
        this.render();
        const outcomeDocContent = this._getOutcomeDocContentModel();
        this.generateFnPromise().done(function(content) {
          outcomeDocContent.save({ stored_content: content })
            .fail(function() {
              alert("[Error] Couldn't save updated generated content");
            }).always(function() {
              self.isLoading = false;
              self.render();
            });
        });
      }, this)
    });
  },

  clickRefresh() {
    this.showWarningModalForGeneratedContentReplace();
  },

  clickSave() {
    const editor_content = this._getEditorEle().trumbowyg('html'),
      outcomeDocContentModel = this._getOutcomeDocContentModel(),
      saved_content = outcomeDocContentModel.get('stored_content'),
      wrapped_saved_content = $(`<div class="temp-wrapper">${saved_content}</div>`),
      saved_content_editor_ele = wrapped_saved_content.find(EDITOR_SELECTOR);

    if (!saved_content_editor_ele || !saved_content_editor_ele.length) {
      console.log(`[Error] Saved content no longer has an area to put editor content.  Save not possible`);
      alert(`[Error] Saved content no longer has an area to put editor content.  Save not possible`);
      return;
    }

    saved_content_editor_ele.html(editor_content);
    outcomeDocContentModel.set('stored_content', wrapped_saved_content.unwrap().html());

    this.isLoading = true;
    this.render();

    const self = this;
    outcomeDocContentModel.save( outcomeDocContentModel.getApiChangesOnly() ).done(function() {
      self.isLoading = false;
      self.render();
    }).fail(function() {
      alert("[Error] Couldn't save changes to the doc content");
    });

  },

  _getEditorEle() {
    return this.$(EDITOR_SELECTOR);
  },


  _getOutcomeDocContentModel() {
    return this.model.get('outcome_doc_file_model').getDocContentType(this.outcomeDocContentType);
  },

  _getOutcomeDocStoredContent() {
    const outcomeDocContentModel = this._getOutcomeDocContentModel()
    return outcomeDocContentModel ? outcomeDocContentModel.getContent() : null;
  },


  isLoading: false,
  generatedContent: null,
  outcomeDocContentType: null,

  /**
   * @param {function} options.generateFn - The function to be run to create generated html
   * @param {int:function} options.outcomeDocContentType - The config value for this section
   * @param {string} options.title - The section title to be displayed at the top
   * @param {boolean} [options.hasRefresh] - Show or hide the refresh button
   * @param {Array.<object>} [options.links] - Has information for any optional links to show
   * @param {string} options.links.text - The title of the link
   * @param {function} options.links.actionFn - Runs when the link is clicked
   * @param {string} [options.links.cssClass] - Optional css class to display
   * @param {ComposerInstanceModel} model - The underlying Backbone model for this View
   */
  initialize(options) {
    this.mergeOptions(options, ['generateFn', 'outcomeDocContentType', 'title', 'hasRefresh', 'links']);

    if (_.isFunction(this.outcomeDocContentType)) {
      this.outcomeDocContentType = this.outcomeDocContentType();
    }

    if (!this.outcomeDocContentType) {
      console.log(`[Error] Tried to create a ContentSection with no valid outcome doc content type`);
      return;
    }

    let outcomeDocContentModel = this._getOutcomeDocContentModel();
    const self = this;
    if (!outcomeDocContentModel) {
      this.isLoading = true;
      this.generateFnPromise().done(function(content) {
        outcomeDocContentModel = self.model.get('outcome_doc_file_model').createDocContent({
          content_type: self.outcomeDocContentType,
          stored_content: content || null
        }, {add: true});
        outcomeDocContentModel.save().done(function() {
          self.isLoading = false;
          self.render();
        }).fail(function() {
          alert("[Error] Couldn't create the doc content");
        });
      });
    }
  },

  generateFnPromise() {
    const dfd = $.Deferred(),
      self = this;
    $.when(this.generateFn())
      .done(dfd.resolve)
      .fail(function() {        
        alert(`[Error] Couldn't generate content for "${self.title}"`);
        dfd.reject(...arguments);
      });
    return dfd.promise();
  },

  onDomRefresh() {
    const ele = this._getEditorEle(),
      self = this;
    if (ele) {
      ele.DMS_trumbowyg();
      ele.off('dms.resetWithGenerated');
      ele.on('dms.resetWithGenerated', function() {
        self.showWarningModalForGeneratedContentReplace();
      });

      ele.closest('.trumbowyg-box').find('.dms-trumbowyg-save').on('click', function() {
        self.clickSave();
      });
      ele.closest('.trumbowyg-box').find('.dms-trumbowyg-cancel').on('click', function() {
        if (confirm("Cancel your in progress edits?")) {
          self.render();
        }
      });
    }
  },

  templateContext() {
    return {
      isLoading: this.isLoading,
      title: this.title,
      hasRefresh: this.hasRefresh,
      links: this.links ? this.links : [],
      generatedContent: this._getOutcomeDocStoredContent()
    };
  }
});
