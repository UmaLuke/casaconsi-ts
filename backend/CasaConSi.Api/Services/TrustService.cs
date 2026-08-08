using CasaConSi.Api.Services.Interfaces;
using CasaConSi.Api.DTOs.Trust;
using CasaConSi.Api.Models;
using CasaConSi.Api.Models.Enums;
using CasaConSi.Api.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CasaConSi.Api.Services;

public class TrustService : ITrustService
{
    private readonly ITrustRepository _trustRepository;
    private readonly UserManager<ApplicationUser> _userManager;

    public TrustService(ITrustRepository trustRepository, UserManager<ApplicationUser> userManager)
    {
        _trustRepository = trustRepository;
        _userManager = userManager;
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
        var isPremium = user.MembershipTier == MembershipTier.Premium;

        // Ítems 1-6: disponibles para cualquier tier.
        if (request.IdentityVerified.HasValue) verification.IdentityVerified = request.IdentityVerified.Value;
        if (request.ContactVerified.HasValue) verification.ContactVerified = request.ContactVerified.Value;
        if (request.SocialMediaVerified.HasValue) verification.SocialMediaVerified = request.SocialMediaVerified.Value;
        if (request.CreditStatusVerified.HasValue) verification.CreditStatusVerified = request.CreditStatusVerified.Value;
        if (request.ProofOfStatusVerified.HasValue) verification.ProofOfStatusVerified = request.ProofOfStatusVerified.Value;
        if (request.SwornDeclarationAccepted.HasValue) verification.SwornDeclarationAccepted = request.SwornDeclarationAccepted.Value;

        // Ítems 7-10: solo Premium puede marcarlos en true. Si no es Premium
        // y manda true, se ignora (queda como estaba) en vez de tirar error,
        // para no romper un PUT parcial por un solo campo no habilitado.
        if (request.PersonalReferencesVerified.HasValue && (isPremium || !request.PersonalReferencesVerified.Value))
            verification.PersonalReferencesVerified = request.PersonalReferencesVerified.Value;
        if (request.VirtualInterviewCompleted.HasValue && (isPremium || !request.VirtualInterviewCompleted.Value))
            verification.VirtualInterviewCompleted = request.VirtualInterviewCompleted.Value;
        if (request.CriminalRecordVerified.HasValue && (isPremium || !request.CriminalRecordVerified.Value))
            verification.CriminalRecordVerified = request.CriminalRecordVerified.Value;
        if (request.CohabitationHistoryVerified.HasValue && (isPremium || !request.CohabitationHistoryVerified.Value))
            verification.CohabitationHistoryVerified = request.CohabitationHistoryVerified.Value;

        verification.UpdatedAtUtc = DateTime.UtcNow;
        await _trustRepository.SaveChangesAsync();

        return BuildResponse(user, verification);
    }

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
            _ => VerificationLevel.AltaConfianza, // 7-10
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