using System;
using System.Collections.Generic;

namespace CM.WebAPI.Configuration;

public class ServiceList : Dictionary<string, string>
{
    public Uri GetServiceUri(string serviceName)
    {
        return new Uri(this[serviceName]);
    }
}