CREATE TABLE `affiliate_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`associateId` varchar(50) NOT NULL,
	`affiliateUrl` text NOT NULL,
	`shortUrl` varchar(255),
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`revenue` decimal(12,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateLinkId` int,
	`pinterestPostId` int,
	`eventType` enum('click','conversion','impression','save') NOT NULL,
	`referrer` varchar(500),
	`userAgent` varchar(500),
	`ipAddress` varchar(45),
	`revenue` decimal(12,2),
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`automationType` enum('amazon_search','pinterest_post','analytics_sync') NOT NULL,
	`status` enum('started','completed','failed','partial') NOT NULL,
	`productsFound` int DEFAULT 0,
	`productsPosted` int DEFAULT 0,
	`errorCount` int DEFAULT 0,
	`errorDetails` json DEFAULT ('[]'),
	`executionTime` int,
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automation_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`dataType` enum('string','number','boolean','json') DEFAULT 'string',
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automation_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `automation_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `file_storage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`s3Url` text NOT NULL,
	`fileType` varchar(50),
	`fileName` varchar(255),
	`fileSize` int,
	`mimeType` varchar(100),
	`relatedProductId` int,
	`relatedPostId` int,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_storage_id` PRIMARY KEY(`id`),
	CONSTRAINT `file_storage_s3Key_unique` UNIQUE(`s3Key`)
);
--> statement-breakpoint
CREATE TABLE `pinterest_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`affiliateLinkId` int NOT NULL,
	`pinId` varchar(100),
	`boardId` varchar(100),
	`pinUrl` text,
	`imageUrl` text,
	`title` text NOT NULL,
	`description` text,
	`status` enum('draft','scheduled','posted','failed') DEFAULT 'draft',
	`scheduledAt` timestamp,
	`postedAt` timestamp,
	`clicks` int DEFAULT 0,
	`saves` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pinterest_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asin` varchar(20) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price` decimal(10,2),
	`originalPrice` decimal(10,2),
	`discount` int,
	`imageUrl` text,
	`productUrl` text NOT NULL,
	`category` varchar(255),
	`rating` decimal(3,1),
	`reviewCount` int,
	`inStock` boolean DEFAULT true,
	`isPrime` boolean DEFAULT false,
	`seoDescription` text,
	`pinterestCaption` text,
	`tags` json DEFAULT ('[]'),
	`source` varchar(50) DEFAULT 'amazon',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_asin_unique` UNIQUE(`asin`)
);
--> statement-breakpoint
ALTER TABLE `affiliate_links` ADD CONSTRAINT `affiliate_links_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics` ADD CONSTRAINT `analytics_affiliateLinkId_affiliate_links_id_fk` FOREIGN KEY (`affiliateLinkId`) REFERENCES `affiliate_links`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics` ADD CONSTRAINT `analytics_pinterestPostId_pinterest_posts_id_fk` FOREIGN KEY (`pinterestPostId`) REFERENCES `pinterest_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_storage` ADD CONSTRAINT `file_storage_relatedProductId_products_id_fk` FOREIGN KEY (`relatedProductId`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_storage` ADD CONSTRAINT `file_storage_relatedPostId_pinterest_posts_id_fk` FOREIGN KEY (`relatedPostId`) REFERENCES `pinterest_posts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `file_storage` ADD CONSTRAINT `file_storage_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pinterest_posts` ADD CONSTRAINT `pinterest_posts_productId_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pinterest_posts` ADD CONSTRAINT `pinterest_posts_affiliateLinkId_affiliate_links_id_fk` FOREIGN KEY (`affiliateLinkId`) REFERENCES `affiliate_links`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `affiliate_links` (`productId`);--> statement-breakpoint
CREATE INDEX `associate_id_idx` ON `affiliate_links` (`associateId`);--> statement-breakpoint
CREATE INDEX `analytics_affiliate_link_id_idx` ON `analytics` (`affiliateLinkId`);--> statement-breakpoint
CREATE INDEX `analytics_pinterest_post_id_idx` ON `analytics` (`pinterestPostId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `analytics` (`eventType`);--> statement-breakpoint
CREATE INDEX `analytics_created_at_idx` ON `analytics` (`createdAt`);--> statement-breakpoint
CREATE INDEX `automation_type_idx` ON `automation_logs` (`automationType`);--> statement-breakpoint
CREATE INDEX `automation_status_idx` ON `automation_logs` (`status`);--> statement-breakpoint
CREATE INDEX `automation_created_at_idx` ON `automation_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `s3_key_idx` ON `file_storage` (`s3Key`);--> statement-breakpoint
CREATE INDEX `file_product_id_idx` ON `file_storage` (`relatedProductId`);--> statement-breakpoint
CREATE INDEX `pinterest_product_id_idx` ON `pinterest_posts` (`productId`);--> statement-breakpoint
CREATE INDEX `pinterest_status_idx` ON `pinterest_posts` (`status`);--> statement-breakpoint
CREATE INDEX `posted_at_idx` ON `pinterest_posts` (`postedAt`);--> statement-breakpoint
CREATE INDEX `asin_idx` ON `products` (`asin`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `products` (`createdAt`);