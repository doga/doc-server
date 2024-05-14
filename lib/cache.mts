import { Gemtext, LineText } from "../deps.mts";
const _ = new LineText('');

type Value = {
  bytes: Uint8Array,
  timestamp: Date,
};

type CharacterMapping = {
  [key: string]: string;
};

function convertToMathematicalSansSerifItalic(input: string) {
  const characterMap: CharacterMapping = {
      'A': '𝑨', 'B': '𝑩', 'C': '𝑪', 'D': '𝑫', 'E': '𝑬', 'F': '𝑭', 'G': '𝑮', 'H': '𝑯',
      'I': '𝑰', 'J': '𝑱', 'K': '𝑲', 'L': '𝑳', 'M': '𝑴', 'N': '𝑵', 'O': '𝑶', 'P': '𝑷',
      'Q': '𝑸', 'R': '𝑹', 'S': '𝑺', 'T': '𝑻', 'U': '𝑼', 'V': '𝑽', 'W': '𝑾', 'X': '𝑿',
      'Y': '𝒀', 'Z': '𝒁',
      'a': '𝒂', 'b': '𝒃', 'c': '𝒄', 'd': '𝒅', 'e': '𝒆', 'f': '𝒇', 'g': '𝒈', 'h': '𝒉',
      'i': '𝒊', 'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏', 'o': '𝒐', 'p': '𝒑',
      'q': '𝒒', 'r': '𝒓', 's': '𝒔', 't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙',
      'y': '𝒚', 'z': '𝒛',
      '0': '𝟢', '1': '𝟣', '2': '𝟤', '3': '𝟥', '4': '𝟦', '5': '𝟧', '6': '𝟨', '7': '𝟩', '8': '𝟪', '9': '𝟫'
  };

  let result = '';
  for (let i = 0; i < input.length; i++) {
      const char: string | undefined = input[i];
      result += characterMap[char || ''] || char; // Use italicized character if available, otherwise keep the original character
  }

  return result;
}


class Cache {
  #maxSize: number;
  #size: number;
  #cache = new Map<string, Value>();
  #lru = new Array<string>(); // Most recently accessed path is first

  #encoder = new TextEncoder();

  /**
   * Creates an in-memory Gemtext cache.
   * @param {number | undefined} size Cache size. Unit is 10_000 bytes. Default is 100.
   */
  constructor(size?: number) {
    size = Math.floor(size || 100);
    if(size<1)size = 1;
    size = size * 10_000;
    // console.debug(`Setting cache size to ${size} bytes`);
    this.#maxSize = size;
    this.#size = 0;
  }


  set(path: string, gemtext: Gemtext):boolean {
    try {
      const 
      timestamp = convertToMathematicalSansSerifItalic(`Cached on ${new Date()}`),
      lines = [
        _,
        // new LineText('————————————————————'),
        // new LineText('In-memory cache:'),
        new LineText(`📅 ${timestamp}`),
      ];
      gemtext.append(...lines);
      const bytes: Uint8Array = this.#encoder.encode(gemtext.string);

      this._purge(path, bytes.length);
      this.#cache.set(path, {bytes, timestamp: new Date()});
      this.#lru.unshift(path);

      return true;
    } catch (_error) {
      return false;
    }
  }


  get(path: string): Value | null {
    try {
      this._touch(path);
      return this.#cache.get(path) || null;
    } catch (_error) {
      return null;
    }
  }

  _touch(path: string){
    if(!this.#cache.has(path))throw new TypeError('unknown path');
    this.#lru = this.#lru.filter(p => p !== path);
    this.#lru.unshift(path);
  }


  _purge(path: string, bytesToFree: number) {
    let freed = 0;

    // remove stored bytes for this path
    if (this.#cache.has(path)) {
      const v = this.#cache.get(path);

      if (v) {
        this.#cache.delete(path);
        this.#lru = this.#lru.filter(p => p !== path);
        this.#size -= v.bytes.length;
        freed += v.bytes.length;
      }
    }

    if(bytesToFree > this.#maxSize)throw new TypeError('uncacheable');
    if(bytesToFree <= this.#maxSize - this.#size)return;

    // remove stored bytes for other paths
    while (freed < bytesToFree && this.#cache.size > 0) {
      const
      p = this.#lru[0],
      v = this.#cache.get(p);

      if (v) {
        this.#lru.pop();
        this.#cache.delete(p);
        this.#size -= v.bytes.length;
        freed += v.bytes.length;
      }
    }
  }

}

export type {Value};
export {Cache};
