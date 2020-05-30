@ECHO OFF
REM argument
SET param=%1
IF /I "%param%" EQU "build" GOTO :build
IF /I "%param%" EQU "start" GOTO :start
EXIT /B 1

REM build
:build
python generate-info.py
EXIT /B

REM start
:start
python -m http.server 8510 --bind 127.0.0.1 --directory ./docs/
