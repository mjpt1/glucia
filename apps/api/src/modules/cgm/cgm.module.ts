import { Module } from '@nestjs/common';
import { CgmController } from './cgm.controller';
import { CgmService } from './cgm.service';

@Module({
  controllers: [CgmController],
  providers: [CgmService],
  exports: [CgmService],
})
export class CgmModule {}
