import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const ROLE_MAPPING: Record<string, { table: string; phoneColumn: string; nameColumn: string }> = {
  "School Admin": { table: "users_master", phoneColumn: process.env.SGS_ADMIN_PHONE_COLUMN || "phone", nameColumn: "name" },
  "Headmaster": { table: "users_master", phoneColumn: process.env.SGS_HEADMASTER_PHONE_COLUMN || "phone", nameColumn: "name" },
  "Faculty": { table: "sgs_teacher_master", phoneColumn: process.env.SGS_TEACHER_PHONE_COLUMN || "phone", nameColumn: "full_name" },
  "Student": { table: "sgs_student_master", phoneColumn: process.env.SGS_STUDENT_PHONE_COLUMN || "phone", nameColumn: "full_name" },
  "Parent": { table: "sgs_student_master", phoneColumn: process.env.SGS_PARENT_PHONE_COLUMN || "parent_phone", nameColumn: "full_name" },
};

function normalizePhone(phone: string) {
  const value = phone.trim().replace(/[\s-]/g, "");
  const digits = value.startsWith("+") ? value.slice(1) : value;

  if (!digits || !/^\d{10,15}$/.test(digits)) {
    return null;
  }

  if (value.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return `+${digits}`;
}

function phoneLookupValues(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return [];
  }

  const withoutPlus = normalized.slice(1);
  const values = [normalized, withoutPlus];

  if (withoutPlus.startsWith("91") && withoutPlus.length === 12) {
    values.push(withoutPlus.slice(2));
  }

  return Array.from(new Set(values));
}

function isSafeIdentifier(identifier: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role } = body;

    if (!phone || !role) {
      return NextResponse.json(
        { valid: false, message: 'Phone number and role are required' },
        { status: 400 }
      );
    }

    const mapping = ROLE_MAPPING[role];
    if (!mapping) {
      return NextResponse.json(
        { valid: false, message: 'Invalid role selected' },
        { status: 400 }
      );
    }

    const phoneValues = phoneLookupValues(phone);
    if (phoneValues.length === 0) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a valid phone number.' },
        { status: 400 }
      );
    }

    const { table, phoneColumn } = mapping;
    if (!isSafeIdentifier(table) || !isSafeIdentifier(phoneColumn)) {
      return NextResponse.json(
        { valid: false, message: 'Phone login is not configured correctly.' },
        { status: 500 }
      );
    }

    const placeholders = phoneValues.map((_, index) => `$${index + 1}`).join(', ');
    const query = `
      SELECT *
      FROM ${table}
      WHERE REGEXP_REPLACE(COALESCE(${phoneColumn}::text, ''), '[^0-9+]', '', 'g') IN (${placeholders})
      LIMIT 1
    `;

    const result = await pool.query(query, phoneValues);

    if (result.rows.length === 0) {
      return NextResponse.json({
        valid: false,
        message: `No ${role} found with this phone number. Please contact your administrator.`
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'User validated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Unable to validate phone number. Please try again.' },
      { status: 500 }
    );
  }
}
