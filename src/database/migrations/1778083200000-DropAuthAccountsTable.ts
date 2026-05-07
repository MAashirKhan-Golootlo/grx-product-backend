import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAuthAccountsTable1778083200000 implements MigrationInterface {
  name = 'DropAuthAccountsTable1778083200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_accounts"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "auth_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "fullName" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_68ef151103dbf5e7e9932972b26" UNIQUE ("email"), CONSTRAINT "PK_8c9dc84256aeaa852e4d87d782b" PRIMARY KEY ("id"))`,
    );
  }
}
