# doc-server

A [Gemini](https://geminiprotocol.net/) server for serving JSdoc on the [Deno](https://deno.com/) JavaScript runtime.

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

Note that the `jsdoc` directory has a strict structure. It can contain:

* a `jsdoc.json` file at the root, and
* any number of module directories, each containing a `jsdoc.json` file.

Additional requirements:

* The `jsdoc` directory can be zero or one directory deep.
* The name `jsdoc.json` is mandatory for the output of `deno doc`.

### 3. Run the JSDoc server

```shell
JSDOC_DIR='./path/to/jsdoc' \
TLS_CERT='./path/to/cert.pem' \
TLS_CERT_KEY='./path/to/key.pem' \
deno task server
```

∎
