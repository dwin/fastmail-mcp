/**
 * Tool filtering logic for DISABLE_TOOLS environment variable support.
 *
 * Separated from index.ts so it can be imported (and tested) without
 * triggering the MCP server startup.
 */

// ---------- env helper ----------

function getEnvValue(keys: string[]): string | undefined {
  const isPlaceholder = (val: string) => /\$\{[^}]+\}/.test(val.trim());
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      if (isPlaceholder(raw)) continue;
      return raw.trim();
    }
  }
  return undefined;
}

// ---------- tool groups & disable logic ----------

export const TOOL_GROUPS: Record<string, string[]> = {
  email: [
    'list_mailboxes', 'list_emails', 'get_email', 'get_recent_emails',
    'search_emails', 'advanced_search', 'get_thread',
    'get_email_attachments', 'download_attachment',
    'get_mailbox_stats', 'get_account_summary',
  ],
  write: [
    'send_email', 'reply_email', 'create_draft', 'edit_draft', 'send_draft',
    'mark_email_read', 'pin_email', 'delete_email', 'move_email',
    'add_labels', 'remove_labels',
    'download_attachment',
    'bulk_mark_read', 'bulk_pin', 'bulk_move', 'bulk_delete',
    'bulk_add_labels', 'bulk_remove_labels',
    'create_calendar_event', 'test_bulk_operations',
  ],
  calendar: [
    'list_calendars', 'list_calendar_events', 'get_calendar_event',
    'create_calendar_event',
  ],
  contacts: [
    'list_contacts', 'get_contact', 'search_contacts',
  ],
  bulk: [
    'bulk_mark_read', 'bulk_pin', 'bulk_move', 'bulk_delete',
    'bulk_add_labels', 'bulk_remove_labels', 'test_bulk_operations',
  ],
  search: [
    'search_emails', 'advanced_search', 'search_contacts',
  ],
  identity: [
    'list_identities', 'check_function_availability',
  ],
};

export function getDisabledToolNames(): Set<string> {
  const raw = getEnvValue([
    'DISABLE_TOOLS',
    'USER_CONFIG_DISABLE_TOOLS',
  ]);
  if (!raw) return new Set();

  const disabled = new Set<string>();
  for (const entry of raw.split(',')) {
    const trimmed = entry.trim().toLowerCase();
    if (!trimmed) continue;
    if (Object.hasOwn(TOOL_GROUPS, trimmed) && Array.isArray(TOOL_GROUPS[trimmed])) {
      for (const tool of TOOL_GROUPS[trimmed]) {
        disabled.add(tool);
      }
    } else {
      disabled.add(trimmed);
    }
  }
  return disabled;
}
