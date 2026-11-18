// Civil subset of the pinned GEV action schemas. Used on both sides of the
// original voice transport; never dispatch an unlisted function/catalog tool.
import tools from './tools.json' with { type: 'json' };
export const ATLAS_VOICE_TOOLS = Object.freeze(tools);
const byName = new Map(tools.map(tool => [tool.name, tool]));

function matches(schema, value) {
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const props = schema.properties || {};
    if ((schema.required || []).some(key => !Object.hasOwn(value, key))) return false;
    return Object.entries(value).every(([key, item]) =>
      Object.hasOwn(props, key) && matches(props[key], item));
  }
  if (schema.type === 'array') return Array.isArray(value) && value.length <= 100 && value.every(item => matches(schema.items, item));
  if (schema.type === 'string') return typeof value === 'string' && value.length <= (schema.maxLength ?? 500);
  if (schema.type === 'boolean') return typeof value === 'boolean';
  if (schema.type === 'number' || schema.type === 'integer') return typeof value === 'number' && Number.isFinite(value) &&
    (schema.type !== 'integer' || Number.isInteger(value)) &&
    (schema.minimum == null || value >= schema.minimum) &&
    (schema.maximum == null || value <= schema.maximum);
  return false;
}

export function isHostedVoiceActionAllowed(name, args = {}) {
  const tool = byName.get(name);
  return Boolean(tool && matches(tool.parameters, args));
}

export function restrictHostedVoiceRunner(runner) {
  const scoped = async (name, args = {}, options) => {
    if (!isHostedVoiceActionAllowed(name, args)) return {
      ok: false, action: name, error: 'This action is not available in hosted Atlas.',
      say: 'That action is not available in this Atlas.',
    };
    return runner(name, args, options);
  };
  scoped.dispose = (...args) => runner.dispose?.(...args);
  scoped.resetConversation = (...args) => runner.resetConversation?.(...args);
  return scoped;
}
