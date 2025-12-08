import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles';

class QuestionDto {
  text: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: number;
  weight: number;
}

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() body: QuestionDto) {
    return this.questionsService.create(body);
  }

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<QuestionDto>) {
    return this.questionsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}
