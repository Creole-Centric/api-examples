using CreoleCentricExample.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register CreoleCentric client as singleton
builder.Services.AddSingleton<CreoleCentricClient>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("✅ CreoleCentric TTS API - ASP.NET Core Example");
Console.WriteLine("📖 API Documentation: https://creolecentric.com/developer");
Console.WriteLine("🚀 Server running on http://localhost:5000");

app.Run();
