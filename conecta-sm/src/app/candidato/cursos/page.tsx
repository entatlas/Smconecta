import React from 'react'
import { getPublicCourses } from '@/app/admin/cursos/actions'
import { GraduationCap } from 'lucide-react'
import { CourseCard } from './CourseCard'

export default async function CandidatoCursosPage() {
  const courses = await getPublicCourses()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="text-blue-500" size={32} />
          Desenvolvimento Profissional
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Catálogo de cursos recomendados para acelerar a sua carreira.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
        
        {courses.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum curso disponível no momento</h3>
            <p className="text-slate-400">Volte em breve para descobrir novos treinamentos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
