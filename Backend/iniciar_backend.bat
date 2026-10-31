@echo off
chcp 65001 > nul
title FECAP - POO - Backend Local (Plataforma de Apoio ao Estudo)
color 0A
cls
cd /d "%~dp0"
echo ======================================================================
echo   FECAP - PROGRAMACAO ORIENTADA A OBJETOS - AULA 9 (PROJETO PI)
echo   Backend Local em C# + MySQL  -  http://localhost:5080
echo ======================================================================
echo.
echo   [Dica] Senha do MySQL: edite mysql_config.txt (Pwd=sua_senha;)
echo.

where dotnet >nul 2>nul
if %errorlevel%==0 goto COMPILAR
if exist "%~dp0BackendEstudoAPI.exe" goto EXE
echo [ERRO] .NET SDK nao encontrado e nao ha BackendEstudoAPI.exe nesta pasta.
echo        Instale o .NET SDK 10: https://dotnet.microsoft.com/download
goto FIM

:COMPILAR
echo Compilando e iniciando a partir do codigo-fonte corrigido...
dotnet run --project "%~dp0Source\BackendEstudoAPI.csproj" -c Release -- %*
goto FIM

:EXE
echo [Aviso] .NET SDK nao encontrado. Usando o BackendEstudoAPI.exe antigo.
echo         Ele NAO contem as correcoes. Instale o .NET SDK 10 para usar o codigo novo.
"%~dp0BackendEstudoAPI.exe" %*

:FIM
echo.
pause
