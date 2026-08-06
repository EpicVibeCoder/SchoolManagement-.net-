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


        return await query
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(s.Id, s.Name, s.Code))
            .ToListAsync(ct);
    }

    public async Task<SubjectDto> GetAsync(Guid id, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException("Subject not found.");

        return ToDto(subject);
    }

    public async Task<SubjectDto> CreateAsync(CreateSubjectRequest request, CancellationToken ct)
    {

        var code = request.Code.Trim().ToLowerInvariant();
        var exists = await _db.Subjects.AnyAsync(s => s.Code.ToLower() == code, ct);
        if (exists)
            throw new AppException("A subject with this code already exists", 409, "conflict");

        var now = DateTimeOffset.UtcNow;
        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Code = request.Code.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Subjects.Add(subject);
        await _db.SaveChangesAsync(ct);

        return new SubjectDto(subject.Id, subject.Name, subject.Code);
    }

    public async Task<SubjectDto> UpdateAsync(Guid id, UpdateSubjectRequest request, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException("Subject not found.");

        var code = request.Code.Trim().ToLowerInvariant();
        var codeTaken = await _db.Subjects
            .AnyAsync(s => s.Id != id && s.Code.ToLower() == code, ct);
        if (codeTaken)
            throw new AppException("A subject with this code already exists", 409, "conflict");

        subject.Name = request.Name.Trim();
        subject.Code = request.Code.Trim();
        subject.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return new SubjectDto(subject.Id, subject.Name, subject.Code);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException("Subject not found.");

        var inUse = await _db.TeacherAssignments.AnyAsync(t => t.SubjectId == id, ct)
            || await _db.Assignments.AnyAsync(a => a.SubjectId == id, ct);

        if (inUse)
            throw new AppException("Cannot delete a subject that has teacher assignments or assignments.", 409, "conflict");

        _db.Subjects.Remove(subject);
        await _db.SaveChangesAsync(ct);
    }

    private static SubjectDto ToDto(Subject s) => new(s.Id, s.Name, s.Code);
}
