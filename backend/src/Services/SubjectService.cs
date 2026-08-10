using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface ISubjectService
{
    Task<List<SubjectDto>> ListAsync(CancellationToken ct);
    Task<SubjectDto> GetAsync(Guid id, CancellationToken ct);
    Task<SubjectDto> CreateAsync(CreateSubjectRequest request, CancellationToken ct);
    Task<SubjectDto> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class SubjectService : ISubjectService
{
    private readonly AppDbContext _db;

    public SubjectService(AppDbContext db) => _db = db;

    public async Task<List<SubjectDto>> ListAsync(CancellationToken ct)
    {
        var query = _db.Subjects.AsQueryable();

        return await query.OrderBy(s => s.Name).Select(s => new SubjectDto(s.Id, s.Name, s.Code)).ToListAsync(ct);
    }

    public async Task<SubjectDto> GetAsync(Guid id, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new NotFoundException("Subject not found.");

        return ToDto(subject);
    }

    public async Task<SubjectDto> CreateAsync(CreateSubjectRequest request, CancellationToken ct)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var name = CapitalizeFirst(request.Name.Trim());
        if (await _db.Subjects.AnyAsync(s => s.Name.ToLower() == name.ToLower(), ct))
            throw new AppException("A subject with this name already exists", 409, "conflict");
        if (await _db.Subjects.AnyAsync(s => s.Code.ToLower() == code.ToLower(), ct))
            throw new AppException("A subject with this code already exists", 409, "conflict");
        var now = DateTimeOffset.UtcNow;
        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = code,
            CreatedAt = now,
            UpdatedAt = now,
        };
        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync(ct);
        return new SubjectDto(subject.Id, subject.Name, subject.Code);
    }

    public async Task<SubjectDto> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new NotFoundException("Subject not found.");

        var code = request.Code.Trim().ToUpperInvariant();
        var name = CapitalizeFirst(request.Name.Trim());
        if (await _db.Subjects.AnyAsync(s => s.Id != id && s.Name.ToLower() == name.ToLower(), ct))
            throw new AppException("A subject with this name already exists", 409, "conflict");
        var codeTaken = await _db.Subjects.AnyAsync(s => s.Id != id && s.Code.ToLower() == code, ct);
        if (codeTaken)
            throw new AppException("A subject with this code already exists", 409, "conflict");

        subject.Name = name;
        subject.Code =  code;
        subject.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new SubjectDto(subject.Id, subject.Name, subject.Code);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new NotFoundException("Subject not found.");

        var inUse = await _db.TeacherAssignments.AnyAsync(t => t.SubjectId == id, ct) || await _db.Assignments.AnyAsync(a => a.SubjectId == id, ct);

        if (inUse)
            throw new AppException("Cannot delete a subject that has teacher assignments or assignments.", 409, "conflict");

        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync(ct);
    }

    private static SubjectDto ToDto(Subject s) => new(s.Id, s.Name, s.Code);

    private static string CapitalizeFirst(string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;
        if (value.Length == 1)
            return value.ToUpperInvariant();
        return char.ToUpperInvariant(value[0]) + value[1..].ToLowerInvariant();
    }
}
