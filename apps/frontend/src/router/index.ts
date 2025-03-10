import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { authClient } from "@/utils/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: () => import("@/views/DashboardView.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/projects",
      name: "Projects",
      component: () => import("@/views/ProjectsOverview.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/projects/:id",
      name: "Project",
      component: () => import("@/views/ProjectDetails.vue"),
      props: true,
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/fluxor",
      name: "Fluxor",
      component: () => import("@/views/FluxorOverview.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/fluxor/:id",
      name: "Flux",
      component: () => import("@/views/FluxDetails.vue"),
      props: true,
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/fluxor/create",
      name: "Create Flux",
      component: () => import("@/views/FluxorCreate.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/networks",
      name: "Networks",
      component: () => import("@/views/NetworkOverview.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/servers",
      name: "Servers",
      component: () => import("@/views/ServerOverview.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/servers/create",
      name: "Create Server",
      component: () => import("@/views/ServerCreate.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/servers/:id",
      name: "Server",
      component: () => import("@/views/ServerDetails.vue"),
      props: true,
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/security",
      name: "Security",
      component: () => import("@/views/SecurityOverview.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    {
      path: "/error/network",
      name: "Network unavailable",
      component: () => import("@/views/NetworkIssues.vue"),
      meta: {
        layout: "ZeroLayout"
      }
    },
    {
      path: "/auth/login",
      name: "Login",
      component: () => import("@/views/AuthLogin.vue"),
      meta: {
        layout: "ZeroLayout"
      }
    },
    {
      path: "/auth/profile",
      name: "Profile",
      component: () => import("@/views/AuthProfile.vue"),
      meta: {
        layout: "DefaultLayout"
      }
    },
    // {
    //   path: "/auth/team",
    //   name: "Team",
    //   component: () => import("@/views/TeamDetails.vue"),
    //   meta: {
    //     layout: "DefaultLayout"
    //   }
    // }
    { 
      path: "/:pathMatch(.*)*", 
      component: () => import("@/views/PageNotFound.vue"),
      meta: {
        layout: "ZeroLayout"
      }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith("/error")) next();
  const session = await authClient.getSession();
  const user = session.data?.user;
  if (user && to.path.startsWith("/auth/login")) {
    next("/");
  } else if (!user && !to.path.startsWith("/auth/login")) next("/auth/login");
  else next();
});

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith("/error")) next();
  const authStore = useAuthStore();
  const organizations = await authClient.organization.list();
  if (!authStore.organizationId && organizations.data !== null)
    authStore.organizationId = organizations.data[0].id;
  authClient.organization.setActive({
    organizationId: authStore.organizationId
  });
  next();
});

export default router;
