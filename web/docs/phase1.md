# Phase 1 実装計画 (2-3週間)

## 1. データベーススキーマ拡張

### 作業内容
1. `schema.ts`の更新
```typescript
export interface Link {
  id: string;
  originalUrl: string;
  customPath?: string;
  createdAt: Date;
  updatedAt: Date;
  clicks: number;
  // 新規追加フィールド
  platform: 'ios' | 'android' | 'web';
  deepLinkConfig: {
    ios?: {
      universalLink?: string;
      customScheme?: string;
      appStoreId?: string;
      minimumVersion?: string;
    };
    android?: {
      appLink?: string;
      customScheme?: string;
      packageName?: string;
      minimumVersion?: string;
    };
  };
  redirectRules: {
    priority: number;
    condition: {
      platform?: string;
      device?: string;
      browser?: string;
      region?: string;
    };
    targetUrl: string;
  }[];
  analytics: {
    platforms: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    regions: Record<string, number>;
  };
  status: 'active' | 'inactive' | 'expired';
  planType: 'free' | 'starter' | 'business';
}
```

2. Firestoreインデックスの作成
```typescript
// links コレクションに対する複合インデックスの作成
- platform, createdAt
- status, planType
- customPath, platform
```

### 確認方法
1. スキーマ定義の型チェック
```bash
npm run type-check
```

2. テストデータの作成と取得確認
```typescript
// テストコード
describe('Link Schema', () => {
  it('should create and retrieve link with extended schema', async () => {
    const newLink = {
      originalUrl: 'https://example.com',
      platform: 'ios',
      deepLinkConfig: {
        ios: {
          universalLink: 'https://example.com/app',
          appStoreId: '123456789'
        }
      }
      // ... その他のフィールド
    };
    
    const created = await createLink(newLink);
    const retrieved = await getLink(created.id);
    
    expect(retrieved).toMatchObject(newLink);
  });
});
```

## 2. 基本的なディープリンク生成

### 作業内容
1. ディープリンク生成ユーティリティの実装
```typescript
// src/lib/deeplink/generator.ts
export class DeepLinkGenerator {
  generateIOSLink(config: IOSConfig): string {
    // Universal Links / Custom Scheme の生成ロジック
  }
  
  generateAndroidLink(config: AndroidConfig): string {
    // App Links / Custom Scheme の生成ロジック
  }
  
  generateFallbackLink(platform: string, storeUrl: string): string {
    // ストアページへのフォールバックURL生成
  }
}
```

2. リンク生成APIエンドポイントの実装
```typescript
// src/app/api/links/route.ts
export async function POST(req: Request) {
  const { url, platform, config } = await req.json();
  const generator = new DeepLinkGenerator();
  
  // プラットフォーム別のディープリンク生成
  const deepLink = platform === 'ios' 
    ? generator.generateIOSLink(config)
    : generator.generateAndroidLink(config);
    
  // データベースへの保存
  const link = await createLink({
    originalUrl: url,
    platform,
    deepLinkConfig: config,
    // ... その他の必要なデータ
  });
  
  return NextResponse.json({ link });
}
```

### 確認方法
1. ユニットテスト実行
```bash
npm run test:deeplink
```

2. APIエンドポイントのテスト
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "platform": "ios",
    "config": {
      "universalLink": "https://example.com/app",
      "appStoreId": "123456789"
    }
  }'
```

3. 生成されたリンクの動作確認
- iOS Simulatorでのユニバーサルリンクテスト
- Android Emulatorでのアプリリンクテスト
- 各プラットフォームでのフォールバック動作確認

## 3. プラットフォーム判定

### 作業内容
1. User-Agent解析ユーティリティの実装
```typescript
// src/lib/platform/detector.ts
export class PlatformDetector {
  detectPlatform(userAgent: string): Platform {
    // iOS/Android/Webの判定ロジック
  }
  
  detectBrowser(userAgent: string): Browser {
    // ブラウザタイプの判定
  }
  
  detectDevice(userAgent: string): Device {
    // デバイスタイプの判定
  }
}
```

2. リダイレクトロジックの実装
```typescript
// src/app/[...shortcode]/page.tsx
export default async function ShortCodePage({
  params,
  headers
}: {
  params: { shortcode: string[] };
  headers: Headers;
}) {
  const detector = new PlatformDetector();
  const userAgent = headers.get('user-agent') || '';
  
  const platform = detector.detectPlatform(userAgent);
  const browser = detector.detectBrowser(userAgent);
  const device = detector.detectDevice(userAgent);
  
  // プラットフォームに応じたリダイレクト先の決定
  const link = await getLink(params.shortcode[0]);
  const redirectUrl = determineRedirectUrl(link, {
    platform,
    browser,
    device
  });
  
  // 分析データの記録
  await recordAnalytics(link.id, {
    platform,
    browser,
    device
  });
  
  return redirect(redirectUrl);
}
```

### 確認方法
1. ユニットテスト
```bash
npm run test:platform
```

2. 異なるデバイスでのアクセステスト
- iOS Safari
- Android Chrome
- デスクトップブラウザ
- 各種ブラウザでのUser-Agent偽装テスト

3. 分析データの確認
```typescript
const analytics = await getAnalytics(linkId);
expect(analytics.platforms).toHaveProperty('ios');
expect(analytics.browsers).toHaveProperty('safari');
```

## 全体の動作確認

1. 開発サーバーの起動
```bash
npm run dev
```

2. E2Eテストの実行
```bash
npm run test:e2e
```

3. パフォーマンステスト
```bash
npm run test:performance
```

## デプロイ手順

1. ステージング環境へのデプロイ
```bash
npm run deploy:staging
```

2. 動作確認項目
- [ ] スキーマ拡張の反映確認
- [ ] ディープリンク生成の動作確認
- [ ] プラットフォーム判定の精度確認
- [ ] 分析データの収集確認

3. 本番環境へのデプロイ
```bash
npm run deploy:production
