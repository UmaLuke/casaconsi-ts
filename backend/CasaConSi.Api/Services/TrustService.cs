using CasaConSi.Api.Services.Interfaces;
using CasaConSi.Api.DTOs.Trust;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

public class TrustService : ITrustService
{
    private readonly ITrustRepository _trustRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IFileStorageService _fileStorageService;

    private static readonly string[] AllowedDocumentExtensions = { ".pdf", ".jpg", ".jpeg", ".png" };

    public TrustService(ITrustRepository trustRepository, UserManager<ApplicationUser> userManager, IFileStorageService fileStorageService)
    {
        _trustRepository = trustRepository;
        _userManager = userManager;
        _fileStorageService = fileStorageService;
    }

    public async Task<TrustStatusResponseDto> GetStatusAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");
        var verification = await _trustRepository.GetOrCreateAsync(userId);

        return BuildResponse(user, verification);
    }

    public async Task<TrustStatusResponseDto> UpdateItemsAsync(string userId, UpdateTrustItemsRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");
        var verification = await _trustRepository.GetOrCreateAsync(userId);

        if (request.IdentityVerified.HasValue) verification.IdentityVerified = request.IdentityVerified.Value;
        if (request.ContactVerified.HasValue) verification.ContactVerified = request.ContactVerified.Value;
        if (request.SocialMediaVerified.HasValue) verification.SocialMediaVerified = request.SocialMediaVerified.Value;
        if (request.CreditStatusVerified.HasValue) verification.CreditStatusVerified = request.CreditStatusVerified.Value;
        if (request.ProofOfStatusVerified.HasValue) verification.ProofOfStatusVerified = request.ProofOfStatusVerified.Value;
        if (request.SwornDeclarationAccepted.HasValue) verification.SwornDeclarationAccepted = request.SwornDeclarationAccepted.Value;

        verification.UpdatedAtUtc = DateTime.UtcNow;
        await _trustRepository.SaveChangesAsync();

        return BuildResponse(user, verification);
    }

    public async Task<TrustStatusResponseDto> RequestAltaConfianzaAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new InvalidOperationException("Usuario no encontrado.");
        if (user.MembershipTier != MembershipTier.Premium)
            throw new InvalidOperationException("Solo los usuarios Premium pueden solicitar Alta Confianza.");

        var verification = await _trustRepository.GetOrCreateAsync(userId);
        if (verification.AltaConfianzaStatus == VerificationReviewStatus.Pendiente)
            throw new InvalidOperationException("Ya hay una solicitud de Alta Confianza pendiente de revisión.");

        verification.AltaConfianzaStatus = VerificationReviewStatus.Pendiente;
        verification.AltaConfianzaRequestedAtUtc = DateTime.UtcNow;
        verification.AltaConfianzaRejectionReason = null;
        verification.UpdatedAtUtc = DateTime.UtcNow;
        await _trustRepository.SaveChangesAsync();

        return BuildResponse(user, verification);
    }

    public async Task<AltaConfianzaEvidenceDto> GetEvidenceAsync(string userId)
    {
        var verification = await _trustRepository.GetOrCreateAsync(userId);
        return BuildEvidence(verification);
    }

    public async Task<AltaConfianzaEvidenceDto> SavePersonalReferencesAsync(string userId, SavePersonalReferencesRequestDto request)
    {
        var verification = await _trustRepository.GetOrCreateAsync(userId);

        verification.Reference1Name = request.Reference1Name;
        verification.Reference1Phone = request.Reference1Phone;
        verification.Reference1Relationship = request.Reference1Relationship;
        verification.Reference2Name = request.Reference2Name;
        verification.Reference2Phone = request.Reference2Phone;
        verification.Reference2Relationship = request.Reference2Relationship;
        verification.UpdatedAtUtc = DateTime.UtcNow;

        await _trustRepository.SaveChangesAsync();
        return BuildEvidence(verification);
    }

    public async Task<AltaConfianzaEvidenceDto> UploadCriminalRecordDocumentAsync(string userId, IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedDocumentExtensions.Contains(extension))
            throw new InvalidOperationException("El documento debe ser PDF, JPG o PNG.");

        var verification = await _trustRepository.GetOrCreateAsync(userId);
        var relativePath = await _fileStorageService.SaveAsync(file, $"verificaciones/{userId}");

        verification.CriminalRecordDocumentPath = relativePath;
        verification.CriminalRecordDocumentUploadedAtUtc = DateTime.UtcNow;
        verification.UpdatedAtUtc = DateTime.UtcNow;

        await _trustRepository.SaveChangesAsync();
        return BuildEvidence(verification);
    }

    private static AltaConfianzaEvidenceDto BuildEvidence(ProfileVerification v) => new()
    {
        Reference1Name = v.Reference1Name,
        Reference1Phone = v.Reference1Phone,
        Reference1Relationship = v.Reference1Relationship,
        Reference2Name = v.Reference2Name,
        Reference2Phone = v.Reference2Phone,
        Reference2Relationship = v.Reference2Relationship,
        HasCriminalRecordDocument = v.CriminalRecordDocumentPath is not null,
        CriminalRecordDocumentUrl = ToUrl(v.CriminalRecordDocumentPath),
        CriminalRecordDocumentUploadedAtUtc = v.CriminalRecordDocumentUploadedAtUtc,
    };

    private static string? ToUrl(string? relativePath) =>
        relativePath is null ? null : $"/uploads/{relativePath}";

    private static TrustStatusResponseDto BuildResponse(ApplicationUser user, ProfileVerification v)
    {
        var isPremium = user.MembershipTier == MembershipTier.Premium;

        var items = new List<TrustItemDto>
        {
            Item("identity_verified", "Identidad (DNI frente/dorso + selfie)", v.IdentityVerified, false, isPremium),
            Item("contact_verified", "Datos de contacto (email + celular)", v.ContactVerified, false, isPremium),
            Item("social_media_verified", "Revisión de identidad (redes sociales)", v.SocialMediaVerified, false, isPremium),
            Item("credit_status_verified", "Situación crediticia (BCRA)", v.CreditStatusVerified, false, isPremium),
            Item("proof_of_status_verified", "Constancia según rol", v.ProofOfStatusVerified, false, isPremium),
            Item("sworn_declaration_accepted", "Declaración jurada", v.SwornDeclarationAccepted, false, isPremium),
            Item("personal_references_verified", "Referencias personales", v.PersonalReferencesVerified, true, isPremium),
            Item("virtual_interview_completed", "Entrevista virtual (10 min)", v.VirtualInterviewCompleted, true, isPremium),
            Item("criminal_record_verified", "Antecedentes penales (RNR)", v.CriminalRecordVerified, true, isPremium),
            Item("cohabitation_history_verified", "Historial de convivencia", v.CohabitationHistoryVerified, true, isPremium),
        };

        var score = items.Count(i => i.Completed);
        var level = score switch
        {
            0 => VerificationLevel.SinVerificar,
            >= 1 and <= 6 => VerificationLevel.Basico,
            _ => VerificationLevel.AltaConfianza,
        };

        return new TrustStatusResponseDto
        {
            Score = score,
            Level = level,
            MembershipTier = user.MembershipTier,
            IsDemoUser = user.IsDemoUser,
            Items = items,
        };
    }

    private static TrustItemDto Item(string key, string label, bool completed, bool requiresPremium, bool isPremium) =>
        new()
        {
            Key = key,
            Label = label,
            Completed = completed,
            RequiresPremium = requiresPremium,
            Locked = requiresPremium && !isPremium,
        };
}