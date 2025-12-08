import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { Test, TestSchema, TestAttempt, TestAttemptSchema } from './test.schemas';
import { QuestionsModule } from '../questions/questions.module';
import { AdaptiveService } from './adaptive.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: TestAttempt.name, schema: TestAttemptSchema },
    ]),
    QuestionsModule,
  ],
  providers: [TestsService, AdaptiveService],
  controllers: [TestsController],
})
export class TestsModule {}
