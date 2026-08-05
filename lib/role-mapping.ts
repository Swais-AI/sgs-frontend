// lib/role-mapping.ts - Centralized role mappings

export type RoleMapping = {
  table: string;
  emailColumn: string;
  phoneColumn: string;
  nameColumn: string;
  dashboardUrl: string;
};

// Role to table and column mapping
const ROLE_MAPPING: Record<string, RoleMapping> = {
  "School Admin": {
    table: "users_master",
    emailColumn: "email",
    phoneColumn: "phone",
    nameColumn: "name",
    dashboardUrl: "http://16.112.236.67:3001/admin/students"
  },
  "Headmaster": {
    table: "users_master",
    emailColumn: "email",
    phoneColumn: "phone",
    nameColumn: "name",
    dashboardUrl: "http://16.112.236.67:3000"
  },
  "Faculty": {
    table: "sgs_teacher_master",
    emailColumn: "email_id",
    phoneColumn: "phone",
    nameColumn: "full_name",
    dashboardUrl: "http://16.112.236.67:3002/dashboard"
  },
  "Student": {
    table: "sgs_student_master",
    emailColumn: "student_email",
    phoneColumn: "student_phone",
    nameColumn: "full_name",
    dashboardUrl: "http://16.112.236.67:84"
  },
  "Parent": {
    table: "sgs_student_master",
    emailColumn: "student_email",
    phoneColumn: "student_phone",
    nameColumn: "full_name",
    dashboardUrl: "http://16.112.236.67:3009/parent/dashboard"
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
