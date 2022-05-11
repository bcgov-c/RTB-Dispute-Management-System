using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Dynamic;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.EntityFramework;

public static class RawSqlExtension
{
    public static IEnumerable<dynamic> CollectionFromSql(this DbContext dbContext, string sql, Dictionary<string, object> parameters)
    {
        using var cmd = dbContext.Database.GetDbConnection().CreateCommand();

        cmd.CommandText = sql;

        if (cmd.Connection != null && cmd.Connection.State != ConnectionState.Open)
        {
            cmd.Connection.Open();
        }

        if (parameters != null)
        {
            foreach (var(key, value) in parameters)
            {
                var dbParameter = cmd.CreateParameter();
                dbParameter.ParameterName = key;
                dbParameter.Value = value;
                cmd.Parameters.Add(dbParameter);
            }
        }

        using var dataReader = cmd.ExecuteReader();

        while (dataReader.Read())
        {
            var dataRow = GetDataRow(dataReader);

            yield return dataRow;
        }
    }

    public static string ScalarFromSql(this DbContext dbContext, string sql, Dictionary<string, object> parameters)
    {
        using var cmd = dbContext.Database.GetDbConnection().CreateCommand();

        cmd.CommandText = sql;

        if (cmd.Connection != null && cmd.Connection.State != ConnectionState.Open)
        {
            cmd.Connection.Open();
        }

        if (parameters != null)
        {
            foreach (var(key, value) in parameters)
            {
                var dbParameter = cmd.CreateParameter();
                dbParameter.ParameterName = key;
                dbParameter.Value = value;
                cmd.Parameters.Add(dbParameter);
            }
        }

        return cmd.ExecuteScalar()?.ToString();
    }

    private static dynamic GetDataRow(DbDataReader dataReader)
    {
        var dataRow = new ExpandoObject() as IDictionary<string, object>;

        for (var fieldCount = 0; fieldCount < dataReader.FieldCount; fieldCount++)
        {
            dataRow.Add(dataReader.GetName(fieldCount), dataReader[fieldCount]);
        }

        return dataRow;
    }
}