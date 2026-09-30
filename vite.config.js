import { defineConfig } from 'vite';
import { brideSite } from './src/config/bride.js';
import { groomSite } from './src/config/groom.js';

const sites = { bride: brideSite, groom: groomSite };

export default defineConfig(({ mode }) => {
  const domain = sites[mode]?.domain;

  return {
    plugins: domain ? [{
      name: 'site-domain-metadata',
      transformIndexHtml(html) {
        return html.replaceAll('https://shahizwananis.vercel.app', `https://${domain}`);
      },
    }] : [],
  };
});
