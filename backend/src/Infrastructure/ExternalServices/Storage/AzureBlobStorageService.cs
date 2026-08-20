using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using GrouponClone.Application.Interfaces;

namespace GrouponClone.Infrastructure.ExternalServices.Storage;

public class AzureBlobStorageService : IStorageService
{
    private readonly BlobServiceClient _client;
    private readonly string _defaultContainer;

    public AzureBlobStorageService(IConfiguration config)
    {
        _client = new BlobServiceClient(config["Azure:StorageConnectionString"]
            ?? throw new InvalidOperationException("Azure:StorageConnectionString not configured."));
        _defaultContainer = config["Azure:ContainerName"] ?? "dealhive-media";
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType,
        string container = "dealhive-media", CancellationToken ct = default)
    {
        var containerClient = _client.GetBlobContainerClient(container);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: ct);

        var blobName = $"{Guid.NewGuid():N}-{Path.GetFileName(fileName)}";
        var blobClient = containerClient.GetBlobClient(blobName);

        var headers = new BlobHttpHeaders { ContentType = contentType };
        await blobClient.UploadAsync(fileStream, headers, cancellationToken: ct);

        return blobClient.Uri.ToString();
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken ct = default)
    {
        var uri = new Uri(fileUrl);
        var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
        if (segments.Length < 2) return;

        var containerClient = _client.GetBlobContainerClient(segments[0]);
        var blobClient = containerClient.GetBlobClient(segments[1]);
        await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
    }
}
