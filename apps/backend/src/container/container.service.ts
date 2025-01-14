import { inject, injectable } from "inversify";
import { NotFoundError } from "../utils/index.js";
import { type IPortRepository } from "../port/index.js";
import { type INetworkRepository, Network } from "../network/index.js";
import { type IVolumeRepository } from "../volumes/volume.repository.js";
import { TYPES } from "../TYPES.js";
import { CreateContainerDto } from "./container.validation.js";
import { Container } from "./container.entity.js";
import { type IContainerRepository } from "./container.repository.js";

export interface IContainerService {
  save(organizationId: string, fluxId: string, dto: CreateContainerDto): Promise<Container>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class ContainerService implements IContainerService {
  constructor(
    @inject(TYPES.ContainerRepository)
    private readonly containerRepository: IContainerRepository,
    @inject(TYPES.PortRepository)
    private readonly portRepository: IPortRepository,
    @inject(TYPES.NetworkRepository)
    private readonly networkRepository: INetworkRepository,
    @inject(TYPES.VolumeRepository)
    private readonly volumeRepository: IVolumeRepository
  ) {}

  public save = async (
    organizationId: string,
    fluxId: string,
    dto: CreateContainerDto
  ): Promise<Container> => {
    const networks: Network[] = await this.networkRepository.findByIds(
      organizationId,
      dto.networks
    );
    if (networks.length !== dto.networks.length)
      throw new NotFoundError(`Not all selected networks exist. Please try again.`);

    const container = await this.containerRepository.save(
      organizationId,
      fluxId,
      dto.name,
      dto.image,
      dto.command,
      dto.labels,
      networks
    );

    for (const port of dto.ports)
      await this.portRepository.save(organizationId, port.hostPort, port.containerPort, container);

    for (const volume of dto.volumes)
      await this.volumeRepository.save(
        organizationId,
        volume.hostPath,
        volume.create,
        volume.permission,
        volume.type,
        volume.containerPath,
        volume.readonly,
        container
      );

    return container;
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    const container: Container | null = await this.containerRepository.findOneById(
      organizationId,
      id
    );
    if (!container) throw new NotFoundError(`Container with id ${id} not found!`);
    await this.containerRepository.delete(organizationId, id);
  };
}
