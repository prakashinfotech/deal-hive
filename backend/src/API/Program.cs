// ============================================================
// GrouponClone.API — Program.cs
// .NET 10 Clean Architecture Entry Point
// ============================================================

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using MediatR;
using FluentValidation;
using StackExchange.Redis;
using GrouponClone.Application.Behaviors;
using GrouponClone.Application.Interfaces;
using GrouponClone.Infrastructure.Persistence;
using GrouponClone.Infrastructure.Identity;
using GrouponClone.Infrastructure.Caching;
using GrouponClone.Infrastructure.ExternalServices.Stripe;
using GrouponClone.Infrastructure.ExternalServices.Email;
using GrouponClone.Infrastructure.ExternalServices.Storage;
using GrouponClone.Infrastructure.Services;
using GrouponClone.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.RateLimiting;
using GrouponClone.API.Middleware;
using GrouponClone.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ─── Serilog ─────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.Seq(builder.Configuration["Seq:ServerUrl"] ?? "http://localhost:5341")
    .CreateLogger();

builder.Host.UseSerilog();

// ─── Database ─────────────────────────────────────────────────
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MigrationsAssembly("GrouponClone.Infrastructure")
                        .EnableRetryOnFailure(3)));
// Expose IApplicationDbContext so Application layer handlers can use it without referencing Infrastructure
builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// ─── Redis ────────────────────────────────────────────────────
var redisConn = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConn));
builder.Services.AddStackExchangeRedisCache(options => options.Configuration = redisConn);
builder.Services.AddScoped<ICacheService, RedisCacheService>();

// ─── Identity + JWT ──────────────────────────────────────────
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>();

var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin", "SuperAdmin"));
    options.AddPolicy("VendorOnly", policy => policy.RequireRole("Vendor"));
});

// ─── Application Services ────────────────────────────────────
var applicationAssembly = typeof(GrouponClone.Application.Features.Deals.Commands.CreateDeal.CreateDealCommand).Assembly;
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));
builder.Services.AddValidatorsFromAssembly(applicationAssembly);
builder.Services.AddAutoMapper(typeof(GrouponClone.Application.Mappings.DealMappingProfile));

// ─── Infrastructure Services ─────────────────────────────────
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<IStripeService, StripeService>();
builder.Services.AddScoped<IEmailService, SendGridEmailService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<IVoucherCodeGenerator, VoucherCodeGenerator>();
builder.Services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<ApplicationDbContext>());
// Allow handlers to inject DbContext directly for cross-aggregate queries
builder.Services.AddScoped<Microsoft.EntityFrameworkCore.DbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// Repositories
builder.Services.AddScoped<IDealRepository, DealRepository>();

// SignalR notification pusher
builder.Services.AddScoped<INotificationPusher, NotificationPusher>();

// ─── MediatR Pipeline Behaviors ──────────────────────────────
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));

// ─── HTTP ────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddResponseCaching();
builder.Services.AddResponseCompression();

// ─── Rate Limiting ───────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("anonymous", cfg =>
    {
        cfg.PermitLimit = 100;
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        cfg.QueueLimit = 5;
    });
    options.AddFixedWindowLimiter("authenticated", cfg =>
    {
        cfg.PermitLimit = 1000;
        cfg.Window = TimeSpan.FromMinutes(1);
        cfg.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        cfg.QueueLimit = 10;
    });
});

// ─── CORS ────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
               ?? ["http://localhost:3000"])
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ─── SignalR ─────────────────────────────────────────────────
builder.Services.AddSignalR();

// ─── Swagger ─────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "DealHive API",
        Version = "v1",
        Description = "Enterprise Deals Platform API",
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            []
        }
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) options.IncludeXmlComments(xmlPath);
});

// ─── Build ────────────────────────────────────────────────────
var app = builder.Build();

// ─── Middleware Pipeline ─────────────────────────────────────
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DealHive API v1"));
}

app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseSerilogRequestLogging();
app.UseCors("FrontendPolicy");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseResponseCaching();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

// Auto-migrate in development (non-fatal — API still starts without a DB)
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        Log.Information("Database migration applied successfully.");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Could not connect to the database on startup. " +
            "Ensure PostgreSQL is running. API will start without DB migrations applied.");
    }
}

app.Run();
