import '@testing-library/jest-dom';

// グローバルなモック設定
global.console = {
  ...console,
  // エラーと警告のログは残す
  error: jest.fn(),
  warn: jest.fn(),
  // 情報ログは抑制
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// テスト環境のタイムアウト設定
jest.setTimeout(10000);
