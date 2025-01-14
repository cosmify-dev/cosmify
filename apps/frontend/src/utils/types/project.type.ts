export type Project = {
  id: string;
  name: string;
  environments: Environment[];
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Environment = {
  id: string;
  name: string;
  project: Project;
  createdAt: string;
  updatedAt: string;
};

export type CreateEnvironmentDto = Omit<Environment, "id" | "project" | "createdAt" | "updatedAt">;
export type UpdateEnvironmentDto = Partial<
  Omit<Environment, "id" | "project" | "createdAt" | "updatedAt">
>;

export type CreateProjectDto = Omit<Project, "id" | "environments" | "createdAt" | "updatedAt"> & {
  environments: CreateEnvironmentDto[];
};
export type UpdateProjectDto = Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>;

export const newCreateProjectDto: () => CreateProjectDto = () => {
  return {
    name: "",
    logoUrl: "",
    environments: [
      {
        name: "prod"
      },
      {
        name: "dev"
      }
    ]
  };
};

export const newCreateEnvironmentDto: () => CreateEnvironmentDto = () => {
  return {
    name: ""
  };
};
