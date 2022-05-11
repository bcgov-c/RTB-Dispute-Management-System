using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using CM.WebAPI.Authorization.Handlers;

namespace CM.WebAPI.Authorization;

public static class AuthorizationHandlerFactory
{
    public static IResourceAuthorizationHandler Create(int systemUserRoleId, List<string> roles, Guid disputeGuid)
    {
        IResourceAuthorizationHandler handler = new ForbidResourceAuthorizationHandler();

        switch (systemUserRoleId)
        {
            case (int)Roles.ExternalUser:
            {
                if (roles.Contains(RoleNames.ExtendedUser))
                {
                    handler = new ExtendedUserResourceAuthorizationHandler();
                }
                else if (roles.Contains(RoleNames.User))
                {
                    handler = new BypassResourceAuthorization();
                }

                break;
            }

            case (int)Roles.AccessCodeUser:
            {
                if (roles.Contains(RoleNames.ExtendedAccessCode))
                {
                    handler = new AccessCodeUserResourceAuthorizationHandler();
                }
                else if (roles.Contains(RoleNames.AccessCode))
                {
                    handler = new BypassResourceAuthorization();
                }

                break;
            }

            case (int)Roles.StaffUser:
            {
                if (roles.Contains(RoleNames.ExtendedAdmin))
                {
                    handler = new ExtendedAdminResourceAuthorizationHandler();
                }
                else if (roles.Contains(RoleNames.AdminLimited))
                {
                    handler = new AdminResourceAuthorizationHandler(disputeGuid);
                }
                else if (roles.Contains(RoleNames.Admin))
                {
                    handler = new BypassResourceAuthorization();
                }

                break;
            }

            case (int)Roles.OfficePayUser:
            {
                if (roles.Contains(RoleNames.ExtendedOfficePay))
                {
                    handler = new ExtendedOfficePayResourceAuthorizationHandler();
                }
                else if (roles.Contains(RoleNames.OfficePay))
                {
                    handler = new BypassResourceAuthorization();
                }

                break;
            }
        }

        return handler;
    }
}