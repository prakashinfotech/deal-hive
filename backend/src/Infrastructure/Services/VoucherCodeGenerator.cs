using System.Security.Cryptography;
using GrouponClone.Application.Interfaces;

namespace GrouponClone.Infrastructure.Services;

public class VoucherCodeGenerator : IVoucherCodeGenerator
{
    private const string Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public string Generate(string prefix = "DH")
    {
        var segment1 = GenerateSegment(4);
        var segment2 = GenerateSegment(4);
        return $"{prefix}-{segment1}-{segment2}";
    }

    private static string GenerateSegment(int length)
    {
        var bytes = RandomNumberGenerator.GetBytes(length);
        return new string(bytes.Select(b => Chars[b % Chars.Length]).ToArray());
    }
}
