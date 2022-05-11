
import WebLink from '../../../../core/components/web-link/WebLink';

// Config items for Intake Applicants page question items
export default {

  applicantCount: {
    type: 'question',
    question_name: 'ARI_S2_ApplicantCount',
    page_item_options(questionModel) {
      const question_answer = questionModel.getData();
      return {
        stepText: 'How many applicants are there in this dispute?',
        stepComplete: question_answer !== null && !_.isNaN(parseInt(question_answer))
      };
    },
    question_options: {
      required: true,
      optionData: [{ name: 'applicant-count-1', value: "1", cssClass: 'option-button yes-no', text: '1'},
          { name: 'applicant-count-2', value: "2", cssClass: 'option-button yes-no', text: '2'},
          { name: 'applicant-count-3', value: "3", cssClass: 'option-button yes-no', text: '3'},
          { name: 'applicant-count-more', value: "more", cssClass: 'option-link', text: 'more than 3'}]
    }
  },

  hasAgent: {
    type: 'question',
    question_name: 'ARI_S2_HasAgent',
    page_item_options(questionModel) {
      const link_data = {
        url: 'http://www2.gov.bc.ca/gov/content/housing-tenancy/residential-tenancies/apply-online/prepare-for-your-hearing#Agents',
        text: 'Click here to learn more'
      };
      return {
        stepText: 'Are the applicant(s) using an agent, advocate or assistant?',
        stepComplete: questionModel.get('question_answer') !== null,
        helpHtml: `You may have an agent or lawyer to represent you or an advocate to assist you. ${WebLink.format(link_data)}`
      };
    },
    question_options: {
      required: true,
      optionData: [
        { name: 'has-agent-no', value: "0", cssClass: 'option-button yes-no', text: 'No'},
        { name: 'has-agent-yes', value: "1", cssClass: 'option-button yes-no', text: 'Yes'}
      ],
    }
  },

  assistantCount: {
    type: 'question',
    question_name: 'ARI_S2_AssistantCount',
    page_item_options(questionModel) {
      const question_answer = questionModel.getData();
      return {
        stepText: 'How many agents, advocates or assistants are helping the applicant?',
        stepComplete: question_answer !== null && !_.isNaN(parseInt(question_answer))
      };
    },
    question_options: {
      required: true,
      optionData: [{ name: 'assistant-count-1', value: "1", cssClass: 'option-button yes-no', text: '1'},
          { name: 'assistant-count-2', value: "2", cssClass: 'option-button yes-no', text: '2'},
          { name: 'assistant-count-3', value: "3", cssClass: 'option-button yes-no', text: '3'},
          { name: 'assistant-count-more', value: "more", cssClass: 'option-link', text: 'more than 3'}]
    }
  }
};
