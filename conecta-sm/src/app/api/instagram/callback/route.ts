import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/eventos?error=instagram_auth_failed`);
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/instagram/callback`;

  try {
    // 1. Trocar o código por um token de curta duração
    const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Erro ao pegar token de curta duração:', tokenData.error);
      throw new Error(tokenData.error.message);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Trocar por um token de longa duração (Long-Lived)
    const longLivedResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`);
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      console.error('Erro ao pegar token de longa duração:', longLivedData.error);
      throw new Error(longLivedData.error.message);
    }

    const longLivedToken = longLivedData.access_token;
    // O token expira em aprox 60 dias
    const expiresIn = longLivedData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // 3. Obter as páginas do usuário e encontrar a conta do Instagram vinculada
    // Pega as páginas que o usuário tem acesso
    const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`);
    const pagesData = await pagesResponse.json();

    console.log('--- FB OAUTH DEBUG ---');
    console.log('Pages Data:', JSON.stringify(pagesData, null, 2));

    let instagramAccountId = null;
    let pageToken = longLivedToken; // fallback

    if (pagesData.data && pagesData.data.length > 0) {
      // Pega a primeira página e tenta achar a conta do Instagram Business vinculada
      for (const page of pagesData.data) {
        console.log(`Checking page ${page.name} (${page.id})...`);
        const igResponse = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
        const igData = await igResponse.json();
        
        console.log(`IG Data for page ${page.name}:`, JSON.stringify(igData, null, 2));

        if (igData.instagram_business_account) {
          instagramAccountId = igData.instagram_business_account.id;
          pageToken = page.access_token; // É melhor usar o page_access_token para publicar
          console.log(`Found IG Account! ID: ${instagramAccountId}`);
          break;
        }
      }
    }

    if (!instagramAccountId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/eventos?error=no_instagram_business_account_found`);
    }

    // 4. Salvar no banco de dados
    await prisma.platformIntegration.upsert({
      where: { provider: 'INSTAGRAM' },
      update: {
        accessToken: pageToken, // Salvamos o token da página, que não expira enquanto a senha não mudar
        accountId: instagramAccountId,
        tokenExpiresAt: expiresAt,
      },
      create: {
        provider: 'INSTAGRAM',
        accessToken: pageToken,
        accountId: instagramAccountId,
        tokenExpiresAt: expiresAt,
      }
    });

    // Redireciona de volta com sucesso
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/eventos?success=instagram_connected`);

  } catch (error: any) {
    console.error('Erro no fluxo OAuth do Instagram:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/eventos?error=oauth_failed`);
  }
}
