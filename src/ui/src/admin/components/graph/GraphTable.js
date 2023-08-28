import React from 'react';
import ViewMixin from "../../../core/utilities/ViewMixin";
import AlertIcon from '../../static/Icon_Alert_SML.png';
import './Graph.scss';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const GraphTable = ViewMixin.extend({
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['childViewIndex']);
    if (typeof this.childViewIndex === 'undefined' || this.childViewIndex === null) {
      this.childViewIndex = '';
    }
    this.isValid = this.model.validate();
  },

  onRender() {
    this.initializeHelp(this, this.model.get('helpHtml'));
  },

  template() {
    return (
      <div className="graph__table">
        <div className="graph__table__title-wrapper">
          <span className={`${this.model.get('helpHtml') ? '' : 'hidden-item'} graph__help`}>
            <div role="button" className="help-icon"></div>
          </span>
          &nbsp;
          <span>{this.model.get('title')}</span>
        </div>
        {this.renderJsxGraphTable()}
        <br />
      </div>
    )
  },

  renderJsxGraphTable() {
    if (!this.isValid) {
      return (
        <div className="graph__table__error">
          <img src={AlertIcon} />&nbsp;Error loading table data
        </div>
      )
    }
    
    // Add custom classes to tables in the GraphTable collection to allow custom highlighting
    // NOTE: This custom colouring is not generic, and colors based on table position in the collection - need a new system
    return (
      <table><thead></thead><tbody>
        {this.model.get('processedContents').map((td, rowIndex) => {
          const getRowClass = () => `graph__tables__table${this.childViewIndex}__row${rowIndex}`;
          const customTableRowClass = Number(rowIndex) === 0 ? 'graph__table__header' : getRowClass();
          return (
            <tr className={customTableRowClass}>
              {td.map((td, colIndex) => {
                const customTableColClass = `${getRowClass()}__td${colIndex}`;
                return <td className={customTableColClass}>{td}</td>
              })}
            </tr>
          )
        })}
      </tbody></table>
    )
  },
});

_.extend(GraphTable.prototype, ViewJSXMixin);
export default GraphTable;
