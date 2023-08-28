import React from 'react';
import Marionette from 'backbone.marionette';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './ReportResultsTable.scss';

const ReportResultsTable = Marionette.View.extend({
  /**
   * @param {GraphModel} model
   */
  initialize() {
    this.template = this.template.bind(this);
    this.responseConfig = this.model.get('reportModel')?.getResponseConfig();
  },

  className: `report-results-table`,

  template() {
    const headerRow = this.model.get('processedContents')?.[0];
    const contentRows = this.model.get('processedContents')?.slice(1);
    if (!headerRow?.length || !contentRows?.length) return;
    return <>
      <div className="standard-list-header">
        {
          headerRow.map(headerCol => {
            const colConfig = this.responseConfig?.columnDisplay?.find(c => String(headerCol) === String(c.name) && c.name);
            const headerConfig = Object.assign({}, colConfig);
            // Ignore html parsing for any header columns
            delete headerConfig.html;
            return this.renderJsxTableCol(headerCol, headerConfig);
          })
        }
      </div>
      {
        contentRows.map(contentRow => <div className="standard-list-item">
          {
          contentRow.map((contentCol, index) => {
            const colConfig = this.responseConfig?.columnDisplay?.find(c => String(headerRow?.[index]) === String(c.name) && c.name);
            return this.renderJsxTableCol(contentCol, colConfig);
            })
          }
        </div>)
      }
    </>;
  },

  /**
   * 
   * @param {JSX} colContent 
   * @param {Object} colConfig - 
   */
  renderJsxTableCol(colContent='', colConfig={}) {
    const style = colConfig?.width ? { width: colConfig.width, minWidth: colConfig.width, maxWidth: colConfig.width } : {};
    // Render the column as HTML if setup in config
    const htmlContent = colConfig?.html ? colContent : null;

    const eleProps = {
      ...(htmlContent ? { dangerouslySetInnerHTML: { __html: htmlContent } } : {}),
      style,
    };
    return <div {...eleProps}>{htmlContent ? null : colContent}</div>
  },
});

_.extend(ReportResultsTable.prototype, ViewJSXMixin);
export default ReportResultsTable;