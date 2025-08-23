
import { db } from "../server/db";
import { subjects, chapters, sections, questions, answers } from "../shared/schema";

async function seedData() {
  try {
    console.log("Inserting dummy data...");

    // Insert subject
    const [subject] = await db.insert(subjects).values({
      name: 'Physics',
      description: 'Physics Subject'
    }).returning();

    console.log("Subject inserted:", subject);

    // Insert chapter
    const [chapter] = await db.insert(chapters).values({
      subjectId: subject.id,
      name: 'Electromagnetic Waves',
      description: 'Chapter about EM waves'
    }).returning();

    console.log("Chapter inserted:", chapter);

    // Insert section
    const [section] = await db.insert(sections).values({
      chapterId: chapter.id,
      name: 'Radio Waves',
      description: 'Section covering radio waves and frequency calculation'
    }).returning();

    console.log("Section inserted:", section);

    // Insert question
    const [question] = await db.insert(questions).values({
      quizId: 1435,
      sectionId: section.id,
      questionText: 'If the wavelength of a radio wave is 3.75 metres, the frequency is:',
      type: 'mcq',
      explanation: 'To calculate f = c/λ ... <br><img src="/uploads/formula.png" />'
    }).returning();

    console.log("Question inserted:", question);

    // Insert sample answers for the MCQ
    const answerOptions = [
      { answerText: '80 MHz', isCorrect: true },
      { answerText: '60 MHz', isCorrect: false },
      { answerText: '100 MHz', isCorrect: false },
      { answerText: '120 MHz', isCorrect: false }
    ];

    for (const answerOption of answerOptions) {
      const [answer] = await db.insert(answers).values({
        questionId: question.id,
        answerText: answerOption.answerText,
        isCorrect: answerOption.isCorrect
      }).returning();
      
      console.log("Answer inserted:", answer);
    }

    console.log("All dummy data inserted successfully!");
    
  } catch (error) {
    console.error("Error inserting dummy data:", error);
  } finally {
    process.exit(0);
  }
}

seedData();
