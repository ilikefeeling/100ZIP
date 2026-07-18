import { exec } from 'child_process';
import fs from 'fs';

exec('npm run build', (error, stdout, stderr) => {
  fs.writeFileSync('build-output.txt', stdout + '\n' + stderr);
  if (error) {
    fs.writeFileSync('build-error.txt', error.toString());
  }
});
