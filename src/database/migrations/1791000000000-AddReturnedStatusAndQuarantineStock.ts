import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * STORE-001 / RED-006:
 * - orders.returned status for post-delivery quality returns
 * - stock_movements.quarantine type
 * - partner_products.quarantineStock
 * - orders return disposition / reason audit fields
 */
export class AddReturnedStatusAndQuarantineStock1791000000000 implements MigrationInterface {
  name = 'AddReturnedStatusAndQuarantineStock1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'returned'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."stock_movements_type_enum" ADD VALUE IF NOT EXISTS 'quarantine'`,
    );

    await queryRunner.query(`
      ALTER TABLE "partner_products"
      ADD COLUMN IF NOT EXISTS "quarantineStock" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "returnDisposition" character varying(30)
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "returnReasonCode" character varying(80)
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "returnReasonText" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "returnReasonText"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "returnReasonCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN IF EXISTS "returnDisposition"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_products" DROP COLUMN IF EXISTS "quarantineStock"`,
    );
    // Postgres cannot easily remove enum values; leave enum members in place on down.
  }
}
