import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryImageUrl1778085000000 implements MigrationInterface {
  name = 'AddCategoryImageUrl1778085000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "imageUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "imageUrl"`);
  }
}
