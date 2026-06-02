-- ============================================================================
-- AGENDA ESCOLAR VIRTUAL (AEV) - BANCO DE DADOS MYSQL
-- ============================================================================
-- Modelo Lógico e Físico
-- Stack: MySQL 8.0+
-- Autor: Gerado automaticamente para o projeto AEV
-- ============================================================================

-- ============================================================================
-- 1. CONFIGURAÇÃO INICIAL
-- ============================================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS aev_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE aev_db;

-- ============================================================================
-- 2. MODELO FÍSICO - CRIAÇÃO DE TABELAS (DDL)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: users (Usuários do sistema)
-- Armazena todos os usuários: alunos, professores, responsáveis e administradores
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    profile_type ENUM('aluno', 'professor', 'responsavel', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_profile_type (profile_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: schools (Escolas/Instituições de ensino)
-- ----------------------------------------------------------------------------
CREATE TABLE schools (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    cnpj VARCHAR(18) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: school_administrators (Administradores de escola)
-- Relaciona usuários com escolas que eles administram
-- ----------------------------------------------------------------------------
CREATE TABLE school_administrators (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_school_admin (school_id, user_id),
    INDEX idx_school_id (school_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: classes (Turmas)
-- Representa as turmas/cursos dentro de uma escola
-- ----------------------------------------------------------------------------
CREATE TABLE classes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    academic_year YEAR NOT NULL,
    grade_level VARCHAR(50) NULL COMMENT 'Ex: 9º Ano, 1ª Série, etc.',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_code (school_id, code, academic_year),
    INDEX idx_school_id (school_id),
    INDEX idx_academic_year (academic_year),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: class_enrollments (Matrículas de alunos nas turmas)
-- Relaciona alunos com suas turmas
-- ----------------------------------------------------------------------------
CREATE TABLE class_enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('ativo', 'inativo', 'concluido', 'transferido') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (class_id, student_id, enrollment_date),
    INDEX idx_class_id (class_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: class_teachers (Professores por turma)
-- Relaciona professores com as turmas que lecionam
-- ----------------------------------------------------------------------------
CREATE TABLE class_teachers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(100) NULL COMMENT 'Disciplina que o professor leciona nesta turma',
    is_primary_teacher BOOLEAN DEFAULT FALSE COMMENT 'Professor titular da turma',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_teacher (class_id, teacher_id, subject),
    INDEX idx_class_id (class_id),
    INDEX idx_teacher_id (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: parent_students (Relação responsável-aluno)
-- Relaciona responsáveis com seus alunos
-- ----------------------------------------------------------------------------
CREATE TABLE parent_students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    relationship VARCHAR(50) NULL COMMENT 'Ex: Pai, Mãe, Tutor, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_student (parent_id, student_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: calendar_events (Eventos do calendário/agenda)
-- Armazena eventos, provas, tarefas, reuniões, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE calendar_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NULL,
    creator_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    event_type ENUM('prova', 'trabalho', 'tarefa', 'reuniao', 'feriado', 'evento_escolar', 'outro') NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NULL,
    end_time TIME NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(255) NULL,
    color_hex VARCHAR(7) DEFAULT '#4A90E2' COMMENT 'Cor do evento no calendário',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: grades (Notas dos alunos)
-- Armazena as notas/provas dos alunos
-- ----------------------------------------------------------------------------
CREATE TABLE grades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    class_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL COMMENT 'Ex: Prova Bimestral, Trabalho, etc.',
    description TEXT NULL,
    grade_value DECIMAL(5,2) NOT NULL COMMENT 'Nota obtida',
    max_grade DECIMAL(5,2) DEFAULT 10.00 COMMENT 'Nota máxima possível',
    weight DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Peso da nota para média final',
    grading_period VARCHAR(50) NULL COMMENT 'Ex: 1º Bimestre, 1º Trimestre',
    graded_at DATE NOT NULL,
    comments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES class_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_class_id (class_id),
    INDEX idx_grading_period (grading_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: activities (Atividades/Tarefas)
-- Armazena atividades e tarefas escolares
-- ----------------------------------------------------------------------------
CREATE TABLE activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    teacher_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    activity_type ENUM('tarefa_casa', 'atividade_sala', 'projeto', 'pesquisa', 'outro') NOT NULL,
    due_date DATE NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 10.00,
    attachments_json JSON NULL COMMENT 'Lista de anexos/arquivos',
    is_graded BOOLEAN DEFAULT FALSE COMMENT 'Se esta atividade vale nota',
    status ENUM('aberta', 'encerrada', 'cancelada') DEFAULT 'aberta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: activity_submissions (Entregas de atividades pelos alunos)
-- ----------------------------------------------------------------------------
CREATE TABLE activity_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id BIGINT UNSIGNED NOT NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    submission_text TEXT NULL,
    attachments_json JSON NULL COMMENT 'Arquivos enviados pelo aluno',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade_value DECIMAL(5,2) NULL,
    teacher_comments TEXT NULL,
    status ENUM('pendente', 'entregue', 'atrasado', 'avaliado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (activity_id, student_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: announcements (Comunicados/Avisos)
-- Comunicados gerais para turmas ou escolas
-- ----------------------------------------------------------------------------
CREATE TABLE announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id BIGINT UNSIGNED NULL,
    class_id BIGINT UNSIGNED NULL,
    author_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT 'Fixado no topo',
    publish_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_school_id (school_id),
    INDEX idx_class_id (class_id),
    INDEX idx_priority (priority),
    INDEX idx_is_active (is_active),
    INDEX idx_publish_at (publish_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: attendance (Frequência dos alunos)
-- Registro de presença/ausência dos alunos
-- ----------------------------------------------------------------------------
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    class_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    status ENUM('presente', 'ausente', 'atrasado', 'justificado') NOT NULL,
    justification TEXT NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES class_enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (enrollment_id, date),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_class_id (class_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: messages (Mensagens entre usuários)
-- Sistema de mensagens internas
-- ----------------------------------------------------------------------------
CREATE TABLE messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT UNSIGNED NOT NULL,
    recipient_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    parent_message_id BIGINT UNSIGNED NULL COMMENT 'Para respostas (thread)',
    is_deleted_sender BOOLEAN DEFAULT FALSE,
    is_deleted_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: user_settings (Configurações dos usuários)
-- Preferências individuais dos usuários
-- ----------------------------------------------------------------------------
CREATE TABLE user_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    theme VARCHAR(50) DEFAULT 'light' COMMENT 'light, dark, system',
    language VARCHAR(10) DEFAULT 'pt-BR',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Tabela: audit_logs (Logs de auditoria)
-- Registra ações importantes no sistema
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL COMMENT 'Tabela/entidade afetada',
    entity_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. VIEWS PARA CONSULTAS FREQUENTES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: vw_active_students_by_class
-- Lista alunos ativos por turma
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_students_by_class AS
SELECT 
    c.id AS class_id,
    c.name AS class_name,
    c.code AS class_code,
    s.name AS school_name,
    u.id AS student_id,
    u.full_name AS student_name,
    u.email AS student_email,
    ce.enrollment_date,
    ce.status AS enrollment_status
FROM class_enrollments ce
INNER JOIN classes c ON ce.class_id = c.id
INNER JOIN users u ON ce.student_id = u.id
INNER JOIN schools s ON c.school_id = s.id
WHERE ce.status = 'ativo' AND u.is_active = TRUE AND c.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- View: vw_teachers_by_class
-- Lista professores por turma com suas disciplinas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_teachers_by_class AS
SELECT 
    c.id AS class_id,
    c.name AS class_name,
    c.code AS class_code,
    u.id AS teacher_id,
    u.full_name AS teacher_name,
    u.email AS teacher_email,
    ct.subject,
    ct.is_primary_teacher
FROM class_teachers ct
INNER JOIN classes c ON ct.class_id = c.id
INNER JOIN users u ON ct.teacher_id = u.id
WHERE u.is_active = TRUE AND c.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- View: vw_student_grades_summary
-- Resumo das notas por aluno e turma
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_grades_summary AS
SELECT 
    u.id AS student_id,
    u.full_name AS student_name,
    c.id AS class_id,
    c.name AS class_name,
    COUNT(g.id) AS total_grades,
    COALESCE(AVG(g.grade_value), 0) AS average_grade,
    MIN(g.grade_value) AS min_grade,
    MAX(g.grade_value) AS max_grade,
    g.grading_period
FROM users u
INNER JOIN class_enrollments ce ON u.id = ce.student_id
INNER JOIN classes c ON ce.class_id = c.id
LEFT JOIN grades g ON ce.id = g.enrollment_id
WHERE u.profile_type = 'aluno' AND u.is_active = TRUE
GROUP BY u.id, u.full_name, c.id, c.name, g.grading_period;

-- ----------------------------------------------------------------------------
-- View: vw_upcoming_events
-- Próximos eventos do calendário (7 dias)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_upcoming_events AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_type,
    e.event_date,
    e.start_time,
    e.end_time,
    e.location,
    e.color_hex,
    c.name AS class_name,
    c.code AS class_code,
    u.full_name AS creator_name
FROM calendar_events e
LEFT JOIN classes c ON e.class_id = c.id
INNER JOIN users u ON e.creator_id = u.id
WHERE e.event_date >= CURDATE() 
  AND e.event_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND e.is_active = TRUE
ORDER BY e.event_date, e.start_time;

-- ----------------------------------------------------------------------------
-- View: vw_attendance_summary
-- Resumo de frequência por aluno
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_attendance_summary AS
SELECT 
    u.id AS student_id,
    u.full_name AS student_name,
    c.id AS class_id,
    c.name AS class_name,
    COUNT(a.id) AS total_records,
    SUM(CASE WHEN a.status = 'presente' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN a.status = 'absente' THEN 1 ELSE 0 END) AS absent_count,
    SUM(CASE WHEN a.status = 'atrasado' THEN 1 ELSE 0 END) AS late_count,
    SUM(CASE WHEN a.status = 'justificado' THEN 1 ELSE 0 END) AS justified_count,
    ROUND(
        (SUM(CASE WHEN a.status = 'presente' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 
        2
    ) AS attendance_percentage
FROM users u
INNER JOIN class_enrollments ce ON u.id = ce.student_id
INNER JOIN classes c ON ce.class_id = c.id
LEFT JOIN attendance a ON ce.id = a.enrollment_id
WHERE u.profile_type = 'aluno' AND u.is_active = TRUE
GROUP BY u.id, u.full_name, c.id, c.name;

-- ============================================================================
-- 4. DADOS INICIAIS (DML) - SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Inserção de Usuários Administrativos
-- ----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, full_name, phone, profile_type, is_active) VALUES
-- Admin do sistema (senha: admin123 - hash simulado, em produção usar password_hash())
('admin@aev.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador do Sistema', '(11) 99999-9999', 'admin', TRUE),
-- Professores
('carlos.silva@escola.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Silva', '(11) 98888-1111', 'professor', TRUE),
('ana.paula@escola.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana Paula Santos', '(11) 98888-2222', 'professor', TRUE),
('tranquedo.nieves@escola.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tranquedo Nieves', '(11) 98888-3333', 'professor', TRUE),
-- Alunos
('ana.clara@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana Clara Silva', '(11) 97777-1111', 'aluno', TRUE),
('bruno.oliveira@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bruno Oliveira', '(11) 97777-2222', 'aluno', TRUE),
('carlos.mendes@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Mendes', '(11) 97777-3333', 'aluno', TRUE),
('diana.santos@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana Santos', '(11) 97777-4444', 'aluno', TRUE),
('eduardo.lima@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Eduardo Lima', '(11) 97777-5555', 'aluno', TRUE),
('fernanda.costa@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fernanda Costa', '(11) 97777-6666', 'aluno', TRUE),
('gabriel.souza@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gabriel Souza', '(11) 97777-7777', 'aluno', TRUE),
('helena.rocha@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Helena Rocha', '(11) 97777-8888', 'aluno', TRUE),
('igor.ferreira@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Igor Ferreira', '(11) 97777-9999', 'aluno', TRUE),
('julia.martins@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Julia Martins', '(11) 97777-0000', 'aluno', TRUE),
('lucas.pereira@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas Pereira', '(11) 96666-1111', 'aluno', TRUE),
('maria.eduarda@aluno.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Eduarda', '(11) 96666-2222', 'aluno', TRUE),
-- Responsáveis
('pai.ana@responsavel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Roberto Silva', '(11) 95555-1111', 'responsavel', TRUE),
('mae.bruno@responsavel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Patricia Oliveira', '(11) 95555-2222', 'responsavel', TRUE);

-- ----------------------------------------------------------------------------
-- Inserção de Escolas
-- ----------------------------------------------------------------------------
INSERT INTO schools (name, address, phone, email, cnpj, is_active) VALUES
('Escola CEF 308', 'Rua das Flores, 123 - Santa Maria, Brasília - DF', '(61) 3333-4444', 'contato@cef308.edu.br', '00.000.000/0001-00', TRUE),
('Colégio Técnico de Santa Maria', 'Av. Principal, 456 - Santa Maria, Brasília - DF', '(61) 3333-5555', 'contato@etsm.edu.br', '00.000.000/0001-11', TRUE),
('Escola Municipal São José', 'Rua Secundária, 789 - Centro, Brasília - DF', '(61) 3333-6666', 'contato@emsj.edu.br', '00.000.000/0001-22', TRUE);

-- ----------------------------------------------------------------------------
-- Inserção de Administradores de Escola
-- ----------------------------------------------------------------------------
INSERT INTO school_administrators (school_id, user_id) VALUES
(1, 1),  -- Admin é administrador da CEF 308
(2, 1),  -- Admin é administrador do ETS M
(3, 1);  -- Admin é administrador da EMSJ

-- ----------------------------------------------------------------------------
-- Inserção de Turmas
-- ----------------------------------------------------------------------------
INSERT INTO classes (school_id, name, code, academic_year, grade_level, is_active) VALUES
-- CEF 308
(1, 'Matemática - 9º Ano A', 'MAT-9A-2025', 2025, '9º Ano', TRUE),
(1, 'Português - 8º Ano A', 'POR-8A-2025', 2025, '8º Ano', TRUE),
(1, 'Ciências - 7º Ano A', 'CIE-7A-2025', 2025, '7º Ano', TRUE),
(1, 'História - 6º Ano A', 'HIS-6A-2025', 2025, '6º Ano', TRUE),
-- ETS M
(2, 'Matemática - 1ª Série EM', 'MAT-1EM-2025', 2025, '1ª Série Ensino Médio', TRUE),
(2, 'Física - 2ª Série EM', 'FIS-2EM-2025', 2025, '2ª Série Ensino Médio', TRUE),
(2, 'Química - 3ª Série EM', 'QUI-3EM-2025', 2025, '3ª Série Ensino Médio', TRUE);

-- ----------------------------------------------------------------------------
-- Inserção de Matrículas de Alunos
-- ----------------------------------------------------------------------------
INSERT INTO class_enrollments (class_id, student_id, enrollment_date, status) VALUES
-- Turma Matemática 9º Ano A
(1, 5, '2025-02-01', 'ativo'),  -- Ana Clara
(1, 6, '2025-02-01', 'ativo'),  -- Bruno Oliveira
(1, 8, '2025-02-01', 'ativo'),  -- Diana Santos
(1, 10, '2025-02-01', 'ativo'), -- Fernanda Costa
(1, 13, '2025-02-01', 'ativo'), -- Igor Ferreira
-- Turma Português 8º Ano A
(2, 7, '2025-02-01', 'ativo'),  -- Carlos Mendes
(2, 9, '2025-02-01', 'ativo'),  -- Eduardo Lima
(2, 11, '2025-02-01', 'ativo'), -- Gabriel Souza
(2, 12, '2025-02-01', 'ativo'), -- Helena Rocha
(2, 14, '2025-02-01', 'ativo'), -- Julia Martins
-- Turma Ciências 7º Ano A
(3, 15, '2025-02-01', 'ativo'), -- Lucas Pereira
(3, 16, '2025-02-01', 'ativo'); -- Maria Eduarda

-- ----------------------------------------------------------------------------
-- Inserção de Professores por Turma
-- ----------------------------------------------------------------------------
INSERT INTO class_teachers (class_id, teacher_id, subject, is_primary_teacher) VALUES
-- Matemática 9º Ano A - Prof. Carlos Silva
(1, 2, 'Matemática', TRUE),
-- Português 8º Ano A - Profª. Ana Paula
(2, 3, 'Português', TRUE),
-- Ciências 7º Ano A - Prof. Tranquedo Nieves
(3, 4, 'Ciências', TRUE),
-- História 6º Ano A - Profª. Ana Paula
(4, 3, 'História', FALSE),
-- Matemática 1ª Série EM - Prof. Carlos Silva
(5, 2, 'Matemática', TRUE),
-- Física 2ª Série EM - Prof. Tranquedo Nieves
(6, 4, 'Física', TRUE),
-- Química 3ª Série EM - Prof. Carlos Silva
(7, 2, 'Química', TRUE);

-- ----------------------------------------------------------------------------
-- Inserção de Relação Responsável-Aluno
-- ----------------------------------------------------------------------------
INSERT INTO parent_students (parent_id, student_id, relationship) VALUES
-- Roberto Silva é pai de Ana Clara
(17, 5, 'Pai'),
-- Patricia Oliveira é mãe de Bruno Oliveira
(18, 6, 'Mãe');

-- ----------------------------------------------------------------------------
-- Inserção de Eventos do Calendário
-- ----------------------------------------------------------------------------
INSERT INTO calendar_events (class_id, creator_id, title, description, event_type, event_date, start_time, end_time, is_all_day, location, color_hex) VALUES
-- Eventos gerais
(NULL, 1, 'Reunião de Pais e Mestres', 'Reunião geral com todos os pais e professores.', 'reuniao', '2025-06-15', '19:00:00', '21:00:00', FALSE, 'Auditório Principal', '#E74C3C'),
(NULL, 1, 'Feriado - Corpus Christi', 'Não haverá aula.', 'feriado', '2025-06-19', NULL, NULL, TRUE, NULL, '#95A5A6'),
-- Eventos por turma
(1, 2, 'Prova de Matemática - 2º Bimestre', 'Prova abrangendo equações de 2º grau e funções.', 'prova', '2025-06-20', '08:00:00', '10:00:00', FALSE, 'Sala 101', '#E74C3C'),
(1, 2, 'Entrega de Trabalho - Geometria', 'Entrega do trabalho sobre polígonos e áreas.', 'trabalho', '2025-06-25', NULL, NULL, TRUE, NULL, '#F39C12'),
(2, 3, 'Prova de Português - Interpretação de Texto', 'Avaliação sobre interpretação e gramática.', 'prova', '2025-06-22', '10:00:00', '12:00:00', FALSE, 'Sala 205', '#E74C3C'),
(2, 3, 'Feira do Livro', 'Apresentação dos trabalhos literários.', 'evento_escolar', '2025-06-28', '14:00:00', '18:00:00', FALSE, 'Biblioteca', '#9B59B6'),
(3, 4, 'Experimento de Ciências', 'Aula prática no laboratório.', 'tarefa', '2025-06-18', '08:00:00', '10:00:00', FALSE, 'Laboratório de Ciências', '#3498DB');

-- ----------------------------------------------------------------------------
-- Inserção de Atividades/Tarefas
-- ----------------------------------------------------------------------------
INSERT INTO activities (class_id, teacher_id, title, description, activity_type, due_date, max_score, is_graded, status) VALUES
-- Matemática 9º Ano
(1, 2, 'Lista de Exercícios - Equações', 'Resolver exercícios 1 a 20 da página 45.', 'tarefa_casa', '2025-06-10', 10.00, TRUE, 'aberta'),
(1, 2, 'Projeto - Matemática no Cotidiano', 'Criar apresentação sobre aplicações práticas da matemática.', 'projeto', '2025-07-01', 10.00, TRUE, 'aberta'),
-- Português 8º Ano
(2, 3, 'Redação - Gênero Narrativo', 'Escrever um conto de até 30 linhas.', 'tarefa_casa', '2025-06-15', 10.00, TRUE, 'aberta'),
(2, 3, 'Análise Literária', 'Analisar o livro "O Pequeno Príncipe".', 'pesquisa', '2025-06-30', 10.00, TRUE, 'aberta'),
-- Ciências 7º Ano
(3, 4, 'Relatório de Experimento', 'Descrever o experimento realizado em aula.', 'atividade_sala', '2025-06-20', 10.00, TRUE, 'aberta');

-- ----------------------------------------------------------------------------
-- Inserção de Comunicados
-- ----------------------------------------------------------------------------
INSERT INTO announcements (school_id, class_id, author_id, title, content, priority, is_pinned) VALUES
-- Comunicados gerais da escola
(1, NULL, 1, 'Início das Matrículas 2026', 'As matrículas para o ano letivo de 2026 estarão abertas a partir de 01/08.', 'alta', TRUE),
(1, NULL, 1, 'Manutenção do Sistema', 'O sistema ficará indisponível no sábado das 02:00 às 06:00.', 'normal', FALSE),
-- Comunicados por turma
(1, 1, 2, 'Material de Apoio Disponível', 'O material complementar de matemática está disponível na biblioteca virtual.', 'normal', FALSE),
(1, 2, 3, 'Lista de Leitura Obrigatória', 'Confira a lista de livros para o segundo semestre.', 'alta', TRUE);

-- ----------------------------------------------------------------------------
-- Inserção de Configurações de Usuário
-- ----------------------------------------------------------------------------
INSERT INTO user_settings (user_id, theme, language, notifications_enabled, email_notifications, timezone)
SELECT id, 'light', 'pt-BR', TRUE, TRUE, 'America/Sao_Paulo'
FROM users;

-- ----------------------------------------------------------------------------
-- Inserção de Logs de Auditoria Iniciais
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, ip_address) VALUES
(1, 'SYSTEM_INIT', 'database', NULL, '{"message": "Sistema inicializado com dados seed"}, '127.0.0.1');

-- ============================================================================
-- 5. TRIGGERS PARA INTEGRIDADE E AUTOMAÇÃO
-- ============================================================================

DELIMITER $$

-- Trigger: Atualizar updated_at automaticamente
CREATE TRIGGER trg_before_update_users
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

-- Trigger: Registrar log quando uma nota for inserida
CREATE TRIGGER trg_after_insert_grades
AFTER INSERT ON grades
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (NEW.teacher_id, 'GRADE_CREATED', 'grades', NEW.id, 
            JSON_OBJECT('grade_value', NEW.grade_value, 'title', NEW.title));
END$$

-- Trigger: Validar data de entrega de atividade não ser passada ao criar
CREATE TRIGGER trg_before_insert_activities
BEFORE INSERT ON activities
FOR EACH ROW
BEGIN
    IF NEW.due_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A data de entrega não pode ser anterior à data atual.';
    END IF;
END$$

-- Trigger: Atualizar status da atividade quando todas as entregas forem avaliadas
CREATE TRIGGER trg_after_update_activity_submissions
AFTER UPDATE ON activity_submissions
FOR EACH ROW
BEGIN
    DECLARE total_submissions INT;
    DECLARE graded_submissions INT;
    
    SELECT COUNT(*), SUM(CASE WHEN status = 'avaliado' THEN 1 ELSE 0 END)
    INTO total_submissions, graded_submissions
    FROM activity_submissions
    WHERE activity_id = NEW.activity_id;
    
    IF total_submissions > 0 AND total_submissions = graded_submissions THEN
        UPDATE activities
        SET status = 'encerrada'
        WHERE id = NEW.activity_id;
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- 6. STORED PROCEDURES PARA OPERAÇÕES COMUNS
-- ============================================================================

DELIMITER $$

-- Procedure: Registrar presença do aluno
CREATE PROCEDURE sp_register_attendance(
    IN p_enrollment_id BIGINT,
    IN p_class_id BIGINT,
    IN p_date DATE,
    IN p_status VARCHAR(20),
    IN p_recorded_by BIGINT,
    IN p_justification TEXT
)
BEGIN
    INSERT INTO attendance (enrollment_id, class_id, date, status, recorded_by, justification)
    VALUES (p_enrollment_id, p_class_id, p_date, p_status, p_recorded_by, p_justification)
    ON DUPLICATE KEY UPDATE 
        status = p_status,
        justification = p_justification,
        updated_at = CURRENT_TIMESTAMP;
END$$

-- Procedure: Calcular média final do aluno em uma turma
CREATE PROCEDURE sp_calculate_student_average(
    IN p_student_id BIGINT,
    IN p_class_id BIGINT
)
BEGIN
    SELECT 
        u.full_name AS student_name,
        c.name AS class_name,
        COUNT(g.id) AS total_grades,
        COALESCE(AVG(g.grade_value * g.weight) / NULLIF(SUM(g.weight), 0), 0) AS weighted_average,
        COALESCE(AVG(g.grade_value), 0) AS simple_average
    FROM users u
    INNER JOIN class_enrollments ce ON u.id = ce.student_id
    INNER JOIN classes c ON ce.class_id = c.id
    LEFT JOIN grades g ON ce.id = g.enrollment_id
    WHERE u.id = p_student_id AND c.id = p_class_id
    GROUP BY u.id, u.full_name, c.id, c.name;
END$$

-- Procedure: Obter agenda completa do aluno
CREATE PROCEDURE sp_get_student_agenda(
    IN p_student_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT DISTINCT
        e.id,
        e.title,
        e.description,
        e.event_type,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.color_hex,
        c.name AS class_name
    FROM calendar_events e
    INNER JOIN class_enrollments ce ON e.class_id = ce.class_id
    INNER JOIN classes c ON e.class_id = c.id
    WHERE ce.student_id = p_student_id
      AND e.event_date BETWEEN p_start_date AND p_end_date
      AND e.is_active = TRUE
    ORDER BY e.event_date, e.start_time;
END$$

-- Procedure: Listar alunos com baixa frequência
CREATE PROCEDURE sp_get_low_attendance_students(
    IN p_class_id BIGINT,
    IN p_min_percentage DECIMAL(5,2)
)
BEGIN
    SELECT 
        u.id AS student_id,
        u.full_name AS student_name,
        u.email,
        COUNT(a.id) AS total_classes,
        SUM(CASE WHEN a.status = 'presente' THEN 1 ELSE 0 END) AS present_count,
        ROUND(
            (SUM(CASE WHEN a.status = 'presente' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 
            2
        ) AS attendance_percentage
    FROM users u
    INNER JOIN class_enrollments ce ON u.id = ce.student_id
    LEFT JOIN attendance a ON ce.id = a.enrollment_id
    WHERE ce.class_id = p_class_id AND u.is_active = TRUE
    GROUP BY u.id, u.full_name, u.email
    HAVING attendance_percentage < p_min_percentage
    ORDER BY attendance_percentage ASC;
END$$

DELIMITER ;

-- ============================================================================
-- 7. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_calendar_events_date_class ON calendar_events(event_date, class_id, is_active);
CREATE INDEX idx_grades_enrollment_period ON grades(enrollment_id, grading_period);
CREATE INDEX idx_attendance_date_class ON attendance(date, class_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_announcements_active ON announcements(is_active, publish_at, priority);

-- ============================================================================
-- 8. CONSULTAS DE VERIFICAÇÃO (TESTES)
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'aev_db' 
-- ORDER BY table_name;

-- Verificar contagem de registros
-- SELECT 
--     'users' AS table_name, COUNT(*) AS record_count FROM users
-- UNION ALL SELECT 'schools', COUNT(*) FROM schools
-- UNION ALL SELECT 'classes', COUNT(*) FROM classes
-- UNION ALL SELECT 'class_enrollments', COUNT(*) FROM class_enrollments
-- UNION ALL SELECT 'calendar_events', COUNT(*) FROM calendar_events;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
