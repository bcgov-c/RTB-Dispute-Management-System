using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AutoText;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.AutoText;

public interface IAutoTextRepository : IRepository<Model.AutoText>
{
    Task<DateTime?> GetLastModifiedDate(int autoTextId);

    Task<List<Model.AutoText>> GetAllByRequest(AutoTextGetRequest request);
}