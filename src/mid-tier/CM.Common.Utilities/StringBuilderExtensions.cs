using System.Text;

namespace CM.Common.Utilities;

public static class StringBuilderExtensions
{
    public static StringBuilder And(this StringBuilder sb, string fieldName, string operation, string value)
    {
        sb.Append(" AND");

        switch (operation)
        {
            case "=":
                sb.Append(" " + fieldName + " " + operation + " '" + value + "'");

                break;
            case "LIKE":
                sb.Append(" " + fieldName + " " + operation + " '%" + value + "%'");

                break;
            case ">":
            case "<":
            case ">=":
            case "<=":
            case "!=":
                sb.Append(" " + fieldName + " " + operation + " '" + value + "'");

                break;
            case "in":
            case "not in":
                sb.Append(" " + fieldName + " " + operation + " " + value);

                break;
        }

        return sb;
    }

    public static StringBuilder Or(this StringBuilder sb, string fieldName, string operation, string value)
    {
        sb.Append(" OR");

        switch (operation)
        {
            case "=":
                sb.Append(" " + fieldName + " " + operation + " '" + value + "'");

                break;
            case "LIKE":
                sb.Append(" " + fieldName + " " + operation + " '%" + value + "%'");

                break;
            case ">":
            case "<":
            case ">=":
            case "<=":
                sb.Append(" " + fieldName + " " + operation + " '" + value + "'");

                break;
        }

        return sb;
    }

    public static string NormalizeThenLowerAndStripApostrophe(this string searchParameter)
    {
        return searchParameter
            .ToLower()
            .Replace("'", "''");
    }

    public static string NormalizeThenLowerAndRemoveQuotes(this string searchParameter)
    {
        return searchParameter
            .ToLower()
            .Replace("'", string.Empty);
    }
}