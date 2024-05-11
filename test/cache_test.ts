// url_test.ts
import { assert, assertEquals } from "jsr:@std/assert";
import { Cache } from "../lib/cache.mts";
import { Gemtext, LineHeading } from "../deps.mts";

Deno.test("no cached content for empty cache", () => {
  const cache = new Cache(1);
  assertEquals(cache.get('/path'), null);
});

Deno.test("cached content is returned", () => {
  const 
  cache = new Cache(1),
  gemtext = new Gemtext(new LineHeading('Header'));

  // console.debug('setting...');
  cache.set('/path', gemtext);
  // console.debug('getting...');
  assert(cache.get('/path'));
});

Deno.test("uncached content is not returned", () => {
  const 
  cache = new Cache(1);

  // console.debug('getting...');
  assertEquals(cache.get('/path'), null);
});