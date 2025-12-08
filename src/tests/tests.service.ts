import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Test, TestAttempt, TestAttemptDocument, TestDocument } from './test.schemas';
import { QuestionsService } from '../questions/questions.service';
import { AdaptiveService } from './adaptive.service';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(TestAttempt.name)
    private readonly attemptModel: Model<TestAttemptDocument>,
    private readonly questionsService: QuestionsService,
    private readonly adaptiveService: AdaptiveService,
  ) {}

  createTest(data: { title: string; description?: string; uniqueUrl: string }) {
    const test = new this.testModel(data);
    return test.save();
  }

  listTests() {
    return this.testModel.find().sort({ createdAt: -1 }).exec();
  }

  async getTestById(id: string) {
    const test = await this.testModel.findById(id).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async getTestBySlug(slug: string) {
    const test = await this.testModel.findOne({ uniqueUrl: slug, isActive: true }).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async getAdminTestWithStats(id: string) {
    const test = await this.getTestById(id);
    const attempts = await this.attemptModel.find({ testId: test.id, isFinished: true }).exec();
    const count = attempts.length;
    const averageScore =
      count === 0
        ? 0
        : attempts.reduce((sum, attempt) => sum + attempt.score, 0) / count;

    return {
      test,
      stats: {
        attempts: count,
        averageScore,
      },
    };
  }

  async startAttempt(testId: string, userId: string) {
    const test = await this.getTestById(testId);

    let attempt = await this.attemptModel
      .findOne({ testId: test.id, userId: new Types.ObjectId(userId), isFinished: false })
      .exec();

    if (!attempt) {
      attempt = new this.attemptModel({
        testId: test.id,
        userId: new Types.ObjectId(userId),
        currentDifficulty: 5,
      });
      await attempt.save();
    }

    const nextQuestion = await this.pickNextQuestion(attempt);

    return {
      attemptId: attempt.id,
      question: nextQuestion,
    };
  }

  async answerQuestion(params: {
    testId: string;
    userId: string;
    questionId: string;
    selectedOptionIndex: number;
  }) {
    const test = await this.getTestById(params.testId);

    const attempt = await this.attemptModel
      .findOne({ testId: test.id, userId: new Types.ObjectId(params.userId), isFinished: false })
      .exec();

    if (!attempt) {
      throw new NotFoundException('Active attempt not found');
    }

    const question = await this.questionsService.findOne(params.questionId);

    const correct = question.correctOptionIndex === params.selectedOptionIndex;
    const difficulty = question.difficulty;
    const weight = question.weight;

    attempt.questions.push({
      questionId: new Types.ObjectId(question.id),
      selectedOptionIndex: params.selectedOptionIndex,
      correct,
      difficulty,
      weight,
    } as any);

    if (correct) {
      attempt.score += difficulty * weight;
      attempt.totalCorrect += 1;
    } else {
      attempt.totalIncorrect += 1;
    }

    const previousTopStreak = this.getTopDifficultyStreak(attempt);
    const updatedTopStreak = this.adaptiveService.getUpdatedTopStreak(
      previousTopStreak,
      difficulty,
      correct,
    );

    const shouldStop = this.adaptiveService.shouldStop({
      questionsCount: attempt.questions.length,
      lastDifficulty: difficulty,
      lastCorrect: correct,
      recentTopDifficultyCorrectCount: updatedTopStreak,
    });

    if (shouldStop) {
      attempt.isFinished = true;
      attempt.finishedAt = new Date();
      await attempt.save();

      return {
        finished: true,
        summary: {
          score: attempt.score,
          totalCorrect: attempt.totalCorrect,
          totalIncorrect: attempt.totalIncorrect,
          questionsCount: attempt.questions.length,
        },
      };
    }

    const nextDifficulty = this.adaptiveService.getNextDifficulty(
      attempt.currentDifficulty,
      correct,
    );
    attempt.currentDifficulty = nextDifficulty;
    await attempt.save();

    const nextQuestion = await this.pickNextQuestion(attempt);

    return {
      finished: false,
      question: nextQuestion,
    };
  }

  private getTopDifficultyStreak(attempt: TestAttempt) {
    let streak = 0;
    for (let i = attempt.questions.length - 1; i >= 0; i -= 1) {
      const q = attempt.questions[i] as any;
      if (q.difficulty === 10 && q.correct) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  private async pickNextQuestion(attempt: TestAttempt) {
    const usedIds = new Set(
      attempt.questions.map((q: any) => q.questionId.toString()),
    );

    const targetDifficulty = attempt.currentDifficulty;

    const tryDifficulty = async (difficulty: number) => {
      const all = await this.questionsService.findAll();
      const candidates = all.filter(
        (q) => q.difficulty === difficulty && !usedIds.has(q.id.toString()),
      );
      if (candidates.length === 0) {
        return null;
      }
      return candidates[0];
    };

    let question = await tryDifficulty(targetDifficulty);

    if (!question) {
      for (let step = 1; step <= 9; step += 1) {
        const lower = targetDifficulty - step;
        if (lower >= 1) {
          question = await tryDifficulty(lower);
          if (question) {
            break;
          }
        }
        const higher = targetDifficulty + step;
        if (higher <= 10) {
          question = await tryDifficulty(higher);
          if (question) {
            break;
          }
        }
      }
    }

    if (!question) {
      throw new NotFoundException('No questions available');
    }

    return question;
  }
}
