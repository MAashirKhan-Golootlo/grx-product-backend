import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantIntegrationCredentials1778079600000 implements MigrationInterface {
  name = 'AddTenantIntegrationCredentials1778079600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "integrationEnabled" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "clientSecretHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "clientSecretEncrypted" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "clientSecretEncrypted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "clientSecretHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "integrationEnabled"`,
    );
  }
}
