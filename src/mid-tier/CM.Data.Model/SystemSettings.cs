﻿namespace CM.Data.Model;

public class SystemSettings
{
    public int SystemSettingsId { get; set; }

    public string Key { get; set; }

    public string Value { get; set; }

    public byte Type { get; set; }
}