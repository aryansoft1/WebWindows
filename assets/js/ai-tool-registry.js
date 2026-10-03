(function (global) {
  "use strict";

  const definitions = new Map();
  let permissionResolver = async () => false;

  function validateName(name) {
    const value = String(name || "");
    if (!/^[a-z][A-Za-z0-9]{2,63}$/.test(value)) {
      throw new TypeError("AI tool name is invalid.");
    }
    return value;
  }

  function validateValue(schema, value, path) {
    const location = path || "arguments";
    if (!schema || typeof schema !== "object") return value;
    if (schema.enum && !schema.enum.includes(value)) throw new TypeError(`Invalid value: ${location}`);
    if (schema.type === "object") {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`Invalid object: ${location}`);
      const properties = schema.properties || {};
      for (const required of schema.required || []) {
        if (!(required in value)) throw new TypeError(`Missing required argument: ${location}.${required}`);
      }
      for (const [key, item] of Object.entries(value)) {
        if (!(key in properties)) {
          if (schema.additionalProperties === false) throw new TypeError(`Unexpected argument: ${location}.${key}`);
          continue;
        }
        validateValue(properties[key], item, `${location}.${key}`);
      }
    } else if (schema.type === "array") {
      if (!Array.isArray(value)) throw new TypeError(`Invalid array: ${location}`);
      if (schema.minItems !== undefined && value.length < schema.minItems) throw new TypeError(`Too few items: ${location}`);
      if (schema.maxItems !== undefined && value.length > schema.maxItems) throw new TypeError(`Too many items: ${location}`);
      value.forEach((item, index) => validateValue(schema.items, item, `${location}[${index}]`));
    } else if (schema.type === "integer") {
      if (!Number.isInteger(value)) throw new TypeError(`Invalid integer: ${location}`);
    } else if (schema.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError(`Invalid number: ${location}`);
    } else if (schema.type && typeof value !== schema.type) {
      throw new TypeError(`Invalid ${schema.type}: ${location}`);
    }
    if (typeof value === "string" && schema.maxLength !== undefined && value.length > schema.maxLength) throw new TypeError(`Value too long: ${location}`);
    if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum) throw new TypeError(`Value too small: ${location}`);
    if (typeof value === "number" && schema.maximum !== undefined && value > schema.maximum) throw new TypeError(`Value too large: ${location}`);
    return value;
  }

  function validateArguments(schema, args) {
    const value = args && typeof args === "object" && !Array.isArray(args) ? args : {};
    return validateValue(schema || { type: "object" }, value, "arguments");
  }

  function register(definition) {
    const name = validateName(definition?.name);
    if (definitions.has(name)) throw new Error(`AI tool already registered: ${name}`);
    if (typeof definition.handler !== "function") throw new TypeError("AI tool handler is required.");
    const record = Object.freeze({
      name,
      description: String(definition.description || "").slice(0, 500),
      permission: String(definition.permission || "none"),
      parameters: definition.parameters || { type: "object", properties: {}, required: [] },
      enabled: definition.enabled === true,
      modelVisible: definition.modelVisible === true,
      handler: definition.handler
    });
    definitions.set(name, record);
    return record;
  }

  async function invoke(name, args, runtimeContext) {
    const tool = definitions.get(validateName(name));
    if (!tool || !tool.enabled) throw new Error("AI tool is unavailable.");
    const allowed = await permissionResolver(tool.permission, {
      tool: tool.name,
      runtimeContext: runtimeContext || null
    });
    if (!allowed) throw new Error("AI tool permission denied.");
    return tool.handler(validateArguments(tool.parameters, args), runtimeContext || null);
  }

  function list() {
    return Array.from(definitions.values()).map(({ handler, ...metadata }) => metadata);
  }

  function toOpenAITools() {
    return Array.from(definitions.values())
      .filter((tool) => tool.enabled && tool.modelVisible)
      .map((tool) => ({
        type: "function",
        function: { name: tool.name, description: tool.description, parameters: tool.parameters }
      }));
  }

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.aiTools = Object.freeze({
    version: 1,
    register,
    invoke,
    list,
    toOpenAITools,
    setPermissionResolver(resolver) {
      if (typeof resolver !== "function") throw new TypeError("Permission resolver must be a function.");
      permissionResolver = resolver;
    }
  });
})(window);
