using CasaConSi.Api.Models.Enums;

namespace CasaConSi.Api.Models;

// 1:1 con ApplicationUser — mismo patrón que StudentProfile/HostProfile.
// Cada bool es uno de los 10 ítems del docx "Verificación de Perfil".
// Los ítems 7-10 solo pueden pasar a true si el usuario es MembershipTier.Premium
// (gateado en TrustService, no acá ni en el front).
public class ProfileVerification
{
    public Guid Id { get; set; }

    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // Básica (ítems 1-6, disponibles en Freemium)
    public bool IdentityVerified { get; set; }        // 1. DNI frente/dorso + selfie con DNI
    public bool ContactVerified { get; set; }          // 2. Email + celular
    public bool SocialMediaVerified { get; set; }       // 3. Redes sociales informadas
    public bool CreditStatusVerified { get; set; }      // 4. Deudas/créditos + BCRA
    public bool ProofOfStatusVerified { get; set; }     // 5. Constancia (domicilio/estudios según rol)
    public bool SwornDeclarationAccepted { get; set; }  // 6. Declaración jurada

    // Alta confianza (ítems 7-10, requieren MembershipTier.Premium)
    public bool PersonalReferencesVerified { get; set; } // 7. 2 referencias personales
    public bool VirtualInterviewCompleted { get; set; }  // 8. Entrevista virtual (10 min)
    public bool CriminalRecordVerified { get; set; }     // 9. Certificado de antecedentes penales (RNR)
    public bool CohabitationHistoryVerified { get; set; } // 10. Historial de convivencia en la plataforma
    public VerificationReviewStatus AltaConfianzaStatus { get; set; } = VerificationReviewStatus.NoSolicitado;
    public DateTime? AltaConfianzaRequestedAtUtc { get; set; }
    public DateTime? AltaConfianzaReviewedAtUtc { get; set; }
    public string? AltaConfianzaReviewedByUserId { get; set; }
    public string? AltaConfianzaRejectionReason { get; set; }
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}