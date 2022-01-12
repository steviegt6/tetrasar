@echo off

echo Compiling TypeScript...
call tsc

echo Copying node_modules...
copy "\node_modules" "dist\node_modules\"

echo Copying assets.
copy "src\assets" "dist\assets"

echo Copying package.json
copy "package.json" "dist\package.json"

echo Copying index.html
copy "src\index.html" "dist\index.html"

echo Copying package-lock.json
copy "package-lock.json" "dist\package-lock.json"

echo Pruning NPM modules...
cd dist
call npm prune --production

echo Archiving to .asar file in build/app.asar
cd ..
call asar p dist build\app.asar