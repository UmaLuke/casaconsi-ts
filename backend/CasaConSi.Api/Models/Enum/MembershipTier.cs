using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

// Modelo freemium del PDF "Propuesta de estructura web":
// Freemium = registro, perfil, búsqueda, match básico (gratis).
// Premium  = "Perfil Verificado" ($7.000 ARS, único pago) — desbloquea los
// ítems 7-10 de Verificación de Perfil (referencias, entrevista, antecedentes,
// historial de convivencia). Ver docx "Verificación de Perfil".
[JsonConverter(typeof(MembershipTierJsonConverter))]
public enum MembershipTier
{
    Freemium,
    Premium
}

public class MembershipTierJsonConverter : JsonConverter<MembershipTier>
{
    public override MembershipTier Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "freemium" => MembershipTier.Freemium,
            "premium" => MembershipTier.Premium,
            _ => throw new JsonException($"Valor de MembershipTier no reconocido: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, MembershipTier value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            MembershipTier.Freemium => "freemium",
            MembershipTier.Premium => "premium",
            _ => throw new JsonException($"MembershipTier no soportado: {value}")
        });
    }
}