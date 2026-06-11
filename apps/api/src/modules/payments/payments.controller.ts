import { Controller, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('payments')
@UseGuards(JwtGuard)
export class PaymentsController {
  constructor(private service: PaymentsService) {}
}
