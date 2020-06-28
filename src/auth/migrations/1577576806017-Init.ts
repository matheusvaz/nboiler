import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1577576806017 implements MigrationInterface {
    name = 'Init1577576806017';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            'CREATE TABLE `role` (`id` varchar(255) NOT NULL, `name` varchar(32) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined,
        );
        await queryRunner.query(
            'CREATE TABLE `user` (`id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `multi_factor_enabled` tinyint NOT NULL DEFAULT 1, `lockout_enabled` tinyint NOT NULL DEFAULT 1, `lockout_end_date_utc` datetime NULL, UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined,
        );
        await queryRunner.query(
            'CREATE TABLE `password_reset` (`id` varchar(255) NOT NULL, `token` varchar(255) NOT NULL, `user_id` varchar(36) NULL, UNIQUE INDEX `REL_ad88301fdc79593dd222268a8b` (`user_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
            undefined,
        );
        await queryRunner.query(
            'CREATE TABLE `user_role` (`user_id` varchar(36) NOT NULL, `role_id` varchar(36) NOT NULL, INDEX `IDX_d0e5815877f7395a198a4cb0a4` (`user_id`), INDEX `IDX_32a6fc2fcb019d8e3a8ace0f55` (`role_id`), PRIMARY KEY (`user_id`, `role_id`)) ENGINE=InnoDB',
            undefined,
        );
        await queryRunner.query(
            'ALTER TABLE `password_reset` ADD CONSTRAINT `FK_ad88301fdc79593dd222268a8b6` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
            undefined,
        );
        await queryRunner.query(
            'ALTER TABLE `user_role` ADD CONSTRAINT `FK_d0e5815877f7395a198a4cb0a46` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined,
        );
        await queryRunner.query(
            'ALTER TABLE `user_role` ADD CONSTRAINT `FK_32a6fc2fcb019d8e3a8ace0f55f` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
            undefined,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `user_role` DROP FOREIGN KEY `FK_32a6fc2fcb019d8e3a8ace0f55f`', undefined);
        await queryRunner.query('ALTER TABLE `user_role` DROP FOREIGN KEY `FK_d0e5815877f7395a198a4cb0a46`', undefined);
        await queryRunner.query(
            'ALTER TABLE `password_reset` DROP FOREIGN KEY `FK_ad88301fdc79593dd222268a8b6`',
            undefined,
        );
        await queryRunner.query('DROP INDEX `IDX_32a6fc2fcb019d8e3a8ace0f55` ON `user_role`', undefined);
        await queryRunner.query('DROP INDEX `IDX_d0e5815877f7395a198a4cb0a4` ON `user_role`', undefined);
        await queryRunner.query('DROP TABLE `user_role`', undefined);
        await queryRunner.query('DROP INDEX `REL_ad88301fdc79593dd222268a8b` ON `password_reset`', undefined);
        await queryRunner.query('DROP TABLE `password_reset`', undefined);
        await queryRunner.query('DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`', undefined);
        await queryRunner.query('DROP TABLE `user`', undefined);
        await queryRunner.query('DROP TABLE `role`', undefined);
    }
}
