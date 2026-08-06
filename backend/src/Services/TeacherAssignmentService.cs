using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface ITeacherAssignmentService
{
    Task<List<TeacherAssignmentDto>> ListAsync(Guid? teacherId, Guid? classId, CancellationToken ct);
    Task<TeacherAssignmentDto> CreateAsync(CreateTeacherAssignmentRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class TeacherAssignmentService : ITeacherAssignmentService
{
    private readonly AppDbContext _db;

    public TeacherAssignmentService(AppDbContext db) => _db = db;

    public async Task<List<TeacherAssignmentDto>> ListAsync(Guid? teacherId, Guid? classId, CancellationToken ct)
    {
        var query = _db.TeacherAssignments
            .Include(t => t.Teacher)
            .Include(t => t.Class)
            .Include(t => t.Subject)
            .AsQueryable();

        if (teacherId.HasValue)
            query = query.Where(t => t.TeacherId == teacherId.Value);
        if (classId.HasValue)
            query = query.Where(t => t.ClassId == classId.Value);

        return await query
            .OrderBy(t => t.Teacher.FullName)
            .Select(t => new TeacherAssignmentDto(
                t.Id, t.TeacherId, t.Teacher.FullName, t.ClassId, t.Class.Name, t.SubjectId, t.Subject.Name))
            .ToListAsync(ct);
    }

    public async Task<TeacherAssignmentDto> CreateAsync(CreateTeacherAssignmentRequest request, CancellationToken ct)
    {
        var teacher = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.TeacherId, ct)
            ?? throw new NotFoundException("Teacher not found.");
        if (teacher.Role != UserRole.Teacher)
            throw new AppException("The selected user is not a teacher.", 400, "invalid_role");

        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassId, ct)
            ?? throw new NotFoundException("Class not found.");

        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == request.SubjectId, ct)
            ?? throw new NotFoundException("Subject not found.");
        if (subject.ClassId != request.ClassId)
            throw new AppException("The subject does not belong to the selected class.", 400, "invalid_subject");

        var exists = await _db.TeacherAssignments.AnyAsync(
            t => t.TeacherId == request.TeacherId && t.ClassId == request.ClassId && t.SubjectId == request.SubjectId, ct);
        if (exists)
            throw new AppException("This teacher is already assigned to this class and subject.", 409, "conflict");

        var assignment = new TeacherAssignment
        {
            Id = Guid.NewGuid(),
            TeacherId = request.TeacherId,
            ClassId = request.ClassId,
            SubjectId = request.SubjectId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.TeacherAssignments.Add(assignment);
        await _db.SaveChangesAsync(ct);

        return new TeacherAssignmentDto(
            assignment.Id, teacher.Id, teacher.FullName, klass.Id, klass.Name, subject.Id, subject.Name);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var assignment = await _db.TeacherAssignments.FirstOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new NotFoundException("Teacher assignment not found.");

        _db.TeacherAssignments.Remove(assignment);
        await _db.SaveChangesAsync(ct);
    }
}
