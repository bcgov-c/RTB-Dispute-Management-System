using System;
using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Services.DataWarehouse.DataWarehouseDataModel.Migrations
{
    public partial class SeedDimTimes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var startDate = new DateTime(2017, 1, 1);
            var endDate = new DateTime(2023, 1, 1);

            for (var date = startDate; date < endDate; date = date.AddDays(1))
            {
                migrationBuilder.Sql(@"INSERT INTO public.""DimTimes""(""DateInserted"", ""AssociatedDate"", ""DayOfWeekId"", ""WeekId"", ""MonthId"", ""QuarterId"", ""YearId"")
                                VALUES ('" + DateTime.Now.Date + "', '" + date + "', '" + GetDayOfWeek(date) + "', '" + GetWeekId(date.DayOfYear) + "', '" + date.Month + "', '" + GetQuarter(date) + "', '" + date.Year + "');");
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"delete from public.""DimTimes""");
        }

        private int GetWeekId(int dayOfYear)
        {
            var id = (decimal)dayOfYear / Constants.DaysInWeek;
            var rel = id - Math.Round(id);

            if (rel == 0)
            {
                return (int)id;
            }

            return (int)id + 1;
        }

        private int GetDayOfWeek(DateTime date)
        {
            var day = (WeekDay)Enum.Parse(typeof(WeekDay), date.DayOfWeek.ToString());
            return (int)day;
        }

        private int GetQuarter(DateTime date)
        {
            var month = (Months)date.Month;

            switch (month)
            {
                case Months.April:
                case Months.May:
                case Months.June:
                    return 1;
                case Months.July:
                case Months.August:
                case Months.September:
                    return 2;
                case Months.October:
                case Months.November:
                case Months.December:
                    return 3;
                case Months.January:
                case Months.February:
                case Months.March:
                    return 4;
                default:
                    return Constants.NotFoundOrIncorrect;
            }
        }
    }
}
