import { prisma } from '../src/lib/prisma';

async function main() {
  const adminEmail = 'smsolucoesetreinamentos@gmail.com';
  console.log('Starting data cleanup...');

  // 1. Find all profiles to delete
  const profilesToDelete = await prisma.profile.findMany({
    where: {
      email: {
        not: adminEmail
      }
    },
    select: { id: true, auth_user_id: true }
  });

  console.log(`Found ${profilesToDelete.length} profiles to delete.`);

  // Because of relations, we might need to delete related data if cascades are not set up perfectly.
  // Prisma schema shows Cascade for Profile -> Candidate, Company. 
  // Company -> Job, Job -> Application, Candidate -> Application.
  // It should be mostly handled by Prisma if we delete the profiles.
  
  const authUserIds = profilesToDelete.map(p => p.auth_user_id);
  
  // 2. Delete profiles (this cascades to Candidate, Company, etc)
  if (profilesToDelete.length > 0) {
    const profileIds = profilesToDelete.map(p => p.id);
    await prisma.profile.deleteMany({
      where: {
        id: { in: profileIds }
      }
    });
    console.log('Profiles and related data deleted via Prisma Cascade.');
  }

  // 3. Delete from auth.users via raw query (if possible)
  if (authUserIds.length > 0) {
    try {
      const idsForQuery = authUserIds.map(id => `'${id}'`).join(',');
      await prisma.$executeRawUnsafe(`DELETE FROM auth.users WHERE id IN (${idsForQuery})`);
      console.log('Deleted corresponding users from auth.users');
    } catch (e: any) {
      console.log('Could not delete from auth.users, possibly due to lack of permissions or foreign keys:', e.message);
    }
  }

  // 4. Optionally delete any orphaned Jobs, etc, if any.
  const remainingJobsCount = await prisma.job.count();
  if (remainingJobsCount > 0) {
      console.log(`Warning: there are still ${remainingJobsCount} jobs in DB. Deleting them...`);
      await prisma.job.deleteMany();
  }

  const remainingCandidatesCount = await prisma.candidate.count();
  if (remainingCandidatesCount > 0) {
      console.log(`Warning: there are still ${remainingCandidatesCount} candidates in DB. Deleting them...`);
      await prisma.candidate.deleteMany();
  }

  const remainingCompaniesCount = await prisma.company.count();
  if (remainingCompaniesCount > 0) {
      console.log(`Warning: there are still ${remainingCompaniesCount} companies in DB. Deleting them...`);
      await prisma.company.deleteMany();
  }

  console.log('Cleanup completed successfully. Only admin remains.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
