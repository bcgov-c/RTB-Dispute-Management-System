﻿using CM.ServiceBase;
using Microsoft.Extensions.Hosting;
using Serilog;

namespace DataWarehouseReporting.API;

public class Program
{
    public static void Main(string[] args)
    {
        try
        {
            CustomExtensionsBase.CreateHostBuilder<Startup>(args).Build().Run();
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}