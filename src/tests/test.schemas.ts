import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from '../questions/question.schema';
import { User } from '../users/user.schema';

export type TestDocument = Test & Document;
export type TestAttemptDocument = TestAttempt & Document;

@Schema({ timestamps: true })
export class Test {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true, index: true })
  uniqueUrl: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TestSchema = SchemaFactory.createForClass(Test);

class AttemptQuestionSnapshot {
  @Prop({ type: Types.ObjectId, ref: Question.name, required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  selectedOptionIndex: number;

  @Prop({ required: true })
  correct: boolean;

  @Prop({ required: true })
  difficulty: number;

  @Prop({ required: true })
  weight: number;
}

@Schema({ timestamps: true })
export class TestAttempt {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Test.name, required: true })
  testId: Types.ObjectId;

  @Prop({ type: [AttemptQuestionSnapshot], default: [] })
  questions: AttemptQuestionSnapshot[];

  @Prop({ default: 5 })
  currentDifficulty: number;

  @Prop({ default: false })
  isFinished: boolean;

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  totalCorrect: number;

  @Prop({ default: 0 })
  totalIncorrect: number;

  @Prop()
  finishedAt?: Date;
}

export const TestAttemptSchema = SchemaFactory.createForClass(TestAttempt);
