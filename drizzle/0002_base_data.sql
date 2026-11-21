INSERT OR IGNORE INTO `cities` (`id`,`name`,`slug`,`region`) VALUES ('bologna-default-city','Bologna','bologna','Emilia-Romagna');
--> statement-breakpoint
INSERT OR IGNORE INTO `milestones` (`id`,`city_id`,`occurred_on`,`title`,`description`,`verification_status`,`source`,`status`)
SELECT 'milestone-2023-09-30',`id`,'2023-09-30','Nasce il gruppo WhatsApp','Il primo spazio informale per organizzare partite spontanee a Bologna.','reported','Indicazione del committente · ricostruzione in revisione con gli organizzatori','published' FROM `cities` WHERE `slug`='bologna';
--> statement-breakpoint
INSERT OR IGNORE INTO `milestones` (`id`,`city_id`,`occurred_on`,`title`,`description`,`verification_status`,`source`,`status`)
SELECT 'milestone-2025-05-25',`id`,'2025-05-25','Il primo torneo organizzato','La comunità aggiunge ai giochi spontanei un appuntamento organizzato collettivamente.','reported','Indicazione del committente · ricostruzione in revisione con gli organizzatori','published' FROM `cities` WHERE `slug`='bologna';