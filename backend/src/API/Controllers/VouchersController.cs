using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Exceptions;
using GrouponClone.Infrastructure.Persistence;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
[Produces("application/json")]
public class VouchersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;

    public VouchersController(ApplicationDbContext db, ICurrentUserService cu, IUnitOfWork uow)
    {
        _db = db; _currentUser = cu; _uow = uow;
    }

    /// <summary>Get user's vouchers.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVouchers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var query = _db.Vouchers.AsNoTracking()
            .Where(v => v.UserId == userId)
            .OrderByDescending(v => v.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(v => new
            {
                v.Id, v.Code, v.QrCodeUrl, v.DealId, v.DealTitle, v.VendorName,
                Status = v.Status.ToString(), IssuedAt = v.CreatedAt, v.ExpiresAt, v.RedeemedAt
            })
            .ToListAsync(ct);

        return Ok(new { items, totalCount = total, page, pageSize });
    }

    /// <summary>Get voucher by code.</summary>
    [HttpGet("{code}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVoucher(string code, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();
        var v = await _db.Vouchers.AsNoTracking()
            .FirstOrDefaultAsync(v => v.Code == code.ToUpperInvariant() && v.UserId == userId, ct);

        if (v is null) return NotFound();

        return Ok(new
        {
            v.Id, v.Code, v.QrCodeUrl, v.DealId, v.DealTitle, v.VendorName,
            Status = v.Status.ToString(), IssuedAt = v.CreatedAt, v.ExpiresAt, v.RedeemedAt
        });
    }

    /// <summary>Redeem a voucher (Vendor only).</summary>
    [HttpPost("{code}/redeem")]
    [Authorize(Roles = "Vendor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Redeem(string code, [FromBody] RedeemRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException();

        var vendor = await _db.Vendors.FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new ForbiddenException("Vendor profile not found.");

        var voucher = await _db.Vouchers.FirstOrDefaultAsync(v => v.Code == code.ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Voucher", code);

        if (voucher.VendorId != vendor.Id) throw new ForbiddenException("This voucher does not belong to your business.");

        voucher.Redeem(userId);
        await _uow.SaveChangesAsync(ct);

        return Ok(new { success = true, message = "Voucher redeemed successfully." });
    }
}

public record RedeemRequest(Guid? VendorStaffId);
