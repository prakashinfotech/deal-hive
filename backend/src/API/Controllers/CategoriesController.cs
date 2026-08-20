using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Infrastructure.Persistence;

namespace GrouponClone.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public CategoriesController(ApplicationDbContext db) => _db = db;

    /// <summary>Get all active categories with subcategories.</summary>
    [HttpGet]
    [AllowAnonymous]
    [ResponseCache(Duration = 3600)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var categories = await _db.Categories.AsNoTracking()
            .Where(c => c.IsActive && c.ParentId == null)
            .Include(c => c.Subcategories.Where(s => s.IsActive))
            .OrderBy(c => c.SortOrder)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Icon, c.ImageUrl,
                Subcategories = c.Subcategories
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new { s.Id, s.Name, s.Slug, s.Icon })
            })
            .ToListAsync(ct);

        return Ok(categories);
    }
}
