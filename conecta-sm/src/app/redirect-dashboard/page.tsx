'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PageLoader } from '@/components/ui/Loading/PageLoader';

export default function RedirectDashboard() {
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('auth_user_id', user.id)
        .single();

      const tipo = profile?.tipo || 'CANDIDATE';
      
      // Override manual for admin
      if (user.email === 'alysontrx@gmail.com') {
        router.push('/admin/dashboard');
        return;
      }

      if (tipo === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (tipo === 'COMPANY') {
        router.push('/empresa/dashboard');
      } else {
        router.push('/candidato/dashboard');
      }
    }

    redirectUser();
  }, [router]);

  return <PageLoader />;
}
