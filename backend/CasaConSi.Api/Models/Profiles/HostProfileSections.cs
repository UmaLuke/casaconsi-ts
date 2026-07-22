namespace CasaConSi.Api.Models.Profiles;

// Espejo campo a campo de frontend/src/types/questionnaire-host.ts.
// Ver notas de diseño (Dni, generation, Files) en StudentProfileSections.cs —
// aplican igual acá.

public class HostPersonalData
{
    public string FullName { get; set; } = string.Empty;
    public string BirthDate { get; set; } = string.Empty; // ISO yyyy-mm-dd
    public string Gender { get; set; } = string.Empty;
    public string MaritalStatus { get; set; } = "soltero";
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string FamilyReferenceName { get; set; } = string.Empty;
    public string FamilyReferenceRelationship { get; set; } = string.Empty;
    public string FamilyReferencePhone { get; set; } = string.Empty;
}

public class HostWorkSituation
{
    public string WorkStatus { get; set; } = "activo";
    public string ProfessionOrEducation { get; set; } = string.Empty;
    public string LivesAlone { get; set; } = "si";
    public string OtherResidents { get; set; } = string.Empty;
}

public class HostHousingData
{
    public string FullAddress { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string HousingType { get; set; } = "casa"; // casa | departamento | ph
    public int TotalBedrooms { get; set; } = 1;
    public int AvailableRooms { get; set; } = 1;
    public List<string> Amenities { get; set; } = new();
    public string HasPrivateBathroom { get; set; } = "no";
    public List<string> Accessibility { get; set; } = new();
    public string PublicTransportDistance { get; set; } = string.Empty;
}

public class HostExchangesExpected
{
    public string ExpectsMonthlyContribution { get; set; } = "si";
    public string ExpectedAmountRangeArs { get; set; } = string.Empty;
    public List<string> OtherExchanges { get; set; } = new();
    public string OtherExchangeDetail { get; set; } = string.Empty;
}

// NOTA DE PROTECCIÓN DE DATOS: ídem StudentHealth — solo accesible al dueño
// del perfil autenticado, nunca en un DTO público.
public class HostHealth
{
    public int CurrentHealthStatus { get; set; } = 3;
    public string RelevantHealthCondition { get; set; } = string.Empty;
    public string DailyActivitySupportDetail { get; set; } = string.Empty;
    public string TakesScheduledMedication { get; set; } = "no";
    public string HasCurrentHelp { get; set; } = "no";
    public string CurrentHelpDetail { get; set; } = string.Empty;
}

public class HostHabits
{
    public string SmokesAtHome { get; set; } = "no";
    public string HasPets { get; set; } = "no";
    public string PetsDetail { get; set; } = string.Empty;
    public string HasMinorChildrenAtHome { get; set; } = "no";
    public string FreeTimeActivities { get; set; } = string.Empty;
    public string BelongsToAssociation { get; set; } = string.Empty;
    public string VisitFrequency { get; set; } = string.Empty;
    public string MealPreference { get; set; } = "indistinto";
    public int CleanlinessExpectation { get; set; } = 3;
}

public class HostTenantPreferences
{
    public string PreferredGeneration { get; set; } = "indiferente"; // joven | adulto-joven | adulto | adulto-mayor | mayor | indiferente
    public string PreferredTenantGender { get; set; } = string.Empty;
    public string AcceptsOtherNationality { get; set; } = "depende";
    public string TenantCanStayAloneIfHostAway { get; set; } = "si";
    public string TenantCanReceiveVisits { get; set; } = "si";
    public string AcceptsTenantSmoking { get; set; } = "no";
    public string AcceptsTenantPets { get; set; } = "no";
    public string AcceptsTenantChildrenVisiting { get; set; } = "si";
    public string NightCurfew { get; set; } = string.Empty;
    public string DealBreakers { get; set; } = string.Empty;
}

public class HostPersonalPresentation
{
    public string Motivation { get; set; } = string.Empty;
    public string AboutMe { get; set; } = string.Empty;
}
