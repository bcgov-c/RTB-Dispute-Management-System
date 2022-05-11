using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AutoText;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.AutoText;

public class AutoTextRepository : CmRepository<Model.AutoText>, IAutoTextRepository
{
    public AutoTextRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int autoTextId)
    {
        var dates = await Context.AutoTexts
            .Where(n => n.AutoTextId == autoTextId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.AutoText>> GetAllByRequest(AutoTextGetRequest request)
    {
        if (request.TextType == null)
        {
            if (request.TextOwner != null)
            {
                var autoTexts = await Context.AutoTexts
                    .Where(a => a.TextOwner == request.TextOwner)
                    .ToListAsync();

                return autoTexts;
            }

            if (request.TextOwner == null)
            {
                return null;
            }
        }

        if (request.TextType != null)
        {
            if (request.TextOwner != null)
            {
                var autoTexts = await Context.AutoTexts
                    .Where(a => a.TextType == request.TextType && a.TextOwner == request.TextOwner)
                    .ToListAsync();

                return autoTexts;
            }

            if (request.TextOwner == null)
            {
                var autoTexts = await Context.AutoTexts
                    .Where(a => a.TextType == request.TextType)
                    .ToListAsync();

                return autoTexts;
            }
        }

        return null;
    }
}