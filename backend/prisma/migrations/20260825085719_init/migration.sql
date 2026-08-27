-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Department_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Municipality" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Municipality_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "municipality_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Zone_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "Municipality" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollingStation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zone_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "PollingStation_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollingTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "polling_station_id" TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    CONSTRAINT "PollingTable_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Elector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Elector_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "document_type" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "TeamPosition_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "municipality_id" TEXT,
    "zone_id" TEXT,
    "polling_station_id" TEXT,
    "polling_table_id" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamAssignment_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "TeamMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamAssignment_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "TeamPosition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamAssignment_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "Municipality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TeamAssignment_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TeamAssignment_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TeamAssignment_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "municipality_id" TEXT,
    "zone_id" TEXT,
    "polling_station_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Plan_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Plan_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "Municipality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plan_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Plan_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "due_date" DATETIME,
    "assignee_id" TEXT,
    "municipality_id" TEXT,
    "zone_id" TEXT,
    "polling_station_id" TEXT,
    "polling_table_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Task_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "TeamMember" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "Municipality" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectionDayOperation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_datetime" DATETIME NOT NULL,
    "end_datetime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ElectionDayOperation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FieldReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "election_day_id" TEXT NOT NULL,
    "client_uuid" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "reporter_id" TEXT NOT NULL,
    "polling_station_id" TEXT,
    "polling_table_id" TEXT,
    "reported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldReport_election_day_id_fkey" FOREIGN KEY ("election_day_id") REFERENCES "ElectionDayOperation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FieldReport_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "TeamMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FieldReport_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FieldReport_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperationalIncident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "election_day_id" TEXT NOT NULL,
    "client_uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "assignee_id" TEXT,
    "polling_station_id" TEXT,
    "polling_table_id" TEXT,
    "resolved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OperationalIncident_election_day_id_fkey" FOREIGN KEY ("election_day_id") REFERENCES "ElectionDayOperation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperationalIncident_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OperationalIncident_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "election_day_id" TEXT NOT NULL,
    "client_uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "polling_station_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "reported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_election_day_id_fkey" FOREIGN KEY ("election_day_id") REFERENCES "ElectionDayOperation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "TeamMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CheckIn_polling_station_id_fkey" FOREIGN KEY ("polling_station_id") REFERENCES "PollingStation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "election_type" TEXT NOT NULL,
    "election_date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Election_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "election_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ballot_number" TEXT,
    "party_or_group" TEXT,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Candidate_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElectionAct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "election_id" TEXT NOT NULL,
    "polling_table_id" TEXT NOT NULL,
    "document_reference" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ElectionAct_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectionAct_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectionAct_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PollingTableResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "election_id" TEXT NOT NULL,
    "polling_table_id" TEXT NOT NULL,
    "act_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "correction_reason" TEXT,
    "reported_by" TEXT NOT NULL,
    "reported_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PollingTableResult_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PollingTableResult_polling_table_id_fkey" FOREIGN KEY ("polling_table_id") REFERENCES "PollingTable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PollingTableResult_act_id_fkey" FOREIGN KEY ("act_id") REFERENCES "ElectionAct" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PollingTableResult_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidateResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CandidateResult_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "PollingTableResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CandidateResult_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoryResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CategoryResult_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "PollingTableResult" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filters" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "file_url" TEXT,
    "error_message" TEXT,
    "expires_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" DATETIME,
    CONSTRAINT "ExportJob_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExportJob_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config_json" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "SavedReport_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DashboardPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "widgets_json" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "DashboardPreference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "new_values" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnomalyAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "context_json" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "reviewed_by" TEXT,
    "resolution_note" TEXT,
    "detected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AnomalyAlert_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnomalyAlert_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntelligenceModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "metrics_json" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SimulationScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parameters_json" TEXT NOT NULL,
    "result_json" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationScenario_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SimulationScenario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_organization_id_name_key" ON "Department"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Elector_organization_id_document_type_document_number_key" ON "Elector"("organization_id", "document_type", "document_number");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_user_id_key" ON "TeamMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_organization_id_document_type_document_number_key" ON "TeamMember"("organization_id", "document_type", "document_number");

-- CreateIndex
CREATE UNIQUE INDEX "FieldReport_client_uuid_key" ON "FieldReport"("client_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalIncident_client_uuid_key" ON "OperationalIncident"("client_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_client_uuid_key" ON "CheckIn"("client_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ElectionAct_checksum_key" ON "ElectionAct"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardPreference_user_id_key" ON "DashboardPreference"("user_id");

-- CreateIndex
CREATE INDEX "AuditLog_organization_id_created_at_idx" ON "AuditLog"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "AnomalyAlert_organization_id_status_idx" ON "AnomalyAlert"("organization_id", "status");
