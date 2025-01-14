import { inject, injectable } from "inversify";
import { PrivateKey } from "./privatekey.entity.js";
import { type ISecurityRepository } from "./security.repository.js";
import { Pagination } from "../validations/pagination.validation.js";
import { PaginationResult } from "../utils/types/pagination.type.js";
import { TYPES } from "../TYPES.js";

export interface ISecurityService {
  findAll(organizationId: string, pagination?: Pagination): Promise<PaginationResult<PrivateKey>>;
  findById(organizationId: string, id: string): Promise<PrivateKey | null>;
  findByServerId(organizationId: string, serverId: string): Promise<PrivateKey | null>;
  save(organizationId: string, name: string, data: string): Promise<PrivateKey>;
  delete(organizationId: string, id: string): Promise<void>;
}

@injectable()
export class SecurityService implements ISecurityService {
  constructor(
    @inject(TYPES.SecurityRepository)
    private readonly securityRepository: ISecurityRepository
  ) {}

  public findAll = async (
    organizationId: string,
    pagination?: Pagination
  ): Promise<PaginationResult<PrivateKey>> => {
    return await this.securityRepository.findAll(organizationId, pagination);
  };

  public findById = async (organizationId: string, id: string): Promise<PrivateKey | null> => {
    return await this.securityRepository.findById(organizationId, id);
  };

  public findByServerId = async (
    organizationId: string,
    serverId: string
  ): Promise<PrivateKey | null> => {
    return await this.securityRepository.findByServerId(organizationId, serverId);
  };

  public save = async (organizationId: string, name: string, data: string): Promise<PrivateKey> => {
    return await this.securityRepository.save(organizationId, name, data);
  };

  public delete = async (organizationId: string, id: string): Promise<void> => {
    return this.securityRepository.delete(organizationId, id);
  };
}
