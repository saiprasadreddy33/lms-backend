import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles';

class CreateTestDto {
  title: string;
  description?: string;
  uniqueUrl: string;
}

class AnswerDto {
  questionId: string;
  selectedOptionIndex: number;
}

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() body: CreateTestDto) {
    return this.testsService.createTest(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  list() {
    return this.testsService.listTests();
  }

  @Get(':testId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  getAdmin(@Param('testId') testId: string) {
    return this.testsService.getAdminTestWithStats(testId);
  }

  @Get(':slug/public')
  getPublic(@Param('slug') slug: string) {
    return this.testsService.getTestBySlug(slug);
  }

  @Post(':testId/start')
  @UseGuards(JwtAuthGuard)
  start(@Param('testId') testId: string, @Body('userId') userId: string) {
    return this.testsService.startAttempt(testId, userId);
  }

  @Post(':testId/questions/answer')
  @UseGuards(JwtAuthGuard)
  answer(
    @Param('testId') testId: string,
    @Body('userId') userId: string,
    @Body() body: AnswerDto,
  ) {
    return this.testsService.answerQuestion({
      testId,
      userId,
      questionId: body.questionId,
      selectedOptionIndex: body.selectedOptionIndex,
    });
  }
}
