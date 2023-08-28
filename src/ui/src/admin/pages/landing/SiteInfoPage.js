import React from 'react';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';

const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');

const SiteInfoPage = Marionette.View.extend({
  template() {
    const RUN_MODE = configChannel.request('get', 'RUN_MODE');
    const API_ROOT_URL = configChannel.request('get', 'API_ROOT_URL');
    const SWAGGER_URL = configChannel.request('get', 'SWAGGER_URL');
    const INTAKE_URL = configChannel.request('get', 'INTAKE_URL');
    const CEU_INTAKE_URL = configChannel.request('get', 'CEU_CONFIG')?.START_URL;
    const DISPUTE_ACCESS_URL = configChannel.request('get', 'DISPUTE_ACCESS_URL');
    const OFFICE_SUBMISSION_URL = configChannel.request('get', 'OFFICE_SUBMISSION_URL');
    const isAdmin = sessionChannel.request('is:active:admin');
    const isCmsOnlyMode = false;
    const isProd = RUN_MODE === 'production';
    const isDev = RUN_MODE === 'development';
    const isStaging = RUN_MODE === 'staging';
    const isSiteminder = sessionChannel.request('is:login:siteminder');
    const runModeDisplay = RUN_MODE === 'staging' ? 'Test/Staging' : Formatter.capitalize(RUN_MODE);
    loaderChannel.trigger('page:load:complete');

    return (
      <table>
        <tbody>
          <tr>
            <td className="landing-page-label">Site</td>
            <td>{runModeDisplay + (isCmsOnlyMode ? ' - CMS Viewer' : '') }</td>
          </tr>
          <tr>
            <td className="landing-page-label">Site Build Date</td>
            <td>{Formatter.toDateAndTimeDisplay(Moment(BUILD_INFO.BUILD_DATE)) }</td>
          </tr>
          <tr>
            <td className="landing-page-label">Special Instructions</td>
            <td>{isCmsOnlyMode ? 'This is a development site which should be used ONLY for viewing loaded CMS data.  If you are trying to reach the DMS test site, contact Hive1 for assistance.' :
              isDev ? 'This is a development site and is not intended for non-developer usage.' :
              isStaging ? 'This is a development and testing site and is intended to be used only by RTB staff.'
              : '-' }
            </td>
          </tr>
          <tr>
            <td className="landing-page-label">Intake URL</td>
            <td>
              {
                isCmsOnlyMode || !INTAKE_URL ? <span>-</span> :
                isSiteminder ? <><span>{INTAKE_URL}</span><span style={{marginLeft: '10px;'}}>(for BCeID, use a separate browser)</span></> :
                <a className="static-external-link" href="javascript:;" url={INTAKE_URL}>{INTAKE_URL}</a>
              }
            </td>
          </tr>
          <tr>
            <td className="landing-page-label">Dispute Access URL</td>
            <td>
              {
                isCmsOnlyMode || !DISPUTE_ACCESS_URL ? '-' : <a className="static-external-link" href="javascript:;" url={DISPUTE_ACCESS_URL}>{DISPUTE_ACCESS_URL }</a>
              }
            </td>
          </tr>

          <tr>
            <td className="landing-page-label">Office Submission URL</td>
            <td>
              {
                isCmsOnlyMode || !OFFICE_SUBMISSION_URL ? '-' : <a className="static-external-link" href="javascript:;" url={OFFICE_SUBMISSION_URL}>{OFFICE_SUBMISSION_URL }</a>
              }
            </td>
          </tr>

          <tr>
            <td className="landing-page-label">CEU Intake URL</td>
            <td>
              {
                isCmsOnlyMode || !CEU_INTAKE_URL ? <span>-</span> :
                isSiteminder ? <><span>{CEU_INTAKE_URL}</span><span style={{marginLeft: '10px;'}}>(for BCeID, use a separate browser)</span></> :
                <a className="static-external-link" href="javascript:;" url={CEU_INTAKE_URL}>{CEU_INTAKE_URL}</a>
              }
            </td>
          </tr>
          <tr>
            <td className="landing-page-label">Mid-Tier API URL</td>
            <td>{API_ROOT_URL || '-' }</td>
          </tr>

          {isAdmin && isDev && !isCmsOnlyMode ?
            <tr>
              <td className="landing-page-label">Test Data</td>
              <td><a className="test-create-users-link" href="javascript:;">Create Users Utility</a></td>
            </tr>
          : null}
        </tbody>
      </table>
    )
  }
});

_.extend(SiteInfoPage.prototype, ViewJSXMixin);
export default SiteInfoPage;