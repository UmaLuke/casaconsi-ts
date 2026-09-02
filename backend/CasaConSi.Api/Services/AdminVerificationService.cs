using CasaConSi.Api.DTOs.Admin;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;

namespace CasaConSi.Api.Services;

public class AdminVerificationService : IAdminVerificationService
{
    private readonly ITrustRepository _trustRepository;

    public AdminVerificationService(ITrustRepository trustRepository)
    {
        _trustRepository = trustRepository;
    }

    public async Task<List<AdminVerificationQueueItemDto>> GetQueueAsync()
    {
        var pending = await _trustRepository.GetPendingAltaConfianzaAsync();
        return pending.Select(v => new AdminVerificationQueueItemDto
        {
            UserId = v.UserId,
            Name = v.User?.Name ?? "(usuario eliminado)",
            Role = v.User?.Role ?? default,
            BasicScore = BasicScore(v),
            RequestedAtUtc = v.AltaConfianzaRequestedAtUtc,
        }).ToList();
    }

    public async Task<AdminVerificationDetailDto> GetDetailAsync(string userId)
    {
        var v = await _trustRepository.GetByUserIdWithUserAsync(userId)
            ?? throw new InvalidOperationException("No se encontró la verificación de este usuario.");
        return BuildDetail(v);
    }

    public async Task<AdminVerificationDetailDto> ApproveAsync(string userId, string adminUserId)
    {
        var v = await _trustRepository.GetByUserIdWithUserAsync(userId)
            ?? throw new InvalidOperationException("No se encontró la verificación de este usuario.");

        v.PersonalReferencesVerified = true;
        v.VirtualInterviewCompleted = true;
        v.CriminalRecordVerified = true;
        v.CohabitationHistoryVerified = true;
        v.AltaConfianzaStatus = VerificationReviewStatus.Aprobado;
        v.AltaConfianzaReviewedAtUtc = DateTime.UtcNow;
        v.AltaConfianzaReviewedByUserId = adminUserId;
        v.AltaConfianzaRejectionReason = null;
        v.UpdatedAtUtc = DateTime.UtcNow;

        await _trustRepository.SaveChangesAsync();
        return BuildDetail(v);
    }

    public async Task<AdminVerificationDetailDto> RejectAsync(string userId, string adminUserId, string reason)
    {
        var v = await _trustRepository.GetByUserIdWithUserAsync(userId)
            ?? throw new InvalidOperationException("No se encontró la verificación de este usuario.");

        v.AltaConfianzaStatus = VerificationReviewStatus.Rechazado;
        v.AltaConfianzaReviewedAtUtc = DateTime.UtcNow;
        v.AltaConfianzaReviewedByUserId = adminUserId;
        v.AltaConfianzaRejectionReason = reason;
        v.UpdatedAtUtc = DateTime.UtcNow;

        await _trustRepository.SaveChangesAsync();
        return BuildDetail(v);
    }

    private static int BasicScore(ProfileVerification v) =>
        new[] { v.IdentityVerified, v.ContactVerified, v.SocialMediaVerified, v.CreditStatusVerified, v.ProofOfStatusVerified, v.SwornDeclarationAccepted }
            .Count(x => x);

    private static AdminVerificationDetailDto BuildDetail(ProfileVerification v)
    {
        var basicItems = new List<AdminVerificationItemDto>
        {
            new() { Key = "identity_verified", Label = "Identidad (DNI frente/dorso + selfie)", Completed = v.IdentityVerified },
            new() { Key = "contact_verified", Label = "Datos de contacto (email + celular)", Completed = v.ContactVerified },
            new() { Key = "social_media_verified", Label = "Revisión de identidad (redes sociales)", Completed = v.SocialMediaVerified },
            new() { Key = "credit_status_verified", Label = "Situación crediticia (BCRA)", Completed = v.CreditStatusVerified },
            new() { Key = "proof_of_status_verified", Label = "Constancia según rol", Completed = v.ProofOfStatusVerified },
            new() { Key = "sworn_declaration_accepted", Label = "Declaración jurada", Completed = v.SwornDeclarationAccepted },
        };

        var altaConfianzaItems = new List<AdminVerificationItemDto>
        {
            new() { Key = "personal_references_verified", Label = "Referencias personales (2)", Completed = v.PersonalReferencesVerified },
            new() { Key = "virtual_interview_completed", Label = "Entrevista virtual (10 min)", Completed = v.VirtualInterviewCompleted },
            new() { Key = "criminal_record_verified", Label = "Certificado de antecedentes penales (RNR)", Completed = v.CriminalRecordVerified },
            new() { Key = "cohabitation_history_verified", Label = "Historial de convivencia en la plataforma", Completed = v.CohabitationHistoryVerified },
        };

        return new AdminVerificationDetailDto
        {
            UserId = v.UserId,
            Name = v.User?.Name ?? "(usuario eliminado)",
            Role = v.User?.Role ?? default,
            MembershipTier = v.User?.MembershipTier ?? default,
            BasicScore = basicItems.Count(i => i.Completed),
            Status = v.AltaConfianzaStatus,
            RequestedAtUtc = v.AltaConfianzaRequestedAtUtc,
            ReviewedAtUtc = v.AltaConfianzaReviewedAtUtc,
            RejectionReason = v.AltaConfianzaRejectionReason,
            BasicItems = basicItems,
            AltaConfianzaItems = altaConfianzaItems,
            Reference1 = v.Reference1Name is not null
                ? new AdminVerificationReferenceDto { Name = v.Reference1Name, Phone = v.Reference1Phone ?? "", Relationship = v.Reference1Relationship ?? "" }
                : null,
            Reference2 = v.Reference2Name is not null
                ? new AdminVerificationReferenceDto { Name = v.Reference2Name, Phone = v.Reference2Phone ?? "", Relationship = v.Reference2Relationship ?? "" }
                : null,
            CriminalRecordDocumentUrl = v.CriminalRecordDocumentPath is not null ? $"/uploads/{v.CriminalRecordDocumentPath}" : null,
            CriminalRecordDocumentUploadedAtUtc = v.CriminalRecordDocumentUploadedAtUtc,
        };
    }
}