import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  create(data: {
    text: string;
    options: string[];
    correctOptionIndex: number;
    difficulty: number;
    weight: number;
  }) {
    const question = new this.questionModel(data);
    return question.save();
  }

  findAll() {
    return this.questionModel.find().sort({ difficulty: 1, createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async update(id: string, data: Partial<Question>) {
    const updated = await this.questionModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Question not found');
    }
    return updated;
  }

  async remove(id: string) {
    const res = await this.questionModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('Question not found');
    }
  }
}
