import React from 'react'
import { NovaVagaForm } from './NovaVagaForm'
import { getCompaniesForSelect } from '../actions'

export default async function NovaVagaPage() {
  const companies = await getCompaniesForSelect()

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', color: '#EAF2FF', minHeight: '100vh' }}>
      <NovaVagaForm companies={companies} />
    </div>
  )
}
