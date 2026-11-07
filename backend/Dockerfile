FROM mcr.microsoft.com/dotnet/sdk:10.0

WORKDIR /app

COPY RateAlerts.Api.csproj ./
RUN dotnet restore

COPY . .

ENV ASPNETCORE_URLS=http://+:5180
ENV DOTNET_USE_POLLING_FILE_WATCHER=1

EXPOSE 5180

ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:5180"]