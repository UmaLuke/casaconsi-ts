namespace CasaConSi.Api.Models.Profiles;

// Owned types mapeados a columnas jsonb vía .ToJson() (ver ApplicationDbContext).
// Espejo campo a campo de frontend/src/types/questionnaire-student.ts, con dos
// excepciones deliberadas:
// - Dni: no vive acá. Sale a StudentProfile.EncryptedDni, protegido aparte
//   (ver ProfileService) — nunca en texto plano en el jsonb.
// - generation: no se guarda como dato. Se deriva en el backend a partir de
//   BirthDate en cada guardado (ProfileService.SyncUserGenerationAsync) y se
//   persiste en ApplicationUser.Generation, no acá — así nunca se confía en
//   un valor calculado del lado del cliente.
// - Los campos de tipo File (profilePhoto, presentationMedia) tampoco viven
//   acá: se resuelven aparte, ver StudentProfile.ProfilePhotoPath / PresentationMediaPath.
//
// Los "options" de cada select (gender, reason, stayDuration, etc.) se
// guardan como string tal cual los define el schema del frontend
// (src/data/studentQuestionnaireSchema.ts), sin enum propio en el backend:
// el único cliente hoy es el frontend, que ya controla los valores posibles
// vía los <select>. Si en el futuro se expone esto a otro cliente, ahí sí
// vale la pena migrar a enums con validación estricta.

public class StudentPersonalData
{
    public string FullName { get; set; } = string.Empty;
    public string BirthDate { get; set; } = string.Empty; // ISO yyyy-mm-dd
    public string Gender { get; set; } = string.Empty;
    public string Nationality { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactRelationship { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
}

public class StudentTravelReason
{
    public string Reason { get; set; } = string.Empty; // estudios | trabajo | proyecto-personal | otro
    public string ReasonOther { get; set; } = string.Empty;
    public string StudyDetails { get; set; } = string.Empty;
    public string WorkDetails { get; set; } = string.Empty;
    public string StayDuration { get; set; } = string.Empty; // 4-6-meses | hasta-1-anio | mas-1-anio
    public string AvailableFrom { get; set; } = string.Empty; // ISO yyyy-mm-dd
}

public class StudentLocationPreferences
{
    public List<string> PreferredNeighborhoods { get; set; } = new();
    public string PreferredNeighborhoodsOther { get; set; } = string.Empty;
    public List<string> ExcludedNeighborhoods { get; set; } = new();
    public string ExcludedNeighborhoodsOther { get; set; } = string.Empty;
    public string ProximityNeeds { get; set; } = string.Empty;
}

public class StudentEconomicSituation
{
    public string MonthlyIncomeRange { get; set; } = string.Empty;
    public List<string> IncomeSources { get; set; } = new();
    public string CanPayMonthlyContribution { get; set; } = "si"; // YesNo
    public string ContributionRangeArs { get; set; } = string.Empty;
}

public class StudentExchangesOffered
{
    public List<string> Offerings { get; set; } = new();
    public string OtherOffering { get; set; } = string.Empty;
}

public class StudentHabits
{
    public string Smokes { get; set; } = "no";
    public string HasPets { get; set; } = "no";
    public string PetsDetail { get; set; } = string.Empty;
    public string HasChildrenAtHome { get; set; } = "no";
    public string UsualScheduleOut { get; set; } = string.Empty;
    public string UsualScheduleBack { get; set; } = string.Empty;
    public string VisitFrequency { get; set; } = string.Empty;
    public string WeekendAbsenceFrequency { get; set; } = string.Empty;
    public string MealPreference { get; set; } = "indistinto";
    public string CooksRegularly { get; set; } = "si";
    public int CleanlinessExpectation { get; set; } = 3;
    public string RelevantAllergies { get; set; } = string.Empty;
}

// NOTA DE PROTECCIÓN DE DATOS: esta sección vive en el jsonb de StudentProfile
// y solo se devuelve al dueño autenticado del perfil (ProfileService resuelve
// el UserId desde el JWT, nunca desde un parámetro del cliente). No debe
// incluirse nunca en un DTO público (explorador de habitaciones, resultados
// de match, etc.) cuando esos módulos se construyan.
public class StudentHealth
{
    public string RelevantHealthCondition { get; set; } = string.Empty;
    public string NeedsDailySupport { get; set; } = "no";
    public string DailySupportDetail { get; set; } = string.Empty;
    public string HealthCoverage { get; set; } = "sin-cobertura";
}

public class StudentHostPreferences
{
    public string PreferredGeneration { get; set; } = "indiferente"; // joven | adulto-joven | adulto | adulto-mayor | mayor | indiferente
    public string PreferredHostGender { get; set; } = string.Empty;
    public string AcceptsCoupleHost { get; set; } = "si";
    public string BotherIfHostSmokes { get; set; } = "depende";
    public string AcceptsPetsAtHome { get; set; } = "depende";
    public string AcceptsHostChildren { get; set; } = "si";
    public int OtherResidentsCount { get; set; }
    public string DealBreakers { get; set; } = string.Empty;
}

public class StudentPersonalPresentation
{
    public string Motivation { get; set; } = string.Empty;
    public string AboutMe { get; set; } = string.Empty;
}
