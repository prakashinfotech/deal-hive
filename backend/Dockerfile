# ─── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution + project files first (layer-cache friendly)
COPY DealHive.sln ./
COPY src/Domain/GrouponClone.Domain.csproj             src/Domain/
COPY src/Application/GrouponClone.Application.csproj   src/Application/
COPY src/Infrastructure/GrouponClone.Infrastructure.csproj src/Infrastructure/
COPY src/API/GrouponClone.API.csproj                   src/API/

RUN dotnet restore

# Copy everything else and publish
COPY . .
RUN dotnet publish src/API/GrouponClone.API.csproj \
    -c Release -o /app/publish --no-restore

# ─── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

COPY --from=build /app/publish .

EXPOSE 5000
ENTRYPOINT ["dotnet", "GrouponClone.API.dll"]

# ─── Development stage (for docker-compose.override.yml) ──────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS development
WORKDIR /app
EXPOSE 5000
CMD ["dotnet", "watch", "run", "--project", "src/API/GrouponClone.API.csproj"]
