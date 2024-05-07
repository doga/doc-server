// Deno.serve(() => new Response("Hello, world!"));
import { Application } from './deps.mts';


const
isProd = !['dev', 'development', 'test'].includes(Deno.env.get('MODE') || ''),
app    = new Application(
  isProd ? {
    // hostname: domain,
    // port     : 1965,
    // transport: 'tcp',
  } :
  {
    keyFile : `./cert/localhost/key.pem`,
    certFile: `./cert/localhost/cert.pem`,
    // hostname: 'localhost',
    // port    : 1965,
  }
);

app.use(ctx => {
  ctx.response.body = '# Hello World!'
})

await app.start()

