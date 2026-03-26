import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, getOperationMode } from './tools.js';

describe('tool operation mode metadata', () => {
  it('sets MCP annotation hints for every tool', () => {
    assert.ok(TOOLS.length > 0, 'expected at least one tool definition');

    for (const tool of TOOLS) {
      assert.ok(tool.annotations, `${tool.name} should define annotations`);
      assert.equal(typeof tool.annotations?.readOnlyHint, 'boolean', `${tool.name} should define readOnlyHint`);

      if (tool.annotations?.readOnlyHint) {
        assert.equal(getOperationMode(tool), 'read-only', `${tool.name} should be classified as read-only`);
      } else {
        assert.equal(typeof tool.annotations?.destructiveHint, 'boolean', `${tool.name} should define destructiveHint`);
        assert.match(getOperationMode(tool), /^(mutative|destructive)$/);
      }
    }
  });

  it('classifies representative tools in each operation mode', () => {
    const modeByName = new Map(TOOLS.map(tool => [tool.name, getOperationMode(tool)]));

    assert.equal(modeByName.get('list_mailboxes'), 'read-only');
    assert.equal(modeByName.get('create_draft'), 'mutative');
    assert.equal(modeByName.get('delete_email'), 'destructive');
    assert.equal(modeByName.get('send_email'), 'destructive');
    assert.equal(modeByName.get('download_attachment'), 'destructive');
  });
});
