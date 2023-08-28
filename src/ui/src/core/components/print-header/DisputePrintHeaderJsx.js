import React from 'react';

const DisputePrintHeader = (printPageTitle) => {
  return (
    <div className="print-page-top-container">
      <img className="print-page-logo" src={`${require('../../../core/static/Header_BCLogo_White.png')}`} width="120" />
      <div className="print-page-title-container">
        <span className="print-page-sub-title">Residential Tenancy Branch</span>
        <span className="print-page-title">{printPageTitle}</span>
      </div>
    </div>
  )
}

export default DisputePrintHeader;