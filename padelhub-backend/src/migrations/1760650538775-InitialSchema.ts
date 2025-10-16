import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760650538775 implements MigrationInterface {
    name = 'InitialSchema1760650538775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clubs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "address" text NOT NULL, "pictureUrl" character varying(500), "phone" character varying(20), "email" character varying(255), "website" character varying(500), "appUrl" character varying(500), "pixKey" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bb09bd0c8d5238aeaa8f86ee0d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."matches_status_enum" AS ENUM('COMPLETED', 'CANCELLED', 'IN_PROGRESS', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "matches" ("matchId" uuid NOT NULL DEFAULT uuid_generate_v4(), "clubId" uuid NOT NULL, "courtId" character varying(100), "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "category" integer NOT NULL, "status" "public"."matches_status_enum" NOT NULL DEFAULT 'PENDING', "password" character varying(255), "isCourtScheduled" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00f0b0a807779364b0671ff5a35" PRIMARY KEY ("matchId"))`);
        await queryRunner.query(`CREATE TYPE "public"."match_players_team_enum" AS ENUM('UNASSIGNED', 'A', 'B')`);
        await queryRunner.query(`CREATE TABLE "match_players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matchId" uuid NOT NULL, "userId" uuid NOT NULL, "team" "public"."match_players_team_enum" NOT NULL DEFAULT 'UNASSIGNED', "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ad88db39fec4c7425084267fb20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_sidepreference_enum" AS ENUM('left', 'right')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "googleId" character varying(255), "phone" character varying(20), "isUserVerified" boolean NOT NULL DEFAULT false, "profilePictureUrl" character varying(500), "category" integer NOT NULL DEFAULT '8', "matchesPlayed" integer NOT NULL DEFAULT '0', "city" character varying(100), "sidePreference" "public"."users_sidepreference_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "match_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "matchId" uuid NOT NULL, "userId" uuid NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e09c0fbac8331956a55da075c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_af4383e83b16dcaef9bdea1056" ON "match_messages" ("matchId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "matches" ADD CONSTRAINT "FK_4d419163c87e8738be9fa825f35" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_players" ADD CONSTRAINT "FK_82908e44842328e7fb058d0f303" FOREIGN KEY ("matchId") REFERENCES "matches"("matchId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_players" ADD CONSTRAINT "FK_65052854f685995e144a037cf2b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_messages" ADD CONSTRAINT "FK_406e5e8dd9829b48bc75f464960" FOREIGN KEY ("matchId") REFERENCES "matches"("matchId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_messages" ADD CONSTRAINT "FK_f3c5ab22af8ef8190aad5e6dfd6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_messages" DROP CONSTRAINT "FK_f3c5ab22af8ef8190aad5e6dfd6"`);
        await queryRunner.query(`ALTER TABLE "match_messages" DROP CONSTRAINT "FK_406e5e8dd9829b48bc75f464960"`);
        await queryRunner.query(`ALTER TABLE "match_players" DROP CONSTRAINT "FK_65052854f685995e144a037cf2b"`);
        await queryRunner.query(`ALTER TABLE "match_players" DROP CONSTRAINT "FK_82908e44842328e7fb058d0f303"`);
        await queryRunner.query(`ALTER TABLE "matches" DROP CONSTRAINT "FK_4d419163c87e8738be9fa825f35"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af4383e83b16dcaef9bdea1056"`);
        await queryRunner.query(`DROP TABLE "match_messages"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_sidepreference_enum"`);
        await queryRunner.query(`DROP TABLE "match_players"`);
        await queryRunner.query(`DROP TYPE "public"."match_players_team_enum"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP TYPE "public"."matches_status_enum"`);
        await queryRunner.query(`DROP TABLE "clubs"`);
    }

}
