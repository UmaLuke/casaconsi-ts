using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

[JsonConverter(typeof(AdvisorySessionTypeJsonConverter))]
public enum AdvisorySessionType
{
    Inicial,
    Convivencia,
    Final
}

public class AdvisorySessionTypeJsonConverter : JsonConverter<AdvisorySessionType>
{
    public override AdvisorySessionType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "inicial" => AdvisorySessionType.Inicial,
            "convivencia" => AdvisorySessionType.Convivencia,
            "final" => AdvisorySessionType.Final,
            _ => throw new JsonException($"Valor de AdvisorySessionType no reconocido: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, AdvisorySessionType value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            AdvisorySessionType.Inicial => "inicial",
            AdvisorySessionType.Convivencia => "convivencia",
            AdvisorySessionType.Final => "final",
            _ => throw new JsonException($"AdvisorySessionType no soportado: {value}")
        });
    }
}