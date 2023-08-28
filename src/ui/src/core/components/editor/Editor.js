/**
 * @class core.components.editor.EditorView
 * @memberof core.components.editor
 * @augments Marionette.View
 * @fileoverview - View that utilizes the trumbowyg npm package to create a text editor
 */

import ViewMixin from '../../utilities/ViewMixin';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewJSXMixin } from '../../utilities/JsxViewMixin';
import EmailTemplateFormatter from '../email/EmailTemplateFormatter';
import './trumbo-plugins/dms.trumbowyg.cleanpaste';

let trumbowygEl = null;
const EDITOR_CLASS = 'trumbowyg-editor';
const EDITOR_SELECTOR = `.${EDITOR_CLASS}`;
const colResizableTableClass = 'JColResizer';
const colResizableGripClasses = ['JCLRgrips', 'JCLRgrip'];
const colResizableTableClasses = [colResizableTableClass, 'JCLRFlex'];

const EditorView = ViewMixin.extend({
  initialize() {
    this.template = this.template.bind(this);
    
    this.theme = this.model.get('theme');
    this.bottomControl = this.model.get('bottomControl');
    this.withGeneratedContent = this.model.get('withGeneratedContent');
    this.withAutoText = this.model.get('withAutoText');
    this.withTable = this.model.get('withTable');

    this.listenTo(this.model, 'render', this.render);

    this.listenTo(this.model, 'update:input', function(newHtml) {
      this._getEditorEle().trumbowyg('html', newHtml);
      this.inputChanged();
    }, this);

    this.listenTo(this.model, 'clear', function() {
      this._getEditorEle().trumbowyg('empty');
      if (this.model.get('isEmailable')) {
        this._getEditorEle().trumbowyg('html', $(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.p).html('<br/>').clone().wrap('<p/>').parent().html() );
      }
    });
  },

  initializeEditor() {
    $.trumbowyg.svgPath = require('../../../../node_modules/trumbowyg/dist/ui/icons.svg');
    // Update langs:
    $.trumbowyg.langs.en.foreColor = 'Format: Text colour';
    $.trumbowyg.langs.en.table = 'Insert: Table';

    const ele = $(this);
    const findTopLevelParent = (currNode) => {
      const parentNode = currNode ? currNode.parent() : null;
      if (parentNode && parentNode.hasClass(EDITOR_CLASS)) return currNode;
      else return findTopLevelParent(parentNode);
    };
    const dmsInsertHtmlFn = (htmlToInsert) => {
      // Save current range
      this._getEditorEle().trumbowyg('saveRange');
      
      const range = this._getEditorEle().trumbowyg('getRange');
      // No selection found - is this ever expected?
      if (!range || !range.commonAncestorContainer) return;
      const topNode = findTopLevelParent($(range.commonAncestorContainer));
      if (topNode) topNode.after(htmlToInsert);
    };

    trumbowygEl = this._getEditorEle().trumbowyg(
      Object.assign({
        defaultLinkTarget: '_blank',
        semantic: false, // Don't replace <b> with <strong>, etc
        removeformatPasted: true,
        tagsToRemove: ['script', 'link'],

        btnsDef: {
          // New custom Email methods
          DMS_title: {
            fn: () => {
              this._getEditorEle().trumbowyg('saveRange');
              const parentNode = window.getSelection().focusNode.parentNode;
              // Only allow H4 title-ing? on <p> tags?
              if (parentNode && parentNode.tagName === 'P') {
                $(parentNode).replaceWith( $(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.h4).text($(parentNode).text()) )
              }
            },
            title: 'Format: Paragraph title',
            text: 'Paragraph Title',
            tag: 'h4',
            ico: 'h4',
          },

          DMS_p: {
            fn: 'formatBlock',
            title: 'Format: Paragraph body',
            text: 'Paragraph Body',
            tag: 'p',
            param: 'p',
            ico: 'p',
          },

          DMS_strong: {
            fn: 'bold',
            title: 'Format: Bold',
            tag: 'b',
            ico: 'strong'
          },

          DMS_em: {
            fn: 'italic',
            title: 'Format: Italic',
            tag: 'i',
            ico: 'italic'
          },

          DMS_del: {
            fn: 'strikethrough',
            title: 'Format: Strikethrough',
            tag: 'strike',
            ico: 'strikethrough'
          },

          DMS_justify: {
            dropdown: ['justifyLeft', 'justifyCenter', 'justifyRight'],
            title: 'Format: Align content',
            ico: 'justifyLeft'
          },

          DMS_unorderedList: {
            fn: () => dmsInsertHtmlFn(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.ul),
            title: 'Insert: Unordered list',
            tag: 'ul',
            param: 'ul',
            ico: 'unorderedList'
          },

          DMS_orderedList: {
            fn: () => dmsInsertHtmlFn(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.ol),
            tag: 'ol',
            title: 'Insert: Ordered list',
            param: 'ol',
            ico: 'orderedList'
          },

          DMS_horizontalRule: {
            fn: () => {
              // Always insert a new paragraph after the hr so editing can continue below
              dmsInsertHtmlFn( `${EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.hr}${
                $(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.p).html('<br/>').clone().wrap('<p/>').parent().html()}` );
            },
            title: 'Insert: Horizontal rule',
            tag: 'hr',
            ico: 'horizontalRule'
          },

          DMS_link: {
            dropdown: ['createLink'],
            title: 'Insert: Web link',
            ico: 'link'
          },

          DMS_autoText: (this.withAutoText != false) ? {
            fn() {
              ele.trigger('dms.autoText');
            },
            tag: 'tagName',
            title: 'Insert Autotext at Cursor',
            text: 'Insert Autotext at Cursor',
            isSupported: true,
            key: 'K',
            param: '',
            forceCSS: false,
            class: 'dms-trumbowyg-btn-pane-autotext',
            hasIcon: false
          } : null,
          DMS_resetWithGenerated: (this.withGeneratedContent != false) ? {
            fn() {
              ele.trigger('dms.resetWithGenerated');
            },
            tag: 'tagName',
            title: 'Reset with Generated Content',
            text: 'Reset with Generated Content',
            isSupported: true,
            key: 'L',
            param: '',
            forceCSS: false,
            class: 'dms-trumbowyg-btn-pane-reset-generated',
            hasIcon: false
          } : null
        },
        btns: [
          // Note: undo and redo are only supported in Blink browsers
          ['DMS_title', 'DMS_p', 'DMS_strong', 'DMS_em', 'DMS_del', 'foreColor', 'DMS_justify', 'historyUndo', 'historyRedo'],
          ['DMS_unorderedList', 'DMS_orderedList', 'DMS_link', 'DMS_horizontalRule', ...(this.withTable ? ['table'] : [])],
          
          // Hide Auto-Text feautes until implemented
          //['DMS_autoText'],
          //['DMS_resetWithGenerated'],
          ['fullscreen']
        ],
        plugins: Object.assign({
            colors: { colorList: [
              'ffffff', '000000', 'eeece1', '1f497d', '4f81bd',
              // This colour of red is from email template, and not from this default trumbo palette row.  Trumbo red is c0504d
              'd80000',
              '9bbb59', '8064a2', '4bacc6', 'f79646', 'ffff00']
            },
          }, this.withTable ? {
            table: {
              styler: this.model.getEditorTableClass()
            }
          } : {}),
        disabled: this.model.get('disabled')
      },
      this.model.get('trumbowygOptions')
    ));

    // Populate model value, if one exists and editor has no other selections
    if (this.model.get('value')) {
      trumbowygEl.trumbowyg('html', this.model.get('value'));
    }

    this.setupTrumboListeners();
  },

  setupTrumboListeners() {
    // Run table parsing twice on focus to force loaded tables to have drag-resize functionality immediately
    const onTrumboFocusFn = () => {
      setTimeout(this.inputChanged.bind(this), 0);
      setTimeout(this.inputChanged.bind(this), 0);
    };

    const onTrumboModalCloseFn = () => {
      this._getEditorEle().find(`a:not(.${EmailTemplateFormatter.DMS_LINK_CLASS}`).each(function() {
        $(this).addClass(EmailTemplateFormatter.DMS_LINK_CLASS).css(EmailTemplateFormatter.DMS_LINK_CSS); });
    };
    
    trumbowygEl.off('tbwfocus', onTrumboFocusFn)
    trumbowygEl.on('tbwfocus', onTrumboFocusFn);

    if (this.model.get('isEmailable')) {
      // Add a listener on modal close to catch link insertion and add correct styles
      trumbowygEl.off('tbwmodalclose', onTrumboModalCloseFn);
      trumbowygEl.on('tbwmodalclose', onTrumboModalCloseFn);
    }
  },

  _getEditorEle() {
    return this.$(EDITOR_SELECTOR);
  },

  getCurrentValue() {
    return this._getEditorEle().trumbowyg('html');
  },

  prepareEmailForSend() {
    this.saveInternalDataToModel();
    const currentValue = this.getCurrentValue();
    const currentEle = $(`<div>${currentValue}</div>`);


    const filter_removeTableHtml = (ele) => {
      _.each(colResizableGripClasses, function(className) {
        ele.find(`.${className}`).remove();
      });
  
      ele.find(`.${this.model.getEditorTableClass()}`).each(function() {
        const tableEle = $(this);
        _.each(colResizableTableClasses, function(className) {
          tableEle.removeClass(className);
        });
      });
      return ele;
    };
  
    // Can be used to add responsize widths to tables.
    // Unused for first release, but may be included in the future.
    const filter_tableWidthsToPercentages = (ele) => {
      $.each(ele.find(`.${this.model.getEditorTableClass()}`), function() {
        const tableEle = $(this);
        const tableWidthInPx = tableEle.width();
  
        $.each(tableEle.find('td'), function() {
          const tdEle = $(this);
          const tdWidthInPx = tdEle.width();
          const tdWidthAsPercentage = Number(tdWidthInPx / tableWidthInPx) * 100;
  
          if (tdWidthInPx && parseInt(tdWidthAsPercentage)) {
            tdEle.css('width', `${parseInt(tdWidthAsPercentage)}%`);
          }
        });
  
        const tableWidthInPxInt = parseInt(tableWidthInPx);
        if (tableWidthInPxInt) tableEle.css({ width: '100%', maxWidth: `${tableWidthInPxInt}px` });
      });
  
      return ele;
    };

    const filter_fixOutlookSpacing = (ele) => {
      // Add spacer block fix for outlook emails
      const elementsToSpace = [`ul`, `ol`, `hr`, `table`];
      $.each(ele.find(elementsToSpace.join(', ')), function() {
        $(this).css({ marginBottom: 0, paddingBottom: 0 });
        if (!$(this).next(`.${EmailTemplateFormatter.EMAIL_P_IGNORE_CLASS}`).length) {
          $(this).after(EmailTemplateFormatter.EMAIL_EDITOR_HTML_TEMPLATES.p_spacer);
        }
      });
      return ele;
    };
    const toHtmlFn = (ele) => ele.html();
    
    // Apply all filter functions in order, casting to HTML at the end
    return [filter_removeTableHtml, filter_fixOutlookSpacing, toHtmlFn].reduce(
      (memo, filterFn) => filterFn.call(this, memo), currentEle);
  },


  checkAndResetDefaultHtml() {
    const currVal = this.getCurrentValue();
    if (!currVal || $.trim(currVal) === '') this.model.trigger('clear');
  },

  saveInternalDataToModel() {
    const activeHtml = this.getUI('input').html();
    this._getEditorEle().trumbowyg('html', activeHtml);
    this.model.set('value', activeHtml, { silent: true });
  },

  validateAndShowErrors() {
    this.getUI('error').html('');
    const is_valid = this.model.isValid();
    this.showErrorMessage(is_valid ? '' : this.model.validationError);
    return is_valid;
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage);
  },

  onBeforeRender() {
    // Re-render was called, view was not destroyed, and so the template didn't get re-rendered completely.
    // Calling React to manually unmount the DOM if this view is being re-rendered
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    this.initializeEditor();

    if (this.model.get('isEmailable')) this.checkAndResetDefaultHtml();
    
    const bottomControl = this.model.get('bottomControl');
    if (bottomControl) this.renderBottomControls();
  },

  renderBottomControls() {
    return;
    /* Currently deprecated */
    if (trumbowygEl.length) {
      trumbowygEl.closest('.trumbowyg-box')
        .append(`<div class="dms-trumbowyg-save-controls">
            <span class="dms-trumbowyg-cancel">Cancel</span>
            <span class="dms-trumbowyg-save-controls-separator"></span>
            <span class="dms-trumbowyg-save">Save Changes</span>
          </div>`);
    }
  },

  applyResizableTablePlugin() {
    const EDITOR_TABLE_CLASS = this.model.getEditorTableClass();
    const isEmailable = this.model.get('isEmailable');
    $.each(this.getUI('input').find(`table:not(.${EmailTemplateFormatter.EMAIL_TABLE_IGNORE_CLASS})`), function() {
      if ($(this).hasClass(colResizableTableClass)) $(this).colResizable({ disable: true });
      else $(this).addClass(colResizableTableClass);

      // Un-set any max length that was set on for responsive display
      const maxWidth = $(this).css('maxWidth');
      if (maxWidth) {
        $(this).css({
          width: maxWidth,
          maxWidth: ''
        });
      }

      $(this).colResizable({
        liveDrag: true,
        resizeMode: 'flex',
        gripInnerHtml: "<div class='grip'></div>",
        draggingClass: 'dragging'
      });

      if (!isEmailable) return;

      // If emailable, then apply manual email css to the tables
      if ($(this).hasClass(EDITOR_TABLE_CLASS)) {
        $(this).css(EmailTemplateFormatter.DMS_TABLE_CSS);

        $(this).find('tr').each(function() {
          $(this).css(EmailTemplateFormatter.DMS_TABLE_TR_CSS);
        });
        
        $(this).find('td').each(function() {
          const td = $(this);
          td.css(EmailTemplateFormatter.DMS_TABLE_TD_CSS);
          // Manually apply a padding fix for JColResizable style override
          if ((EmailTemplateFormatter.DMS_TABLE_TD_CSS || {}).padding) {
            td[0].style.removeProperty('padding');
            td[0].style.setProperty('padding', EmailTemplateFormatter.DMS_TABLE_TD_CSS.padding, 'important');
          }
        });
      }
    });
  },

  applyEmailContentStyles() {
    if (!this.model.get('isEmailable')) return;

    // Add class to p tags that might not have gotten one via default trumbo editting
    this._getEditorEle().find(`p:not(.${EmailTemplateFormatter.DMS_P_CLASS}, .${EmailTemplateFormatter.EMAIL_P_IGNORE_CLASS})`).each(function() {
      $(this)
        .addClass(EmailTemplateFormatter.DMS_P_CLASS)
        .css(EmailTemplateFormatter.DMS_P_CSS);
    });
  },


  inputChanged() {
    this.getUI('error').html('');

    this.applyResizableTablePlugin();
    this.applyEmailContentStyles();
    
    this.model.set('value', this.getCurrentValue());
    this.trigger('finished:change', this);
  },

  defaultClass: 'intake-input-component form-group',
  ui: {
    input: EDITOR_SELECTOR,
    container: '.form-group',
    error: '.error-block'
  },
  events: {
    'change @ui.input': 'inputChanged',
    'keyup @ui.input': 'inputChanged',
    'input @ui.input': 'inputChanged',
    'propertychange @ui.input': 'inputChanged'
  },

  template() {
    const labelText = this.model.get('labelText');
    return (
      <>
        <div className={!labelText ? 'hidden' : ''}>
          <label className="form-control-label">{labelText}</label>
        </div>
        <div className={`trumbowyg--${this.theme} editor-component-input-container ${this.model.get('isEmailable')? 'trumbowyg-emailable' : ''}`}>
          <div className={`${EDITOR_CLASS} ${this.model.get('isEmailable') ? EmailTemplateFormatter.EMAIL_CONTENT_CLASS : ''}`}></div>
        </div>
        <p className="error-block"></p>
      </>
    );
  }
});

_.extend(EditorView.prototype, ViewJSXMixin);
export default EditorView;
