echo Compiling TypeScript...
tsc

echo Copying node_modules...
cp -r node_modules dist/node_modules

echo Copying assets.
cp -r src/assets dist/assets

echo Copying package.json
cp package.json dist/package.json

echo Copying index.html
cp src/index.html dist/index.html

echo Copying package-lock.json
cp package-lock.json dist/package-lock.json

echo Pruning NPM modules...
cd "dist"
npm prune --production

echo Archiving to .asar file in build/app.asar
cd ..
asar p dist build/app.asar
