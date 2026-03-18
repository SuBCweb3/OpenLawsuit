CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`caseType` varchar(100) NOT NULL,
	`status` enum('draft','in_progress','completed','filed') NOT NULL DEFAULT 'draft',
	`plaintiffName` varchar(100),
	`plaintiffGender` varchar(10),
	`plaintiffEthnicity` varchar(20),
	`plaintiffBirthDate` varchar(20),
	`plaintiffIdNumber` varchar(64),
	`plaintiffAddress` text,
	`plaintiffPhone` varchar(20),
	`plaintiffType` enum('natural','legal') DEFAULT 'natural',
	`defendantName` varchar(100),
	`defendantGender` varchar(10),
	`defendantEthnicity` varchar(20),
	`defendantBirthDate` varchar(20),
	`defendantIdNumber` varchar(64),
	`defendantAddress` text,
	`defendantPhone` varchar(20),
	`defendantType` enum('natural','legal') DEFAULT 'natural',
	`claims` text,
	`factsAndReasons` text,
	`evidenceList` text,
	`courtName` varchar(200),
	`disputeAmount` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`docType` enum('complaint','evidence_list','other') NOT NULL DEFAULT 'complaint',
	`title` varchar(255) NOT NULL,
	`content` text,
	`fileUrl` text,
	`fileKey` varchar(500),
	`version` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`caseId` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('document_generated','case_updated','reminder','system') NOT NULL DEFAULT 'system',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
