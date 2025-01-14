import { betterAuth } from "better-auth";
import pkg from "pg";
import { organization, username } from "better-auth/plugins";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

export let auth: any;

export const initAuth = () => {
  if (auth) return;
  auth = betterAuth({
    basePath: "v1/auth",
    trustedOrigins: ["http://localhost:5173"],
    database: new pkg.Pool({
      host: config.DATABASE.HOST,
      port: config.DATABASE.PORT,
      user: config.DATABASE.USERNAME,
      password: config.DATABASE.PASSWORD,
      database: config.DATABASE.NAME
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user: any) => {
            try {
              await auth.api.createOrganization({
                body: {
                  name: `${user.username}'s`,
                  slug: `${user.username}s`,
                  userId: user.id
                }
              });
            } catch (error) {
              logger.error(error);
            }
          }
        }
      }
    },
    socialProviders: {
      github: {
        clientId: config.AUTH.GITHUB_ID,
        clientSecret: config.AUTH.GITHUB_SECRET,
        mapProfileToUser: (profile) => {
          return {
            username: profile.login
          };
        }
      }
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true
      }),
      username()
    ]
  });
};
