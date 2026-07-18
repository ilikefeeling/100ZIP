import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const sourceIcon = path.join(__dirname, 'icon.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 빌드 시 Vite가 정적 파일로 인식하도록 public 폴더로 원본 복사
fs.copyFileSync(sourceIcon, path.join(publicDir, 'icon.png'));

console.log('✅ public 폴더가 생성되었으며 icon.png가 복사되었습니다!');
console.log('참고: PWA(웹 앱) 아이콘은 브라우저에서 자동으로 적합하게 리사이징하여 사용합니다.');
