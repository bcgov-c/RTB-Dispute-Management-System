using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.EntityFramework;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CsvHelper;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Controllers;

[Produces(Application.Json)]
[Route("adhocreport")]
public class AdHocReportController : Controller
{
    private readonly AdHocReportContext _context;
    private readonly RtbDmsContext _contextRtbDms;
    private readonly IMapper _mapper;

    public AdHocReportController(AdHocReportContext context, RtbDmsContext contextRtbDms, IMapper mapper)
    {
        _context = context;
        _contextRtbDms = contextRtbDms;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> GetList()
    {
        var reports = await _context.AdHocDlReports
            .Where(x => x.IsActive)
            .ToListAsync();
        return Ok(_mapper.Map<List<AdHocDlReportResponse>>(reports));
    }

    [HttpGet("{adHocDlReportId:int}")]
    public async Task<IActionResult> Get(int adHocDlReportId, AdHocReportRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var report = await _context.AdHocDlReports
            .SingleOrDefaultAsync(x => x.AdHocDlReportId == adHocDlReportId && x.IsActive);

        if (report == null)
        {
            return BadRequest("The provided adHocDlReportId is not a valid active ID");
        }

        var contentDisposition = new ContentDispositionHeaderValue(ContentDisposition.Attachment);
        var reportName = _contextRtbDms.ScalarFromSql(report.QueryForName, null);

        if (request.UseExcelTemplate)
        {
            if (!report.ExcelTemplateId.HasValue)
            {
                return BadRequest("This report is not associated to an excel template in the common files");
            }

            var templateFileResponse = await _contextRtbDms
                .CommonFiles
                .FirstOrDefaultAsync(x => x.CommonFileId == report.ExcelTemplateId.Value);

            if (templateFileResponse == null || templateFileResponse.FileType != (byte)FileType.ExcelDlReport)
            {
                return BadRequest("This report is not associated to an excel template in the common files");
            }

            reportName = Path.ChangeExtension(reportName, "xlsx");
        }

        contentDisposition.SetHttpFileName(reportName);

        var binaryData = await GetAdHocReport(report, request);

        Response.Headers[HeaderNames.ContentDisposition] = contentDisposition.ToString();

        var result = new FileContentResult(binaryData, FileMimeTypes.Excel);

        return result;
    }

    private async Task<byte[]> GetAdHocReport(AdHocDlReport adHocDlReport, AdHocReportRequest request)
    {
        var items = _contextRtbDms.CollectionFromSql(adHocDlReport.QueryForReport, null).ToList();
        var memoryStream = new MemoryStream();

        await using (var writer = new StreamWriter(memoryStream))
        {
            if (request.UseExcelTemplate)
            {
                var root = _contextRtbDms.SystemSettings.FirstOrDefault(x => x.Key == SettingKeys.CommonFileStorageRoot);
                var tempRoot = _contextRtbDms.SystemSettings.FirstOrDefault(x => x.Key == SettingKeys.TempStorageRoot);
                var templateFileResponse = await _contextRtbDms
                    .CommonFiles
                    .FirstOrDefaultAsync(x => x.CommonFileId == adHocDlReport.ExcelTemplateId.Value);
                var fullPath = Path.Combine(root.Value, templateFileResponse.FilePath);
                var tempFullPath = Path.Combine(tempRoot.Value, Guid.NewGuid() + "-tempForAdHocExcelReport.xlsx");

                System.IO.File.Copy(fullPath, tempFullPath, true);

                try
                {
                    using (var spreadsheetDocument = SpreadsheetDocument.Open(tempFullPath, true))
                    {
                        if (spreadsheetDocument.WorkbookPart?.Workbook.Sheets != null)
                        {
                            var workbookPart = spreadsheetDocument.WorkbookPart;
                            var sheetcollection = workbookPart.Workbook.GetFirstChild<Sheets>();
                            var thesheet = sheetcollection.GetFirstChild<Sheet>();
                            var worksheet = ((WorksheetPart)workbookPart.GetPartById(thesheet.Id)).Worksheet;
                            var sheetData = worksheet.GetFirstChild<SheetData>();

                            for (var j = 0; j < items.Count; j++)
                            {
                                var rowItem = (ExpandoObject)items[j];

                                var newRow = new Row { RowIndex = (uint)j + 2 };

                                for (var k = 0; k < rowItem.Count(); k++)
                                {
                                    if (j == 0)
                                    {
                                        sheetData.Elements<Row>().ElementAt(j).Elements<Cell>().ElementAt(k).CellValue = new CellValue(rowItem.ElementAt(k).Key);
                                        sheetData.Elements<Row>().ElementAt(j).Elements<Cell>().ElementAt(k).DataType = CellValues.String;
                                    }

                                    var cell = new Cell();
                                    switch (rowItem.ElementAt(k).Value)
                                    {
                                        case string:
                                            cell.DataType = CellValues.String;
                                            break;
                                        case int:
                                        case short:
                                        case long:
                                            cell.DataType = CellValues.Number;
                                            break;
                                        case DateTime:
                                            cell.DataType = CellValues.Date;
                                            break;
                                        case bool:
                                            cell.DataType = CellValues.Boolean;
                                            break;
                                        default:
                                            cell.DataType = CellValues.String;
                                            break;
                                    }

                                    cell.InlineString = new InlineString() { Text = new DocumentFormat.OpenXml.Spreadsheet.Text(rowItem.ElementAt(k).Value.ToString()) };
                                    cell.CellValue = new CellValue(rowItem.ElementAt(k).Value.ToString());
                                    newRow.AppendChild(cell);
                                }

                                sheetData.AppendChild(newRow);
                            }

                            workbookPart.Workbook.Save();
                            spreadsheetDocument.Close();
                        }
                    }

                    await using (var fileStream = new FileStream(tempFullPath, FileMode.Open))
                    {
                        await fileStream.CopyToAsync(memoryStream);
                    }

                    if (System.IO.File.Exists(tempFullPath))
                    {
                        System.IO.File.Delete(Path.Combine(tempFullPath));
                    }
                }
                catch (Exception e)
                {
                    Debug.WriteLine(e.Message);
                }
                finally
                {
                    memoryStream.Flush();
                }
            }
            else
            {
                await using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
                await csv.WriteRecordsAsync(items);
            }
        }

        memoryStream.Flush();

        return memoryStream.ToArray();
    }
}