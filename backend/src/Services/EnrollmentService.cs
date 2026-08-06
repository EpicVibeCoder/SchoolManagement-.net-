using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IEnrollmentService
{
    Task<List<EnrollmentDto>> ListAsync(Guid? studentId, Guid? classId, CancellationToken ct);
    Task<EnrollmentDto> CreateAsync(CreateEnrollmentRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _db;

    public EnrollmentService(AppDbContext db) => _db = db;

    public async Task<List<EnrollmentDto>> ListAsync(Guid? studentId, Guid? classId, CancellationToken ct)
    {
        var query = _db.StudentEnrollments
            .Include(e => e.Student)
            .Include(e => e.Class)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(e => e.StudentId == studentId.Value);
        if (classId.HasValue)
            query = query.Where(e => e.ClassId == classId.Value);

        return await query
            .OrderBy(e => e.Student.FullName)
            .Select(e => new EnrollmentDto(e.Id, e.StudentId, e.Student.FullName, e.ClassId, e.Class.Name, e.EnrolledAt))
            .ToListAsync(ct);
    }

    public async Task<EnrollmentDto> CreateAsync(CreateEnrollmentRequest request, CancellationToken ct)
    {
        var student = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.StudentId, ct)
            ?? throw new NotFoundException("Student not found.");
        if (student.Role != UserRole.Student)
            throw new AppException("The selected user is not a student.", 400, "invalid_role");

        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassId, ct)
            ?? throw new NotFoundException("Class not found.");

        var exists = await _db.StudentEnrollments.AnyAsync(
            e => e.StudentId == request.StudentId && e.ClassId == request.ClassId, ct);
        if (exists)
            throw new AppException("This student is already enrolled in this class.", 409, "conflict");

        var enrollment = new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = request.StudentId,
            ClassId = request.ClassId,
            EnrolledAt = DateTimeOffset.UtcNow
        };

        _db.StudentEnrollments.Add(enrollment);
        await _db.SaveChangesAsync(ct);

        return new EnrollmentDto(enrollment.Id, student.Id, student.FullName, klass.Id, klass.Name, enrollment.EnrolledAt);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var enrollment = await _db.StudentEnrollments.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException("Enrollment not found.");

        _db.StudentEnrollments.Remove(enrollment);
        await _db.SaveChangesAsync(ct);
    }
}
