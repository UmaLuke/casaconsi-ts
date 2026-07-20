using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

[JsonConverter(typeof(GenerationJsonConverter))]
public enum Generation
{
    JovenAdulto,
    AdultoMayor
}

// Serializa a los strings con guion de src/types/filters.ts ('joven-adulto' | 'adulto-mayor')
public class GenerationJsonConverter : JsonConverter<Generation>
{
    public override Generation Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "joven-adulto" => Generation.JovenAdulto,
            "adulto-mayor" => Generation.AdultoMayor,
            _ => throw new JsonException($"Valor de Generation no reconocido: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, Generation value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            Generation.JovenAdulto => "joven-adulto",
            Generation.AdultoMayor => "adulto-mayor",
            _ => throw new JsonException($"Generation no soportado: {value}")
        });
    }
}