import Radio from 'backbone.radio';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import InputModel from '../../../../core/components/input/Input_model';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const DROPDOWN_CODE_NO = '1';
const DROPDOWN_CODE_YES = '2';

const NOTICE_DELIVERED_DEFAULT_TEXT = 'Notice Delivered To';
const NOTICE_DELIVERED_RTB_TEXT = 'Notice Provided To';

const filesChannel = Radio.channel('files');
const participantsChannel = Radio.channel('participants');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const noticeChannel = Radio.channel('notice');
const hearingChannel = Radio.channel('hearings');
const sessionChannel = Radio.channel('session');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default {

  /**
   * Creates the following UI models:
   * packageProvidedModel - DropdownModel
   * noticeDeliveryTo - DropdownModel
   * noticeDeliveryModel - InputModel
   * deliveryDateModel - InputModel
   * deliveryTimeModel - InputModel
   */
  createPackageProvidedUiModels() {
    const servedByRTB = this.model.isServedByRTB();

    this.packageProvidedModel = new DropdownModel({
      optionData: [{ value: DROPDOWN_CODE_NO, text: 'No' }, { value: DROPDOWN_CODE_YES, text: 'Yes' }],
      labelText: 'Package provided',
      value: this.model.get('notice_delivered_to') ? DROPDOWN_CODE_YES : DROPDOWN_CODE_NO,
      required: true,
    });
    const isPackageProvided = this.packageProvidedModel.getData() === DROPDOWN_CODE_YES;
    const delivery_method = this.model.get('notice_delivery_method');
    
    this.noticeDeliveryTo = new DropdownModel({
      optionData: this._getDeliveryToOptions(),
      labelText: servedByRTB ? NOTICE_DELIVERED_RTB_TEXT : NOTICE_DELIVERED_DEFAULT_TEXT,
      value: this.model.get('notice_delivered_to') ? String(this.model.get('notice_delivered_to')) : null,
      apiMapping: 'notice_delivered_to',
      defaultBlank: true,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.servedByRTBModel = new CheckboxModel({
      html: 'Served By RTB',
      required: false,
      checked: servedByRTB,
      disabled: !isPackageProvided,
    });

    this.noticeDeliveryModel = new DropdownModel({
      optionData: this._getDeliveryOptions({ servedByRTB }),
      labelText: 'Notice Delivery Method',
      value: delivery_method ? String(delivery_method) : null,
      apiMapping: 'notice_delivery_method',
      defaultBlank: true,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.deliveryDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      value: this.model.get('notice_delivered_date') ? Moment(this.model.get('notice_delivered_date')).format(InputModel.getDateFormat()) : null,
      labelText: 'Notice Delivery Date',
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.deliveryTimeModel = new InputModel({
      inputType: 'time',
      value: this.model.get('notice_delivered_date') ? Moment(this.model.get('notice_delivered_date')).format(InputModel.getTimeFormat()) : null,
      labelText: 'Delivery Time',
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.noticeOtherDeliveryDescriptionModel = new InputModel({
      inputType: 'text',
      value: this.model.get('notice_delivered_to_other') || null,
      maxLength: 100,
      labelText: 'Other Delivery Description',
      required: isPackageProvided && this.servedByRTBModel.getData(),
      apiMapping: 'notice_delivered_to_other'
    });
  },

  setupPackageProvidedUiModelListeners() {
    this.listenTo(this.packageProvidedModel, 'change:value', () => {
      if (this.packageProvidedModel.getData() === DROPDOWN_CODE_NO) {
        this.noticeDeliveryModel.set({ optionData: [], value: null, disabled: true, required: false });
        this.noticeDeliveryTo.set({ value: null, disabled: true, required: false  });
        this.servedByRTBModel.set({ checked: null, disabled: true});
        this.deliveryDateModel.set({ value: null, disabled: true, required: false });
        this.deliveryTimeModel.set({ value: null, disabled: true, required: false });
      } else {
        this.noticeDeliveryModel.set({
          optionData: this._getDeliveryOptions(),
          value: this.model.get('notice_delivery_method') ? this.model.get('notice_delivery_method') : null,
          disabled: false,
          required: true
        });
  
        this.noticeDeliveryTo.set({
          value: this.model.get('notice_delivered_to'),
          disabled: false,
          required: true
        });

        this.servedByRTBModel.set({ disabled: false });
  
        const dateToUse = this.model.get('notice_delivered_date') || Moment();
        this.deliveryDateModel.set({
          value: Moment(dateToUse).format(InputModel.getDateFormat()),
          disabled: false,
          required: true
        });
        this.deliveryTimeModel.set({
          value: Moment(dateToUse).format(InputModel.getTimeFormat()),
          disabled: false,
          required: true
        });
      }
  
      _.each([this.noticeDeliveryModel, this.noticeDeliveryTo, this.servedByRTBModel, this.deliveryDateModel, this.deliveryTimeModel], function(model) {
        model.trigger('render');
      });
    },);

    this.listenTo(this.servedByRTBModel, 'change:checked', (model, isChecked) => {
      if (isChecked) this.noticeDeliveryTo.set({ labelText: NOTICE_DELIVERED_RTB_TEXT });
      else this.noticeDeliveryTo.set({ labelText: NOTICE_DELIVERED_DEFAULT_TEXT });
      
      this.noticeDeliveryModel.set({ value: null, optionData: this._getDeliveryOptions({ servedByRTB: isChecked }) });
      this.noticeDeliveryModel.trigger('render');
      this.noticeDeliveryTo.trigger('render');
    });

    this.listenTo(this.noticeDeliveryModel, 'change:value', (model, value) => {
      if (!this.getUI('noticeOtherDeliveryDescription')) return;

      if (value === String(configChannel.request('get', 'NOTICE_DELIVERY_TYPE_OTHER'))) {
        this.getUI('noticeOtherDeliveryDescription').removeClass('hidden');
      }
      else {
        this.noticeOtherDeliveryDescriptionModel.set({ value: null });
        this.noticeOtherDeliveryDescriptionModel.trigger('render');
        this.getUI('noticeOtherDeliveryDescription').addClass('hidden');
      }
    })
  },

  resetPackageProvidedUiModels() {
    this.packageProvidedModel.set({
      value: this.model.get('notice_delivered_to') ? DROPDOWN_CODE_YES : DROPDOWN_CODE_NO,
      required: true,
    });
    const isPackageProvided = this.packageProvidedModel.getData() === DROPDOWN_CODE_YES;
    const delivery_method = this.model.get('notice_delivery_method');
    
    this.noticeDeliveryTo.set({
      value: this.model.get('notice_delivered_to') ? String(this.model.get('notice_delivered_to')) : null,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.servedByRTBModel.set({
      checked: this.model.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_EMAIL_AND_MAIL') || this.model.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_OTHER'),
      disabled: !isPackageProvided,
    });
    
    this.noticeDeliveryModel.set({
      value: delivery_method ? String(delivery_method) : null,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.deliveryDateModel.set({
      value: this.model.get('notice_delivered_date') ? Moment(this.model.get('notice_delivered_date')).format(InputModel.getDateFormat()) : null,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });

    this.deliveryTimeModel.set({
      value: this.model.get('notice_delivered_date') ? Moment(this.model.get('notice_delivered_date')).format(InputModel.getTimeFormat()) : null,
      required: isPackageProvided,
      disabled: !isPackageProvided
    });
  },


  getPackageProvidedApiChanges() {
    const isPackageProvided = this.packageProvidedModel && this.packageProvidedModel.getData() === DROPDOWN_CODE_YES;
    return Object.assign({
        notice_delivered_date: isPackageProvided ?
          Moment(`${this.deliveryDateModel.getData({ format: 'date' })}T${this.deliveryTimeModel.getData({ iso: true })}`).toISOString()
          : null
      },
      this.noticeDeliveryModel.getPageApiDataAttrs(),
      this.noticeDeliveryTo.getPageApiDataAttrs(),
      this.noticeOtherDeliveryDescriptionModel.getPageApiDataAttrs()
    );
  },

  _getDeliveryOptions( options= { servedByRTB: false }) {
    const SERVED_BY_RTB_DELIVERY_TYPES = [configChannel.request('get', 'NOTICE_DELIVERY_TYPE_EMAIL_AND_MAIL'), configChannel.request('get', 'NOTICE_DELIVERY_TYPE_OTHER')];
    const SERVED_BY_DEFAULT_DELIVERY_TYPES = [
      configChannel.request('get', 'NOTICE_DELIVERY_TYPE_EMAIL'),
      configChannel.request('get', 'NOTICE_DELIVERY_TYPE_PICKUP'),
      configChannel.request('get', 'NOTICE_DELIVERY_TYPE_MAIL'),
      configChannel.request('get', 'NOTICE_DELIVERY_TYPE_FAX'),
      configChannel.request('get', 'NOTICE_DELIVERY_TYPE_USER'),
    ]
    let NOTICE_DELIVERY_TYPES_DISPLAY = configChannel.request('get', 'NOTICE_DELIVERY_TYPES_DISPLAY') || {};

    if (!options.servedByRTB) NOTICE_DELIVERY_TYPES_DISPLAY = _.omit(NOTICE_DELIVERY_TYPES_DISPLAY, SERVED_BY_RTB_DELIVERY_TYPES);
    else NOTICE_DELIVERY_TYPES_DISPLAY = _.omit(NOTICE_DELIVERY_TYPES_DISPLAY, SERVED_BY_DEFAULT_DELIVERY_TYPES);

    return Object.entries(NOTICE_DELIVERY_TYPES_DISPLAY).map( ([value, text]) => ({ value, text }) );
  },

  _getDeliveryToOptions() {
    const noticeAssociatedTo = this.model.get('notice_associated_to') ? String(this.model.get('notice_associated_to')) : null;
    const isAssociatedtoRespondents = noticeAssociatedTo === String(configChannel.request('get', 'NOTICE_ASSOCIATED_TO_RESPONDENT') || '');
    const requestString = `get:${isAssociatedtoRespondents ? 'respondents' : 'applicants'}`;
    return participantsChannel.request(requestString).sortBy(p =>p.isPrimary()?0:1).map(model => (
      { value: String(model.get('participant_id')), text: `${model.getDisplayName()}${model.isPrimary()?' [Primary]':''}` }));
  },

  _getDeficientReason() {
    const selectedReason = this.deficientReasonModel ? this.deficientReasonModel.getData() : '-';
    return `Notice record replaced by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${selectedReason}`;
  },

  // If a file description exists, mark it as deficient and unlink it from the notice object
  checkAndCleanupExistingFileDescription() {
    if (!this.model.get('notice_file_description_id')) {
      return $.Deferred().resolve().promise();
    }

    const existingFileDescription = this.model.getNoticeFileDescription();
    if (existingFileDescription) {
      existingFileDescription.markAsDeficient(this._getDeficientReason());
    }
    this.model.set('notice_file_description_id', null);

    return $.whenAll(
      existingFileDescription ? existingFileDescription.save(existingFileDescription.getApiChangesOnly()) : $.Deferred().resolve().promise(),
      this.model.isNew() ? this.model.save({ notice_file_description_id: null }) : $.Deferred().resolve().promise()
    );
  },


  cleanupExistingFileDescriptionAndSaveNewNoticeFileDescription() {
    const noticeFileDescription = this.model.createNoticeFileDescription({
      description_by: participantsChannel.request('get:primaryApplicant:id')
    });

    const dfd = $.Deferred();
    this.checkAndCleanupExistingFileDescription()
      .done(() => {
        noticeFileDescription.save()
          .done(() => {
            filesChannel.request('add:filedescription', noticeFileDescription);
            this.model.set({ notice_file_description_id: noticeFileDescription.id })
            dfd.resolve(noticeFileDescription)
          })
          .fail(dfd.reject);
      }).fail(dfd.reject);
    return dfd.promise();
  },

  saveInternalDataToNotice(noticeSaveAttrs) {
    const dispute = disputeChannel.request('get');
    const activeHearing = hearingChannel.request('get:active');

    // If we are replacing the file, make sure to set provision fields to empty:
    if (this.isRegenerationMode) {
      this.model.set(
        Object.assign({
          notice_delivered_to: null,
          notice_delivery_method: null,
          // Change delivered_date to null, but it can be overriden with a real value later in this function if it's passed in noticeSaveAttrs
          notice_delivered_date: null
        },
      ));
    }

    this.model.set(
      Object.assign({
          hearing_type: dispute.getProcess(),
        },
        activeHearing && !this.model.isAmendmentNotice() && !dispute.isNonParticipatory() ? { hearing_id: activeHearing.id } : {},
        this.parentNoticeModel ? { notice_associated_to: this.parentNoticeModel.get('notice_associated_to') } : {},
        noticeSaveAttrs
      )
    );
  },

  performNoticeGeneration(pdfTitle, pdfHtml, noticeFileDescriptionModel, onSuccessFn=null, isNoticeNew=false) {
    console.log(`[INFO] Starting notice generation of ${pdfTitle}`);
    console.log(`[INFO] html`, $(pdfHtml));
    const dfd = $.Deferred();
    const pdf_data = {
      file_title: pdfTitle,
      html_for_pdf: pdfHtml,
      version_number: this.model.get('notice_version')
    };
    filesChannel.request('upload:pdf', disputeChannel.request('get:id'), pdf_data)
      .done(pdfFileModel => {
        if (!pdfFileModel) {
          loaderChannel.trigger('page:load:complete');
          // Create an empty handler just to show the error message:
          const handler = generalErrorFactory.createHandler('ADMIN.PDF.GENERATE', () => dfd.reject());
          handler();
          return;
        }

        filesChannel.request('create:linkfile', pdfFileModel, noticeFileDescriptionModel)
          .done(() => {
            _.isFunction(onSuccessFn) ? onSuccessFn() : this.onNoticeModelSaveSuccess();
            dfd.resolve();
          })
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.LINKFILE.CREATE', () => dfd.reject(err));
            handler(err);
          });
      })
      .fail(err => {
        const showErrMsg = () => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.PDF.GENERATE');
          handler(err);
        };
        if (isNoticeNew) {
          this.model.fullDelete().always(showErrMsg);
        } else {
          showErrMsg();
        }
      });
    return dfd.promise();
  },

  prepareFileUploads(fileUploader, fileData) {
    fileUploader.files.each(function(fileModel) {
      fileModel.set(fileData);
    });
  },

  performNoticeUpload() {
    this.cleanupExistingFileDescriptionAndSaveNewNoticeFileDescription()
      .done(noticeFileDescriptionModel => {
        if (!noticeFileDescriptionModel) {
          alert("Notice file upload setup failed.");
          loaderChannel.trigger('page:load:complete');
          return;
        }

        this.fileUploader.file_description = noticeFileDescriptionModel;
        // NOTE: We want to NOT show page loader when uploading files, because they have their own loaders
        loaderChannel.trigger('page:load:complete');
        this.fileUploader.uploadAddedFiles()
          .done(() => {
            loaderChannel.trigger('page:load');
            this.model.save()
              .done(() => this.onNoticeModelSaveSuccess())
              .fail(err => {
                loaderChannel.trigger('page:load:complete');
                const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.SAVE');
                handler(err);
              });
          }).fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.FILES.UPLOAD');
            handler(err);
          });
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.CLEANUP');
        handler(err);
      });
  },

  onNoticeModelSaveSuccess() {
    const onCompleteFn = () => {
      if (this.isRegenerationMode) {
        this.model.trigger('notice:regenerated');
      } else {
        this.model.trigger('notice:added');
      }
      this.close();
    };
    noticeChannel.request('update:dispute:notice')
      .done(onCompleteFn)
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', onCompleteFn);
        handler(err);
      });
  }
};