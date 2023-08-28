using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Database;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CsvHelper;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using Serilog;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services;

public class ScheduledAdHocReport : IScheduledAdHocReport
{
    private readonly AdHocReportContext _adHocReportContext;
    private readonly ILogger _logger;
    private readonly IMapper _mapper;
    private readonly RtbDmsContext _rtbDmsContext;
    private readonly DataWarehouseContext _dataWarehouseContext;
    private readonly PostedDecisionContext _postedDecisionContext;

    public ScheduledAdHocReport(
        IMapper mapper,
        AdHocReportContext adHocReportContext,
        RtbDmsContext rtbDmsContext,
        DataWarehouseContext dataWarehouseContext,
        PostedDecisionContext postedDecisionContext,
        ILogger logger)
    {
        _mapper = mapper;
        _logger = logger;
        _adHocReportContext = adHocReportContext;
        _rtbDmsContext = rtbDmsContext;
        _dataWarehouseContext = dataWarehouseContext;
        _postedDecisionContext = postedDecisionContext;
    }

    public async Task RunAdHocReport(Models.AdHocReport adHocReport)
    {
        if (string.IsNullOrWhiteSpace(adHocReport.EmailTo))
        {
            _logger.Warning("EmailTo should not be empty");
            return;
        }

        var adHocReportAttachments = await QueryableExtensions.ToListAsync(_adHocReportContext.AdHocReportAttachments
                .Where(x => x.AdHocReportId == adHocReport.AdHocReportId && x.IsActive));

        if (adHocReportAttachments.Any())
        {
            var emailConfiguration = await EmailConfiguration.GetConfiguration(_rtbDmsContext);

            var attachmentsSet = new Dictionary<string, byte[]>();

            foreach (var item in adHocReportAttachments)
            {
                var context = GetContext(item.TargetDatabase);
                var caption = GetAdHocReportName(item, context);
                var useExcel = false;

                if (item.ExcelTemplateExists.HasValue &&
                    item.ExcelTemplateExists.Value &&
                    item.ExcelTemplateId.HasValue)
                {
                    var templateFileResponse = await GetTemplateFile(item.ExcelTemplateId);
                    if (templateFileResponse is { FileType: (byte)FileType.ExcelDlReport })
                    {
                        caption = Path.ChangeExtension(caption, "xlsx");
                        useExcel = true;
                    }
                }

                var report = await GetAdHocReport(item, context, useExcel);

                if (report != null)
                {
                    attachmentsSet.Add(caption, report);
                }
            }

            if (attachmentsSet.Any())
            {
                var success = await SendMail(adHocReport, attachmentsSet, emailConfiguration);
                await TrackEmailActivity(adHocReport, success);
                return;
            }
        }

        await TrackEmailActivity(adHocReport, AdHocReportStatus.Idle);
    }

    public async Task<List<AdHocDlReportResponse>> GetListAsync()
    {
        var reports = await _adHocReportContext.AdHocDlReports
            .Where(x => x.IsActive)
            .ToListAsync();
        return _mapper.Map<List<AdHocDlReportResponse>>(reports);
    }

    public async Task<AdHocDlReportResponse> GetById(int id)
    {
        var report = await _adHocReportContext.AdHocDlReports
            .SingleOrDefaultAsync(x => x.AdHocDlReportId == id && x.IsActive);
        return _mapper.Map<AdHocDlReportResponse>(report);
    }

    public string GetAdHocReportName(AdHocDlReportResponse adHocDlReport)
    {
        return _rtbDmsContext.ScalarFromSql(adHocDlReport.QueryForName, null);
    }

    public async Task<byte[]> GetAdHocReportBytes(AdHocDlReportResponse adHocDlReport, AdHocReportRequest request, List<dynamic> parameters = null)
    {
        var context = GetContext(adHocDlReport.TargetDatabase);
        var items = context.CollectionFromSql(adHocDlReport.QueryForReport, parameters).ToList();
        var memoryStream = new MemoryStream();

        if (request.UseExcelTemplate)
        {
            await WriteToExcel(adHocDlReport.ExcelTemplateId, items, memoryStream);
        }
        else
        {
            await using var writer = new StreamWriter(memoryStream);
            await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
            await csv.WriteRecordsAsync(items);
        }

        memoryStream.Flush();

        return memoryStream.ToArray();
    }

    public async Task<CommonFile> GetTemplateFile(AdHocDlReportResponse adHocDlReport)
    {
        var templateFileResponse = await _rtbDmsContext
            .CommonFiles
            .FirstOrDefaultAsync(x => x.CommonFileId == adHocDlReport.ExcelTemplateId.GetValueOrDefault());

        return templateFileResponse;
    }

    public async Task<CommonFile> GetTemplateFile(int? excelTemplateId)
    {
        var templateFileResponse = await _rtbDmsContext
            .CommonFiles
            .FirstOrDefaultAsync(x => x.CommonFileId == excelTemplateId.GetValueOrDefault());

        return templateFileResponse;
    }

    private async Task WriteToExcel(int? excelTemplateId, List<dynamic> items, Stream memoryStream)
    {
        var root = await GetSetting(SettingKeys.CommonFileStorageRoot);
        var tempRoot = await GetSetting(SettingKeys.TempStorageRoot);
        var templateFileResponse = await GetTemplateFile(excelTemplateId);

        var fullPath = Path.Combine(root.Value, templateFileResponse.FilePath);
        var tempFullPath = Path.Combine(tempRoot.Value, Guid.NewGuid() + "-tempForAdHocExcelReport.xlsx");

        File.Copy(fullPath, tempFullPath, true);

        try
        {
            using (var spreadsheetDocument = SpreadsheetDocument.Open(tempFullPath, true))
            {
                if (spreadsheetDocument.WorkbookPart?.Workbook.Sheets != null)
                {
                    var workbookPart = spreadsheetDocument.WorkbookPart;
                    var sheetCollection = workbookPart.Workbook.GetFirstChild<Sheets>();
                    var theSheet = sheetCollection?.GetFirstChild<Sheet>();

                    if (theSheet != null && theSheet.Id != null)
                    {
                        var worksheet = ((WorksheetPart)workbookPart.GetPartById(theSheet.Id)).Worksheet;
                        var sheetData = worksheet.GetFirstChild<SheetData>();

                        if (sheetData != null)
                        {
                            for (var j = 0; j < items.Count; j++)
                            {
                                var rowItem = (ExpandoObject)items[j];

                                var newRow = new Row { RowIndex = (uint)j + 2 };

                                for (var k = 0; k < rowItem.Count(); k++)
                                {
                                    var cellObject = rowItem.ElementAt(k).Value;
                                    if (cellObject == null)
                                    {
                                        continue;
                                    }

                                    var cellText = cellObject.ToString() ?? string.Empty;
                                    var newCell = new Cell
                                    {
                                        DataType = CellValues.InlineString,
                                        InlineString = new InlineString { Text = new Text(cellText) }
                                    };
                                    newRow.AppendChild(newCell);
                                    workbookPart.Workbook.Save();
                                }

                                sheetData.AppendChild(newRow);
                                workbookPart.Workbook.Save();
                            }
                        }
                    }

                    workbookPart.Workbook.Save();
                    spreadsheetDocument.Dispose();
                }
            }

            await using (var fileStream = new FileStream(tempFullPath, FileMode.Open))
            {
                await fileStream.CopyToAsync(memoryStream);
                fileStream.Close();
            }

            if (File.Exists(tempFullPath))
            {
                File.Delete(Path.Combine(tempFullPath));
            }
        }
        catch (Exception e)
        {
            _logger.Error(e, "Excel Template");
        }
    }

    private DbContext GetContext(TargetDatabase targetDatabase)
    {
        return targetDatabase switch
        {
            TargetDatabase.RtbDms => _rtbDmsContext,
            TargetDatabase.DataWarehouse => _dataWarehouseContext,
            TargetDatabase.PostedDecision => _postedDecisionContext,
            _ => _rtbDmsContext
        };
    }

    private async Task<AdHocReportStatus> SendMail(Models.AdHocReport adHocReport, Dictionary<string, byte[]> attachments, EmailConfiguration smtpConfiguration)
    {
        using var client = new SmtpClient();

        try
        {
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(adHocReport.EmailSubject, adHocReport.EmailFrom));
            mimeMessage.To.Add(MailboxAddress.Parse(adHocReport.EmailTo));

            mimeMessage.Subject = adHocReport.EmailSubject;

            var builder = new BodyBuilder { HtmlBody = adHocReport.EmailBody };

            foreach (var(key, value) in attachments)
            {
                builder.Attachments.Add(key, value);
            }

            mimeMessage.Body = builder.ToMessageBody();

            client.ServerCertificateValidationCallback = (_, _, _, _) => true;

            client.Timeout = smtpConfiguration.Timeout;

            await client.ConnectAsync(smtpConfiguration.Host, smtpConfiguration.Port);

            if (!string.IsNullOrWhiteSpace(smtpConfiguration.User) && !string.IsNullOrWhiteSpace(smtpConfiguration.Password))
            {
                await client.AuthenticateAsync(smtpConfiguration.User, smtpConfiguration.Password);
            }

            await client.SendAsync(mimeMessage);

            await client.DisconnectAsync(true);
        }
        catch (Exception exc)
        {
            _logger.Error(exc, "SMTP Exception");

            return AdHocReportStatus.Failed;
        }

        return AdHocReportStatus.Sent;
    }

    private async Task TrackEmailActivity(Models.AdHocReport adHocReport, AdHocReportStatus adHocReportStatus)
    {
        var adHocReportTracking = new AdHocReportTracking
        {
            AdHocReportId = adHocReport.AdHocReportId,
            SentDate = DateTime.UtcNow,
            Status = adHocReportStatus
        };

        _adHocReportContext.AdHocReportsTracking.Add(adHocReportTracking);
        await _adHocReportContext.SaveChangesAsync();
    }

    private async Task<SystemSettings> GetSetting(string key)
    {
        var setting = await _rtbDmsContext.SystemSettings.SingleOrDefaultAsync(s => s.Key == key);
        return setting;
    }

    private string GetAdHocReportName(AdHocReportAttachment adHocReportAttachment, DbContext context)
    {
        return context.ScalarFromSql(adHocReportAttachment.QueryForName, null);
    }

    private async Task<byte[]> GetAdHocReport(
        AdHocReportAttachment adHocReportAttachment,
        DbContext context,
        bool useExcelTemplate = false,
        List<object> parameters = null)
    {
        var items = context.CollectionFromSql(adHocReportAttachment.QueryForAttachment, parameters).ToList();

        if (!items.Any())
        {
            return null;
        }

        var memoryStream = new MemoryStream();

        if (useExcelTemplate)
        {
            await WriteToExcel(adHocReportAttachment.ExcelTemplateId, items, memoryStream);
        }

        await using (var writer = new StreamWriter(memoryStream))
        {
            await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
            await csv.WriteRecordsAsync(items);
        }

        memoryStream.Flush();

        return memoryStream.ToArray();
    }
}