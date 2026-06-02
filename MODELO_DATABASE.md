# 📊 Modelo Lógico e Físico do Banco de Dados - AEV
## Agenda Escolar Virtual

---

## 1. VISÃO GERAL DO MODELO

Este documento descreve o modelo lógico e físico do banco de dados MySQL para o sistema **Agenda Escolar Virtual (AEV)**. O modelo foi projetado para suportar todas as funcionalidades identificadas na análise do código frontend do repositório.

### 1.1 Stack Tecnológico
- **SGBD**: MySQL 8.0+
- **Engine**: InnoDB
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

### 1.2 Perfis de Usuário Suportados
- 👨‍🏫 **Professor**: Lança notas, frequência, cria eventos e atividades
- 👨‍🎓 **Aluno**: Visualiza agenda, notas, atividades e frequência
- 👨‍👩‍👧 **Responsável**: Acompanha desempenho e agenda dos alunos vinculados
- 🔧 **Admin**: Gerencia escolas, usuários e configurações do sistema

---

## 2. MODELO CONCEITUAL (ENTIDADES)

```
┌─────────────────┐
│     USERS       │
│  (Usuários)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ SCHOOLS  │ │ CLASSES  │ │ PARENTS  │ │ MESSAGES │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘
     │            │             │
     │       ┌────┴────┐        │
     │       │         │        │
     ▼       ▼         ▼        ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ SCHOOL   │ │ENROLLMENT│ │ PARENT_STUDENT│
│  ADMINS  │ │          │ │   RELATION   │
└──────────┘ └────┬─────┘ └──────────────┘
                  │
         ┌────────┼────────┐
         │        │        │
         ▼        ▼        ▼
    ┌────────┐ ┌────────┐ ┌────────────┐
    │TEACHERS│ │GRADES  │ │ ATTENDANCE │
    │  LINK  │ │        │ │            │
    └────────┘ └────────┘ └────────────┘
         │
         ▼
    ┌────────────┐ ┌──────────────┐ ┌──────────────┐
    │ ACTIVITIES │ │  CALENDAR    │ │ ANNOUNCEMENTS│
    │            │ │   EVENTS     │ │              │
    └────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. MODELO LÓGICO DETALHADO

### 3.1 Tabela: `users`
**Descrição**: Armazena todos os usuários do sistema (alunos, professores, responsáveis e administradores).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| email | VARCHAR(255) | NOT NULL, UNIQUE | E-mail de login |
| password_hash | VARCHAR(255) | NOT NULL | Senha criptografada |
| full_name | VARCHAR(255) | NOT NULL | Nome completo |
| phone | VARCHAR(20) | NULL | Telefone/WhatsApp |
| profile_type | ENUM | NOT NULL | aluno, professor, responsavel, admin |
| is_active | BOOLEAN | DEFAULT TRUE | Status da conta |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |
| last_login_at | TIMESTAMP | NULL | Último acesso |

**Índices**: idx_email, idx_profile_type, idx_is_active

---

### 3.2 Tabela: `schools`
**Descrição**: Instituições de ensino (escolas, colégios, etc.).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| name | VARCHAR(255) | NOT NULL | Nome da escola |
| address | TEXT | NULL | Endereço completo |
| phone | VARCHAR(20) | NULL | Telefone |
| email | VARCHAR(255) | NULL | E-mail institucional |
| cnpj | VARCHAR(18) | NULL | CNPJ da instituição |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_name, idx_is_active

---

### 3.3 Tabela: `classes`
**Descrição**: Turmas disponíveis nas escolas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| school_id | BIGINT UNSIGNED | FK → schools(id) | Escola vinculada |
| name | VARCHAR(100) | NOT NULL | Nome da turma |
| code | VARCHAR(50) | NOT NULL | Código único (ex: MAT-9A-2025) |
| academic_year | YEAR | NOT NULL | Ano letivo |
| grade_level | VARCHAR(50) | NULL | Ex: 9º Ano, 1ª Série EM |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_school_id, idx_academic_year, idx_is_active  
**Unique**: unique_class_code (school_id, code, academic_year)

---

### 3.4 Tabela: `class_enrollments`
**Descrição**: Matrículas de alunos nas turmas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| class_id | BIGINT UNSIGNED | FK → classes(id) | Turma |
| student_id | BIGINT UNSIGNED | FK → users(id) | Aluno |
| enrollment_date | DATE | NOT NULL | Data da matrícula |
| status | ENUM | DEFAULT 'ativo' | ativo, inativo, concluido, transferido |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_class_id, idx_student_id, idx_status  
**Unique**: unique_enrollment (class_id, student_id, enrollment_date)

---

### 3.5 Tabela: `class_teachers`
**Descrição**: Professores vinculados às turmas.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| class_id | BIGINT UNSIGNED | FK → classes(id) | Turma |
| teacher_id | BIGINT UNSIGNED | FK → users(id) | Professor |
| subject | VARCHAR(100) | NULL | Disciplina lecionada |
| is_primary_teacher | BOOLEAN | DEFAULT FALSE | É professor titular? |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_class_id, idx_teacher_id  
**Unique**: unique_class_teacher (class_id, teacher_id, subject)

---

### 3.6 Tabela: `parent_students`
**Descrição**: Relação entre responsáveis e alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| parent_id | BIGINT UNSIGNED | FK → users(id) | Responsável |
| student_id | BIGINT UNSIGNED | FK → users(id) | Aluno |
| relationship | VARCHAR(50) | NULL | Parentesco (Pai, Mãe, Tutor) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |

**Índices**: idx_parent_id, idx_student_id  
**Unique**: unique_parent_student (parent_id, student_id)

---

### 3.7 Tabela: `calendar_events`
**Descrição**: Eventos do calendário (provas, trabalhos, reuniões, feriados).

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| class_id | BIGINT UNSIGNED | FK → classes(id), NULL | Turma vinculada (opcional) |
| creator_id | BIGINT UNSIGNED | FK → users(id) | Criador do evento |
| title | VARCHAR(255) | NOT NULL | Título |
| description | TEXT | NULL | Descrição detalhada |
| event_type | ENUM | NOT NULL | prova, trabalho, tarefa, reuniao, feriado, evento_escolar, outro |
| event_date | DATE | NOT NULL | Data do evento |
| start_time | TIME | NULL | Hora de início |
| end_time | TIME | NULL | Hora de término |
| is_all_day | BOOLEAN | DEFAULT FALSE | Evento de dia inteiro |
| location | VARCHAR(255) | NULL | Local |
| color_hex | VARCHAR(7) | DEFAULT '#4A90E2' | Cor no calendário |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_class_id, idx_creator_id, idx_event_date, idx_event_type, idx_is_active

---

### 3.8 Tabela: `grades`
**Descrição**: Notas dos alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| enrollment_id | BIGINT UNSIGNED | FK → class_enrollments(id) | Matrícula do aluno |
| teacher_id | BIGINT UNSIGNED | FK → users(id) | Professor que lançou |
| class_id | BIGINT UNSIGNED | FK → classes(id) | Turma |
| title | VARCHAR(255) | NOT NULL | Ex: Prova Bimestral |
| description | TEXT | NULL | Descrição |
| grade_value | DECIMAL(5,2) | NOT NULL | Nota obtida |
| max_grade | DECIMAL(5,2) | DEFAULT 10.00 | Nota máxima |
| weight | DECIMAL(5,2) | DEFAULT 1.00 | Peso da nota |
| grading_period | VARCHAR(50) | NULL | Ex: 1º Bimestre |
| graded_at | DATE | NOT NULL | Data da avaliação |
| comments | TEXT | NULL | Comentários do professor |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_enrollment_id, idx_teacher_id, idx_class_id, idx_grading_period

---

### 3.9 Tabela: `activities`
**Descrição**: Atividades e tarefas escolares.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| class_id | BIGINT UNSIGNED | FK → classes(id) | Turma |
| teacher_id | BIGINT UNSIGNED | FK → users(id) | Professor criador |
| title | VARCHAR(255) | NOT NULL | Título |
| description | TEXT | NOT NULL | Descrição |
| activity_type | ENUM | NOT NULL | tarefa_casa, atividade_sala, projeto, pesquisa, outro |
| due_date | DATE | NOT NULL | Data de entrega |
| max_score | DECIMAL(5,2) | DEFAULT 10.00 | Pontuação máxima |
| attachments_json | JSON | NULL | Anexos/arquivos |
| is_graded | BOOLEAN | DEFAULT FALSE | Vale nota? |
| status | ENUM | DEFAULT 'aberta' | aberta, encerrada, cancelada |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_class_id, idx_teacher_id, idx_due_date, idx_status

---

### 3.10 Tabela: `activity_submissions`
**Descrição**: Entregas de atividades pelos alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| activity_id | BIGINT UNSIGNED | FK → activities(id) | Atividade |
| student_id | BIGINT UNSIGNED | FK → users(id) | Aluno |
| submission_text | TEXT | NULL | Texto da entrega |
| attachments_json | JSON | NULL | Arquivos enviados |
| submitted_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de entrega |
| grade_value | DECIMAL(5,2) | NULL | Nota recebida |
| teacher_comments | TEXT | NULL | Comentários do professor |
| status | ENUM | DEFAULT 'pendente' | pendente, entregue, atrasado, avaliado |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_activity_id, idx_student_id, idx_status  
**Unique**: unique_submission (activity_id, student_id)

---

### 3.11 Tabela: `announcements`
**Descrição**: Comunicados e avisos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| school_id | BIGINT UNSIGNED | FK → schools(id), NULL | Escola (opcional) |
| class_id | BIGINT UNSIGNED | FK → classes(id), NULL | Turma (opcional) |
| author_id | BIGINT UNSIGNED | FK → users(id) | Autor |
| title | VARCHAR(255) | NOT NULL | Título |
| content | TEXT | NOT NULL | Conteúdo |
| priority | ENUM | DEFAULT 'normal' | baixa, normal, alta, urgente |
| is_pinned | BOOLEAN | DEFAULT FALSE | Fixado no topo |
| publish_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de publicação |
| expires_at | TIMESTAMP | NULL | Expiração |
| is_active | BOOLEAN | DEFAULT TRUE | Status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_school_id, idx_class_id, idx_priority, idx_is_active, idx_publish_at

---

### 3.12 Tabela: `attendance`
**Descrição**: Registro de frequência dos alunos.

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Identificador único |
| enrollment_id | BIGINT UNSIGNED | FK → class_enrollments(id) | Matrícula |
| class_id | BIGINT UNSIGNED | FK → classes(id) | Turma |
| date | DATE | NOT NULL | Data da aula |
| status | ENUM | NOT NULL | presente, ausente, atrasado, justificado |
| justification | TEXT | NULL | Justificativa de ausência/atraso |
| recorded_by | BIGINT UNSIGNED | FK → users(id) | Professor que registrou |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Última atualização |

**Índices**: idx_enrollment_id, idx_class_id, idx_date, idx_status  
**Unique**: unique_attendance (enrollment_id, date)

---

### 3.13 Demais Tabelas Auxiliares

#### `messages` - Mensagens internas entre usuários
- sender_id, recipient_id, subject, body, is_read, parent_message_id (thread)

#### `user_settings` - Preferências dos usuários
- user_id, theme, language, notifications_enabled, timezone

#### `audit_logs` - Logs de auditoria
- user_id, action, entity_type, entity_id, old_values, new_values, ip_address

#### `school_administrators` - Admins por escola
- school_id, user_id

---

## 4. DIAGRAMA DE RELACIONAMENTOS (DER)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DIAGRAMA ENTIDADE-RELACIONAMENTO                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │    USERS     │
                              │ (pk: id)     │
                              └──────┬───────┘
                                     │ 1
                     ┌───────────────┼───────────────┐
                     │               │               │
                     │ N             │ N             │ N
            ┌────────▼──────┐ ┌──────▼──────┐ ┌──────▼────────┐
            │   SCHOOLS     │ │   PARENT_   │ │   MESSAGES    │
            │ (pk: id)      │ │   STUDENTS  │ │ (pk: id)      │
            └───────┬───────┘ │ (pk: id)    │ └───────────────┘
                    │ 1       └─────────────┘
                    │
                    │ N
            ┌───────▼───────┐
            │    CLASSES    │
            │ (pk: id)      │
            │ (fk: school)  │
            └───────┬───────┘
                    │ 1
        ┌───────────┼───────────┐
        │           │           │
        │ N         │ N         │ N
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────────┐
│ ENROLLMENTS  │ │ TEACHERS  │ │ CALENDAR_     │
│ (pk: id)     │ │ (pk: id)  │ │ EVENTS        │
│ (fk: class,  │ │ (fk: class│ │ (pk: id)      │
│  student)    │ │  teacher) │ │ (fk: class,   │
└───────┬──────┘ └───────────┘ │  creator)     │
        │ 1                    └───────────────┘
        │
        │ N
┌───────▼──────────┐
│     GRADES       │
│ (pk: id)         │
│ (fk: enrollment, │
│  teacher, class) │
└──────────────────┘

        ┌────────────────┐
        │   ACTIVITIES   │
        │ (pk: id)       │
        │ (fk: class,    │
        │  teacher)      │
        └───────┬────────┘
                │ 1
                │
                │ N
        ┌───────▼──────────┐
        │ SUBMISSIONS      │
        │ (pk: id)         │
        │ (fk: activity,   │
        │  student)        │
        └──────────────────┘
```

---

## 5. REGRAS DE NEGÓCIO IMPLEMENTADAS

### 5.1 Integridade Referencial
- **CASCADE DELETE**: Quando uma escola é removida, todas as turmas, comunicados e administradores vinculados são removidos
- **SET NULL**: Eventos podem existir sem turma vinculada (eventos gerais da escola)
- **UNIQUE CONSTRAINTS**: Garante unicidade de emails, matrículas, relações pai-aluno

### 5.2 Validações Automáticas (Triggers)
1. **trg_before_insert_activities**: Impede criação de atividades com data de entrega passada
2. **trg_after_insert_grades**: Registra automaticamente log de auditoria ao lançar notas
3. **trg_after_update_activity_submissions**: Atualiza status da atividade quando todas as entregas são avaliadas

### 5.3 Views Pré-definidas
- `vw_active_students_by_class`: Lista alunos ativos por turma
- `vw_teachers_by_class`: Lista professores e disciplinas por turma
- `vw_student_grades_summary`: Resumo de notas com médias
- `vw_upcoming_events`: Próximos eventos (7 dias)
- `vw_attendance_summary`: Percentual de frequência por aluno

### 5.4 Stored Procedures
- `sp_register_attendance`: Registrar presença/ausência
- `sp_calculate_student_average`: Calcular média ponderada do aluno
- `sp_get_student_agenda`: Obter agenda completa do aluno em período
- `sp_get_low_attendance_students`: Listar alunos com frequência abaixo do mínimo

---

## 6. ÍNDICES DE PERFORMANCE

### Índices Simples
- `idx_email` em users(email)
- `idx_profile_type` em users(profile_type)
- `idx_event_date` em calendar_events(event_date)
- `idx_due_date` em activities(due_date)

### Índices Compostos
- `idx_calendar_events_date_class` em calendar_events(event_date, class_id, is_active)
- `idx_grades_enrollment_period` em grades(enrollment_id, grading_period)
- `idx_attendance_date_class` em attendance(date, class_id)

### Índices Parciais (MySQL 8.0+)
- `idx_messages_unread` em messages(recipient_id, is_read) WHERE is_read = FALSE
- `idx_announcements_active` em announcements(is_active, publish_at, priority)

---

## 7. COMO UTILIZAR

### 7.1 Instalação
```bash
mysql -u root -p < /workspace/aev_database.sql
```

### 7.2 Conexão
```bash
mysql -u seu_usuario -p aev_db
```

### 7.3 Verificação
```sql
-- Listar tabelas
SHOW TABLES;

-- Contar registros
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = 'aev_db';

-- Testar view
SELECT * FROM vw_upcoming_events LIMIT 10;

-- Testar procedure
CALL sp_get_student_agenda(5, '2025-06-01', '2025-06-30');
```

---

## 8. USUÁRIOS DE TESTE (SEED DATA)

### Administrador
- Email: `admin@aev.com`
- Senha: `admin123` (em produção, usar hash real)

### Professores
- `carlos.silva@escola.com` - Matemática
- `ana.paula@escola.com` - Português/História
- `tranquedo.nieves@escola.com` - Ciências/Física

### Alunos (12 alunos cadastrados)
- `ana.clara@aluno.com` até `maria.eduarda@aluno.com`

### Responsáveis
- `pai.ana@responsavel.com` - Pai de Ana Clara
- `mae.bruno@responsavel.com` - Mãe de Bruno Oliveira

---

## 9. CONSIDERAÇÕES FINAIS

### Pontos Fortes do Modelo
✅ **Normalização 3NF**: Sem redundância de dados  
✅ **Integridade**: Chaves estrangeiras e constraints bem definidas  
✅ **Performance**: Índices estratégicos para consultas frequentes  
✅ **Escalabilidade**: Projeto preparado para crescimento  
✅ **Auditoria**: Logs completos de operações críticas  
✅ **Flexibilidade**: Suporte a múltiplas escolas e perfis  

### Próximas Evoluções Sugeridas
- Implementar soft delete em tabelas críticas
- Adicionar suporte a anexos de arquivos (S3/Cloud Storage)
- Criar API REST para integração com frontend
- Implementar cache (Redis) para consultas frequentes
- Adicionar full-text search em comunicados e atividades

---

**Documento gerado em**: Junho 2025  
**Versão do modelo**: 1.0  
**Compatibilidade**: MySQL 8.0+
