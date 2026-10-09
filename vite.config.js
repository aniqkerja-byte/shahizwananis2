import { defineConfig, loadEnv } from 'vite';
import { createRsvpHandler, appendRsvp } from './server/rsvp.js';
import { brideSite } from './src/config/bride.js';
import { groomSite } from './src/config/groom.js';

const sites = { bride: brideSite, groom: groomSite };

export default defineConfig(({ mode }) => {
  const domain = sites[mode]?.domain;
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

  return {
    plugins: [{
      name: 'local-rsvp-api',
      configureServer(server) {
        server.middlewares.use('/api/rsvp', createRsvpHandler(values => appendRsvp(values, env)));
      },
    }, ...(domain ? [{
      name: 'site-domain-metadata',
      transformIndexHtml(html) {
        return html.replaceAll('https://shahizwananis.vercel.app', `https://${domain}`);
      },
    }] : [])],
  };
});
