import { 
  Application,
  Gemtext, Line, LineText, LineLink, LineHeading, // LineQuote, LineListItem, LinePreformattingToggle,
  handleRedirects, handleRoutes, Route, // Redirect,
} from './deps.mts';

import type {
  JsDoc, Param, Tag, // SeeTag, ExampleTag, ReturnTag, ParamTag, UnsupportedTag,
  Constructor, MethodDef, // FunctionDef, ClassDef,
  Definition, // ClassDefinition,
} from "./lib/jsdoc-types.mts";

['JSDOC_DIR', 'TLS_CERT', 'TLS_CERT_KEY']
.forEach(envvar => console.info(`${envvar}: ${Deno.env.get(envvar)}`));

const
jsdocDir = Deno.env.get('JSDOC_DIR'),    // './jsdoc'
certFile = Deno.env.get('TLS_CERT'),     // './cert.pem'
keyFile  = Deno.env.get('TLS_CERT_KEY'), // './key.pem'
hostname = '0.0.0.0',                    // reachable from all network interfaces
app      = new Application({ keyFile, certFile, hostname }),

_        = new LineText(''),

dirPage = async (path: string):Promise<Line[]> => {
  // console.debug(`dir path: ${path}`);
  try {
    const 
    expandedPath     = `${jsdocDir}/${path}`,
    dirLines: Line[] = [],
    docLines: Line[] = await docPage(`${path}/jsdoc.json`);
  
    // list the subdirectories
    for await (const dirEntry of Deno.readDir(expandedPath)) {
      // // console.debug(`dir: ${dirEntry.name}`);
      if (!dirEntry.isDirectory) continue;
      dirLines.push(new LineLink(`/${path}/${dirEntry.name}`.replace('//','/'), dirEntry.name));
    }

    if (dirLines.length > 0) {
      dirLines.unshift(_);
      dirLines.push(_);
    }

    if (docLines.length > 0) {
      // dirLines.push(new LineHeading(`JSdoc`,2));
      for (const docLine of docLines) {
        dirLines.push(docLine);
      }
    }

    return dirLines;
  } catch (error) {
    // dirLines.push(new LineHeading('Error'));
    return [new LineText(`${error}`)];
  }
},

getJsdocLines = (jsdoc: JsDoc):Line[] =>{
  const lines: Line[] = [];
  if(jsdoc.doc) [
    new LineText(jsdoc.doc.trim()), _,
  ];
  for (const tag of (jsdoc.tags as Tag[])) {
    switch (tag.kind) {
      case 'unsupported':
        lines.push(new LineText(`🏷  ${tag.value}`));
        lines.push(_);
        break;

      case 'param':
        lines.push(new LineText(`🏷  @${tag.kind}`));
        lines.push(new LineText(`  {${tag.type}}`));
        lines.push(new LineText(`  🆔 ${tag.name}`));
        lines.push(new LineText(`  💬 ${tag.doc}`));
        lines.push(_);
        break;

      case 'return':
        lines.push(new LineText(`🏷  @${tag.kind} {${tag.type}}`));
        lines.push(_);
        break;

      case 'see':
        try {
          const 
          re    = /\s*\{@link\s+(?<url>[^\s|]+)(?<text>(|.*)?)\}\s*/,
          match = tag.doc.match(re);

          if (match) {
            const 
            url = new URL((match.groups as {url:string}).url),
            text = match.groups?.text.substring(1);

            lines.push(new LineText(`🏷  @${tag.kind}`));
            if (text) {
              lines.push(new LineLink(`${url}`, `${text}`));
            } else {
              lines.push(new LineLink(`${url}`, `${url}`));
            }
          }
          lines.push(_);
        } catch (error) {
          console.error(`🏷  @see tag error: ${error}`);
        }
        break;

      default:
        lines.push(new LineText(`🏷  @${tag.kind} ${tag.doc}`));
        lines.push(_);
        break;
    }
  }
  lines.push(_);
  return lines;
},

docPage = async (path: string):Promise<Line[]> => {
  // console.debug(`doc path: ${path}`);
  try {
    const 
    expandedPath  = `${jsdocDir}/${path}`,
    json          = await Deno.readTextFile(expandedPath),
    sorter        = (a:Definition | MethodDef,b:Definition | MethodDef)=>{return a.name < b.name ? -1 : (a.name === b.name ? 0 : 1);},
    jsdoc         = (JSON.parse(json) as Array<Definition>).sort(sorter),
    lines: Line[] = [_];

    for (const def of jsdoc) {
      // console.debug(`\nDefinition(name: ${def.name}, kind: ${def.kind})`);
      if (def.kind === 'class') {
        // header
        let classHeader = `${def.kind} ${def.name}`;
        if (def.classDef.extends) {
          classHeader += ` extends ${def.classDef.extends}`;
        }
        if ((def.classDef.implements as string[]).length>0) {
          classHeader += ` implements ${(def.classDef.implements as string[]).join(', ')}`;
        }
        lines.push(new LineHeading(classHeader, 2));
        lines.push(_);

        // constructor
        for (const constr of (def.classDef.constructors as Constructor[])) {
          // console.debug(`constructor`);
          if (constr.jsDoc) {
            // header
            const 
            paramNames: string = (constr.params as Param[]).map(p => p.name).join(', '),
            constrHeader: string = `constructor(${paramNames})`;

            lines.push(new LineHeading(constrHeader, 3)); lines.push(_);

            if (constr.jsDoc) {
              const jsdocLines = getJsdocLines(constr.jsDoc);

              for (const line of jsdocLines) lines.push(line);
              lines.push(_);
            }
          }
        }
        // lines.push(_);

        // methods
        for (const method of (def.classDef.methods as MethodDef[]).sort(sorter)) {
          // console.debug(`method: ${method.name}`);
          // header
          const 
          staticMarker = method.isStatic ? 'static ' : '',
          asyncMarker = method.functionDef.isAsync ? 'async ' : '',
          paramNames: string = (method.functionDef.params as Param[]).map(p => p.name).join(', '),
          methodHeader: string = method.kind === 'getter' ? `getter ${method.name}` : `${staticMarker}${asyncMarker}${method.name}(${paramNames})`;

          // console.debug(`method header: ${methodHeader}`);
          lines.push(new LineHeading(methodHeader, 3)); lines.push(_);

          if (method.jsDoc) {
            // console.debug(`  reading jsdoc`);
            const jsdocLines = getJsdocLines(method.jsDoc);

            for (const line of jsdocLines) lines.push(line);
            lines.push(_);
          }
        }
        lines.push(_);
      }
    }

    lines.push(_);
    return lines;
  } catch (error) {
    console.error(`🔴 doc error: ${error}`);
    return <Line[]>[];
    // lines.push(new LineHeading('Error'));
    // lines.push(new LineText(`${error}`));
  }
},

mainRoute = new Route('/', async (ctx) => {
  // // console.debug('main route');
  try {
    const lines = await dirPage('');

    ctx.response.body =
    new Gemtext(
      new LineHeading('Qworum JSdoc Server', 1), _,
      ...lines,
    );
  } catch (error) {
    ctx.response.body =
    new Gemtext(
      new LineHeading('Error'), _,
      new LineText(`${error}`)
    );
  }
}),

// Kaksik BUG/feature: at most one "parameterized route" is allowed !
// Kaksik BUG/feature: `:path` does not match strings that contain "/" !
dirRoute = new Route<{path?: string}>('/:path', async (ctx) => {
  // // console.debug('dir route');
  try {
    const
    path : string = (ctx.pathParams as {path: string}).path,
    lines = await dirPage(path);

    ctx.response.body =
    new Gemtext(
      new LineHeading(`${path}`, 1), _,
      ...lines,
    );
  } catch (error) {
    ctx.response.body =
    new Gemtext(
      new LineHeading('Error', 1), _,
      new LineText(`${error}`)
    );
  }
});

app.use(async (ctx, next) => {
  console.info(`\n▶︎ ${new Date()}\n`, ctx.request)
  console.time('◀︎ Latency')
  await next()
  console.timeEnd('◀︎ Latency')
})

app.use(handleRedirects(
  // new Redirect('/', '/dir/'),
));

app.use(handleRoutes(
  mainRoute,
  dirRoute,
));

app.use(async (ctx) => {
  ctx.response.body = new Gemtext(
    new LineHeading('No routes matched'), 
    // _,
    // new LineText('Running fallback middleware')
  );
});

while(true)
try {
  await app.start();
} catch (error) {
  console.error(`Restarting the server after this error: ${error}`);
}
