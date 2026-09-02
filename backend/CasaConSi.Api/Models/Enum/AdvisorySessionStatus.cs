using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

[JsonConverter(typeof(AdvisorySessionStatusJsonConverter))]
public enum AdvisorySessionStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

public class AdvisorySessionStatusJsonConverter : JsonConverter<AdvisorySessionStatus>
{
    public override AdvisorySessionStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "pending" => AdvisorySessionStatus.Pending,
            "confirmed" => AdvisorySessionStatus.Confirmed,
            "completed" => AdvisorySessionStatus.Completed,
            "cancelled" => AdvisorySessionStatus.Cancelled,
            _ => throw new JsonException($"Valor de AdvisorySessionStatus no reconocido: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, AdvisorySessionStatus value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            AdvisorySessionStatus.Pending => "pending",
            AdvisorySessionStatus.Confirmed => "confirmed",
            AdvisorySessionStatus.Completed => "completed",
            AdvisorySessionStatus.Cancelled => "cancelled",
            _ => throw new JsonException($"AdvisorySessionStatus no soportado: {value}")
        });
    }
}