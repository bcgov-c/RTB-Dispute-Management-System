using System.Collections.Generic;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CM.WebAPI.Filters;

public class FileOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        switch (operation.OperationId)
        {
            case "ExternalPostFileChunked":
            case "PostFileChunked":
            {
                var uploadFileMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["OriginalFile"] = new OpenApiSchema
                            {
                                Description = "Upload File",
                                Type = "file",
                                Format = "binary"
                            }
                        },
                        Required = new HashSet<string> { "OriginalFile" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = { ["multipart/form-data"] = uploadFileMediaType }
                };

                break;
            }

            case "PostFile":
            {
                var uploadFileMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["uploadedFile"] = new OpenApiSchema
                            {
                                Description = "Upload File",
                                Type = "file",
                                Format = "binary"
                            },
                            ["FileType"] = new OpenApiSchema
                            {
                                Description = "FileType",
                                Type = "integer"
                            },
                            ["FileName"] = new OpenApiSchema
                            {
                                Description = "FileName",
                                Type = "string"
                            },
                            ["isInline"] = new OpenApiSchema
                            {
                                Description = "Content Disposition",
                                Type = "bool"
                            },
                            ["AddedBy"] = new OpenApiSchema
                            {
                                Description = "AddedBy",
                                Type = "string"
                            },
                            ["FilePackageId"] = new OpenApiSchema
                            {
                                Description = "FilePackageId",
                                Type = "byte"
                            },
                            ["SubmitterName"] = new OpenApiSchema
                            {
                                Description = "SubmitterName",
                                Type = "string"
                            },
                            ["FileDate"] = new OpenApiSchema
                            {
                                Description = "FileDate",
                                Type = "string"
                            }
                        },
                        Required = new HashSet<string> { "uploadedFile", "FileType", "FileName" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = { ["multipart/form-data"] = uploadFileMediaType }
                };

                break;
            }

            case "PostCommonFile":
            {
                var uploadFileMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["uploadedFile"] = new OpenApiSchema
                            {
                                Description = "Upload File",
                                Type = "file",
                                Format = "binary"
                            },
                            ["OriginalFileName"] = new OpenApiSchema
                            {
                                Description = "OriginalFileName",
                                Type = "string"
                            },
                            ["FileType"] = new OpenApiSchema
                            {
                                Description = "FileType",
                                Type = "integer"
                            },
                            ["FileName"] = new OpenApiSchema
                            {
                                Description = "FileName",
                                Type = "string"
                            },
                            ["FileTitle"] = new OpenApiSchema
                            {
                                Description = "FileTitle",
                                Type = "string"
                            },
                            ["FileDescription"] = new OpenApiSchema
                            {
                                Description = "FileDescription",
                                Type = "string"
                            }
                        },
                        Required = new HashSet<string> { "uploadedFile", "FileType", "FileName" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = { ["multipart/form-data"] = uploadFileMediaType }
                };

                break;
            }

            case "PostExternalFile":
            {
                var uploadFileMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["uploadedFile"] = new OpenApiSchema
                            {
                                Description = "Upload File",
                                Type = "file",
                                Format = "binary"
                            },
                            ["OriginalFileName"] = new OpenApiSchema
                            {
                                Description = "OriginalFileName",
                                Type = "string"
                            },
                            ["FileType"] = new OpenApiSchema
                            {
                                Description = "FileType",
                                Type = "integer"
                            },
                            ["FileName"] = new OpenApiSchema
                            {
                                Description = "FileName",
                                Type = "string"
                            },
                            ["FileTitle"] = new OpenApiSchema
                            {
                                Description = "FileTitle",
                                Type = "string"
                            },
                            ["FileDescription"] = new OpenApiSchema
                            {
                                Description = "FileDescription",
                                Type = "string"
                            }
                        },
                        Required = new HashSet<string> { "uploadedFile", "FileType", "FileName" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = { ["multipart/form-data"] = uploadFileMediaType }
                };

                break;
            }

            case "PostExternalFileToken":
            {
                var uploadFileMediaType = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties =
                        {
                            ["uploadedFile"] = new OpenApiSchema
                            {
                                Description = "Upload File",
                                Type = "file",
                                Format = "binary"
                            },
                            ["OriginalFileName"] = new OpenApiSchema
                            {
                                Description = "OriginalFileName",
                                Type = "string"
                            },
                            ["FileType"] = new OpenApiSchema
                            {
                                Description = "FileType",
                                Type = "integer"
                            },
                            ["FileName"] = new OpenApiSchema
                            {
                                Description = "FileName",
                                Type = "string"
                            },
                            ["FileTitle"] = new OpenApiSchema
                            {
                                Description = "FileTitle",
                                Type = "string"
                            },
                            ["FileDescription"] = new OpenApiSchema
                            {
                                Description = "FileDescription",
                                Type = "string"
                            }
                        },
                        Required = new HashSet<string> { "uploadedFile", "FileType", "FileName" }
                    }
                };
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = { ["multipart/form-data"] = uploadFileMediaType }
                };

                break;
            }
        }
    }
}