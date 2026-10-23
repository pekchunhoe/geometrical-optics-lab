import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:45000,fullyParallel:false,workers:1,
  reporter:[['list'],['json',{outputFile:(process.env.OPTICS_AUDIT_OUTPUT||'tmp')+'/browser-results.json'}]],
  webServer:[
    {command:'npm run preview -- --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:30000},
    {command:'npm run dev -- --port 4174 --strictPort',url:'http://127.0.0.1:4174',reuseExistingServer:false,timeout:30000},
    {command:'node scripts/audit-static-server.mjs',url:'http://127.0.0.1:4175/geometrical-optics-lab/',reuseExistingServer:false,timeout:30000}
  ],
  use:{baseURL:'http://127.0.0.1:4173',headless:true,launchOptions:{executablePath:process.env.OPTICS_BROWSER_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']},screenshot:'only-on-failure',trace:'retain-on-failure'},
  outputDir:(process.env.OPTICS_AUDIT_OUTPUT||'tmp')+'/browser-artifacts'
});
