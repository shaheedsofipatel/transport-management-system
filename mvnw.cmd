@REM Maven Wrapper Script for Windows
@echo off
setlocal

set "DIR=%~dp0"
if defined JAVA_HOME goto checkMaven
if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.10002-hotspot"
)

:checkMaven
set "REPO=%DIR%.m2\repository"
if exist "%DIR%.maven\bin\mvn.cmd" (
    call "%DIR%.maven\bin\mvn.cmd" -Dmaven.repo.local="%REPO%" %*
) else (
    call mvn -Dmaven.repo.local="%REPO%" %*
)
