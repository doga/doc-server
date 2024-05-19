// BUG This library can't be imported from https://deno.land/x/jsdocserver. Possible fix: a refactoring of possible of Server, such as putting all the code inside the Server class.

import type {ServerConfig} from './lib/server.mts';
export type {ServerConfig};
export {Server} from './lib/server.mts';
