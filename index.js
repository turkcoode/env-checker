#!/usr/bin/env node
/**
 * Env Checker - .env dosyalarını doğrulama aracı
 * @author turkcoode
 */

const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;

    const key = line.substring(0, eqIdx).trim();
    let value = line.substring(eqIdx + 1).trim();

    // Tırnak temizle
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  });

  return vars;
}

function checkEnv(options = {}) {
  const envPath = options.envPath || '.env';
  const examplePath = options.examplePath || '.env.example';
  const strict = options.strict || false;

  const envVars = parseEnvFile(envPath);
  const exampleVars = parseEnvFile(examplePath);

  if (!envVars) {
    return { valid: false, error: envPath + ' dosyasi bulunamadi', missing: [], empty: [], extra: [] };
  }

  const result = {
    valid: true,
    missing: [],
    empty: [],
    extra: [],
    present: [],
    total: 0
  };

  if (exampleVars) {
    result.total = Object.keys(exampleVars).length;

    Object.keys(exampleVars).forEach(key => {
      if (!(key in envVars)) {
        result.missing.push(key);
      } else if (!envVars[key] && exampleVars[key] === 'required') {
        result.empty.push(key);
      } else {
        result.present.push(key);
      }
    });

    // Extra keys
    Object.keys(envVars).forEach(key => {
      if (!(key in exampleVars)) {
        result.extra.push(key);
      }
    });
  } else {
    result.total = Object.keys(envVars).length;
    Object.keys(envVars).forEach(key => {
      if (!envVars[key]) result.empty.push(key);
      else result.present.push(key);
    });
  }

  if (strict && (result.missing.length > 0 || result.empty.length > 0)) {
    result.valid = false;
  }

  return result;
}

function printReport(result) {
  console.log('\n.env Dogrulama Raporu');
  console.log('━'.repeat(30));

  if (result.error) {
    console.log('❌ ' + result.error);
    return;
  }

  result.present.forEach(key => console.log('✅ ' + key));
  result.empty.forEach(key => console.log('⚠️  ' + key + ': Bos deger'));
  result.missing.forEach(key => console.log('❌ ' + key + ': Eksik!'));

  if (result.extra.length > 0) {
    console.log('\nEkstra degiskenler:');
    result.extra.forEach(key => console.log('ℹ️  ' + key));
  }

  const valid = result.present.length;
  const total = result.total;
  console.log('\nSonuc: ' + result.missing.length + ' eksik, ' + result.empty.length + ' bos | ' + valid + '/' + total + ' gecerli');
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i+1]) options.envPath = args[++i];
    else if (args[i] === '--example' && args[i+1]) options.examplePath = args[++i];
    else if (args[i] === '--strict') options.strict = true;
    else if (args[i] === '--json') options.json = true;
  }

  const result = checkEnv(options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result);
  }

  if (!result.valid) process.exit(1);
}

module.exports = { checkEnv, parseEnvFile };
