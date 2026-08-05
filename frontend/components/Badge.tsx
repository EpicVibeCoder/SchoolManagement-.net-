import {
  AssignmentStatus,
  SubmissionStatus,
  UserRole,
  assignmentStatusLabels,
  submissionStatusLabels,
  userRoleLabels,
} from "@/lib/api";

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className={`sm-badge ${status === AssignmentStatus.Published ? "sm-badge-published" : "sm-badge-draft"}`}>
      {assignmentStatusLabels[status]}
    </span>
  );
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cls =
    status === SubmissionStatus.Graded
      ? "sm-badge-published"
      : status === SubmissionStatus.Late
      ? "sm-badge-danger"
      : status === SubmissionStatus.Returned
      ? "sm-badge-info"
      : "sm-badge-muted";
  return <span className={`sm-badge ${cls}`}>{submissionStatusLabels[status]}</span>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const cls =
    role === UserRole.Admin ? "sm-badge-info" : role === UserRole.Teacher ? "sm-badge-published" : "sm-badge-muted";
  return <span className={`sm-badge ${cls}`}>{userRoleLabels[role]}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`sm-badge ${active ? "sm-badge-published" : "sm-badge-danger"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
