using System.Text.Json;
using System.Text.Json.Serialization;

namespace CasaConSi.Api.Models.Enums;

[JsonConverter(typeof(UserRoleJsonConverter))]
public enum UserRole
{
    Host,
    Student
}

// Serializa a los mismos strings que usa el frontend (role: 'host' | 'student')
public class UserRoleJsonConverter : JsonConverter<UserRole>
{
    public override UserRole Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value switch
        {
            "host" => UserRole.Host,
            "student" => UserRole.Student,
            _ => throw new JsonException($"Valor de UserRole no reconocido: {value}")
        };
    }

    public override void Write(Utf8JsonWriter writer, UserRole value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value switch
        {
            UserRole.Host => "host",
            UserRole.Student => "student",
            _ => throw new JsonException($"UserRole no soportado: {value}")
        });
    }
}