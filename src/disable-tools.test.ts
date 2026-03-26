import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getDisabledToolNames, TOOL_GROUPS } from './tool-filters.js';

// ---------- helpers ----------

function setEnv(key: string, value: string) {
  process.env[key] = value;
}

function clearEnv(...keys: string[]) {
  for (const key of keys) {
    delete process.env[key];
  }
}

// ---------- tests ----------

describe('getDisabledToolNames', () => {
  beforeEach(() => {
    clearEnv('DISABLE_TOOLS', 'USER_CONFIG_DISABLE_TOOLS');
  });

  afterEach(() => {
    clearEnv('DISABLE_TOOLS', 'USER_CONFIG_DISABLE_TOOLS');
  });

  it('returns empty set when DISABLE_TOOLS is not set', () => {
    const disabled = getDisabledToolNames();
    assert.equal(disabled.size, 0);
  });

  it('returns empty set when DISABLE_TOOLS is empty string', () => {
    setEnv('DISABLE_TOOLS', '');
    const disabled = getDisabledToolNames();
    assert.equal(disabled.size, 0);
  });

  it('disables a single tool by name', () => {
    setEnv('DISABLE_TOOLS', 'send_email');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.equal(disabled.size, 1);
  });

  it('disables multiple tools by name (comma-separated)', () => {
    setEnv('DISABLE_TOOLS', 'send_email,delete_email,move_email');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.ok(disabled.has('delete_email'));
    assert.ok(disabled.has('move_email'));
    assert.equal(disabled.size, 3);
  });

  it('handles whitespace around tool names', () => {
    setEnv('DISABLE_TOOLS', ' send_email , delete_email ');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.ok(disabled.has('delete_email'));
    assert.equal(disabled.size, 2);
  });

  it('is case-insensitive', () => {
    setEnv('DISABLE_TOOLS', 'Send_Email,DELETE_EMAIL');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.ok(disabled.has('delete_email'));
  });

  it('expands the "calendar" group', () => {
    setEnv('DISABLE_TOOLS', 'calendar');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.calendar) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('expands the "contacts" group', () => {
    setEnv('DISABLE_TOOLS', 'contacts');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.contacts) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('expands the "write" group', () => {
    setEnv('DISABLE_TOOLS', 'write');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.write) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('expands the "bulk" group', () => {
    setEnv('DISABLE_TOOLS', 'bulk');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.bulk) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('expands the "search" group', () => {
    setEnv('DISABLE_TOOLS', 'search');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.search) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('expands the "identity" group', () => {
    setEnv('DISABLE_TOOLS', 'identity');
    const disabled = getDisabledToolNames();
    for (const tool of TOOL_GROUPS.identity) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
  });

  it('mixes individual tools and groups', () => {
    setEnv('DISABLE_TOOLS', 'calendar,send_email');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    for (const tool of TOOL_GROUPS.calendar) {
      assert.ok(disabled.has(tool), `Expected ${tool} to be disabled`);
    }
    // Non-disabled tools should not be present
    assert.ok(!disabled.has('list_emails'));
  });

  it('handles trailing comma gracefully', () => {
    setEnv('DISABLE_TOOLS', 'send_email,');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.equal(disabled.size, 1);
  });

  it('supports USER_CONFIG_DISABLE_TOOLS as fallback', () => {
    setEnv('USER_CONFIG_DISABLE_TOOLS', 'send_email');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
  });

  it('prefers DISABLE_TOOLS over USER_CONFIG_DISABLE_TOOLS', () => {
    setEnv('DISABLE_TOOLS', 'send_email');
    setEnv('USER_CONFIG_DISABLE_TOOLS', 'delete_email');
    const disabled = getDisabledToolNames();
    assert.ok(disabled.has('send_email'));
    assert.ok(!disabled.has('delete_email'));
  });
});

describe('TOOL_GROUPS', () => {
  it('all group names are lowercase', () => {
    for (const group of Object.keys(TOOL_GROUPS)) {
      assert.equal(group, group.toLowerCase(), `Group "${group}" should be lowercase`);
    }
  });

  it('all tool names within groups are lowercase', () => {
    for (const [group, tools] of Object.entries(TOOL_GROUPS)) {
      for (const tool of tools) {
        assert.equal(tool, tool.toLowerCase(), `Tool "${tool}" in group "${group}" should be lowercase`);
      }
    }
  });
});
