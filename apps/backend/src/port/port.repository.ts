import { inject, injectable } from "inversify";
import { ConflictError } from "../utils/index.js";
import { Repository, UpdateResult } from "typeorm";
import { type IDatabase } from "../config/database.js";
import { Port } from "./port.entity.js";
import { TYPES } from "../TYPES.js";
import { Container } from "../container/container.entity.js";

export interface IPortRepository {
  save(
    organizationId: string,
    hostPort: number,
    containerPort: number,
    container: Container
  ): Promise<Port>;
  updatePartial(organizationId: string, id: string, partialPort: Partial<Port>): Promise<number>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class PostgresPortRepository implements IPortRepository {
  private repository: Repository<Port>;

  constructor(@inject(TYPES.Database) database: IDatabase) {
    this.repository = database.getDataSource().getRepository(Port);
  }

  public save = async (
    organizationId: string,
    hostPort: number,
    containerPort: number,
    container: Container
  ): Promise<Port> => {
    if (
      await this.repository.existsBy({
        organization: {
          id: organizationId
        },
        hostPort: hostPort,
        containerPort: containerPort,
        container: { id: container.id }
      })
    )
      throw new ConflictError(
        `Port ${hostPort}:${containerPort} is already registered for Container ${container.id}`
      );

    const port: Port = this.repository.create({
      organization: {
        id: organizationId
      },
      hostPort,
      containerPort,
      container
    });

    await this.repository.insert(port);
    return port;
  };

  public updatePartial = async (
    organizationId: string,
    id: string,
    partialPort: Partial<Port>
  ): Promise<number> => {
    const updateResult: UpdateResult = await this.repository.update(
      {
        id: id,
        organization: {
          id: organizationId
        }
      },
      partialPort
    );
    return updateResult.affected ?? 0;
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    await this.repository.delete({
      id: id,
      organization: {
        id: organizationId
      }
    });
  };
}
