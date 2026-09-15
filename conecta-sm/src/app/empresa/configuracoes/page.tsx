'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSettings, updateNotificationSettings, sendPasswordResetEmail, updateUserEmail } from './actions';
import { Key, Bell, Shield, User, Globe, Monitor } from 'lucide-react';
import { useTranslation, Language } from '@/contexts/I18nContext';

export default function EmpresaConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({ emailEnabled: true, inAppEnabled: true });
  const [userEmail, setUserEmail] = useState('');
  
  const { language, setLanguage, t } = useTranslation();
  
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      setPrefs({
        emailEnabled: res.notifications.emailEnabled,
        inAppEnabled: res.notifications.inAppEnabled
      });
      if (res.userEmail) setUserEmail(res.userEmail);
      setLoading(false);
    }).catch(err => {
      toast.error(t('settings.errorPrefs'));
      setLoading(false);
    });
  }, [t]);

  const handleToggleNotification = async (key: 'emailEnabled' | 'inAppEnabled', value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      await updateNotificationSettings(newPrefs);
      toast.success(t('settings.successPrefs'));
    } catch (err) {
      toast.error(t('settings.errorPrefs'));
      setPrefs(prefs); // revert
    }
  };

  const handlePasswordReset = async () => {
    setSendingEmail(true);
    try {
      const res = await sendPasswordResetEmail(window.location.origin);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(t('settings.successEmail'));
      }
    } catch (err: any) {
      toast.error(err.message || t('settings.errorEmail'));
    } finally {
      setSendingEmail(false);
    }
  };

  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === userEmail) return;
    setUpdatingEmail(true);
    try {
      const res = await updateUserEmail(newEmail, window.location.origin);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Solicitação de troca enviada! Verifique o novo e-mail.');
        setNewEmail('');
      }
    } catch (err: any) {
      toast.error('Erro ao solicitar troca de e-mail.');
    } finally {
      setUpdatingEmail(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t('settings.loading')}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-6">
        {/* INFORMAÇÕES DA CONTA */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User size={20}/> {t('settings.accountInfo')}</CardTitle>
            <CardDescription>{t('settings.accountDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">{t('settings.emailLabel')}</p>
              <p className="text-sm text-slate-400 bg-slate-950 p-2 rounded-md border border-slate-800 inline-block">
                {userEmail || t('settings.loading')}
              </p>
            </div>
            
            <form onSubmit={handleEmailUpdate} className="space-y-3 pt-4 border-t border-slate-800">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-300">Alterar E-mail de Acesso</p>
                <div className="flex gap-3 items-center">
                  <Input 
                    type="email" 
                    placeholder="Novo endereço de e-mail" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="max-w-xs bg-slate-950 border-slate-800"
                  />
                  <Button type="submit" disabled={updatingEmail || !newEmail || newEmail === userEmail} variant="secondary">
                    {updatingEmail ? 'Solicitando...' : 'Solicitar Troca'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Um link de confirmação será enviado para o novo e-mail.</p>
              </div>
            </form>
          </CardContent>
        </Card>


        {/* ALTERAR SENHA */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Shield size={20}/> {t('settings.security')}</CardTitle>
            <CardDescription>{t('settings.securityDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                {t('settings.securityText')}
              </p>
              <Button 
                onClick={handlePasswordReset} 
                disabled={sendingEmail} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendingEmail ? t('settings.sendingEmailBtn') : t('settings.sendEmailBtn')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICAÇÕES */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Bell size={20}/> {t('settings.notifications')}</CardTitle>
            <CardDescription>{t('settings.notifDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium text-slate-200">{t('settings.emailNotif')}</h3>
                <p className="text-sm text-slate-400">{t('settings.emailNotifDesc')}</p>
              </div>
              <Switch 
                checked={prefs.emailEnabled} 
                onCheckedChange={(val) => handleToggleNotification('emailEnabled', val)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-medium text-slate-200">{t('settings.inAppNotif')}</h3>
                <p className="text-sm text-slate-400">{t('settings.inAppNotifDesc')}</p>
              </div>
              <Switch 
                checked={prefs.inAppEnabled} 
                onCheckedChange={(val) => handleToggleNotification('inAppEnabled', val)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
