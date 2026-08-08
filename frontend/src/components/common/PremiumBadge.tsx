// Insignia de "Perfil Verificado" premium (docx: ítems 7-10, $7.000 ARS único pago). 
// Aparece cuando el usuario llega a Alta confianza (7-10/10) — no alcanza con ser MembershipTier.Premium, tiene que haber completado los
// ítems de verdad. Color turquesa (--color-brand-teal)

type PremiumBadgeProps = {
  achieved: boolean;
};

export const PremiumBadge = ({ achieved }: PremiumBadgeProps) => {
  if (!achieved) return null;

  return (
    <span className="text-sm font-semibold text-brand-teal">Perfil Verificado Premium</span>
  );
};