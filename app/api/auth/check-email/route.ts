import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Role to table and column mapping
const ROLE_MAPPING: Record<string, { table: string; emailColumn: string; nameColumn: string }> = {
  "School Admin": { table: "users_master", emailColumn: "email", nameColumn: "name" },
  "Headmaster": { table: "users_master", emailColumn: "email", nameColumn: "name" },
  "Faculty": { table: "sgs_teacher_master", emailColumn: "email_id", nameColumn: "full_name" },
  "Student": { table: "sgs_student_master", emailColumn: "student_email", nameColumn: "full_name" },
  "Parent": { table: "sgs_student_master", emailColumn: "student_email", nameColumn: "full_name" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    console.log('Validation request:', { email, role });

    if (!email || !role) {
      return NextResponse.json(
        { valid: false, message: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Get the mapping for this role
    const mapping = ROLE_MAPPING[role];
    if (!mapping) {
      return NextResponse.json(
        { valid: false, message: 'Invalid role selected' },
        { status: 400 }
      );
    }

    const { table, emailColumn, nameColumn } = mapping;
    const emailLower = email.trim().toLowerCase();

    // Build the query dynamically
    const query = `SELECT * FROM ${table} WHERE ${emailColumn} = $1`;
    console.log('Query:', query, 'Email:', emailLower);

    const result = await pool.query(query, [emailLower]);

    console.log('Result rows:', result.rows.length);

    if (result.rows.length === 0) {
      return NextResponse.json({
        valid: false,
        message: `No ${role} found with email: ${email}. Please contact your administrator.`
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'User validated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Unable to validate email. Please try again.' },
      { status: 500 }
    );
  }
}
