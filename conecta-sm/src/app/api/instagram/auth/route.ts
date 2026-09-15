import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/instagram/callback`;

  if (!appId) {
    return NextResponse.json({ error: 'META_APP_ID não configurado no .env' }, { status: 500 });
  }

  // Scopes necessários para postar no Instagram vinculado a uma página do Facebook
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'business_management'
  ].join(',');

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;

  return NextResponse.redirect(authUrl);
}
