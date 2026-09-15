import { prisma } from './src/lib/prisma';

async function main() {
  const jobs = await prisma.job.count();
  const candidates = await prisma.candidate.count();
  const companies = await prisma.company.count();
  const events = await prisma.calendarEvent.count();
  const stories = await prisma.inspiringStory.count();
  const courses = await prisma.course.count();

  console.log(`Jobs: ${jobs}`);
  console.log(`Candidates: ${candidates}`);
  console.log(`Companies: ${companies}`);
  console.log(`Events: ${events}`);
  console.log(`Stories: ${stories}`);
  console.log(`Courses: ${courses}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
