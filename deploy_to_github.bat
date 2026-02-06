@echo off
echo ========================================================
echo FORCE UPDATE - Unlimited Tetris v1.1
echo Repo: https://github.com/seebadas25-lab/unlimited-tetris
echo ========================================================

echo.
echo 1. Committing changes (v1.1)...
git add .
git commit -m "Update to v1.1 - Force redeploy and verification"

echo.
echo 2. Pushing code...
echo    (A browser window or login prompt may appear. Please sign in!)
git push -u origin main

echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed. 
) else (
    echo [SUCCESS] Update pushed!
    echo Please wait 1-2 minutes and then press CTRL+SHIFT+R on the website.
)
pause
