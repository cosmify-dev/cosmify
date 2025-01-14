import { MigrationInterface, QueryRunner } from "typeorm";

export class Auth1736695267728 implements MigrationInterface {
  name = "Auth1736695267728";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" text not null primary key, "name" text not null, "email" text unique, "username" text not null unique, "emailVerified" boolean   not null, "image" text, "createdAt" timestamp not null, "updatedAt" timestamp not null)`
    );

    await queryRunner.query(
      `CREATE TABLE "session" ("id" text not null primary key, "expiresAt" timestamp not null, "token" text not null unique, "createdAt" timestamp not null, "updatedAt" timestamp not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id"), "activeOrganizationId" text)`
    );

    await queryRunner.query(
      `CREATE TABLE "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamp, "refreshTokenExpiresAt" timestamp, "scope" text, "password" text, "createdAt" timestamp not null, "updatedAt" timestamp not null)`
    );

    await queryRunner.query(
      `CREATE TABLE "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamp not null, "createdAt" timestamp, "updatedAt" timestamp)`
    );

    await queryRunner.query(
      `CREATE TABLE "organization" ("id" text not null primary key, "name" text not null, "slug" text not null unique, "logo" text, "createdAt" timestamp not null, "metadata" text)`
    );

    await queryRunner.query(
      `CREATE TABLE "member" ("id" text not null primary key, "organizationId" text not null references "organization" ("id"), "userId" text not null references "user" ("id"), "role" text not null, "createdAt" timestamp not null)`
    );

    await queryRunner.query(
      `CREATE TABLE "invitation" ("id" text not null primary key, "organizationId" text not null references "organization" ("id"), "email" text not null, "role" text, "status" text not null, "expiresAt" timestamp not null, "inviterId" text not null references "user" ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("invitation");
    await queryRunner.dropTable("member");
    await queryRunner.dropTable("organization");
    await queryRunner.dropTable("verification");
    await queryRunner.dropTable("account");
    await queryRunner.dropTable("session");
    await queryRunner.dropTable("user");
  }
}
