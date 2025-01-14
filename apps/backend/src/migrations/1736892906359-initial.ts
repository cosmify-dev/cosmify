import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1736892906359 implements MigrationInterface {
  name = "Initial1736892906359";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."command_logs_status_enum" AS ENUM('PENDING', 'INITIALIZING', 'EXECUTING', 'PREPARING', 'INSTALLING', 'SUCCESS', 'ERROR', 'ONLINE', 'OFFLINE', 'DELETING')`
    );
    await queryRunner.query(
      `CREATE TABLE "command_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "command" text, "stdout" text, "stderr" text, "status" "public"."command_logs_status_enum" NOT NULL, "serverId" uuid, "actionId" uuid, CONSTRAINT "PK_15837db71653337438e0c578f56" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'EXECUTING', 'SUCCESS', 'ERROR')`
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" text NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "ports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "hostPort" integer NOT NULL, "containerPort" integer NOT NULL, "containerId" uuid, CONSTRAINT "PK_291c9f372b1ce97c885e96f5ff4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "networks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "default" boolean NOT NULL DEFAULT false, "serverId" uuid, CONSTRAINT "PK_61b1ee921bf79550d9d4742b9f7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "volumes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "hostPath" text NOT NULL, "permission" integer NOT NULL, "create" boolean NOT NULL, "type" text NOT NULL, "containerPath" text NOT NULL, "readonly" boolean NOT NULL, "containerId" uuid, CONSTRAINT "PK_f3d03a6ad79006b028d3eae9e9f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "containers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "image" text NOT NULL, "command" text array NOT NULL, "labels" text array NOT NULL, "fluxId" uuid, CONSTRAINT "PK_21cbac3e68f7b1cf53d39cda70c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fluxes_status_enum" AS ENUM('PENDING', 'INITIALIZING', 'EXECUTING', 'PREPARING', 'INSTALLING', 'SUCCESS', 'ERROR', 'ONLINE', 'OFFLINE', 'DELETING')`
    );
    await queryRunner.query(
      `CREATE TABLE "fluxes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "status" "public"."fluxes_status_enum" NOT NULL DEFAULT 'PENDING', "directoryPath" text, "shutdownTimeout" integer NOT NULL DEFAULT '32', "serverId" uuid, CONSTRAINT "PK_38c307c65cd864dffbe9bc918fe" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_type_enum" AS ENUM('FETCH_UPTIME', 'FETCH_SERVER_INFORMATION', 'UPGRADE_SERVER_PACKAGES', 'CHECK_COMMAND_AVAILABILITY', 'INSTALL_DOCKER', 'QUERY_CONTAINER_LOGS', 'QUERY_CONTAINER_STATS', 'RUN_CONTAINER', 'RUN_COMPOSE_FILE', 'RESTART_COMPOSE_FILE', 'STOP_COMPOSE_FILE', 'PULL_IMAGE', 'CREATE_NETWORK', 'REMOVE_NETWORK', 'REMOVE_CONTAINER', 'SAVE_FILE', 'CREATE_FILE', 'CREATE_DIRECTORY', 'REMOVE_PATH', 'REMOVE_DOCKER')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_status_enum" AS ENUM('PENDING', 'INITIALIZING', 'EXECUTING', 'PREPARING', 'INSTALLING', 'SUCCESS', 'ERROR', 'ONLINE', 'OFFLINE', 'DELETING')`
    );
    await queryRunner.query(
      `CREATE TABLE "actions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."actions_type_enum" NOT NULL, "status" "public"."actions_status_enum" NOT NULL DEFAULT 'PENDING', "serverId" uuid, "fluxId" uuid, "transactionId" uuid, CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."servers_status_enum" AS ENUM('PENDING', 'INITIALIZING', 'EXECUTING', 'PREPARING', 'INSTALLING', 'SUCCESS', 'ERROR', 'ONLINE', 'OFFLINE', 'DELETING')`
    );
    await queryRunner.query(
      `CREATE TABLE "servers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "description" text NOT NULL, "ip" inet NOT NULL, "port" integer NOT NULL, "user" text NOT NULL, "status" "public"."servers_status_enum" NOT NULL DEFAULT 'PENDING', "prettyOs" text, "osId" text, "privateKeyId" uuid, CONSTRAINT "UQ_6b6d30654aac4d8401c6103a3c2" UNIQUE ("organizationId", "ip"), CONSTRAINT "UQ_591d41b9b8ce2ff187a23036142" UNIQUE ("organizationId", "name"), CONSTRAINT "PK_c0947efd9f3db2dcc010164d20b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "private_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "data" text NOT NULL, CONSTRAINT "UQ_644c4a23647399526ef7f5478fc" UNIQUE ("organizationId", "name"), CONSTRAINT "PK_0c2e3c676a14ff8393a840afa05" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "environments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "projectId" uuid, CONSTRAINT "PK_ec32d12469ec3c2f2f20c4f5e71" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" text NOT NULL, "logoUrl" text, CONSTRAINT "UQ_8cccef51900ef3e9eea094a8756" UNIQUE ("organizationId", "name"), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "containers_networks_networks" ("containersId" uuid NOT NULL, "networksId" uuid NOT NULL, CONSTRAINT "PK_3987cab49d49dad559d1f5bd5f9" PRIMARY KEY ("containersId", "networksId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be5eda5e1432d45d0201e413c6" ON "containers_networks_networks" ("containersId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efd084fc0906be27bb2a77476a" ON "containers_networks_networks" ("networksId") `
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" ADD CONSTRAINT "FK_e69183df3e24dc2da6ee85c5125" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" ADD CONSTRAINT "FK_91583de87280b42b188e172582b" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" ADD CONSTRAINT "FK_999d890db86ea4620308a07343c" FOREIGN KEY ("actionId") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_5b86d893321c200c779f9464cac" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "ports" ADD CONSTRAINT "FK_2e32c96128a356018d3a3d0a17f" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "ports" ADD CONSTRAINT "FK_be73a438a4b0a3151b098f22dfb" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "networks" ADD CONSTRAINT "FK_0df87568139629af482675719c1" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "networks" ADD CONSTRAINT "FK_7c493004928222141f4158d74fa" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "volumes" ADD CONSTRAINT "FK_cfcb31478d82cad930f3ac19af9" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "volumes" ADD CONSTRAINT "FK_1fccf3f8563396cba0d204740b7" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "containers" ADD CONSTRAINT "FK_5734f307e9283745748de78f93d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "containers" ADD CONSTRAINT "FK_34f8e642a67fa35f6209ad4f270" FOREIGN KEY ("fluxId") REFERENCES "fluxes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "fluxes" ADD CONSTRAINT "FK_2795801d98a37dcad862de8c59d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "fluxes" ADD CONSTRAINT "FK_ff51be3e1f40c56be4464bfc111" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_c03c7bbb17d00b98d11b17cc59d" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_510dd8b26e362401688d6e62e76" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_ee6cbc7a7a9ca20edf997fc2a6d" FOREIGN KEY ("fluxId") REFERENCES "fluxes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_242e275f209824fa8429ca76f90" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "servers" ADD CONSTRAINT "FK_fd4d09b5f3e01c15d2d59c04944" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "servers" ADD CONSTRAINT "FK_15caddcda5343289106db5d6444" FOREIGN KEY ("privateKeyId") REFERENCES "private_keys"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "private_keys" ADD CONSTRAINT "FK_c22917bdf6fa61a4bd3f759d36b" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "environments" ADD CONSTRAINT "FK_58ee22336823c2be00651f4a735" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "environments" ADD CONSTRAINT "FK_3e378bf01840fb1c568d64fa87f" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_eec93fd979bdcf5a0141da324d6" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "containers_networks_networks" ADD CONSTRAINT "FK_be5eda5e1432d45d0201e413c6a" FOREIGN KEY ("containersId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "containers_networks_networks" ADD CONSTRAINT "FK_efd084fc0906be27bb2a77476a1" FOREIGN KEY ("networksId") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "containers_networks_networks" DROP CONSTRAINT "FK_efd084fc0906be27bb2a77476a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "containers_networks_networks" DROP CONSTRAINT "FK_be5eda5e1432d45d0201e413c6a"`
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_eec93fd979bdcf5a0141da324d6"`
    );
    await queryRunner.query(
      `ALTER TABLE "environments" DROP CONSTRAINT "FK_3e378bf01840fb1c568d64fa87f"`
    );
    await queryRunner.query(
      `ALTER TABLE "environments" DROP CONSTRAINT "FK_58ee22336823c2be00651f4a735"`
    );
    await queryRunner.query(
      `ALTER TABLE "private_keys" DROP CONSTRAINT "FK_c22917bdf6fa61a4bd3f759d36b"`
    );
    await queryRunner.query(
      `ALTER TABLE "servers" DROP CONSTRAINT "FK_15caddcda5343289106db5d6444"`
    );
    await queryRunner.query(
      `ALTER TABLE "servers" DROP CONSTRAINT "FK_fd4d09b5f3e01c15d2d59c04944"`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_242e275f209824fa8429ca76f90"`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_ee6cbc7a7a9ca20edf997fc2a6d"`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_510dd8b26e362401688d6e62e76"`
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_c03c7bbb17d00b98d11b17cc59d"`
    );
    await queryRunner.query(
      `ALTER TABLE "fluxes" DROP CONSTRAINT "FK_ff51be3e1f40c56be4464bfc111"`
    );
    await queryRunner.query(
      `ALTER TABLE "fluxes" DROP CONSTRAINT "FK_2795801d98a37dcad862de8c59d"`
    );
    await queryRunner.query(
      `ALTER TABLE "containers" DROP CONSTRAINT "FK_34f8e642a67fa35f6209ad4f270"`
    );
    await queryRunner.query(
      `ALTER TABLE "containers" DROP CONSTRAINT "FK_5734f307e9283745748de78f93d"`
    );
    await queryRunner.query(
      `ALTER TABLE "volumes" DROP CONSTRAINT "FK_1fccf3f8563396cba0d204740b7"`
    );
    await queryRunner.query(
      `ALTER TABLE "volumes" DROP CONSTRAINT "FK_cfcb31478d82cad930f3ac19af9"`
    );
    await queryRunner.query(
      `ALTER TABLE "networks" DROP CONSTRAINT "FK_7c493004928222141f4158d74fa"`
    );
    await queryRunner.query(
      `ALTER TABLE "networks" DROP CONSTRAINT "FK_0df87568139629af482675719c1"`
    );
    await queryRunner.query(`ALTER TABLE "ports" DROP CONSTRAINT "FK_be73a438a4b0a3151b098f22dfb"`);
    await queryRunner.query(`ALTER TABLE "ports" DROP CONSTRAINT "FK_2e32c96128a356018d3a3d0a17f"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_5b86d893321c200c779f9464cac"`
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" DROP CONSTRAINT "FK_999d890db86ea4620308a07343c"`
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" DROP CONSTRAINT "FK_91583de87280b42b188e172582b"`
    );
    await queryRunner.query(
      `ALTER TABLE "command_logs" DROP CONSTRAINT "FK_e69183df3e24dc2da6ee85c5125"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_efd084fc0906be27bb2a77476a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_be5eda5e1432d45d0201e413c6"`);
    await queryRunner.query(`DROP TABLE "containers_networks_networks"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "environments"`);
    await queryRunner.query(`DROP TABLE "private_keys"`);
    await queryRunner.query(`DROP TABLE "servers"`);
    await queryRunner.query(`DROP TYPE "public"."servers_status_enum"`);
    await queryRunner.query(`DROP TABLE "actions"`);
    await queryRunner.query(`DROP TYPE "public"."actions_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."actions_type_enum"`);
    await queryRunner.query(`DROP TABLE "fluxes"`);
    await queryRunner.query(`DROP TYPE "public"."fluxes_status_enum"`);
    await queryRunner.query(`DROP TABLE "containers"`);
    await queryRunner.query(`DROP TABLE "volumes"`);
    await queryRunner.query(`DROP TABLE "networks"`);
    await queryRunner.query(`DROP TABLE "ports"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(`DROP TABLE "command_logs"`);
    await queryRunner.query(`DROP TYPE "public"."command_logs_status_enum"`);
  }
}
