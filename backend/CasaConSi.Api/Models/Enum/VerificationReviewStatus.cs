using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

// Estado de la revisión manual de staff sobre los ítems 7-10 (Alta Confianza).
// No aplica a los ítems 1-6 (Básica), que siguen siendo autodeclarados.
[JsonConverter(typeof(VerificationReviewStatusJsonConverter))]
public enum VerificationReviewStatus
{
    NoSolicitado,
    Pendiente,
    Aprobado,
    Rechazado
}

public class VerificationReviewStatusJsonConverter : JsonConverter<VerificationReviewStatus>
{
    public override VerificationReviewStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => throw new NotSupportedException("VerificationReviewStatus es solo de salida (calculado por el backend).");

    public override void Write(Utf8JsonWriter writer, VerificationReviewStatus value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            VerificationReviewStatus.NoSolicitado => "no_solicitado",
            VerificationReviewStatus.Pendiente => "pendiente",
            VerificationReviewStatus.Aprobado => "aprobado",
            VerificationReviewStatus.Rechazado => "rechazado",
            _ => throw new JsonException($"VerificationReviewStatus no soportado: {value}")
        });
    }
}