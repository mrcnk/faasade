# FaaSade

Stupid simple FaaS (Function as a Service) runner using GitHub Gists.

## Features

- Run JavaScript code from a Gist.
- Run TypeScript transformed code from a Gist.
- Code is executed in a Node.js Worker Thread Pool (tinypool).
- Pretty errors.

## Todo

- [ ] Consider adding support for other languages and runtimes.
- [ ] Consider allowing importing http modules (--experimental-network-imports) or Deno.
- [ ] Consider adding a simple, Monaco editor-based web interface.
- [ ] Consider adding GitHub repo support.
- [ ] Consider sandboxing the code execution.
- [ ] Add /gist/:gistId route to list all the runnable files in the Gist.
- [ ] Add more tests.

## API Docs

Adding Swagger to this project sounds like an overkill, so here's a simple API documentation.

### ALL /gist/:gistId/:filename

Run the code in the specified file in the Gist.

#### Parameters

- `gistId` - [required] The ID of the Gist. You can find it in the URL of the Gist.
- `filename` - [required] The name of the specific file in the Gist to run.

#### Response

Whatever the code in the file returns. If it's a valid JSON, it's gonna be parsed and returned as JSON. If not it's gonna be served as HTML.
