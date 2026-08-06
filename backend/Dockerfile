# Multi-stage Dockerfile for .NET 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["backend/src/backend.csproj", "backend/src/"]
RUN dotnet restore "backend/src/backend.csproj"

# Copy full source and build
COPY ["backend/src/", "backend/src/"]
WORKDIR "/src/backend/src"
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

# Non-root user for security
USER $APP_UID

COPY --from=build /app/publish .

# Render assigns PORT dynamically, ASPNETCORE_HTTP_PORTS binds to it
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]
