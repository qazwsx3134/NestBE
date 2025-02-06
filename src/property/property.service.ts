import { Injectable } from '@nestjs/common';

@Injectable()
export class PropertyService {
  async findOne(id: string) {
    return `This action returns a #${id} property`;
  }

  async findAll() {
    return [];
  }

  async create() {
    return [];
  }

  async update() {
    return [];
  }
}
