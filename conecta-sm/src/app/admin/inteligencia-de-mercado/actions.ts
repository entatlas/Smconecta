'use server';
import { prisma } from '@/lib/prisma';



export async function getMarketIntelligenceData() {
  const [
    totalCandidates,
    totalCompanies,
    totalJobs,
    totalApplications,
    totalAreas,
    newCandidatesLast30Days
  ] = await Promise.all([
    prisma.profile.count({ where: { tipo: 'CANDIDATE' } }),
    prisma.profile.count({ where: { tipo: 'COMPANY' } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.professionalArea.count({ where: { active: true } }),
    prisma.profile.count({
      where: {
        tipo: 'CANDIDATE',
        created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    })
  ]);

  // Calculate Candidates per Area (Legacy String Field)
  const candidateInterestsString = await prisma.candidate.groupBy({
    by: ['professionalArea'],
    _count: { id: true },
    where: { professionalArea: { not: null } }
  });

  // Calculate Jobs per Area (Legacy String Field)
  const jobCountsString = await prisma.job.groupBy({
    by: ['area'],
    _count: { id: true },
    where: { area: { not: "" } }
  });

  // Combine unique area names
  const uniqueAreaNames = new Set<string>();
  candidateInterestsString.forEach(c => { if (c.professionalArea) uniqueAreaNames.add(c.professionalArea) });
  jobCountsString.forEach(j => { if (j.area) uniqueAreaNames.add(j.area) });

  const areasData = Array.from(uniqueAreaNames).map(areaName => {
    const candidatesCount = candidateInterestsString.find(c => c.professionalArea === areaName)?._count.id || 0;
    const jobsCount = jobCountsString.find(j => j.area === areaName)?._count.id || 0;
    const opportunityIndex = jobsCount > 0 ? (candidatesCount / jobsCount) : candidatesCount > 0 ? candidatesCount : 0;

    return {
      id: areaName,
      name: areaName,
      candidates: candidatesCount,
      jobs: jobsCount,
      opportunityIndex: opportunityIndex
    };
  });

  // Rank by most candidates
  const mostWanted = [...areasData].sort((a, b) => b.candidates - a.candidates).filter(a => a.candidates > 0);
  
  // Rank by most jobs
  const mostDemanded = [...areasData].sort((a, b) => b.jobs - a.jobs).filter(a => a.jobs > 0);

  return {
    overview: {
      totalCandidates,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalAreas,
      newCandidatesLast30Days
    },
    supplyDemand: areasData,
    mostWanted,
    mostDemanded
  };
}
