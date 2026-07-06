const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// drizzle 마이그레이션 .sql 파일을 모듈로 불러올 수 있게 함
config.resolver.sourceExts.push('sql');

// expo-sqlite 웹(wa-sqlite) wasm 에셋 지원.
// 웹에서 실행하려면 호스팅/프록시에서 COOP(same-origin) + COEP 헤더도 켜야 한다.
config.resolver.assetExts.push('wasm');

module.exports = config;
