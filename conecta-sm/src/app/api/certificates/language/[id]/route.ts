import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await prisma.candidateLanguage.findUnique({ where: { id } });
  
  if (!lang || !lang.certificateUrl) {
    return new NextResponse('Not found', { status: 404 });
  }
  
  const match = lang.certificateUrl.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    let ext = 'pdf';
    if (mimeType.includes('image/png')) ext = 'png';
    else if (mimeType.includes('image/jpeg')) ext = 'jpg';
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="certificado-${lang.language.toLowerCase()}.${ext}"`
      }
    });
  }
  
  return NextResponse.redirect(lang.certificateUrl);
}
