import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { QuestionsService } from '../questions/questions.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const questionsService = app.get(QuestionsService);

  const difficulties = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const tasks: Promise<unknown>[] = [];

  for (let i = 0; i < 500; i += 1) {
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const weight = 1 + Math.floor(Math.random() * 3);
    const correctIndex = Math.floor(Math.random() * 4);

    tasks.push(
      questionsService.create({
        text: `Sample question ${i + 1} (difficulty ${difficulty})`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: correctIndex,
        difficulty,
        weight,
      }),
    );
  }

  await Promise.all(tasks);

  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
