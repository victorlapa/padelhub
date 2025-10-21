import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1760654800000 implements MigrationInterface {
  name = 'AddNotifications1760654800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create push_subscriptions table
    await queryRunner.query(`
      CREATE TABLE "push_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "endpoint" text NOT NULL,
        "p256dh" text NOT NULL,
        "auth" text NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "userAgent" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_push_subscriptions" PRIMARY KEY ("id")
      )
    `);

    // Create unique index on userId and endpoint
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_push_subscriptions_userId_endpoint"
      ON "push_subscriptions" ("userId", "endpoint")
    `);

    // Create foreign key to users table
    await queryRunner.query(`
      ALTER TABLE "push_subscriptions"
      ADD CONSTRAINT "FK_push_subscriptions_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create notification_types enum
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'MATCH_STARTING_SOON',
        'MATCH_CANCELLED',
        'MATCH_UPDATED',
        'PLAYER_JOINED',
        'PLAYER_LEFT'
      )
    `);

    // Create notification_status enum
    await queryRunner.query(`
      CREATE TYPE "notification_status_enum" AS ENUM (
        'PENDING',
        'SENT',
        'FAILED'
      )
    `);

    // Create notification_logs table
    await queryRunner.query(`
      CREATE TABLE "notification_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "matchId" uuid,
        "type" "notification_type_enum" NOT NULL,
        "status" "notification_status_enum" NOT NULL DEFAULT 'PENDING',
        "title" text NOT NULL,
        "body" text NOT NULL,
        "data" jsonb,
        "errorMessage" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "sentAt" TIMESTAMP,
        CONSTRAINT "PK_notification_logs" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for notification_logs
    await queryRunner.query(`
      CREATE INDEX "IDX_notification_logs_userId_createdAt"
      ON "notification_logs" ("userId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notification_logs_matchId_type"
      ON "notification_logs" ("matchId", "type")
    `);

    // Create foreign keys for notification_logs
    await queryRunner.query(`
      ALTER TABLE "notification_logs"
      ADD CONSTRAINT "FK_notification_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notification_logs"
      ADD CONSTRAINT "FK_notification_logs_matchId"
      FOREIGN KEY ("matchId") REFERENCES "matches"("matchId")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "notification_logs" DROP CONSTRAINT "FK_notification_logs_matchId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_logs" DROP CONSTRAINT "FK_notification_logs_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "push_subscriptions" DROP CONSTRAINT "FK_push_subscriptions_userId"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_notification_logs_matchId_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_notification_logs_userId_createdAt"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_push_subscriptions_userId_endpoint"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "notification_logs"`);
    await queryRunner.query(`DROP TABLE "push_subscriptions"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "notification_status_enum"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
  }
}
