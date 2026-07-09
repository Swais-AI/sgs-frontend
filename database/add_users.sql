-- ============================================
-- ADD USERS SCRIPT (FOR REFERENCE ONLY)
-- This is NOT executed automatically
-- ============================================

-- Insert into users_master
INSERT INTO users_master (email, username, password_hash, role, is_active, created_at, updated_at) 
VALUES 
('murty.varanasi1@gmail.com', 'murty.varanasi1', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('snisthala@gmail.com', 'snisthala', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('anushkag472004@gmail.com', 'anushkag472004', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('krithim0371@gmail.com', 'krithim0371', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('ayushig987@gmail.com', 'ayushig987', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('bhuvan.k59@gmail.com', 'bhuvan.k59', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('hari76112@gmail.com', 'hari76112', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('leelamadhurikattaboyina@gmail.com', 'leelamadhurikattaboyina', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('gudavallirenuka19@gmail.com', 'gudavallirenuka19', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('srinavya724@gmail.com', 'srinavya724', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('vaibhavyaso20@gmail.com', 'vaibhavyaso20', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('gowrigowtham2016@gmail.com', 'Gowtham', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW()),
('yash.samu04@gmail.com', 'Yaswanth', 'dummy_hash_for_google_oauth', 'admin', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert into sgs_teacher_master
INSERT INTO sgs_teacher_master (email_id, full_name, subject_name, role, is_active, created_at) 
VALUES 
('murty.varanasi1@gmail.com', 'Murthy Varanasi', 'Management', 'Teacher', true, NOW()),
('snisthala@gmail.com', 'Snisthala', 'General', 'Teacher', true, NOW()),
('anushkag472004@gmail.com', 'Anushka G', 'General', 'Teacher', true, NOW()),
('krithim0371@gmail.com', 'Krithi M', 'General', 'Teacher', true, NOW()),
('ayushig987@gmail.com', 'Ayushi G', 'General', 'Teacher', true, NOW()),
('bhuvan.k59@gmail.com', 'Bhuvan K', 'General', 'Teacher', true, NOW()),
('hari76112@gmail.com', 'Hari', 'General', 'Teacher', true, NOW()),
('leelamadhurikattaboyina@gmail.com', 'Leela Madhuri', 'General', 'Teacher', true, NOW()),
('gudavallirenuka19@gmail.com', 'Renuka Gudavalli', 'General', 'Teacher', true, NOW()),
('srinavya724@gmail.com', 'Srinavya', 'General', 'Teacher', true, NOW()),
('vaibhavyaso20@gmail.com', 'Vaibhav Yaso', 'General', 'Teacher', true, NOW()),
('gowrigowtham2016@gmail.com', 'Gowtham', 'General', 'Teacher', true, NOW()),
('yash.samu04@gmail.com', 'Yaswanth', 'General', 'Teacher', true, NOW())
ON CONFLICT (email_id) DO NOTHING;

-- Insert into sgs_student_master (Note: class_id may need to be adjusted)
INSERT INTO sgs_student_master (student_email, full_name, admission_no, class_id, section, created_datetime, is_active) 
VALUES 
('murty.varanasi1@gmail.com', 'Murthy Varanasi', 'M001', 20, 'A', NOW(), true),
('snisthala@gmail.com', 'Snisthala', 'S001', 20, 'A', NOW(), true),
('anushkag472004@gmail.com', 'Anushka G', 'S002', 20, 'A', NOW(), true),
('krithim0371@gmail.com', 'Krithi M', 'S003', 20, 'A', NOW(), true),
('ayushig987@gmail.com', 'Ayushi G', 'S004', 20, 'A', NOW(), true),
('bhuvan.k59@gmail.com', 'Bhuvan K', 'S005', 20, 'A', NOW(), true),
('hari76112@gmail.com', 'Hari', 'S006', 20, 'A', NOW(), true),
('leelamadhurikattaboyina@gmail.com', 'Leela Madhuri', 'S007', 20, 'A', NOW(), true),
('gudavallirenuka19@gmail.com', 'Renuka Gudavalli', 'S008', 20, 'A', NOW(), true),
('srinavya724@gmail.com', 'Srinavya', 'S009', 20, 'A', NOW(), true),
('vaibhavyaso20@gmail.com', 'Vaibhav Yaso', 'S010', 20, 'A', NOW(), true),
('gowrigowtham2016@gmail.com', 'Gowtham', 'S100', 20, 'B', NOW(), true),
('yash.samu04@gmail.com', 'Yaswanth', 'S101', 20, 'C', NOW(), true)
ON CONFLICT (student_email) DO NOTHING;

-- ============================================
-- VERIFY ALL USERS
-- ============================================

SELECT 'users_master' as table_name, email, username, role::text FROM users_master 
WHERE email IN (
    'murty.varanasi1@gmail.com', 'snisthala@gmail.com', 'anushkag472004@gmail.com', 
    'krithim0371@gmail.com', 'ayushig987@gmail.com', 'bhuvan.k59@gmail.com', 
    'hari76112@gmail.com', 'leelamadhurikattaboyina@gmail.com', 'gudavallirenuka19@gmail.com', 
    'srinavya724@gmail.com', 'vaibhavyaso20@gmail.com', 'gowrigowtham2016@gmail.com', 
    'yash.samu04@gmail.com'
)
ORDER BY email;
