import { Controller, UseGuards } from '@nestjs/common';
import { CgmService } from './cgm.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('cgm')
@UseGuards(JwtGuard)
export class CgmController {
  constructor(private service: CgmService) {}
}
