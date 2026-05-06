import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1778067080414 implements MigrationInterface {
  name = 'InitSchema1778067080414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "imageUrl" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUrl"`);
  }
}
