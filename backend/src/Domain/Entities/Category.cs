namespace GrouponClone.Domain.Entities;

public class Category
{
    public int Id { get; private set; }
    public string Name { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string? Icon { get; private set; }
    public string? ImageUrl { get; private set; }
    public int? ParentId { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    public Category? Parent { get; private set; }
    private readonly List<Category> _subcategories = [];
    public IReadOnlyCollection<Category> Subcategories => _subcategories.AsReadOnly();

    protected Category() { }

    public static Category Create(string name, string slug, string? icon = null, int? parentId = null, int sortOrder = 0)
    {
        return new Category
        {
            Name = name.Trim(),
            Slug = slug.ToLowerInvariant(),
            Icon = icon,
            ParentId = parentId,
            SortOrder = sortOrder,
        };
    }
}
