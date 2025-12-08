import { AdaptiveService } from './adaptive.service';

describe('AdaptiveService', () => {
  const service = new AdaptiveService();

  it('increases difficulty on correct answers up to 10', () => {
    expect(service.getNextDifficulty(5, true)).toBe(6);
    expect(service.getNextDifficulty(10, true)).toBe(10);
  });

  it('decreases difficulty on incorrect answers down to 1', () => {
    expect(service.getNextDifficulty(5, false)).toBe(4);
    expect(service.getNextDifficulty(1, false)).toBe(1);
  });

  it('stops after 20 questions', () => {
    expect(
      service.shouldStop({
        questionsCount: 20,
        lastDifficulty: 5,
        lastCorrect: true,
        recentTopDifficultyCorrectCount: 0,
      }),
    ).toBe(true);
  });

  it('stops on incorrect answer at difficulty 1', () => {
    expect(
      service.shouldStop({
        questionsCount: 5,
        lastDifficulty: 1,
        lastCorrect: false,
        recentTopDifficultyCorrectCount: 0,
      }),
    ).toBe(true);
  });

  it('stops after 3 consecutive correct answers at difficulty 10', () => {
    expect(
      service.shouldStop({
        questionsCount: 5,
        lastDifficulty: 10,
        lastCorrect: true,
        recentTopDifficultyCorrectCount: 3,
      }),
    ).toBe(true);
  });

  it('does not stop when none of the conditions are met', () => {
    expect(
      service.shouldStop({
        questionsCount: 5,
        lastDifficulty: 5,
        lastCorrect: true,
        recentTopDifficultyCorrectCount: 1,
      }),
    ).toBe(false);
  });

  it('tracks top difficulty correct streak correctly', () => {
    expect(service.getUpdatedTopStreak(0, 10, true)).toBe(1);
    expect(service.getUpdatedTopStreak(2, 10, true)).toBe(3);
    expect(service.getUpdatedTopStreak(3, 9, true)).toBe(0);
    expect(service.getUpdatedTopStreak(3, 10, false)).toBe(0);
  });
});
