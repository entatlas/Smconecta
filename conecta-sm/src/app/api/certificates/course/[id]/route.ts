import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.candidateCourse.findUnique({ where: { id } });
  
  if (!course || !course.certificateUrl) {
    return new NextResponse('Not found', { status: 404 });
  }
  
  const match = course.certificateUrl.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Fallback to .pdf if mimeType is application/pdf, else check if image
    let ext = 'pdf';
    if (mimeType.includes('image/png')) ext = 'png';
    else if (mimeType.includes('image/jpeg')) ext = 'jpg';
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="certificado-${course.name.replace(/\s+/g, '-').toLowerCase()}.${ext}"`
      }
    });
  }
  
  // Se for uma URL comum, redireciona
  return NextResponse.redirect(course.certificateUrl);
}
