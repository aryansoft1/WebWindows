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

  function validateArguments(schema, args) {
    const value = args && typeof args === "object" && !Array.isArray(args) ? args : {};
    const properties = schema?.properties || {};
    for (const required of schema?.required || []) {
      if (!(required in value)) throw new TypeError(`Missing required argument: ${required}`);
    }
    for (const [key, item] of Object.entries(value)) {
      if (!(key in properties)) throw new TypeError(`Unexpected argument: ${key}`);
      const expected = properties[key]?.type;
      if (expected && typeof item !== expected) {
        throw new TypeError(`Invalid argument type: ${key}`);
      }
    }
    return value;
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

  global.WebWindows = global.WebWindows || {};
  global.WebWindows.aiTools = Object.freeze({
    version: 1,
    register,
    invoke,
    list,
    setPermissionResolver(resolver) {
      if (typeof resolver !== "function") throw new TypeError("Permission resolver must be a function.");
      permissionResolver = resolver;
    }
  });
})(window);

