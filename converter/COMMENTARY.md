# Commentary

## OpenAPI

There is an included OpenAPI spec here: [OpenAPI](docs/openapi.yml).

The Swagger UI will be mounted by default when running the converter project - vistiting http://localhost:3000 in your browser will redirect to it.

Swagger UI itself has some interesting limitations in the context of the approach I went with for specifying custom delimeters. I chose to use the `Content-Type` and `Accept` headers for specifying the input format and output format, which allows the response body to match the desired conversion. However, Swagger UI commandeers those two headers for the UI itself, so it has to operate against a hardcoded list of headers.

This means that, _only_ in the Swagger UI, you **cannot** specify _custom_ delimeters for the vendor media type `application/vnd.trademax.txt` dynamically since those are appended to the header as an additional `directives` property in my chosen design. You will see that I was able to present a demo of this by harcoding the default delimiters specified in the exercise instructions as their `Base 64 URL` format (_not_ regular `Base 64`):

`application/vnd.trademax.txt; directives=c2VnbWVudGRlbGltPX4sZWxlbWVudGRlbGltPSo`

`c2VnbWVudGRlbGltPX4sZWxlbWVudGRlbGltPSo` -> `"segmentdelim=~,elementdelim=*"`

**Note:** I chose to not specifically limit the delimeters to one character, but did not test this use case explicitly. The parsing directives must be encoded if they're being passed in a header, otherwise you would not be able to specify certain characters like newlines, which could be a common choice for segment delimiting.

Here is a cURL example for `application/json` -> `application/vnd.trademax.txt` that uses `segmentdelim=+,elementdelim=$`:

```
cd converter/src/models/v1/fixtures

curl -X POST -H "Content-Type: application/json" -H "Accept: application/vnd.trademax.txt; directives=c2VnbWVudGRlbGltPSssZWxlbWVudGRlbGltPSQ" -d @example.json http://localhost:3000/api/v1/documents

ProductID$4$8$15$16$23+
ProductID$a$b$c$d$e+
AddressID$42$108$3$14+
ContactID$59$26+
```

**Note:** Newlines are always appended for visual help for text output between segments, but carry no semantic meaning. Control characters are also untested as input for delimeters, so edge cases may be encountered.

## Approach

### Character Set

For simplicity this implementation _assumes_ UTF-8 content but makes no explicit attempts to reason about it. Splitting on funky unicode characters was neither ruled out or requested in the exercise instructions, but no testing was done around their support given the example document content.

### Multiple Document Types

To support a scalable way to add new types, I decided early on that - due to single responsibility and convienence - each document type should **not** have to understand how to convert to any others. I achieved this by defining a canonical [Document](src/models/v1/Document.ts) type with content matching a format that can be found here: [Canonical](src/models/v1/fixtures/example.canonical.json).

So each Document sub-type: [JsonDocument](src/models/v1/JsonDocument.ts), [TextDocument](src/models/v1/XmlDocument.ts), and [XmlDocument](src/models/v1/TextDocument.ts) only needs to understand how to parse from its own representation and serialize via the common representation. To convert documents, this allows you to simply pass any document into another and it can be constructed from the underlying canonical representation.

**Note:** The document sub-types _do_ inherit from `Document`, which does not heed the well-regarded "composition over inheritance" programming advice. This was done to save some method duplication, but in a real-world context I may prefer composing `Document` _into_ the sub-types instead of extending it. Inheritance almost always fails long term in my experience.

#### Adding a new Document type

Was made as easy as possible with strict, static typing. Extend `Document` with a new class [in the expected directory](src/models/v1) and register it in [the models index](src/models/v1/index.ts).

It would be expected to update tests, which adds some additional small overhead. There are test matrices in the [router](src/routers/v1/documents.test.ts) and [service](src/services/v1/DocumentsService.test.ts) tests that you can add the new document type to. These tests are designed to check every possible conversion from/to, so they will explode in size with every new type. This is very intentional, however, since the tests are not meant to understand _how_ the underyling implementation is done. That said, I would say I caught numerous serialization and parsing bugs by testing every combination.

### Validation

XML parsing libraries have ruined my day! I don't have time at the moment to check the official XML specification, but the libraries I tried all had a possible limitation where if a text node value was _only_ comprised of whitespace, it would reduce it to the empty string on parsing/serialization.

The above constraint anchored the design semantics for my consistent parsing and serialization between document types - the instructions said they were all equivalent formats, so they must all support common denominator capabilities.

The only emergent characteristics that I _intentionally_ did not preserve were:

1. **Pure whitespace values** - those are now trimmed to empty string content always for consistency.

2. **Whitespace-only / empty property names**. In the text document case it is possible to parse whitespace or empty property names, which can't very reasonably be supported by the other formats. This produces a behaviour where the larger supplied [text document](src/models/v1/fixtures/orderful.original.txt) will _never_ be 1:1 reproducible in its exact _visual_ form when being converted to, **but it should be semantically correct**.

The values are assumed to always be of type `string`.

Property key enumeration in the JSON and XML case do not need to be in order since neither JSON nor XML guarantees this, _but_ I did enforce that the input be contiguous. For example:

```
...
"ProductID1: "",
"ProductID3: "",
...
```

Without a `ProductID2` is not allowed. This seems like it would always be a parsing or serialization error and I deemed it to be invalid.

To account for this, lexical sorting is applied during parsing only as a means to find out if there are gaps, and an error is thrown.

For JSON and XML, existing libraries were used in combination with `zod` for schema parsing so the structures must always match the exact shape specified in the instructions.

## Performance

Performance will likely struggle and not scale well for the following reasons:

1. The constraints on the expected input/output formats gravitate toward quadratic time algorithms
2. As a higher level scripting language, Node.js performs a lot of copying. For example, JSON and schema parsing are pure copy operations, so there will be plenty of serialization and deserialization overhead.

Performance will be "fine" up to a certain file size then fall off a cliff most likely. Had performance been a goal, it's worth asking the question if scripting languages are appropriate. Compiled languages like Go and Rust will be able to offer superior (de)serialization performance through zero copy data structures and true parallelism for building the document tree. A native addon to speed things up would work, but given that most of the model code _is_ (de)serialization, one could argue the models themselves should be native code. And at that point - if and only if performance matters - maybe a scripting language isn't the best choice.
