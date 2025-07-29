@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Git Auto Push - Simple Version
echo ========================================

REM Check if we're in a git repository
git status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Not a git repository!
    pause
    exit /b 1
)

REM 1. Add all changes
echo.
echo Step 1: Adding all changes...
git add .

REM 2. Check if there's anything to commit
git diff --cached --quiet
if %ERRORLEVEL% NEQ 0 (
    echo Step 2: Committing changes...
    
    REM Simple commit message with timestamp
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set mytime=%%a:%%b
    set commit_msg=Auto commit - %mydate% %mytime%
    
    git commit -m "!commit_msg!"
    if %ERRORLEVEL% NEQ 0 (
        echo Commit failed!
        pause
        exit /b 1
    )
    echo Committed successfully!
) else (
    echo No new changes to commit.
)

REM 3. Check current branch and set upstream if needed
echo.
echo Step 3: Checking branch setup...
for /f %%i in ('git branch --show-current') do set current_branch=%%i
echo Current branch: !current_branch!

REM 4. Push to remote
echo.
echo Step 4: Pushing to remote...

REM Try normal push first
git push >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ Push successful!
    goto :success
)

REM If normal push failed, try with upstream
echo Normal push failed, trying to set upstream...
git push -u origin !current_branch!
if %ERRORLEVEL% EQU 0 (
    echo ✓ Push successful with upstream set!
    goto :success
)

REM If still failed, show error
echo.
echo ❌ Push failed! 
echo.
echo Possible solutions:
echo 1. Check your internet connection
echo 2. Make sure you're logged into Git (git config --global user.name)
echo 3. Check if remote repository exists: git remote -v
echo 4. Try: git push origin !current_branch! manually
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo ✓ All done! Changes pushed successfully.
echo ========================================
pause 