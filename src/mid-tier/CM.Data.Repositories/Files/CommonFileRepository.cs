using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic.FileIO;

namespace CM.Data.Repositories.Files;

public class CommonFileRepository : CmRepository<CommonFile>, ICommonFileRepository
{
    public CommonFileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int commonFileId)
    {
        var dates = await Context.CommonFiles
            .Where(p => p.CommonFileId == commonFileId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<CommonFile> GetCommonFileWithType(int commonFileId, CommonFileType? fileType)
    {
        var commonFile =
            await Context.CommonFiles.SingleOrDefaultAsync(c =>
                c.CommonFileId == commonFileId && c.FileType == fileType);

        return commonFile;
    }

    public async Task<List<CommonFile>> GetCommonFilesByType(CommonFileType? fileType, int count, int index)
    {
        var commonFiles = await Context.CommonFiles
            .Where(c => !fileType.HasValue || c.FileType == fileType)
            .ApplyPaging(count, index)
            .ToListAsync();

        return commonFiles;
    }

    public async Task<(List<CommonFile> commonFiles, int totalCount)> GetExternalFiles(int count, int index)
    {
        var commonFiles = await Context.CommonFiles
        .Where(c => c.FileType.HasValue && (c.FileType == CommonFileType.UserGuide || c.FileType == CommonFileType.Form))
        .ApplyPaging(count, index)
        .ToListAsync();

        var totalCount = await Context.CommonFiles
        .CountAsync(c => c.FileType.HasValue && (c.FileType == CommonFileType.UserGuide || c.FileType == CommonFileType.Form));

        return (commonFiles, totalCount);
    }
}