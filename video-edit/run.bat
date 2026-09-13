@echo off
REM ===================================================================
REM  Marketeers / Smart Value - interview film
REM
REM  1. Put this file, edit.py and your logo.png in one folder.
REM  2. Copy the two .mov recordings into the same folder.
REM  3. Edit the names below if yours differ.
REM  4. Double-click this file.
REM ===================================================================

set VIDEO1=Screen Recording 2026-09-10 at 5.34.20 PM.mov
set VIDEO2=Screen Recording 2026-09-10 at 5.58.12 PM.mov
set LOGO=logo.png
set TITLE=Susan Interview
set SUBTITLE=Marketeers Research  ^|  Smart Value

python edit.py "%VIDEO1%" "%VIDEO2%" --logo "%LOGO%" --title "%TITLE%" --subtitle "%SUBTITLE%" --model small --out final_film.mp4

echo.
echo Done. Look for final_film.mp4 in this folder.
pause
