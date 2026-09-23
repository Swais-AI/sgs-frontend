// lib/role-mapping.ts - Centralized role mappings

export type RoleMapping = {
  table: string;
  emailColumn: string;
  phoneColumn: string;
  nameColumn: string;
  dashboardUrl: string;
  // Account-status validation (confirmed with the DB owner). All optional so
  // roles that don't need a particular check simply omit that field.
  activeColumn?: string;        // boolean column; falsy => reject
  statusColumn?: string;        // string column to compare
  activeStatusValue?: string;   // required value of statusColumn for "active"
  deletedStatusValue?: string;  // specific statusColumn value => "no longer active" message
  inactiveMessage?: string;     // message for any other non-active state for this role
};

// Dashboard URLs come from the environment so each deployment points at its own
// host. The fallbacks are relative paths, which resolve against whatever domain
// the login app is served from — never a hardcoded server address.
const dashboardUrls = {
  schoolAdmin: process.env.NEXT_PUBLIC_SCHOOL_ADMIN_DASHBOARD_URL || "/admin/students",
  headmaster: process.env.NEXT_PUBLIC_HEADMASTER_DASHBOARD_URL || "/headmaster",
  faculty: process.env.NEXT_PUBLIC_FACULTY_DASHBOARD_URL || "/faculty/dashboard",
  student: process.env.NEXT_PUBLIC_STUDENT_DASHBOARD_URL || "/student",
  parent: process.env.NEXT_PUBLIC_PARENT_DASHBOARD_URL || "/parent/dashboard",
};

export const INACTIVE_MESSAGE = "Your account is inactive. Please contact the administration.";
export const NO_LONGER_ACTIVE_MESSAGE = "Your account is no longer active. Please contact the administration.";

// Role to table and column mapping
const ROLE_MAPPING: Record<string, RoleMapping> = {
  "School Admin": {
    table: "sgs_users_masters",
    emailColumn: "email_id",
    phoneColumn: "mobile_no",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.schoolAdmin,
    activeColumn: "is_active",
    inactiveMessage: INACTIVE_MESSAGE
  },
  "Headmaster": {
    table: "sgs_users_masters",
    emailColumn: "email_id",
    phoneColumn: "mobile_no",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.headmaster,
    activeColumn: "is_active",
    inactiveMessage: INACTIVE_MESSAGE
  },
  "Faculty": {
    table: "sgs_teacher_master",
    emailColumn: "email_id",
    phoneColumn: "phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.faculty,
    // record_status must NOT be consulted for Faculty — it is always 'Active'
    // for teachers, so only is_active determines account status here.
    activeColumn: "is_active",
    inactiveMessage: INACTIVE_MESSAGE
  },
  "Student": {
    table: "sgs_student_master",
    emailColumn: "student_email",
    phoneColumn: "student_phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.student,
    activeColumn: "is_active",
    statusColumn: "record_status",
    activeStatusValue: "Active",
    deletedStatusValue: "Deleted",
    inactiveMessage: INACTIVE_MESSAGE
  },
  // Parents are their own records, linked to children through
  // sgs_parent_student_map. This used to validate against the *student's*
  // email in sgs_student_master, which meant a "parent" login resolved to a
  // student_id and the parent dashboard had no way to know who the parent was.
  "Parent": {
    table: "sgs_parent_master",
    emailColumn: "email",
    phoneColumn: "phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.parent,
    statusColumn: "record_status",
    activeStatusValue: "Active",
    inactiveMessage: NO_LONGER_ACTIVE_MESSAGE
  },
};

export function getRoleMapping(role: string): RoleMapping | null {
  return ROLE_MAPPING[role] || null;
}

export function getAllRoles(): string[] {
  return Object.keys(ROLE_MAPPING);
}

export function getDashboardUrl(role: string): string | null {
  return ROLE_MAPPING[role]?.dashboardUrl || null;
}

export type AccountStatusCheck = { allowed: true } | { allowed: false; message: string };

// Evaluates the confirmed account-status rules for a role against an already
// fetched row. Read-only — never writes, never re-queries the DB.
export function checkAccountStatus(mapping: RoleMapping, row: Record<string, any>): AccountStatusCheck {
  const defaultMessage = mapping.inactiveMessage || INACTIVE_MESSAGE;

  // Student-only: an explicit "Deleted" status always wins, regardless of is_active.
  if (mapping.statusColumn && mapping.deletedStatusValue &&
      row[mapping.statusColumn] === mapping.deletedStatusValue) {
    return { allowed: false, message: NO_LONGER_ACTIVE_MESSAGE };
  }

  // Boolean flag check (Admin, Headmaster, Faculty, Student).
  if (mapping.activeColumn && !row[mapping.activeColumn]) {
    return { allowed: false, message: defaultMessage };
  }

  // String status check (Student, Parent).
  if (mapping.statusColumn && mapping.activeStatusValue &&
      row[mapping.statusColumn] !== mapping.activeStatusValue) {
    return { allowed: false, message: defaultMessage };
  }

  return { allowed: true };
}
