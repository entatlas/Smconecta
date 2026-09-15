import CandidaturaDetailsClient from './ClientPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <CandidaturaDetailsClient id={id} />
}
