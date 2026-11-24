@echo off
title Transport & Logistic Management System
echo ==========================================================
echo Starting Transport & Logistic Management System (TMS)...
echo ==========================================================
call "%~dp0mvnw.cmd" spring-boot:run
pause
