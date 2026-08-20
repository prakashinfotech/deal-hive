// ============================================================
// GrouponClone.Domain — Base Entity
// Domain/Entities/BaseEntity.cs
// ============================================================

using GrouponClone.Domain.Events;

namespace GrouponClone.Domain.Entities;

/// <summary>
/// Base class for all domain entities with audit fields and domain event support.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; protected set; }
    public bool IsDeleted => DeletedAt.HasValue;

    private readonly List<IDomainEvent> _domainEvents = [];

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);

    public void ClearDomainEvents() => _domainEvents.Clear();

    protected void SetUpdated() => UpdatedAt = DateTime.UtcNow;

    public void SoftDelete()
    {
        DeletedAt = DateTime.UtcNow;
        SetUpdated();
    }
}
