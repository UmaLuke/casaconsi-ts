using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

// Umbrales tal cual el docx "Verificación de Perfil":
// Perfil básico = 01/10 a 06/10, Perfil de alta confianza = 07/10 a 10/10.
// SinVerificar (0/10) no está en el docx pero hace falta como estado inicial.
[JsonConverter(typeof(VerificationLevelJsonConverter))]
public enum VerificationLevel
{
    SinVerificar,
    Basico,
    AltaConfianza
}

public class VerificationLevelJsonConverter : JsonConverter<VerificationLevel>
{
    public override VerificationLevel Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        => throw new NotSupportedException("VerificationLevel es solo de salida (calculado por el backend).");

    public override void Write(Utf8JsonWriter writer, VerificationLevel value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            VerificationLevel.SinVerificar => "sin_verificar",
            VerificationLevel.Basico => "basico",
            VerificationLevel.AltaConfianza => "alta_confianza",
            _ => throw new JsonException($"VerificationLevel no soportado: {value}")
        });
    }
}