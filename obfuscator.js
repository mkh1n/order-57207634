const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Путь к собранному JS файлу
const distJsPath = path.join(__dirname, 'dist', 'js');
const files = fs.readdirSync(distJsPath);

files.forEach(file => {
  if (file.endsWith('.bundle.js') && !file.endsWith('.obfuscated.js')) {
    const inputPath = path.join(distJsPath, file);
    const outputPath = path.join(distJsPath, file.replace('.bundle.js', '.obfuscated.bundle.js'));
    
    try {
      const code = fs.readFileSync(inputPath, 'utf8');
      
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false, // отключаем чтобы не было ошибок
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false
      });

      fs.writeFileSync(outputPath, obfuscatedCode.getObfuscatedCode());
      console.log(`✅ Код обфусцирован: ${file} -> ${file.replace('.bundle.js', '.obfuscated.bundle.js')}`);
      
      // Заменяем оригинальный файл на обфусцированный
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
      
    } catch (error) {
      console.log(`⚠️  Ошибка при обфускации ${file}:`, error.message);
    }
  }
});