import { brideSite } from './bride.js';
import { groomSite } from './groom.js';

const sites = { bride: brideSite, groom: groomSite };

// Unqualified development defaults to the bride site; query params can preview either side.
export const siteConfig = sites[import.meta.env.MODE] ?? null;
export { brideSite, groomSite };
