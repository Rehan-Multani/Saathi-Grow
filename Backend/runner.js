import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('node', ['src/uploadFromFolder.js'], { stdio: 'pipe' });

let output = '';

child.stdout.on('data', (data) => {
    output += data.toString();
    console.log(data.toString());
});

child.stderr.on('data', (data) => {
    output += data.toString();
    console.error(data.toString());
});

child.on('close', (code) => {
    output += `\nExited with code: ${code}`;
    fs.writeFileSync('crash.log', output);
    console.log(`Process exited with code ${code}`);
});
