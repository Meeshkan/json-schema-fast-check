import jsfc, {
  generate,
  FastCheckSchema,
  makeArbitrary,
  generateT
} from "../src";
import * as t from "io-ts";
import fc from "fast-check";
import { JSONSchemaObject } from "json-schema-strictly-typed";
import jsonschema from "jsonschema";

const validate = (schema: FastCheckSchema) => {
  // test jsfc
  fc.assert(
    fc.property(jsfc(schema), i => jsonschema.validate(i, schema).valid)
  );
  // test generate
  expect(jsonschema.validate(generate(schema), schema).valid).toBe(true);
};

test("empty schema is correctly defined", () => {
  const schema: FastCheckSchema = {};
  expect(jsonschema.validate({ foo: [1, "bar"] }, schema).valid).toBe(true);
  validate(schema);
});

test("null schema is correctly defined", () => {
  const schema: FastCheckSchema = { type: "null" };
  expect(jsonschema.validate(null, schema).valid).toBe(true);
  validate(schema);
});

test("null schema is correctly defined", () => {
  const schema: FastCheckSchema = { type: "null" };
  expect(jsonschema.validate(null, schema).valid).toBe(true);
  validate(schema);
});

test("const schema is correctly defined", () => {
  const schema: FastCheckSchema = { const: { hello: "world" } };
  expect(jsonschema.validate({ hello: "world" }, schema).valid).toBe(true);
  validate(schema);
});

test("integer enum schema is correctly defined", () => {
  const schema: FastCheckSchema = { type: "integer", enum: [1, 2, 3] };
  expect(jsonschema.validate(1, schema).valid).toBe(true);
  expect(jsonschema.validate(4, schema).valid).toBe(false);
  validate(schema);
});

test("number enum schema is correctly defined", () => {
  const schema: FastCheckSchema = { type: "number", enum: [1.0, 2.1, 3.3] };
  expect(jsonschema.validate(2.1, schema).valid).toBe(true);
  expect(jsonschema.validate(4.75, schema).valid).toBe(false);
  validate(schema);
});

test("string enum schema is correctly defined", () => {
  const schema: FastCheckSchema = { type: "string", enum: ["a", "b"] };
  expect(jsonschema.validate("a", schema).valid).toBe(true);
  expect(jsonschema.validate("q", schema).valid).toBe(false);
  validate(schema);
});

test("integer is correctly defined", () => {
  const schema: FastCheckSchema = { type: "integer" };
  expect(jsonschema.validate(42, schema).valid).toBe(true);
  validate(schema);
});

test("integer is correctly defined with minimum", () => {
  const schema: FastCheckSchema = { type: "integer", minimum: -42 };
  expect(jsonschema.validate(0, schema).valid).toBe(true);
  validate(schema);
});

test("integer is correctly defined with maximum", () => {
  const schema: FastCheckSchema = { type: "integer", maximum: 43 };
  expect(jsonschema.validate(0, schema).valid).toBe(true);
  validate(schema);
});

test("integer is correctly defined with min/max", () => {
  const schema: FastCheckSchema = { type: "integer", minimum: -1, maximum: 43 };
  expect(jsonschema.validate(0, schema).valid).toBe(true);
  validate(schema);
});

test("integer is correctly defined with exclusive min/max", () => {
  const schema: FastCheckSchema = {
    type: "integer",
    minimum: 0,
    maximum: 3,
    exclusiveMinimum: true,
    exclusiveMaximum: true
  };
  expect(jsonschema.validate(1, schema).valid).toBe(true);
  validate(schema);
});

test("number is correctly defined", () => {
  const schema: FastCheckSchema = { type: "number" };
  expect(jsonschema.validate(0.0, schema).valid).toBe(true);
  validate(schema);
});

test("number is correctly defined with minimum", () => {
  const schema: FastCheckSchema = { type: "number", minimum: -42 };
  expect(jsonschema.validate(0.0, schema).valid).toBe(true);
  validate(schema);
});

test("number is correctly defined with maximum", () => {
  const schema: FastCheckSchema = { type: "number", maximum: 43 };
  expect(jsonschema.validate(0.0, schema).valid).toBe(true);
  validate(schema);
});

test("number is correctly defined with min/max", () => {
  const schema: FastCheckSchema = { type: "number", minimum: -1, maximum: 43 };
  expect(jsonschema.validate(0.0, schema).valid).toBe(true);
  validate(schema);
});

test("boolean is correctly defined", () => {
  const schema: FastCheckSchema = { type: "boolean" };
  expect(jsonschema.validate(true, schema).valid).toBe(true);
  validate(schema);
});

test("string is correctly defined", () => {
  const schema: FastCheckSchema = { type: "string" };
  expect(jsonschema.validate("foo", schema).valid).toBe(true);
  validate(schema);
});

test("string with pattern is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "string",
    pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
  };
  expect(jsonschema.validate("555-1212", schema).valid).toBe(true);
  expect(jsonschema.validate("foo", schema).valid).toBe(false);
  validate(schema);
});

test("faker string is correctly defined", () => {
  const schema: FastCheckSchema = { type: "string", faker: "address.zipCode" };
  expect(jsonschema.validate("foo", schema).valid).toBe(true);
  validate(schema);
});

test("array is correctly defined", () => {
  const schema: FastCheckSchema = { type: "array", items: { type: "string" } };
  expect(jsonschema.validate(["foo", "bar"], schema).valid).toBe(true);
  expect(jsonschema.validate(["foo", "foo"], schema).valid).toBe(true);
  validate(schema);
});

test("array with min and max items correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "array",
    items: { type: "string" },
    minItems: 3,
    maxItems: 4
  };
  expect(jsonschema.validate(["foo", "bar", "baz"], schema).valid).toBe(true);
  expect(jsonschema.validate(["foo", "bar"], schema).valid).toBe(false);
  validate(schema);
});

test("array with unique items is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "array",
    items: { type: "string" },
    uniqueItems: true
  };
  expect(jsonschema.validate(["foo", "bar"], schema).valid).toBe(true);
  expect(jsonschema.validate(["foo", "foo"], schema).valid).toBe(false);
  validate(schema);
});

test("tuple is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "array",
    items: [{ type: "string" }, { type: "number" }, { type: "boolean" }]
  };
  expect(jsonschema.validate(["foo", 1, true], schema).valid).toBe(true);
  expect(jsonschema.validate(["bar", 3, false], schema).valid).toBe(true);
  expect(jsonschema.validate([3, 3, false], schema).valid).toBe(false);
  validate(schema);
});

test("object is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      foo: { type: "string" },
      bar: { type: "number" }
    }
  };
  expect(
    jsonschema.validate({ foo: "a", bar: 0.0, fewfwef: { a: 1 } }, schema).valid
  ).toBe(true);
  validate(schema);
});

test("object can contain fast-check", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      foo: fc.string(),
      bar: { type: "number" }
    }
  };
  const schema2 = {
    type: "object",
    properties: {
      foo: { type: "string" },
      bar: { type: "number" }
    }
  };
  fc.assert(
    fc.property(jsfc(schema), i => jsonschema.validate(i, schema2).valid)
  );
  expect(jsonschema.validate(generate(schema), schema2).valid).toBe(true);
});

const Color = t.union([
  t.literal("green"),
  t.literal("red"),
  t.literal("blue")
]);
type Color = t.TypeOf<typeof Color>;

test("generic version works", () => {
  const schema: JSONSchemaObject<Color, {}> = {
    type: "object",
    properties: {
      foo: "blue",
      bar: { type: "number" }
    }
  };
  const schema2 = {
    type: "object",
    properties: {
      foo: { type: "string", enum: ["red", "green", "blue"] },
      bar: { type: "number" }
    }
  };
  const check = {
    c: Color,
    f: (i: Color) => fc.constant(i),
    u: t.type({})
  };
  fc.assert(
    fc.property(
      makeArbitrary(schema, check),
      i => jsonschema.validate(i, schema2).valid
    )
  );
  expect(jsonschema.validate(generateT(schema, check), schema2).valid).toBe(
    true
  );
});

test("object with no additional properties is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      foo: { type: "string" },
      bar: { type: "number" }
    },
    additionalProperties: false
  };
  expect(jsonschema.validate({ foo: "a", bar: 0.0 }, schema).valid).toBe(true);
  expect(
    jsonschema.validate({ foo: "a", bar: 0.0, fewfwef: { a: 1 } }, schema).valid
  ).toBe(false);
  validate(schema);
});

test("object with required properties and no additional properties is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    required: ["foo"],
    properties: {
      foo: { type: "string" },
      bar: { type: "number" },
      baz: { type: "integer" }
    },
    additionalProperties: false
  };
  expect(jsonschema.validate({ foo: "a", bar: 0.0 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ bar: 0.0 }, schema).valid).toBe(false);
  validate(schema);
});

test("$ref works", () => {
  const schema: FastCheckSchema = {
    definitions: {
      baz: {
        type: "string"
      }
    },
    type: "object",
    properties: {
      foo: { $ref: "#/definitions/baz" },
      bar: { type: "number" }
    }
  };
  expect(jsonschema.validate({ foo: "a", bar: 0.0 }, schema).valid).toBe(true);
  validate(schema);
});

test("object with additional properties is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      foo: { type: "string" }
    },
    additionalProperties: {
      type: "number"
    }
  };
  expect(jsonschema.validate({ foo: "a", baz: 0.0 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ foo: "a", baz: "z" }, schema).valid).toBe(false);
  validate(schema);
});

test("object with pattern properties is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      foo: { type: "string" }
    },
    patternProperties: {
      "^S_": { type: "string" },
      "^I_": { type: "integer" }
    }
  };
  expect(jsonschema.validate({ foo: "a", S_: "m" }, schema).valid).toBe(true);
  expect(
    jsonschema.validate({ foo: "a", S_z: "m", I_oo: 1 }, schema).valid
  ).toBe(true);
  expect(jsonschema.validate({ foo: "a", S_o: 1 }, schema).valid).toBe(false);
  validate(schema);
});

test("object with dependencies is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "object",
    properties: {
      a: { type: "integer" },
      b: { type: "integer" },
      c: { type: "integer" }
    },
    dependencies: {
      c: ["b"]
    }
  };
  expect(jsonschema.validate({ a: 1 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ a: 1, c: 2 }, schema).valid).toBe(false);
  expect(jsonschema.validate({ a: 1, b: 2 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ a: 1, b: 2, c: 3 }, schema).valid).toBe(true);
  validate(schema);
});

test("anyOf at top level is correctly defined", () => {
  const schema: FastCheckSchema = {
    anyOf: [{ type: "string" }, { type: "number" }]
  };
  expect(jsonschema.validate(32, schema).valid).toBe(true);
  expect(jsonschema.validate("foobar", schema).valid).toBe(true);
  expect(jsonschema.validate({ foo: "a", S_o: 1 }, schema).valid).toBe(false);
  validate(schema);
});

test("anyOf internal level is correctly defined", () => {
  const schema: FastCheckSchema = {
    definitions: {
      foo: { type: "number" },
      bar: { type: "string" }
    },
    type: "object",
    properties: {
      z: {
        anyOf: [{ $ref: "#/definitions/foo" }, { $ref: "#/definitions/bar" }]
      }
    }
  };
  expect(jsonschema.validate({ z: 1 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ z: 2 }, schema).valid).toBe(true);
  expect(jsonschema.validate({ z: { z: 1 } }, schema).valid).toBe(false);
  validate(schema);
});

test("oneOf at top level is correctly defined", () => {
  const schema: FastCheckSchema = {
    oneOf: [{ type: "string" }, { type: "number" }]
  };
  expect(jsonschema.validate(32, schema).valid).toBe(true);
  expect(jsonschema.validate("foobar", schema).valid).toBe(true);
  expect(jsonschema.validate({ foo: "a", S_o: 1 }, schema).valid).toBe(false);
  validate(schema);
});

test("not at top level is correctly defined", () => {
  const schema: FastCheckSchema = {
    not: { type: "string" }
  };
  expect(jsonschema.validate(32, schema).valid).toBe(true);
  expect(jsonschema.validate("foobar", schema).valid).toBe(false);
  validate(schema);
});

test("not at top level with definitions is correctly defined", () => {
  const schema: FastCheckSchema = {
    definitions: {
      foo: { type: "string" }
    },
    not: { $ref: "#/definitions/foo" }
  };
  expect(jsonschema.validate(32, schema).valid).toBe(true);
  expect(jsonschema.validate("foobar", schema).valid).toBe(false);
  validate(schema);
});

test("not is correctly defined", () => {
  const schema: FastCheckSchema = {
    type: "array",
    items: { not: { type: "string" } }
  };
  expect(jsonschema.validate([32, true], schema).valid).toBe(true);
  expect(jsonschema.validate([32, "foobar"], schema).valid).toBe(false);
  validate(schema);
});

test("not with definitions is correctly defined", () => {
  const schema: FastCheckSchema = {
    definitions: {
      foo: { type: "string" }
    },
    type: "array",
    items: { not: { $ref: "#/definitions/foo" } }
  };
  expect(jsonschema.validate([32], schema).valid).toBe(true);
  expect(jsonschema.validate(["foobar"], schema).valid).toBe(false);
  validate(schema);
});

test("allOf at top level is correctly defined", () => {
  const schema: FastCheckSchema = {
    allOf: [
      {
        type: "object",
        properties: { z: { type: "string" } },
        required: ["z"]
      },
      { type: "object", properties: { q: { type: "string" } }, required: ["q"] }
    ]
  };
  expect(jsonschema.validate({ z: "hello", q: "world" }, schema).valid).toBe(
    true
  );
  expect(jsonschema.validate({ z: "hello" }, schema).valid).toBe(false);
  validate(schema);
});

test("allOf at top level with definitions is correctly defined", () => {
  const schema: FastCheckSchema = {
    definitions: {
      z: {
        type: "object",
        properties: { z: { type: "string" } },
        required: ["z"]
      },
      q: {
        type: "object",
        properties: { q: { type: "string" } },
        required: ["q"]
      }
    },
    allOf: [{ $ref: "#/definitions/z" }, { $ref: "#/definitions/q" }]
  };
  expect(jsonschema.validate({ z: "hello", q: "world" }, schema).valid).toBe(
    true
  );
  expect(jsonschema.validate({ z: "hello" }, schema).valid).toBe(false);
  validate(schema);
});

test("works with a schema from the json-schema.org website", () => {
  const schema: FastCheckSchema = {
    $id: "https://example.com/arrays.schema.json",
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      fruits: {
        type: "array",
        items: {
          type: "string"
        }
      },
      vegetables: {
        type: "array",
        items: { $ref: "#/definitions/veggie" }
      }
    },
    definitions: {
      veggie: {
        type: "object",
        required: ["veggieName", "veggieLike"],
        properties: {
          veggieName: {
            type: "string"
          },
          veggieLike: {
            type: "boolean"
          }
        }
      }
    }
  };
  validate(schema);
});
