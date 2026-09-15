/**
 * src/lib/permissions/features.ts
 * Utilitário centralizado para verificação de permissões do Modelo Comercial.
 */

export type FeatureKey = 
  | 'premium_resume_review'
  | 'premium_interview_sim'
  | 'premium_early_alerts'
  | 'premium_pro_development'
  | 'premium_exclusive_content'
  | 'company_sponsored_jobs'
  | 'company_custom_recruitment';

/**
 * Interface que representa o status da assinatura do usuário logado.
 * Normalmente o backend já deve injetar isso nas consultas principais.
 */
export interface UserSubscriptionContext {
  role: 'CANDIDATE' | 'COMPANY' | 'ADMIN';
  subscriptionStatus: string; // 'TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED'
}

/**
 * Verifica se um usuário possui acesso a uma determinada funcionalidade.
 */
export function hasFeature(context: UserSubscriptionContext, feature: FeatureKey): boolean {
  if (context.role === 'ADMIN') {
    return true;
  }

  // Se a assinatura está ativa, o usuário tem acesso às features de seu papel (Role)
  const isPremiumActive = context.subscriptionStatus === 'ACTIVE';

  if (context.role === 'CANDIDATE') {
    const candidateFeatures: FeatureKey[] = [
      'premium_resume_review',
      'premium_interview_sim',
      'premium_early_alerts',
      'premium_pro_development',
      'premium_exclusive_content'
    ];
    
    if (candidateFeatures.includes(feature)) {
      return isPremiumActive;
    }
  }

  if (context.role === 'COMPANY') {
    const companyFeatures: FeatureKey[] = [
      'company_sponsored_jobs',
      'company_custom_recruitment'
    ];

    if (companyFeatures.includes(feature)) {
      return isPremiumActive;
    }
  }

  return false;
}
