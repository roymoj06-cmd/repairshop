@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Starting automated git push process...
echo ========================================

REM 1. Add all changes
echo.
echo Step 1: Adding all changes...
git add .

REM 2. Check if there are staged changes to commit
git diff --cached --quiet
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Step 2: Committing changes...
    
    REM Generate commit message based on changes
    echo Analyzing changes to generate commit message...
    
    REM Get list of modified files
    for /f "tokens=*" %%i in ('git diff --cached --name-only') do (
        set "modified_files=!modified_files! %%i"
    )
    
    REM Generate commit message based on file patterns
    set "commit_msg="
    echo %modified_files% | findstr /i "\.tsx" >nul && set "commit_msg=!commit_msg! Update React components"
    echo %modified_files% | findstr /i "\.ts" >nul && set "commit_msg=!commit_msg! Update TypeScript files"
    echo %modified_files% | findstr /i "\.scss" >nul && set "commit_msg=!commit_msg! Update styles"
    echo %modified_files% | findstr /i "\.json" >nul && set "commit_msg=!commit_msg! Update configuration"
    echo %modified_files% | findstr /i "\.md" >nul && set "commit_msg=!commit_msg! Update documentation"
    
    REM If no specific pattern found, use generic message
    if "!commit_msg!"=="" set "commit_msg=Update project files"
    
    REM Add timestamp
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "date=%%a-%%b-%%c"
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "time=%%a:%%b"
    set "commit_msg=!commit_msg! - !date! !time!"
    
    echo Generated commit message: !commit_msg!
    echo.
    set /p confirm="Use this message? (Y/n): "
    if /i "!confirm!"=="n" (
        set /p commit_msg="Enter custom commit message: "
    )
    
    git commit -m "!commit_msg!"
    echo Changes committed successfully.
) ELSE (
    echo No changes to commit.
)

REM 3. Pull latest changes from remote
echo.
echo Step 3: Pulling latest changes from remote...
git pull --no-edit

REM 4. Check for merge conflicts
git ls-files -u > nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo !!! MERGE CONFLICT DETECTED !!!
    echo Please resolve conflicts manually, then run this script again.
    echo ========================================
    pause
    exit /b 1
)

REM 5. Push changes if no conflict
echo.
echo Step 4: Pushing changes to remote...
git push

echo.
echo ========================================
echo All done! Changes pushed successfully.
echo ========================================
pause 