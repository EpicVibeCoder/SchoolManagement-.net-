using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests;

public class AssignmentVisibilityAndOwnershipTests : TestHarness
{
    [Fact]
    public async Task Draft_Excluded_From_Student_List_Until_Published()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Draft HW", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Student, StudentId);
        var list = await Assignments.ListAsync(null, null, CancellationToken.None);
        Assert.DoesNotContain(list, a => a.Id == created.Id);

        As(UserRole.Teacher, TeacherId);
        await Assignments.PublishAsync(created.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        list = await Assignments.ListAsync(null, null, CancellationToken.None);
        Assert.Contains(list, a => a.Id == created.Id);
    }

    [Fact]
    public async Task Student_Get_Draft_Looks_Like_Not_Found()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Hidden", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Assignments.GetAsync(created.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Unenrolled_Student_Cannot_See_Published_Assignment()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Class only", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(created.Id, CancellationToken.None);

        As(UserRole.Student, OtherStudentId);
        var list = await Assignments.ListAsync(null, null, CancellationToken.None);
        Assert.DoesNotContain(list, a => a.Id == created.Id);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Assignments.GetAsync(created.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Admin_Can_List_Drafts()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Admin sees draft", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Admin, AdminId);
        var list = await Assignments.ListAsync(null, null, CancellationToken.None);
        Assert.Contains(list, a => a.Id == created.Id);
    }

    [Fact]
    public async Task Unpublish_Hides_From_Students_Again()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Toggle", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(created.Id, CancellationToken.None);
        await Assignments.UnpublishAsync(created.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var list = await Assignments.ListAsync(null, null, CancellationToken.None);
        Assert.DoesNotContain(list, a => a.Id == created.Id);
    }

    [Fact]
    public async Task Teacher_Cannot_Edit_Other_Teachers_Assignment()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "HW", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Teacher, OtherTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Assignments.UpdateAsync(created.Id, new UpdateAssignmentRequest(
                "Stolen", "x", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None));
    }

    [Fact]
    public async Task Teacher_Cannot_Publish_Or_Delete_Others_Assignment()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Mine", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Teacher, OtherTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Assignments.PublishAsync(created.Id, CancellationToken.None));
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Assignments.DeleteAsync(created.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Unassigned_Teacher_Cannot_Create_Assignment()
    {
        As(UserRole.Teacher, UnassignedTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Assignments.CreateAsync(new CreateAssignmentRequest(
                "Nope", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None));
    }

    [Fact]
    public async Task Student_Cannot_Create_Assignment()
    {
        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Assignments.CreateAsync(new CreateAssignmentRequest(
                "Nope", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None));
    }

    [Fact]
    public async Task Cannot_Delete_Assignment_With_Graded_Submissions()
    {
        var (assignment, submission) = await PublishedWithSubmissionAsync("Lock delete");

        As(UserRole.Teacher, TeacherId);
        await Submissions.GradeAsync(submission.Id, new GradeSubmissionRequest(80, "ok", null), CancellationToken.None);

        await Assert.ThrowsAsync<AppException>(() =>
            Assignments.DeleteAsync(assignment.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Can_Delete_Assignment_With_Ungraded_Submissions()
    {
        var (assignment, _) = await PublishedWithSubmissionAsync("Can delete");

        As(UserRole.Teacher, TeacherId);
        await Assignments.DeleteAsync(assignment.Id, CancellationToken.None);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Assignments.GetAsync(assignment.Id, CancellationToken.None));
    }

    [Fact]
    public async Task New_Assignment_Starts_As_Draft()
    {
        As(UserRole.Teacher, TeacherId);
        var created = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Draft by default", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, ClassId, SubjectId), CancellationToken.None);
        Assert.Equal(AssignmentStatus.Draft, created.Status);
    }
}

public class SubmissionWorkflowTests : TestHarness
{
    [Fact]
    public async Task Student_Cannot_Grade()
    {
        var (_, s) = await PublishedWithSubmissionAsync("G2");

        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(10, "ok", null), CancellationToken.None));
    }

    [Fact]
    public async Task Other_Teacher_Cannot_Grade()
    {
        var (_, s) = await PublishedWithSubmissionAsync("G3");

        As(UserRole.Teacher, OtherTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(10, "ok", null), CancellationToken.None));
    }

    [Fact]
    public async Task Submission_Update_Before_Deadline_Ok_Duplicate_Fails()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Quiz", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var s = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "answer1"), CancellationToken.None);
        var updated = await Submissions.UpdateAsync(s.Id, new UpdateSubmissionRequest("answer2"), CancellationToken.None);
        Assert.Equal("answer2", updated.Answer);
        Assert.Equal(SubmissionStatus.Submitted, updated.Status);

        await Assert.ThrowsAsync<AppException>(() =>
            Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "dup"), CancellationToken.None));
    }

    [Fact]
    public async Task Cannot_Submit_Draft_Assignment()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Still draft", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);

        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None));
    }

    [Fact]
    public async Task Unenrolled_Student_Cannot_Submit()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Enroll required", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, OtherStudentId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None));
    }

    [Fact]
    public async Task Submission_After_Deadline_Fails_When_Late_Disallowed()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "LateQuiz", "desc", DateTimeOffset.UtcNow.AddDays(-1), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<AppException>(() =>
            Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "too late"), CancellationToken.None));
    }

    [Fact]
    public async Task Late_Allowed_Marks_Late()
    {
        var row = await Db.AppSettings.FirstAsync(s => s.Key == "AllowLateSubmissions");
        row.Value = "true";
        await Db.SaveChangesAsync();

        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "LateOk", "desc", DateTimeOffset.UtcNow.AddDays(-1), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var s = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "late ans"), CancellationToken.None);
        Assert.Equal(SubmissionStatus.Late, s.Status);
    }

    [Fact]
    public async Task Update_After_Deadline_Fails_When_Late_Disallowed()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Will expire", "desc", DateTimeOffset.UtcNow.AddMilliseconds(50), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var s = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "on time"), CancellationToken.None);
        await Task.Delay(80);

        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Submissions.UpdateAsync(s.Id, new UpdateSubmissionRequest("too late"), CancellationToken.None));
        Assert.Equal("deadline_passed", ex.Code);
    }

    [Fact]
    public async Task Graded_Submission_Cannot_Be_Updated()
    {
        var (_, s) = await PublishedWithSubmissionAsync("Lock update");

        As(UserRole.Teacher, TeacherId);
        await Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(70, "good", null), CancellationToken.None);

        As(UserRole.Student, StudentId);
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Submissions.UpdateAsync(s.Id, new UpdateSubmissionRequest("cheat"), CancellationToken.None));
        Assert.Equal("already_graded", ex.Code);
    }

    [Fact]
    public async Task Student_Cannot_Update_Someone_Elses_Submission()
    {
        var (_, s) = await PublishedWithSubmissionAsync("Privacy");

        As(UserRole.Student, OtherStudentId);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Submissions.UpdateAsync(s.Id, new UpdateSubmissionRequest("hack"), CancellationToken.None));
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Submissions.GetAsync(s.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Grade_Marks_Above_Max_Fails()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "G", "desc", DateTimeOffset.UtcNow.AddDays(3), 10, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var s = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None);

        As(UserRole.Teacher, TeacherId);
        await Assert.ThrowsAsync<AppException>(() =>
            Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(99, "nope", null), CancellationToken.None));
    }

    [Fact]
    public async Task Grade_Negative_Marks_Fails()
    {
        var (_, s) = await PublishedWithSubmissionAsync("Neg");

        As(UserRole.Teacher, TeacherId);
        await Assert.ThrowsAsync<AppException>(() =>
            Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(-1, "nope", null), CancellationToken.None));
    }

    [Fact]
    public async Task Grade_Sets_Graded_And_Notifies_Student()
    {
        var (_, s) = await PublishedWithSubmissionAsync("Notify");

        As(UserRole.Teacher, TeacherId);
        var graded = await Submissions.GradeAsync(s.Id, new GradeSubmissionRequest(90, "nice", null), CancellationToken.None);
        Assert.Equal(SubmissionStatus.Graded, graded.Status);
        Assert.Equal(90, graded.Marks);
        Assert.Equal("nice", graded.Feedback);

        As(UserRole.Student, StudentId);
        var notes = await Notifications.ListMineAsync(CancellationToken.None);
        Assert.Contains(notes, n => n.Type == "submission_graded");
    }

    [Fact]
    public async Task Grade_Can_Set_Returned_But_Not_Submitted()
    {
        var (_, s) = await PublishedWithSubmissionAsync("Return");

        As(UserRole.Teacher, TeacherId);
        var returned = await Submissions.GradeAsync(
            s.Id, new GradeSubmissionRequest(40, "redo", SubmissionStatus.Returned), CancellationToken.None);
        Assert.Equal(SubmissionStatus.Returned, returned.Status);

        var (_, s2) = await PublishedWithSubmissionAsync("Bad status");
        As(UserRole.Teacher, TeacherId);
        await Assert.ThrowsAsync<AppException>(() =>
            Submissions.GradeAsync(s2.Id, new GradeSubmissionRequest(40, "x", SubmissionStatus.Submitted), CancellationToken.None));
    }

    [Fact]
    public async Task Student_Cannot_List_Submissions_By_Assignment()
    {
        var (a, _) = await PublishedWithSubmissionAsync("List");

        As(UserRole.Student, StudentId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Submissions.ListByAssignmentAsync(a.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Unassigned_Teacher_Cannot_List_Submissions()
    {
        var (a, _) = await PublishedWithSubmissionAsync("Scope");

        As(UserRole.Teacher, UnassignedTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            Submissions.ListByAssignmentAsync(a.Id, CancellationToken.None));
    }

    [Fact]
    public async Task Student_Mine_Includes_Assignment_And_Student()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "Mine HW", "show working", DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var created = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "x = 5"), CancellationToken.None);

        var mine = await Submissions.MineAsync(CancellationToken.None);
        var row = Assert.Single(mine);
        Assert.Equal(created.Id, row.Id);
        Assert.Equal("Mine HW", row.AssignmentTitle);
        Assert.Equal("show working", row.AssignmentDescription);
        Assert.Equal("C", row.ClassName);
        Assert.Equal("Math", row.SubjectName);
        Assert.Equal("T", row.TeacherName);
        Assert.Equal("S", row.StudentName);
        Assert.Equal("x = 5", row.Answer);
    }

    [Fact]
    public async Task Student_Can_Get_Own_Submission()
    {
        As(UserRole.Teacher, TeacherId);
        var a = await Assignments.CreateAsync(new CreateAssignmentRequest(
            "GetMine", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var created = await Submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None);

        var detail = await Submissions.GetAsync(created.Id, CancellationToken.None);
        Assert.Equal(created.Id, detail.Id);
        Assert.Equal("GetMine", detail.AssignmentTitle);
        Assert.Equal("S", detail.StudentName);
    }
}

public class AuthAndUserRulesTests : TestHarness
{
    [Fact]
    public async Task Login_Rejects_Bad_Password()
    {
        await Assert.ThrowsAsync<UnauthorizedAppException>(() =>
            Auth.LoginAsync(new LoginRequest("t@s.com", "wrong"), CancellationToken.None));
    }

    [Fact]
    public async Task Login_Rejects_Deactivated_Account()
    {
        await Users.DeactivateAsync(TeacherId, CancellationToken.None);
        await Assert.ThrowsAsync<UnauthorizedAppException>(() =>
            Auth.LoginAsync(new LoginRequest("t@s.com", TeacherPassword), CancellationToken.None));
    }

    [Fact]
    public async Task Login_Succeeds_For_Active_User()
    {
        var result = await Auth.LoginAsync(new LoginRequest("t@s.com", TeacherPassword), CancellationToken.None);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        Assert.Equal(UserRole.Teacher, result.User.Role);
    }

    [Fact]
    public async Task Duplicate_Email_Is_Rejected()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Users.CreateAsync(new CreateUserRequest("t@s.com", "Pass123!", "Dup", UserRole.Student), CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task Deactivate_Sets_Inactive()
    {
        await Users.DeactivateAsync(OtherStudentId, CancellationToken.None);
        var user = await Users.GetAsync(OtherStudentId, CancellationToken.None);
        Assert.False(user.IsActive);
    }
}

public class CatalogRulesTests : TestHarness
{
    [Fact]
    public async Task Duplicate_Class_Code_Is_Rejected()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Classes.CreateAsync(new CreateClassRequest("X", "C1", "2026"), CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task Cannot_Delete_Class_In_Use()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Classes.DeleteAsync(ClassId, CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task Can_Delete_Unused_Class()
    {
        await Classes.DeleteAsync(OtherClassId, CancellationToken.None);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Classes.GetAsync(OtherClassId, CancellationToken.None));
    }

    [Fact]
    public async Task Duplicate_Subject_Name_Or_Code_Is_Rejected()
    {
        await Assert.ThrowsAsync<AppException>(() =>
            Subjects.CreateAsync(new CreateSubjectRequest("Math", "ZZ"), CancellationToken.None));
        await Assert.ThrowsAsync<AppException>(() =>
            Subjects.CreateAsync(new CreateSubjectRequest("Chemistry", "M"), CancellationToken.None));
    }

    [Fact]
    public async Task Cannot_Delete_Subject_In_Use()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Subjects.DeleteAsync(SubjectId, CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task Enrollment_Requires_Student_Role()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Enrollments.CreateAsync(new CreateEnrollmentRequest(TeacherId, OtherClassId), CancellationToken.None));
        Assert.Equal("invalid_role", ex.Code);
    }

    [Fact]
    public async Task Duplicate_Enrollment_Is_Rejected()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            Enrollments.CreateAsync(new CreateEnrollmentRequest(StudentId, ClassId), CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task Teacher_Assignment_Requires_Teacher_Role()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            TeacherAssignments.CreateAsync(
                new CreateTeacherAssignmentRequest(StudentId, OtherClassId, OtherSubjectId), CancellationToken.None));
        Assert.Equal("invalid_role", ex.Code);
    }

    [Fact]
    public async Task One_Teacher_Per_Class_Subject()
    {
        var ex = await Assert.ThrowsAsync<AppException>(() =>
            TeacherAssignments.CreateAsync(
                new CreateTeacherAssignmentRequest(UnassignedTeacherId, ClassId, SubjectId), CancellationToken.None));
        Assert.Equal("conflict", ex.Code);
    }

    [Fact]
    public async Task AllowLateSubmissions_Setting_Parses_Bool()
    {
        Assert.False(await Settings.GetBoolAsync("AllowLateSubmissions", true, CancellationToken.None));
        await Settings.UpdateAsync("AllowLateSubmissions", new UpdateSettingRequest("true"), CancellationToken.None);
        Assert.True(await Settings.GetBoolAsync("AllowLateSubmissions", false, CancellationToken.None));
        Assert.True(await Settings.GetBoolAsync("MissingKey", true, CancellationToken.None));
    }

    [Fact]
    public async Task Notification_MarkRead_Is_Owner_Only()
    {
        As(UserRole.Student, StudentId);
        await Notifications.CreateAsync(StudentId, "ping", "Hi", "body", CancellationToken.None);
        var mine = await Notifications.ListMineAsync(CancellationToken.None);
        var note = Assert.Single(mine);
        Assert.Equal(1, await Notifications.UnreadCountAsync(CancellationToken.None));

        As(UserRole.Student, OtherStudentId);
        await Assert.ThrowsAsync<NotFoundException>(() =>
            Notifications.MarkReadAsync(note.Id, CancellationToken.None));

        As(UserRole.Student, StudentId);
        await Notifications.MarkReadAsync(note.Id, CancellationToken.None);
        Assert.Equal(0, await Notifications.UnreadCountAsync(CancellationToken.None));
    }
}
