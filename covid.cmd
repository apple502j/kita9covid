@ECHO OFF
REM argument
SET param=%1
IF /I "%param%" EQU "build" GOTO :build
IF /I "%param%" EQU "start" GOTO :start
IF /I "%param%" EQU "touch" GOTO :touch
IF /I "%param%" EQU "optimize" GOTO :optimize
EXIT /B 1

REM build
:build
python generate-info.py
EXIT /B

REM start
:start
python -m http.server 8510 --bind 127.0.0.1 --directory ./docs/
EXIT /B

REM touch
:touch
python update-touching.py %2
python optimize.py
EXIT /B

REM optimize
:optimize
python optimize.py
EXIT /B
