// lib/role-mapping.ts - Centralized role mappings

export type RoleMapping = {
  table: string;
  emailColumn: string;
  phoneColumn: string;
  nameColumn: string;
  dashboardUrl: string;
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

// Role to table and column mapping
const ROLE_MAPPING: Record<string, RoleMapping> = {
  "School Admin": {
    table: "sgs_users_masters",
    emailColumn: "email",
    phoneColumn: "phone",
    nameColumn: "name",
    dashboardUrl: dashboardUrls.schoolAdmin
  },
  "Headmaster": {
    table: "sgs_users_masters",
    emailColumn: "email",
    phoneColumn: "phone",
    nameColumn: "name",
    dashboardUrl: dashboardUrls.headmaster
  },
  "Faculty": {
    table: "sgs_teacher_master",
    emailColumn: "email_id",
    phoneColumn: "phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.faculty
  },
  "Student": {
    table: "sgs_student_master",
    emailColumn: "student_email",
    phoneColumn: "student_phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.student
  },
  "Parent": {
    table: "sgs_student_master",
    emailColumn: "student_email",
    phoneColumn: "student_phone",
    nameColumn: "full_name",
    dashboardUrl: dashboardUrls.parent
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
