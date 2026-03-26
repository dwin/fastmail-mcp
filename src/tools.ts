import type { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export type OperationMode = 'read-only' | 'mutative' | 'destructive';

export const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
};

export const MUTATIVE_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
};

export const DESTRUCTIVE_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: true,
};

export function getOperationMode(tool: Pick<Tool, 'annotations'>): OperationMode {
  if (tool.annotations?.readOnlyHint) {
    return 'read-only';
  }

  if (tool.annotations?.destructiveHint === false) {
    return 'mutative';
  }

  if (tool.annotations?.destructiveHint === true) {
    return 'destructive';
  }

  throw new Error('Non-read-only tools must explicitly define destructiveHint');
}

export const TOOLS: Tool[] = [
      {
        name: 'list_mailboxes',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List all mailboxes in the Fastmail account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_emails',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List emails from a mailbox',
        inputSchema: {
          type: 'object',
          properties: {
            mailboxId: {
              type: 'string',
              description: 'ID of the mailbox to list emails from (optional, defaults to all)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of emails to return (default: 20)',
              default: 20,
            },
          },
        },
      },
      {
        name: 'get_email',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get a specific email by ID',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to retrieve',
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'send_email',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Send an email',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recipient email addresses',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'CC email addresses (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'BCC email addresses (optional)',
            },
            from: {
              type: 'string',
              description: 'Sender email address (optional, defaults to account primary email)',
            },
            mailboxId: {
              type: 'string',
              description: 'Mailbox ID to save the email to (optional, defaults to Drafts folder)',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            textBody: {
              type: 'string',
              description: 'Plain text body (optional)',
            },
            htmlBody: {
              type: 'string',
              description: 'HTML body (optional)',
            },
            inReplyTo: {
              type: 'array',
              items: { type: 'string' },
              description: 'Message-ID(s) of the email being replied to (optional, for threading)',
            },
            references: {
              type: 'array',
              items: { type: 'string' },
              description: 'Full reference chain of Message-IDs (optional, for threading)',
            },
          },
          required: ['to', 'subject'],
        },
      },
      {
        name: 'reply_email',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Reply to an existing email with proper threading headers (In-Reply-To, References). Automatically fetches the original email to build the reply chain. By default sends immediately; set send=false to save as a draft instead.',
        inputSchema: {
          type: 'object',
          properties: {
            originalEmailId: {
              type: 'string',
              description: 'ID of the email to reply to',
            },
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recipient email addresses (optional, defaults to the original sender)',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'CC email addresses (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'BCC email addresses (optional)',
            },
            from: {
              type: 'string',
              description: 'Sender email address (optional, defaults to account primary email)',
            },
            textBody: {
              type: 'string',
              description: 'Plain text body (optional)',
            },
            htmlBody: {
              type: 'string',
              description: 'HTML body (optional)',
            },
            send: {
              type: 'boolean',
              description: 'Whether to send the reply immediately (default: true). Set to false to save as draft instead.',
            },
          },
          required: ['originalEmailId'],
        },
      },
      {
        name: 'create_draft',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Create an email draft without sending it. Supports threading headers for replies. IMPORTANT: each call creates a new draft — do not call twice for the same message.',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recipient email addresses (optional)',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'CC email addresses (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'BCC email addresses (optional)',
            },
            from: {
              type: 'string',
              description: 'Sender email address (optional, defaults to account primary email)',
            },
            mailboxId: {
              type: 'string',
              description: 'Mailbox ID to save the draft to (optional, defaults to Drafts folder)',
            },
            subject: {
              type: 'string',
              description: 'Email subject (optional)',
            },
            textBody: {
              type: 'string',
              description: 'Plain text body (optional)',
            },
            htmlBody: {
              type: 'string',
              description: 'HTML body (optional)',
            },
            inReplyTo: {
              type: 'array',
              items: { type: 'string' },
              description: 'Message-IDs to reply to (optional, for threading)',
            },
            references: {
              type: 'array',
              items: { type: 'string' },
              description: 'Message-IDs for References header (optional, for threading)',
            },
          },
        },
      },
      {
        name: 'edit_draft',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Edit an existing draft email. Since JMAP emails are immutable, this atomically destroys the old draft and creates a new one with the updated fields. Only fields you provide will be changed; others are preserved from the original draft.',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'The ID of the draft email to edit',
            },
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Updated recipient email addresses (optional, keeps existing if omitted)',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'Updated CC email addresses (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'Updated BCC email addresses (optional)',
            },
            from: {
              type: 'string',
              description: 'Updated sender email address (optional)',
            },
            subject: {
              type: 'string',
              description: 'Updated email subject (optional)',
            },
            textBody: {
              type: 'string',
              description: 'Updated plain text body (optional)',
            },
            htmlBody: {
              type: 'string',
              description: 'Updated HTML body (optional)',
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'send_draft',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Send an existing draft email. The draft must have recipients (to/cc/bcc) and a from address. After sending, the email is moved to the Sent folder and the draft keyword is removed.',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'The ID of the draft email to send',
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'search_emails',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Search emails by subject or content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 20)',
              default: 20,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_contacts',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List contacts from the address book',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of contacts to return (default: 50)',
              default: 50,
            },
          },
        },
      },
      {
        name: 'get_contact',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get a specific contact by ID',
        inputSchema: {
          type: 'object',
          properties: {
            contactId: {
              type: 'string',
              description: 'ID of the contact to retrieve',
            },
          },
          required: ['contactId'],
        },
      },
      {
        name: 'search_contacts',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Search contacts by name or email',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 20)',
              default: 20,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_calendars',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List all calendars',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_calendar_events',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List events from a calendar',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'ID of the calendar (optional, defaults to all calendars)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of events to return (default: 50)',
              default: 50,
            },
          },
        },
      },
      {
        name: 'get_calendar_event',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get a specific calendar event by ID',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'ID of the event to retrieve',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'create_calendar_event',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Create a new calendar event',
        inputSchema: {
          type: 'object',
          properties: {
            calendarId: {
              type: 'string',
              description: 'ID of the calendar to create the event in',
            },
            title: {
              type: 'string',
              description: 'Event title',
            },
            description: {
              type: 'string',
              description: 'Event description (optional)',
            },
            start: {
              type: 'string',
              description: 'Start time in ISO 8601 format',
            },
            end: {
              type: 'string',
              description: 'End time in ISO 8601 format',
            },
            location: {
              type: 'string',
              description: 'Event location (optional)',
            },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              description: 'Event participants (optional)',
            },
          },
          required: ['calendarId', 'title', 'start', 'end'],
        },
      },
      {
        name: 'list_identities',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'List sending identities (email addresses that can be used for sending)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_recent_emails',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get the most recent emails from inbox (like top-ten)',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of recent emails to retrieve (default: 10, max: 50)',
              default: 10,
            },
            mailboxName: {
              type: 'string',
              description: 'Mailbox to search (default: inbox)',
              default: 'inbox',
            },
          },
        },
      },
      {
        name: 'mark_email_read',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Mark an email as read or unread',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to mark',
            },
            read: {
              type: 'boolean',
              description: 'true to mark as read, false to mark as unread',
              default: true,
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'pin_email',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Pin or unpin an email',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to pin/unpin',
            },
            pinned: {
              type: 'boolean',
              description: 'true to pin, false to unpin',
              default: true,
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'delete_email',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Delete an email (move to trash)',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to delete',
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'move_email',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Move an email to a different mailbox',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to move',
            },
            targetMailboxId: {
              type: 'string',
              description: 'ID of the target mailbox',
            },
          },
          required: ['emailId', 'targetMailboxId'],
        },
      },
      {
        name: 'add_labels',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Add labels (mailboxes) to an email without removing existing ones',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to add labels to',
            },
            mailboxIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of mailbox IDs to add as labels',
            },
          },
          required: ['emailId', 'mailboxIds'],
        },
      },
      {
        name: 'remove_labels',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Remove specific labels (mailboxes) from an email',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email to remove labels from',
            },
            mailboxIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of mailbox IDs to remove as labels',
            },
          },
          required: ['emailId', 'mailboxIds'],
        },
      },
      {
        name: 'get_email_attachments',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get list of attachments for an email',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email',
            },
          },
          required: ['emailId'],
        },
      },
      {
        name: 'download_attachment',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Download an email attachment. If savePath is provided, saves the file to disk and returns the file path and size. Otherwise returns a download URL.',
        inputSchema: {
          type: 'object',
          properties: {
            emailId: {
              type: 'string',
              description: 'ID of the email',
            },
            attachmentId: {
              type: 'string',
              description: 'ID of the attachment',
            },
            savePath: {
              type: 'string',
              description: 'File path within ~/Downloads/fastmail-mcp/ to save the attachment to. Paths outside this directory are rejected for security. Parent directories will be created automatically.',
            },
          },
          required: ['emailId', 'attachmentId'],
        },
      },
      {
        name: 'advanced_search',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Advanced email search with multiple criteria',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Text to search for in subject/body',
            },
            from: {
              type: 'string',
              description: 'Filter by sender email',
            },
            to: {
              type: 'string',
              description: 'Filter by recipient email',
            },
            subject: {
              type: 'string',
              description: 'Filter by subject',
            },
            hasAttachment: {
              type: 'boolean',
              description: 'Filter emails with attachments',
            },
            isUnread: {
              type: 'boolean',
              description: 'Filter unread emails',
            },
            isPinned: {
              type: 'boolean',
              description: 'Filter pinned emails',
            },
            mailboxId: {
              type: 'string',
              description: 'Search within specific mailbox',
            },
            after: {
              type: 'string',
              description: 'Emails after this date (ISO 8601)',
            },
            before: {
              type: 'string',
              description: 'Emails before this date (ISO 8601)',
            },
            limit: {
              type: 'number',
              description: 'Maximum results (default: 50)',
              default: 50,
            },
          },
        },
      },
      {
        name: 'get_thread',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get all emails in a conversation thread',
        inputSchema: {
          type: 'object',
          properties: {
            threadId: {
              type: 'string',
              description: 'ID of the thread/conversation',
            },
          },
          required: ['threadId'],
        },
      },
      {
        name: 'get_mailbox_stats',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get statistics for a mailbox (unread count, total emails, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            mailboxId: {
              type: 'string',
              description: 'ID of the mailbox (optional, defaults to all mailboxes)',
            },
          },
        },
      },
      {
        name: 'get_account_summary',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Get overall account summary with statistics',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'bulk_mark_read',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Mark multiple emails as read/unread',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to mark',
            },
            read: {
              type: 'boolean',
              description: 'true to mark as read, false as unread',
              default: true,
            },
          },
          required: ['emailIds'],
        },
      },
      {
        name: 'bulk_pin',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Pin or unpin multiple emails',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to pin/unpin',
            },
            pinned: {
              type: 'boolean',
              description: 'true to pin, false to unpin',
              default: true,
            },
          },
          required: ['emailIds'],
        },
      },
      {
        name: 'bulk_move',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Move multiple emails to a mailbox',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to move',
            },
            targetMailboxId: {
              type: 'string',
              description: 'ID of target mailbox',
            },
          },
          required: ['emailIds', 'targetMailboxId'],
        },
      },
      {
        name: 'bulk_delete',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Delete multiple emails (move to trash)',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to delete',
            },
          },
          required: ['emailIds'],
        },
      },
      {
        name: 'bulk_add_labels',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Add labels to multiple emails simultaneously',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to add labels to',
            },
            mailboxIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of mailbox IDs to add as labels',
            },
          },
          required: ['emailIds', 'mailboxIds'],
        },
      },
      {
        name: 'bulk_remove_labels',
        annotations: DESTRUCTIVE_ANNOTATIONS,
        description: 'Remove labels from multiple emails simultaneously',
        inputSchema: {
          type: 'object',
          properties: {
            emailIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of email IDs to remove labels from',
            },
            mailboxIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of mailbox IDs to remove as labels',
            },
          },
          required: ['emailIds', 'mailboxIds'],
        },
      },
      {
        name: 'check_function_availability',
        annotations: READ_ONLY_ANNOTATIONS,
        description: 'Check which MCP functions are available based on account permissions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'test_bulk_operations',
        annotations: MUTATIVE_ANNOTATIONS,
        description: 'Test bulk operations by finding recent emails and performing safe operations (mark read/unread)',
        inputSchema: {
          type: 'object',
          properties: {
            dryRun: {
              type: 'boolean',
              description: 'If true, only shows what would be done without making changes (default: true)',
              default: true,
            },
            limit: {
              type: 'number',
              description: 'Number of emails to test with (default: 3, max: 10)',
              default: 3,
            },
          },
        },
      },
];
