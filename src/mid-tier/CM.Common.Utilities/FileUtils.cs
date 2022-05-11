using System;
using System.IO;
using System.Linq;

namespace CM.Common.Utilities;

public static class FileUtils
{
    public static void DeleteEmptySubdirectories(string parentDirectory)
    {
        foreach (var directory in Directory.GetDirectories(parentDirectory))
        {
            DeleteEmptySubdirectories(directory);

            if (Directory.EnumerateFileSystemEntries(directory).Any())
            {
                continue;
            }

            try
            {
                Directory.Delete(directory, false);
            }
            catch (Exception)
            {
                // ignored
            }
        }
    }

    public static string GetFileExtension(string filename)
    {
        if (!filename.Contains("."))
        {
            return string.Empty;
        }

        return filename.Split(".").LastOrDefault();
    }

    public static void CheckIfNotExistsCreate(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
        {
            throw new InvalidDataException("Wrong file path");
        }

        if (Directory.Exists(path) == false)
        {
            Directory.CreateDirectory(path);
        }
    }

    public static bool IsValidFileName(string fileName)
    {
        return !string.IsNullOrEmpty(fileName) && fileName.IndexOfAny(Path.GetInvalidFileNameChars()) < 0;
    }
}