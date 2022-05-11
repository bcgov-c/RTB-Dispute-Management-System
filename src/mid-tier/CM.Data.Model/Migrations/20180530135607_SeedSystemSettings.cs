using CM.Common.Utilities;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CM.Data.Model.Migrations
{
    public partial class SeedSystemSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('MerchantId', '337440000', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('HashKey', 'ee8A2689f4304Aed8ac40db4F94c6802', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('TrnAmount', '100', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('ReturnUrl', 'www.frontendUIreturnURL.com', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('PaymentURI', 'https://www.beanstream.com/scripts/payment/payment.asp', 0)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('PaymentReportURI', 'https://www.beanstream.com/scripts/process_transaction.asp?', 0)");

            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('PdfPageHeaderHtmlKey', 'Dispute Number: {0} - {1}', 1)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('PdfPageFooterHtmlKey', 'Residential Tenancies Dispute Notice - Page [page]/[topage]', 1)");

            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientPort', '465', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientHost', 'smtp.gmail.com', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientTimeout', '10000', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientFromEmail', 'rtb.dms.test@gmail.com', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientUsername', 'rtb.dms.test@gmail.com', 2)");
            migrationBuilder.Sql(string.Format(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientPassword', '{0}', 2)", HashHelper.EncryptPassword("!234Qwer", "rtb.dms.test@gmail.com")));
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientEnableSsl', 'true', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientNumberOfRetries', '3', 2)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('SmtpClientDelayBetweenRetries', '60', 2)");

            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('FileRepositoryBaseUrl', 'localhost:51757/api/file', 4)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('CommonFileStorageRoot', 'C:\CaseManagement\CommonFiles', 4)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('CommonFileRepositoryBaseUrl', 'localhost:51757/api/commonfiles', 4)");
            migrationBuilder.Sql(@"INSERT INTO public.""SystemSettings""(""Key"", ""Value"", ""Type"") VALUES ('FileStorageRoot', 'C:\CaseManagement\DisputeFiles', 4)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'MerchantId'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'HashKey'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'TrnAmount'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'ReturnUrl'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'PaymentURI'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'PaymentReportURI'");

            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'PdfPageHeaderHtmlKey'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'PdfPageFooterHtmlKey'");

            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientPort'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientHost'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientTimeout'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientFromEmail'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientUsername'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientPassword'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientEnableSsl'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientNumberOfRetries'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'SmtpClientDelayBetweenRetries'");

            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'FileRepositoryBaseUrl'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'CommonFileStorageRoot'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'CommonFileRepositoryBaseUrl'");
            migrationBuilder.Sql(@"DELETE FROM ""SystemSettings"" where ""Key"" = 'FileStorageRoot'");
        }
    }
}
