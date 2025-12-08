import { Injectable } from '@nestjs/common';

interface AttemptState {
  questionsCount: number;
  lastDifficulty?: number;
  lastCorrect?: boolean;
  recentTopDifficultyCorrectCount: number;
}

@Injectable()
export class AdaptiveService {
  getNextDifficulty(currentDifficulty: number, correct: boolean) {
    if (correct) {
      return Math.min(10, currentDifficulty + 1);
    }
    return Math.max(1, currentDifficulty - 1);
  }

  shouldStop(state: AttemptState) {
    if (state.questionsCount >= 20) {
      return true;
    }

    if (state.lastDifficulty === 1 && state.lastCorrect === false) {
      return true;
    }

    if (state.recentTopDifficultyCorrectCount >= 3) {
      return true;
    }

    return false;
  }

  getUpdatedTopStreak(previousStreak: number, difficulty: number, correct: boolean) {
    if (difficulty === 10 && correct) {
      return previousStreak + 1;
    }
    return 0;
  }
}
