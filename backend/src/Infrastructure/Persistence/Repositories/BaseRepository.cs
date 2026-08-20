using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using GrouponClone.Application.Interfaces;
using GrouponClone.Domain.Entities;
using GrouponClone.Infrastructure.Persistence;

namespace GrouponClone.Infrastructure.Persistence.Repositories;

public class BaseRepository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext _db;
    protected DbSet<T> DbSet => _db.Set<T>();

    public BaseRepository(ApplicationDbContext db) => _db = db;

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await DbSet.FindAsync([id], ct);

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct = default)
        => await DbSet.AsNoTracking().ToListAsync(ct);

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default)
        => await DbSet.AsNoTracking().Where(predicate).ToListAsync(ct);

    public async Task AddAsync(T entity, CancellationToken ct = default)
        => await DbSet.AddAsync(entity, ct);

    public void Update(T entity) => DbSet.Update(entity);

    public void Remove(T entity) => entity.SoftDelete();
}
