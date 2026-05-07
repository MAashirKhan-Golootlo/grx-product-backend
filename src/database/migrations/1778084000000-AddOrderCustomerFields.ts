import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderCustomerFields1778084000000 implements MigrationInterface {
  name = 'AddOrderCustomerFields1778084000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "customerId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "customerName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "customerPhone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "customerEmail" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customerEmail"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customerPhone"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customerName"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "customerId"`);
  }
}
