import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const userDataDir = path.resolve(__dirname, config.userDataDir);

async function runPoster() {
  console.log('🚀 네이버 카페 포스팅 도구를 시작합니다...');
  console.log(`📂 세션 데이터 경로: ${userDataDir}`);

  // 사용자의 로그인 쿠키 및 세션을 유지하기 위해 PersistentContext 사용
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // 브라우저 창을 화면에 띄움
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = context.pages()[0] || (await context.newPage());

  for (const cafe of config.targetCafes) {
    const postData = config.posts[cafe.postType];
    if (!postData) {
      console.log(`⚠️  [${cafe.name}] 포스트 타입(${cafe.postType}) 정보를 찾을 수 없습니다.`);
      continue;
    }

    console.log(`\n----------------------------------------`);
    console.log(`📌 [${cafe.name}] 카페 포스팅 시작...`);
    console.log(`🌐 이동 URL: ${cafe.writeUrl}`);

    await page.goto(cafe.writeUrl, { waitUntil: 'domcontentloaded' });

    // 로그인 여부 체크
    if (page.url().includes('nid.naver.com') || (await page.$('.btn_login'))) {
      console.log(`🔒 수동 로그인이 필요합니다. 브라우저에서 네이버 로그인을 완료해 주세요!`);
      console.log(`⏳ 로그인 완료를 60초간 대기합니다...`);
      await page.waitForURL((url) => url.toString().includes('cafe.naver.com'), { timeout: 60000 }).catch(() => {});
    }

    // 스마트에디터 ONE 로딩 대기
    console.log('⏳ 스마트에디터 로딩을 기다립니다...');
    try {
      // 스마트 에디터 ONE 제목 영역 셀렉터
      const titleSelector = 'textarea.textarea_input, textarea.ArticleTitle, textarea';
      await page.waitForSelector(titleSelector, { timeout: 15000 });

      // 1. 제목 입력
      console.log(`✍️  제목 입력 중: "${postData.title}"`);
      await page.click(titleSelector);
      await page.fill(titleSelector, postData.title);
      await page.waitForTimeout(500);

      // 2. 본문 입력
      console.log(`📝 본문 작성 중...`);
      const bodySelector = '.se-content, div.se-component-content, .se-module-text';
      await page.click(bodySelector).catch(() => page.click('.se-main-container'));
      await page.waitForTimeout(500);

      const fullContent = postData.content.join('\n');
      // 한 글자씩 타이핑 대신 빠른 텍스트 입력
      await page.keyboard.insertText(fullContent);
      await page.waitForTimeout(1000);

      // 3. 태그 입력 (태그 입력칸이 있는 경우)
      if (postData.tags && postData.tags.length > 0) {
        console.log(`🏷️  태그 입력 중: ${postData.tags.join(', ')}`);
        const tagInputSelector = '#tag_input, .tag_input, input[placeholder*="태그"]';
        const hasTagInput = await page.$(tagInputSelector);
        if (hasTagInput) {
          for (const tag of postData.tags) {
            await page.click(tagInputSelector);
            await page.keyboard.insertText(tag);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(300);
          }
        }
      }

      console.log(`✅ [${cafe.name}] 글 작성이 완료되었습니다!`);
      console.log(`👉 브라우저 화면에서 내용을 최종 확인하신 후 [등록] 버튼을 누르거나 검토하세요.`);
      console.log(`⏸️  다음 작업을 위해 10초간 대기합니다...`);
      await page.waitForTimeout(10000);

    } catch (err) {
      console.error(`❌ [${cafe.name}] 글 작성 중 오류 발생:`, err.message);
    }
  }

  console.log('\n🎉 모든 타겟 카페 작성 준비가 완료되었습니다.');
  console.log('📌 브라우저를 닫으려면 엔터를 누르세요...');
}

runPoster().catch((err) => {
  console.error('실행 중 치명적 오류:', err);
});
