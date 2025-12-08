import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TestsService } from './tests.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles';

class CreateTestDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(3)
  uniqueUrl: string;
}

class AnswerDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(0)
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
  start(@Param('testId') testId: string, @Body() _body: Record<string, never>, @Req() req: any) {
    return this.testsService.startAttempt(testId, req.user.userId);
  }

  @Post(':testId/questions/answer')
  @UseGuards(JwtAuthGuard)
  answer(
    @Param('testId') testId: string,
    @Body() body: AnswerDto,
    @Req() req: any,
  ) {
    return this.testsService.answerQuestion({
      testId,
      userId: req.user.userId,
      questionId: body.questionId,
      selectedOptionIndex: body.selectedOptionIndex,
    });
  }
}
