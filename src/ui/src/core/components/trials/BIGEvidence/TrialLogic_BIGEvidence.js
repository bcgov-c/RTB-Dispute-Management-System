
import Radio from 'backbone.radio';
import ModalArbRating from './ModalArbRating';

const TRIAL_TITLE = `BIGEvidence`;
const TRIAL_SUB_TYPE = 1;
const TRIAL_INTERVENTION_TYPE_INTAKE_CAROUSEL = 1;
const TRIAL_INTERVENTION_TYPE_INTAKE_EVIDENCE_NUDGE = 2;
const TRIAL_INTERVENTION_TYPE_DA_CAROUSEL = 3;
const TRIAL_INTERVENTION_TYPE_DA_EVIDENCE_NUDGE = 4;

const TRIAL_OUTCOME_TYPE_INTAKE_RATING = 1;
const TRIAL_OUTCOME_TYPE_ARB_RATING = 2;
const TRIAL_TOU_HTML = `
<p><b>System improvements</b></p>
<p>As a part of ongoing efforts to improve clients' experience, the RTB occasionally evaluates the impact of minor changes on how users interact with it. You will always be asked first if you are willing to participate and if you agree you may be selected to experience a slightly modified intake and/or asked a quick question at the end of the intake process. Your decision to participate is completely voluntary.</p>
<br/>`;

const sessionChannel = Radio.channel('session');
const trialsChannel = Radio.channel('trials');
const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');
const loaderChannel = Radio.channel('loader');

const getTrialModel = () => {
  const matchingTrials = trialsChannel.request('get').filter(trial => {
    const trialTimingIsValid = (trial.hasStarted() && !trial.hasEnded());
    const isBIGTrial = trial.get('trial_sub_type') === TRIAL_SUB_TYPE;
    return trialTimingIsValid && isBIGTrial;
  });

  if (matchingTrials.length > 1) {
    console.log(`[Warning] Multiple matching trials`);
  }
  
  return matchingTrials.length ? matchingTrials[0] : null;
};
const getDisputeTrialModel = () => {
  const matchingDisputeTrials = trialsChannel.request('get:dispute');
  return matchingDisputeTrials.length ? matchingDisputeTrials.at(0) : null;
};

const isTrialOngoing = () => {
  const trialModel = getTrialModel();
  if (!trialModel) return;
  const trialTimingIsValid = (trialModel.hasStarted() && !trialModel.hasEnded());
  return trialTimingIsValid;
};

const hasArbRatingOutcome = () => {
  const disputeTrialModel = getDisputeTrialModel();
  return disputeTrialModel && !!disputeTrialModel.getOutcomeByType(TRIAL_OUTCOME_TYPE_ARB_RATING);
};

const _addParticipantIntervention = (participantModel, interventionData={}) => {
  const disputeTrialModel = getDisputeTrialModel();
  const now = Moment().toISOString();
  return new Promise((res, rej) => {
    if (!participantModel || !disputeTrialModel) return rej();
    const existingTrialParticipant = disputeTrialModel.get('trial_participants').findWhere({ participant_id: participantModel.id });
    // Create a trial participant if one doesn't exist, otherwise just create the intervention
    const createParticipant = () => existingTrialParticipant ? Promise.resolve(existingTrialParticipant) : (
        disputeTrialModel.createTrialParticipantFromParticipant(participantModel, {
          participant_type: configChannel.request('get', 'TRIAL_PARTICIPANT_TYPE_DISPUTE_PARTICIPANT'),
          participant_selection_method: configChannel.request('get', 'TRIAL_DISPUTE_SELECTION_METHOD_OPT_IN_RANDOM'),
          participant_opted_in: true,
          start_date: now
        })
    );
    return createParticipant().then(trialParticipant => (
        disputeTrialModel.createTrialIntervention(trialParticipant, Object.assign({
          intervention_status: configChannel.request('get', 'TRIAL_INTERVENTION_STATUS_COMPLETE'),
          start_date: now,
        }, interventionData))
      ))
      .finally(res)
    });
};

const canViewArbRating = (dispute) => {
  const loggedInUser = sessionChannel.request('get:user');
  const disputeTrialModel = getDisputeTrialModel();
  if (!dispute
    || !isTrialOngoing()
    || !disputeTrialModel
    || disputeTrialModel.areOutcomesDisabled()
    || (!disputeTrialModel.isOptedIn() && !disputeTrialModel.isOptedOut())
    || !loggedInUser
    || !loggedInUser.isArbitrator()
    || loggedInUser.isAdjudicator()
  ) {
    return false;
  }
  return !hasArbRatingOutcome();
};

const addArbRatingOutcome = (arbRatingData={}) => {
  const disputeTrialModel = getDisputeTrialModel();
  const now = Moment().toISOString();
  const loggedInUser = sessionChannel.request('get:user');
  const participant_type = configChannel.request('get', 'TRIAL_PARTICIPANT_TYPE_STAFF');
  return new Promise((res, rej) => {
    if (!disputeTrialModel || !loggedInUser) return rej();
    const existingTrialParticipant = disputeTrialModel.get('trial_participants').findWhere({ system_user_id: loggedInUser.id });

    const createParticipant = () => existingTrialParticipant ? Promise.resolve(existingTrialParticipant) : (
        disputeTrialModel.createTrialParticipantFromUser(loggedInUser, {
          participant_type,
          participant_selection_method: configChannel.request('get', 'TRIAL_DISPUTE_SELECTION_METHOD_NOT_REQUIRED'),
          participant_opted_in: false,
          start_date: now
        })
    );
    return createParticipant().then(trialParticipant => (
        disputeTrialModel.createTrialOutcome(trialParticipant, Object.assign({
          outcome_type: TRIAL_OUTCOME_TYPE_ARB_RATING,
          outcome_status: configChannel.request('get', 'TRIAL_OUTCOME_STATUS_COMPLETED'),
          start_date: now
        }, arbRatingData))
      ))
      .finally(res)
    });
};

const flipCoin = function() { return  Math.random() < 0.5; };

export default {
  getTrialModel,
  getDisputeTrialModel,
  isTrialOngoing,

  getTrialsTOUHtml() {
    return TRIAL_TOU_HTML;
  },

  isOptInAllowed(disputeModel) {
    const trialModel = getTrialModel();
    const disputeHasStep1Data = !!disputeModel.get('tenancy_address');
    const disputeTimingIsValid = trialModel && Moment(disputeModel.get('created_date')).isBetween(Moment(trialModel.get('trial_start_date')), Moment(trialModel.get('trial_end_date')), 'minutes', '[]');
    return (trialModel
      && trialModel.isActive()
      && isTrialOngoing()
      && disputeTimingIsValid
      && (!disputeHasStep1Data || getDisputeTrialModel())
    );
  },

  addIntakeDisputeToTrial(disputeModel, disputeTrialData={}) {
    const trialModel = getTrialModel();
    const trialDisputeModel = getDisputeTrialModel();
    if (trialDisputeModel || !trialModel) return Promise.resolve();
    const defaultIntakeData = {
      dispute_role: configChannel.request('get', flipCoin() ? 'TRIAL_DISPUTE_ROLE_TREATMENT' : 'TRIAL_DISPUTE_ROLE_CONTROL'),
      start_date: Moment().toISOString(),
      dispute_selection_method: configChannel.request('get', 'TRIAL_DISPUTE_SELECTION_METHOD_OPT_IN_RANDOM'),
      dispute_opted_in: true,
    }
    return trialModel.createTrialDispute(disputeModel, Object.assign(defaultIntakeData, disputeTrialData));
  },

  getIntakeTrialRole() {
    // Only show in certain build environments (dev, staging))
    const UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    const SHOW_TRIALS_INTAKE_CONTROL = UAT_TOGGLING.SHOW_TRIALS_INTAKE_CONTROL;
    return new Promise(res => {
      let isTreatment = false;
      const getRole = () => configChannel.request('get', isTreatment ? 'TRIAL_DISPUTE_ROLE_TREATMENT' : 'TRIAL_DISPUTE_ROLE_CONTROL');

      if (SHOW_TRIALS_INTAKE_CONTROL) {
        const modalView = modalChannel.request('show:standard', {
          title: 'UAT Trial Control',
          bodyHtml: `<p>On UAT sites you can set whether an opt-in dispute file will be part of the treatment group or the control group. Once set this value cannot be modified. This feature will not appear on preprod or production environments.</p>`,
          hideHeaderX: true,
          primaryButtonText: 'Set as Treatment',
          cancelButtonText: 'Set as Control',
          onContinueFn(_modalView) {
            isTreatment = true;
            _modalView.close();
          }
        });
        modalView.once('removed:modal', () => res(getRole()));
      } else {
        isTreatment = flipCoin();
        res(getRole());
      }
    });
  },

  canViewIntakeCarousel() {
    const disputeTrial = getDisputeTrialModel();
    if (!isTrialOngoing()
      || !disputeTrial
      || !disputeTrial.isTreatment()
      || hasArbRatingOutcome()
    ) {
      return false;
    }
    
    const intevention = disputeTrial.get('trial_interventions').find(intervention => (
      intervention.get('intervention_type') === TRIAL_INTERVENTION_TYPE_INTAKE_CAROUSEL
    ));
    return !intevention;
  },

  canViewDisputeAccessCarousel(dispute) {
    const disputeTrial = getDisputeTrialModel();
    if (!dispute
      || !dispute.get('tokenParticipantId')
      || !isTrialOngoing()
      || !disputeTrial
      || !disputeTrial.isTreatment()
      || hasArbRatingOutcome()
    ) {
      return false;
    }
    
    const trialParticipant = disputeTrial.get('trial_participants').findWhere({ participant_id: dispute.get('tokenParticipantId') });
    if (!trialParticipant) return true;

    // Was an Intake or DA evidence carousel already shown to this user?
    return !disputeTrial.get('trial_interventions').find(intervention => (
      intervention.get('trial_participant_guid') === trialParticipant.id &&
      [TRIAL_INTERVENTION_TYPE_INTAKE_CAROUSEL, TRIAL_INTERVENTION_TYPE_DA_CAROUSEL].includes(intervention.get('intervention_type'))
    ));
  },

  canViewIntakeOutcome(dispute) {
    const disputeTrial = getDisputeTrialModel();
    if (!dispute
      || !disputeTrial
      || disputeTrial.areOutcomesDisabled()
      || !isTrialOngoing()
      || !disputeTrial.isOptedIn()
      || hasArbRatingOutcome()
    ) {
      return false;
    }
    
    const outcome = disputeTrial.getOutcomeByType(TRIAL_OUTCOME_TYPE_INTAKE_RATING);
    return !outcome;
  },

  canViewDisputeAccessEvidenceNudgeInterventions(dispute, participantModel) {
    const disputeTrial = getDisputeTrialModel();
    if (!dispute
      || !participantModel
      || !isTrialOngoing()
      || !disputeTrial
      || !disputeTrial.isTreatment()
      || hasArbRatingOutcome()
    ) {
      return false;
    }
    
    const trialParticipant = disputeTrial.get('trial_participants').findWhere({ participant_id: participantModel.id });
    if (!trialParticipant) return true;

    return !disputeTrial.get('trial_interventions').find(intervention => (
      intervention.get('trial_participant_guid') === trialParticipant.id &&
      TRIAL_INTERVENTION_TYPE_DA_EVIDENCE_NUDGE === intervention.get('intervention_type')
    ));
  },

  canViewIntakeEvidenceNudgeInterventions(dispute, participantModel) {
    const disputeTrial = getDisputeTrialModel();
    if (!dispute
      || !participantModel
      || !isTrialOngoing()
      || !disputeTrial
      || !disputeTrial.isTreatment()
      || hasArbRatingOutcome()
    ) {
      return false;
    }
    
    const trialParticipant = disputeTrial.get('trial_participants').findWhere({ participant_id: participantModel.id });
    if (!trialParticipant) return true;

    return !disputeTrial.get('trial_interventions').find(intervention => (
      intervention.get('trial_participant_guid') === trialParticipant.id &&
      TRIAL_INTERVENTION_TYPE_INTAKE_EVIDENCE_NUDGE === intervention.get('intervention_type')
    ));
  },

  addIntakeParticipantInterventionCarousel(participantModel) {
    return _addParticipantIntervention(participantModel, {
      intervention_type: TRIAL_INTERVENTION_TYPE_INTAKE_CAROUSEL
    });
  },

  addIntakeParticipantInterventionEvidence(participantModel) {
    return _addParticipantIntervention(participantModel, {
      intervention_type: TRIAL_INTERVENTION_TYPE_INTAKE_EVIDENCE_NUDGE
    });
  },

  addDisputeAccessParticipantInterventionCarousel(participantModel) {
    return _addParticipantIntervention(participantModel, {
      intervention_type: TRIAL_INTERVENTION_TYPE_DA_CAROUSEL
    });
  },

  addDisputeAccessParticipantInterventionEvidence(participantModel) {
    return _addParticipantIntervention(participantModel, {
      intervention_type: TRIAL_INTERVENTION_TYPE_DA_EVIDENCE_NUDGE
    });
  },

  addIntakeRatingOutcome(participantModel, intakeRatingData={}) {
    if (!participantModel) return Promise.reject();
    const disputeTrialModel = getDisputeTrialModel();
    const now = Moment().toISOString();

    return new Promise((res, rej) => {
      if (!participantModel || !disputeTrialModel) return rej();
      const existingTrialParticipant = disputeTrialModel.get('trial_participants').findWhere({ participant_id: participantModel.id });
      // Create a trial participant if one doesn't exist, otherwise just create the outcome
      const createParticipant = () => existingTrialParticipant ? Promise.resolve(existingTrialParticipant) : (
          disputeTrialModel.createTrialParticipantFromParticipant(participantModel, {
            participant_type: configChannel.request('get', 'TRIAL_PARTICIPANT_TYPE_DISPUTE_PARTICIPANT'),
            participant_selection_method: configChannel.request('get', 'TRIAL_DISPUTE_SELECTION_METHOD_OPT_IN_RANDOM'),
            participant_opted_in: true,
            start_date: now
          })
      );
      return createParticipant().then(trialParticipant => (
        disputeTrialModel.createTrialOutcome(trialParticipant, Object.assign({
          outcome_type: TRIAL_OUTCOME_TYPE_INTAKE_RATING,
          outcome_status: configChannel.request('get', 'TRIAL_OUTCOME_STATUS_COMPLETED'),
          start_date: now
        }, intakeRatingData))
        .finally(res)
      ));
    });
  },

  checkAndShowArbWarning(disputeModel) {
    if (canViewArbRating(disputeModel)) {
      const trialModalView = new ModalArbRating();
      trialModalView.once('continue', (outcomeData) => {
        loaderChannel.trigger('page:load');
        trialModalView.close();
        addArbRatingOutcome(outcomeData).finally(() => {
          loaderChannel.trigger('page:load:complete');
        });
      });
      modalChannel.request('add', trialModalView);
    }
  },

  saveDisputeTrialAsDirectRequest() {
    // Convert DRs in trial to control, with outcomes suppressed
    const disputeTrialModel = getDisputeTrialModel();
    if (!disputeTrialModel) return Promise.resolve();
    disputeTrialModel.set({
      dispute_trial_status: configChannel.request('get', 'TRIAL_DISPUTE_STATUS_NO_OUTCOMES'),
      dispute_role: configChannel.request('get', 'TRIAL_DISPUTE_ROLE_CONTROL')
    });
    return new Promise((res, rej) => disputeTrialModel.save(disputeTrialModel.getApiChangesOnly()).done(res).fail(rej));
  },

  saveDisputeTrialAsStandard() {
    // Set trial outcomes bacck to visible
    const disputeTrialModel = getDisputeTrialModel();
    if (!disputeTrialModel) return Promise.resolve();
    disputeTrialModel.set({ dispute_trial_status: configChannel.request('get', 'TRIAL_DISPUTE_STATUS_STANDARD') });
    return new Promise((res, rej) => disputeTrialModel.save(disputeTrialModel.getApiChangesOnly()).done(res).fail(rej));
  }

};