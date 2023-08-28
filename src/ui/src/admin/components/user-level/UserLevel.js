/**
 * @fileoverview - File containing functions for displaying user roles groupings, types, and scheduler privileges
 */
import Radio from 'backbone.radio';
import React from 'react';
import { renderToString } from 'react-dom/server';
import './UserLevel.scss';

const Formatter = Radio.channel('formatter').request('get');

const toSchedulerTypeDisplay = (arbModel) => {
  if (!arbModel) return;
  const displayDutySchedulerType = () => arbModel.isDutyScheduler() ? <span className="user-level__duty-scheduler">*</span> : null;
  const displayEmergencySchedulerType = () => arbModel.isEmergencyScheduler() ? <span className="user-level__emergency-scheduler">*</span> : null;
  return <>{displayDutySchedulerType()}{displayEmergencySchedulerType()}</>
}

const toUserLevelAndNameDisplay = (arbModel, options={ displaySchedulerType: true, displayUserLevelIcon: true, trimNameAtChar: null }) => {
  if (!arbModel) return '-';

  const isActive = arbModel.isActive();
  const schedulerType = options.displaySchedulerType ? toSchedulerTypeDisplay(arbModel) : null;
  const displayName = options.trimNameAtChar ? Formatter.toTrimmedString(arbModel.getDisplayName(), options.trimNameAtChar) : arbModel.getDisplayName();

  const renderUserLevelIcon = () => {
    if (!options.displayUserLevelIcon) return;
    return <span className="user-level__display">{Formatter.toUserLevelDisplay(arbModel)}</span>
  }

  return renderToString(
    <span className={`user-level__container${isActive ? '' : '--inactive'}`}>
      {renderUserLevelIcon()}
      <span className="user-level__scheduler-display">{!arbModel.isActive()?'** ':''}{displayName}{schedulerType}</span>
    </span>
  );
}

export { toSchedulerTypeDisplay, toUserLevelAndNameDisplay };