import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function isStudentEmailAllowed(email: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT student_id 
       FROM sgs_student_master 
       WHERE student_email = $1 
       AND is_active = true
       AND record_status = 'Active'`,
      [email]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Student validation error:', error);
    return false;
  }
}
