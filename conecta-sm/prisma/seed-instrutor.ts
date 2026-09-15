import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Populando Dados do Instrutor (Prompt 15) ---');

  // Verifica se já existe um instrutor
  let instrutorProfile = await prisma.profile.findFirst({
    where: { tipo: 'INSTRUCTOR' }
  });

  if (!instrutorProfile) {
    console.log('Criando Perfil de Instrutor...');
    // Procurar por um auth user para linkar (idealmente um usuário criado para teste)
    // Para simplificar, não criarei usuário no Auth, apenas um perfil órfão que não loga,
    // OU usaremos um perfil já existente (ex: um admin e mudamos o tipo temporariamente? Nao, melhor criar novo).
    
    // Gerar um uuid dummy simples
    const dummyAuthId = '11111111-1111-1111-1111-111111111111';
    
    instrutorProfile = await prisma.profile.create({
      data: {
        authUserId: dummyAuthId, // Fictício
        tipo: 'INSTRUCTOR',
        email: 'instrutor@conectasm.com.br',
        nome: 'Professor João',
        telefone: '11999999999'
      }
    });
    console.log('Perfil Instrutor Criado:', instrutorProfile.nome);
  }

  // Cria um curso / turma
  let curso = await prisma.course.findFirst({
    where: { instructorId: instrutorProfile.id }
  });

  if (!curso) {
    console.log('Criando Curso/Turma de Teste...');
    curso = await prisma.course.create({
      data: {
        title: 'Liderança e Gestão 360',
        description: 'Curso avançado de liderança',
        instructorId: instrutorProfile.id,
        level: 'Advanced',
        modality: 'Híbrido',
        workloadHours: 40,
        status: 'PUBLISHED',
        minimumGrade: 70,
        minimumAttendance: 75,
        startDate: new Date(),
      }
    });
  }

  // Matricula alguns alunos (Candidates) nesse curso se não houver
  const enrollmentsCount = await prisma.courseEnrollment.count({
    where: { courseId: curso.id }
  });

  if (enrollmentsCount === 0) {
    console.log('Matriculando Alunos na Turma...');
    const candidates = await prisma.candidate.findMany({ take: 3, include: { profile: true } });
    
    for (const candidate of candidates) {
      await prisma.courseEnrollment.create({
        data: {
          courseId: curso.id,
          candidateId: candidate.id,
          status: 'IN_PROGRESS',
          progressPercent: 10,
          attendancePercent: 0,
        }
      });
      console.log(`- Matrícula criada para ${candidate.profile.nome}`);
    }
  }

  console.log('--- Seed Instrutor Finalizado ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
