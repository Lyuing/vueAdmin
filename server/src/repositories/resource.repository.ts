import { BaseRepository } from './base.repository.js'
import type { Resource } from '../types/resource.types.js'

export class ResourceRepository extends BaseRepository<Resource> {
  constructor() {
    super('resources.json')
  }
}

export const resourceRepository = new ResourceRepository()
