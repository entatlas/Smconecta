import { redirect } from 'next/navigation'

export default async function VagaPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  redirect(`/empresa/vagas/${p.id}/editar`);
}
