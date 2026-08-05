using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IClassService
{
    Task<List<ClassDto>> ListAsync(CancellationToken ct);
    Task<ClassDto> GetAsync(Guid id, CancellationToken ct);
    Task<ClassDto> CreateAsync(CreateClassRequest request, CancellationToken ct);
    Task<ClassDto> UpdateAsync(Guid id, UpdateClassRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class ClassService : IClassService
{
    private readonly AppDbContext _db;

    public ClassService(AppDbContext db) => _db = db;

    public async Task<List<ClassDto>> ListAsync(CancellationToken ct) =>
        await _db.Classes
            .OrderBy(c => c.Name)
            .Select(c => new ClassDto(c.Id, c.Name, c.Code, c.AcademicYear))
            .ToListAsync(ct);

    public async Task<ClassDto> GetAsync(Guid id, CancellationToken ct)
    {
        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Class not found.");

        return ToDto(klass);
    }

    public async Task<ClassDto> CreateAsync(CreateClassRequest request, CancellationToken ct)
    {
        var code = request.Code.Trim().ToLowerInvariant();
        var exists = await _db.Classes.AnyAsync(c => c.Code.ToLower() == code, ct);
        if (exists)
            throw new AppException("A class with this code already exists.", 409, "conflict");

        var now = DateTimeOffset.UtcNow;
        var klass = new Class
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Code = request.Code.Trim(),
            AcademicYear = request.AcademicYear.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Classes.Add(klass);
        await _db.SaveChangesAsync(ct);

        return ToDto(klass);
    }

    public async Task<ClassDto> UpdateAsync(Guid id, UpdateClassRequest request, CancellationToken ct)
    {
        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Class not found.");

        var code = request.Code.Trim().ToLowerInvariant();
        var codeTaken = await _db.Classes.AnyAsync(c => c.Id != id && c.Code.ToLower() == code, ct);
        if (codeTaken)
            throw new AppException("A class with this code already exists.", 409, "conflict");

        klass.Name = request.Name.Trim();
        klass.Code = request.Code.Trim();
        klass.AcademicYear = request.AcademicYear.Trim();
        klass.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToDto(klass);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw new NotFoundException("Class not found.");

        var inUse = await _db.Subjects.AnyAsync(s => s.ClassId == id, ct)
            || await _db.StudentEnrollments.AnyAsync(e => e.ClassId == id, ct)
            || await _db.TeacherAssignments.AnyAsync(t => t.ClassId == id, ct)
            || await _db.Assignments.AnyAsync(a => a.ClassId == id, ct);

        if (inUse)
            throw new AppException("Cannot delete a class that has subjects, enrollments, or assignments.", 409, "conflict");

        _db.Classes.Remove(klass);
        await _db.SaveChangesAsync(ct);
    }

    private static ClassDto ToDto(Class c) => new(c.Id, c.Name, c.Code, c.AcademicYear);
}
