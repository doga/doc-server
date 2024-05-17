# doc-server

A Gemini server for serving JSDoc documentation on the [Deno](https://deno.com/) JavaScript runtime.

## What is Gemini?

[Gemini](https://geminiprotocol.net/) is a new Web-like content platform with its own protocol and its own Markdown-like content format. It is especially suitable for browsing content from the terminal. Recommended Gemini client: [amfora](https://github.com/makew0rld/amfora?tab=readme-ov-file#amfora).

## How to install

```shell
git clone https://github.com/doga/doc-server.git
```

_Note: This library is also published on `deno.land/x` under the name `jsdocserver` but for some reason importing from `https://deno.land/x/jsdocserver@VERSION/mod.mts` does not work, so `git clone` is currently the only install method._

## Usage

### 1. Create a TLS certificate and private key

```shell
TLS_CERT=./path/to/cert.pem \
TLS_CERT_KEY=./path/to/key.pem && \
openssl req -x509 -newkey rsa:2048 -keyout $TLS_CERT_KEY -out $TLS_CERT -days 365 -nodes
```

Certificate validity is set to one year by default, and must normally be regenerated periodically.

### 2. Create JSDoc JSON files from the source code

Do this each time the JSDoc in the source code changes:

```shell
deno doc --json --name=MODULENAME ./path/to/mod.mjs > ./path/to/jsdoc/MODULENAME/jsdoc.json
```

The server does not need a restart to serve new content.

Note that the `jsdoc` directory has a strict structure. It can contain:

- a `jsdoc.json` file at the root, and
- any number of module directories, each containing a `jsdoc.json` file.

Additional requirements:

- The `jsdoc` directory can be zero or one directory deep.
- The name `jsdoc.json` is mandatory for the output of `deno doc`.

### 3. Run the JSDoc server

```shell
JSDOC_DIR='./jsdoc' \
TLS_CERT='./cert/cert.pem' \
TLS_CERT_KEY='./cert/key.pem' \
CACHE_SIZE='100' \
HOSTNAME='0.0.0.0' \
PORT='1965'
deno task server
```

All environment variables are optional. The command above shows their default values.

`CACHE_SIZE` defines the size of the in-memory cache. 1 means 10 000 bytes. 0 disables the cache.

## To do

Current status:

- Only classes, constructors and methods are listed.
- Setter methods are not listed.

## Live servers

These Gemini capsules are running on doc-server:

- __Qworum JSDoc server__: `gemini://qworum-jdoc.ddns.net/`

To add your doc-server capsule here, simply send a pull request.

∎
