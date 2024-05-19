
import { Server } from "./lib/server.mts";
import type { ServerConfig } from "./lib/server.mts";

const
jsdocDir:  string | undefined = Deno.env.get('JSDOC_DIR')    || undefined,
certFile:  string | undefined = Deno.env.get('TLS_CERT')     || undefined,
keyFile:   string | undefined = Deno.env.get('TLS_CERT_KEY') || undefined,
hostname:  string | undefined = Deno.env.get('HOSTNAME')     || undefined,
cacheSize: number | undefined = Deno.env.get('CACHE_SIZE') ? parseInt(Deno.env.get('CACHE_SIZE') || '-1') : undefined,
port:      number | undefined = Deno.env.get('PORT')       ? parseInt(Deno.env.get('PORT') || '-1') : undefined,
config: ServerConfig = {};

if (jsdocDir) config.jsdocDir = jsdocDir;
if (certFile) config.certFile = certFile;
if (keyFile) config.keyFile = keyFile;
if (hostname) config.hostname = hostname;
if (cacheSize) config.cacheSize = cacheSize;
if (port) config.port = port;

// console.debug('main config', config);
// console.debug('using https://deno.land/x/qgeminiserver@1.3.2');

const server = new Server(config);

await server.run();

