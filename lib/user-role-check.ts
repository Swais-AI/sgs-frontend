import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'swais-db-test-env.cri2kcc26kxg.ap-south-2.rds.amazonaws.com',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'swais_app_user',
  password: process.env.PGPASSWORD || 'Swaisuser007',
  database: process.env.PGDATABASE || 'sgs_prod',
  ssl: { rejectUnauthorized: false }
});

export async function checkUserRoleInDB(email: string, role: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    const lowerEmail = email.toLowerCase();
    console.log('🔍 Checking role for:', lowerEmail, 'with role:', role);
    
    // ADMIN role - check users_master
    if (role === 'admin' || role === 'principal') {
      const userResult = await pool.query(
        'SELECT user_id, email, role, is_active FROM users_master WHERE LOWER(email) = $1',
        [lowerEmail]
      );
      
      console.log('📊 Admin check result:', userResult.rows);
      
      if (userResult.rows.length === 0) {
        return { 
          allowed: false, 
          message: `This email is not registered as an admin. Please contact your administrator.` 
        };
      }
      
      const user = userResult.rows[0];
      
      if (!user.is_active) {
        return { 
          allowed: false, 
          message: `Your account is inactive. Please contact your administrator.` 
        };
      }
      
      return { allowed: true };
    }
    
    // TEACHER role - check sgs_teacher_master
    if (role === 'teacher') {
      const teacherResult = await pool.query(
        'SELECT teacher_id, email_id, is_active FROM sgs_teacher_master WHERE LOWER(email_id) = $1',
        [lowerEmail]
      );
      
      console.log('📊 Teacher check result:', teacherResult.rows);
      
      if (teacherResult.rows.length === 0) {
        return { 
          allowed: false, 
          message: `This email is not registered as a teacher. Please contact your administrator.` 
        };
      }
      
      if (!teacherResult.rows[0].is_active) {
        return { 
          allowed: false, 
          message: `Your teacher account is inactive. Please contact your administrator.` 
        };
      }
      
      return { allowed: true };
    }
    
    // STUDENT role - check sgs_student_master
    if (role === 'student') {
      const studentResult = await pool.query(
        'SELECT student_id, student_email, is_active FROM sgs_student_master WHERE LOWER(student_email) = $1',
        [lowerEmail]
      );
      
      console.log('📊 Student check result:', studentResult.rows);
      
      if (studentResult.rows.length === 0) {
        return { 
          allowed: false, 
          message: `This email is not registered as a student. Please contact your administrator.` 
        };
      }
      
      if (!studentResult.rows[0].is_active) {
        return { 
          allowed: false, 
          message: `Your student account is inactive. Please contact your administrator.` 
        };
      }
      
      return { allowed: true };
    }
    
    // PARENT role - check sgs_student_master (parents are also in student master)
    if (role === 'parent') {
      const parentResult = await pool.query(
        'SELECT student_id, student_email, is_active FROM sgs_student_master WHERE LOWER(student_email) = $1',
        [lowerEmail]
      );
      
      console.log('📊 Parent check result:', parentResult.rows);
      
      if (parentResult.rows.length === 0) {
        return { 
          allowed: false, 
          message: `This email is not registered as a parent. Please contact your administrator.` 
        };
      }
      
      if (!parentResult.rows[0].is_active) {
        return { 
          allowed: false, 
          message: `Your parent account is inactive. Please contact your administrator.` 
        };
      }
      
      return { allowed: true };
    }
    
    return { 
      allowed: false, 
      message: `Unknown role: ${role}. Please contact your administrator.` 
    };
    
  } catch (error) {
    console.error('❌ Role check error:', error);
    return { 
      allowed: false, 
      message: 'Role validation could not be completed. Please try again.' 
    };
  }
}
