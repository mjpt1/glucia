import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CgmService {
  constructor(private prisma: PrismaService) {}
}
