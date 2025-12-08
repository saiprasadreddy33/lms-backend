import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ required: true, min: 0 })
  correctOptionIndex: number;

  @Prop({ required: true, min: 1, max: 10 })
  difficulty: number;

  @Prop({ required: true, min: 1 })
  weight: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
