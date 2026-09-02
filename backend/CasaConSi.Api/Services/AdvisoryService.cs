using CasaConSi.Api.DTOs.Advisory;
using CasaConSi.Api.Models;
using CasaConSi.Api.Repositories.Interfaces;
using CasaConSi.Api.Services.Interfaces;

namespace CasaConSi.Api.Services;

// Reservas centralizadas: el cliente elige tipo de sesión + día + horario,
// nunca una asesora puntual (decisión del 2/9 con Lucía: quiere centralizar
// los turnos, no que la persona usuaria elija profesional). Por ahora todo
// turno se asigna a la asesora marcada IsPrimaryAdvisor (Lic. Pozzo). A
// futuro, con más asesoras activas, la idea es que el turno nazca sin
// asignar y cualquiera del staff lo tome al confirmarlo — reasignando
// AdvisorUserId en un endpoint de "aceptar turno" que todavía no existe (no
// hace falta cambio de esquema para eso). Ver
// docs/vault-casaconsi/modulos/Asesorias.md.
public class AdvisoryService : IAdvisoryService
{
    // Precio único para todas las asesorías — ver "Servicios y precios" en
    // el contenido provisto por la clienta ($50.000 ARS por sesión). Todavía
    // no hay precio configurable por asesor.
    private const decimal SessionPrice = 50000m;

    // Grilla de horarios fija ofrecida por el equipo — todavía no hay agenda
    // individual por asesor (ver pendiente en
    // docs/vault-casaconsi/modulos/Asesorias.md).
    private static readonly TimeOnly[] DailySlots =
    [
        new TimeOnly(9, 0), new TimeOnly(10, 30), new TimeOnly(12, 0),
        new TimeOnly(14, 0), new TimeOnly(15, 30), new TimeOnly(16, 30),
    ];

    private readonly IAdvisoryRepository _advisoryRepository;

    public AdvisoryService(IAdvisoryRepository advisoryRepository)
    {
        _advisoryRepository = advisoryRepository;
    }

    public async Task<List<AvailabilitySlotDto>> GetAvailabilityAsync(DateOnly date)
    {
        var advisor = await _advisoryRepository.GetPrimaryAdvisorAsync()
            ?? throw new InvalidOperationException("Todavía no hay ninguna asesora configurada. Probá más tarde.");

        var takenTimes = (await _advisoryRepository.GetSessionsForAdvisorOnDateAsync(advisor.Id, date))
            .Select(s => TimeOnly.FromDateTime(s.ScheduledAt))
            .ToHashSet();

        var isPastOrWeekend = date < DateOnly.FromDateTime(DateTime.UtcNow) || IsWeekend(date);

        return DailySlots.Select(t => new AvailabilitySlotDto
        {
            Time = t.ToString("HH:mm"),
            Available = !isPastOrWeekend && !takenTimes.Contains(t),
        }).ToList();
    }

    public async Task<AdvisorySessionDto> CreateSessionAsync(string clientUserId, CreateAdvisorySessionRequestDto request)
    {
        var advisor = await _advisoryRepository.GetPrimaryAdvisorAsync()
            ?? throw new InvalidOperationException("Todavía no hay ninguna asesora configurada. Probá más tarde.");

        if (IsWeekend(request.Date))
        {
            throw new InvalidOperationException("Las asesorías solo se ofrecen de lunes a viernes.");
        }

        if (!TimeOnly.TryParseExact(request.Time, "HH:mm", out var time) || !DailySlots.Contains(time))
        {
            throw new InvalidOperationException("El horario seleccionado no es válido.");
        }

        var scheduledAt = request.Date.ToDateTime(time, DateTimeKind.Utc);
        if (scheduledAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("No se puede reservar una sesión en el pasado.");
        }

        var taken = (await _advisoryRepository.GetSessionsForAdvisorOnDateAsync(advisor.Id, request.Date))
            .Any(s => TimeOnly.FromDateTime(s.ScheduledAt) == time);
        if (taken)
        {
            throw new InvalidOperationException("Ese horario ya fue reservado. Elegí otro.");
        }

        var session = new AdvisorySession
        {
            Id = Guid.NewGuid(),
            AdvisorUserId = advisor.Id,
            ClientUserId = clientUserId,
            SessionType = request.SessionType,
            ScheduledAt = scheduledAt,
            Price = SessionPrice,
        };

        await _advisoryRepository.CreateSessionAsync(session);
        await _advisoryRepository.SaveChangesAsync();

        return ToSessionDto(session);
    }

    public async Task<List<AdvisorySessionDto>> GetMySessionsAsync(string clientUserId)
    {
        var sessions = await _advisoryRepository.GetSessionsForClientAsync(clientUserId);
        return sessions.Select(ToSessionDto).ToList();
    }

    private static bool IsWeekend(DateOnly date) =>
        date.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;

    private static AdvisorySessionDto ToSessionDto(AdvisorySession session) => new()
    {
        Id = session.Id,
        SessionType = session.SessionType,
        ScheduledAt = session.ScheduledAt,
        Status = session.Status,
        Price = session.Price,
    };
}
