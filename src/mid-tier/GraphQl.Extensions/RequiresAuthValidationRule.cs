using System.Threading.Tasks;
using GraphQL.Language.AST;
using GraphQL.Validation;

namespace GraphQl.Extensions;

public class RequiresAuthValidationRule : IValidationRule
{
    public Task<INodeVisitor> ValidateAsync(ValidationContext validationContext)
    {
        var userContext = validationContext.UserContext as GraphQlUserContext;
        var authenticated = userContext?.User.Identity is { IsAuthenticated: true };
        var originalQuery = validationContext.Document.OriginalQuery ?? "Unknown";

        return Task.FromResult((INodeVisitor)new NodeVisitors(
            new MatchingNodeVisitor<Operation>((op, context) =>
            {
                if (!authenticated)
                {
                    context.ReportError(new ValidationError(originalQuery, "auth-required", $"Authorization is required to access {op.Name}.", op));
                }
            }),
            new MatchingNodeVisitor<Field>((fieldAst, context) =>
            {
                var fieldDef = context.TypeInfo.GetFieldDef();
                var claims = userContext?.User.Claims;
                if (fieldDef != null && fieldDef.RequiresPermissions() && (!authenticated || !fieldDef.CanAccess(claims)))
                {
                    context.ReportError(new ValidationError(originalQuery, "auth-required", "You are not authorized to run this query.", fieldAst));
                }
            })));
    }
}