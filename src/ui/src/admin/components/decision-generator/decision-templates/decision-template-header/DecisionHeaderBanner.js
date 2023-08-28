import React from 'react';
import DecGenData from '../../DecGenData';
import { BCLogoSrc } from '../BCLogoBase64';

export default (contextData={}) => <table className="layout_table twocol_table"><tbody>
    <tr>
    <td align="left">
      <img className="bc_header_img" src={BCLogoSrc} />
      <div style={{ width:1, height:1, lineHeight: 1, fontSize: 1, color: 'white'}}>
        DMSDOC:{contextData?.[DecGenData.currentDoc]?.get('file_type')
        }-{`${contextData?.[DecGenData.dispute]?.get('file_number')}`.slice(-4)}
      </div>
    </td>
    <td align="right">
      <div className="services_subtitle">Dispute Resolution Services</div>
      <div className="services_subtitle">Residential Tenancy Branch</div>
      <div className="services_subtitle">Ministry of Housing</div>
    </td>
    </tr>
  </tbody></table>;