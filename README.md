# Fastmail MCP Server

A Model Context Protocol (MCP) server that provides access to the Fastmail API, enabling AI assistants to interact with email, contacts, and calendar data.

## Features

### Core Email Operations
- List mailboxes and get mailbox statistics
- List, search, and filter emails with advanced criteria
- Get specific emails by ID with full content
- Send emails (text and HTML) with proper draft/sent handling
- Reply to emails with proper threading (In-Reply-To, References headers)
- Create and save email drafts (with or without threading)
- Email management: mark read/unread, delete, move between folders

### Advanced Email Features
- **Attachment Handling**: List and download email attachments
- **Threading Support**: Get complete conversation threads
- **Advanced Search**: Multi-criteria filtering (sender, date range, attachments, read status)
- **Bulk Operations**: Process multiple emails simultaneously
- **Statistics & Analytics**: Account summaries and mailbox statistics

### Contacts Operations
- List all contacts with full contact information
- Get specific contacts by ID
- Search contacts by name or email

### Calendar Operations
- List all calendars and calendar events
- Get specific calendar events by ID
- Create new calendar events with participants and details

### Label vs Move Operations
- **move_email/bulk_move**: Replaces ALL mailboxes for an email (folder behavior)
- **add_labels/remove_labels**: Adds/removes SPECIFIC mailboxes while preserving others (label behavior)

### Identity & Account Management
- List available sending identities
- Account summary with comprehensive statistics

## Setup

### Prerequisites
- Node.js 18+ 
- A Fastmail account with API access
- Fastmail API token

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Configuration

1. Get your Fastmail API token:
   - Log in to Fastmail web interface
   - Go to Settings → Privacy & Security
   - Find "Connected apps & API tokens" section
   - Click "Manage API tokens"
   - Click "New API token"
   - Copy the generated token

2. Set environment variables:
   ```bash
   export FASTMAIL_API_TOKEN="your_api_token_here"
   # Optional: customize base URL (defaults to https://api.fastmail.com)
   export FASTMAIL_BASE_URL="https://api.fastmail.com"
   ```

### Disabling Tools

You can selectively disable tools at runtime using the `DISABLE_TOOLS` environment variable. Disabled tools will not appear in tool discovery and cannot be called.

Set `DISABLE_TOOLS` to a comma-separated list of individual tool names and/or group names:

```bash
# Disable specific tools
export DISABLE_TOOLS="send_email,delete_email"

# Disable an entire group
export DISABLE_TOOLS="calendar"

# Mix individual tools and groups
export DISABLE_TOOLS="calendar,contacts,send_email"

# Disable all write/mutating operations (read-only mode)
export DISABLE_TOOLS="write"
```

**Available groups:**

| Group | Tools |
|-------|-------|
| `email` | `list_mailboxes`, `list_emails`, `get_email`, `get_recent_emails`, `search_emails`, `advanced_search`, `get_thread`, `get_email_attachments`, `download_attachment`, `get_mailbox_stats`, `get_account_summary` |
| `write` | `send_email`, `reply_email`, `create_draft`, `edit_draft`, `send_draft`, `mark_email_read`, `pin_email`, `delete_email`, `move_email`, `add_labels`, `remove_labels`, `bulk_mark_read`, `bulk_pin`, `bulk_move`, `bulk_delete`, `bulk_add_labels`, `bulk_remove_labels`, `create_calendar_event` |
| `calendar` | `list_calendars`, `list_calendar_events`, `get_calendar_event`, `create_calendar_event` |
| `contacts` | `list_contacts`, `get_contact`, `search_contacts` |
| `bulk` | `bulk_mark_read`, `bulk_pin`, `bulk_move`, `bulk_delete`, `bulk_add_labels`, `bulk_remove_labels`, `test_bulk_operations` |
| `search` | `search_emails`, `advanced_search`, `search_contacts` |
| `identity` | `list_identities`, `check_function_availability` |

The `USER_CONFIG_DISABLE_TOOLS` variant is also supported for Claude Desktop DXT deployments.

### Running the Server

Start the MCP server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Run via npx (GitHub)

Default to `main` branch:

```bash
FASTMAIL_API_TOKEN="your_token" FASTMAIL_BASE_URL="https://api.fastmail.com" \
  npx --yes github:MadLlama25/fastmail-mcp fastmail-mcp
```

Windows PowerShell:

```powershell
$env:FASTMAIL_API_TOKEN="your_token"
$env:FASTMAIL_BASE_URL="https://api.fastmail.com"
npx --yes github:MadLlama25/fastmail-mcp fastmail-mcp
```

Pin to a tagged release:

```bash
FASTMAIL_API_TOKEN="your_token" \
  npx --yes github:MadLlama25/fastmail-mcp@v1.8.2 fastmail-mcp
```

## Install as a Claude Desktop Extension (DXT)

You can install this server as a Desktop Extension for Claude Desktop using the packaged `.dxt` file.

1. Build and pack:
   ```bash
   npm run build
   npx @anthropic-ai/dxt pack
   ```
   This produces `fastmail-mcp.dxt` in the project root.

2. Install into Claude Desktop:
   - Open the `.dxt` file, or drag it into Claude Desktop
   - When prompted:
     - Fastmail API Token: paste your token (stored encrypted by Claude)
     - Fastmail Base URL: leave blank to use `https://api.fastmail.com` (default)

3. Use any of the tools (e.g. `get_recent_emails`).

## Available Tools (38 Total)

Every tool advertises MCP operation hints via `annotations.readOnlyHint` and `annotations.destructiveHint`.

| Mode | `readOnlyHint` | `destructiveHint` | Meaning |
|------|---------------|-------------------|---------|
| Read-only | `true` | — | Reads data only, no side effects |
| Mutative | `false` | `false` | Changes state, but additive/non-destructive |
| Destructive | `false` | `true` | May delete, send, or make irreversible changes |

### Email

| Tool | Mode | Description |
|------|------|-------------|
| `list_mailboxes` | Read-only | List all mailboxes in the account |
| `list_emails` | Read-only | List emails from a mailbox (`mailboxId?`, `limit=20`) |
| `get_email` | Read-only | Get a specific email by ID |
| `get_recent_emails` | Read-only | Get the most recent emails from a mailbox (`limit=10`, `mailboxName=inbox`) |
| `search_emails` | Read-only | Search emails by subject or content (`query`, `limit=20`) |
| `advanced_search` | Read-only | Multi-criteria search: `query`, `from`, `to`, `subject`, `hasAttachment`, `isUnread`, `isPinned`, `mailboxId`, `after`, `before`, `limit=50` |
| `get_thread` | Read-only | Get all emails in a conversation thread |
| `get_email_attachments` | Read-only | List attachments for an email |
| `get_mailbox_stats` | Read-only | Unread count and totals for a mailbox (`mailboxId?`) |
| `get_account_summary` | Read-only | Overall account statistics |
| `mark_email_read` | Mutative | Mark an email read or unread (`emailId`, `read=true`) |
| `pin_email` | Mutative | Pin or unpin an email (`emailId`, `pinned=true`) |
| `add_labels` | Mutative | Add mailboxes to an email without removing existing ones |
| `create_draft` | Mutative | Create a draft without sending (`to?`, `cc?`, `bcc?`, `from?`, `subject?`, `textBody?`, `htmlBody?`, threading headers) |
| `send_email` | Destructive | Send an email (`to`, `subject`, `textBody?`, `htmlBody?`, `cc?`, `bcc?`, threading headers) |
| `reply_email` | Destructive | Reply with auto-built threading headers; set `send=false` to save as draft |
| `edit_draft` | Destructive | Atomically replace a draft's fields (preserves unspecified fields) |
| `send_draft` | Destructive | Send an existing draft |
| `download_attachment` | Destructive | Download an attachment; saves to disk if `savePath` provided |
| `move_email` | Destructive | Move an email to a different mailbox (replaces all mailboxes) |
| `remove_labels` | Destructive | Remove specific mailboxes from an email |
| `delete_email` | Destructive | Move an email to trash |

### Bulk Operations

| Tool | Mode | Description |
|------|------|-------------|
| `bulk_mark_read` | Mutative | Mark multiple emails read/unread (`emailIds`, `read=true`) |
| `bulk_pin` | Mutative | Pin or unpin multiple emails (`emailIds`, `pinned=true`) |
| `bulk_add_labels` | Mutative | Add mailboxes to multiple emails |
| `bulk_move` | Destructive | Move multiple emails to a mailbox |
| `bulk_remove_labels` | Destructive | Remove mailboxes from multiple emails |
| `bulk_delete` | Destructive | Move multiple emails to trash |
| `test_bulk_operations` | Mutative | Dry-run bulk operations safely (`dryRun=true`, `limit=3`) |

### Contacts

| Tool | Mode | Description |
|------|------|-------------|
| `list_contacts` | Read-only | List contacts from the address book (`limit=50`) |
| `get_contact` | Read-only | Get a specific contact by ID |
| `search_contacts` | Read-only | Search contacts by name or email (`query`, `limit=20`) |

### Calendar

| Tool | Mode | Description |
|------|------|-------------|
| `list_calendars` | Read-only | List all calendars |
| `list_calendar_events` | Read-only | List calendar events (`calendarId?`, `limit=50`) |
| `get_calendar_event` | Read-only | Get a specific calendar event by ID |
| `create_calendar_event` | Mutative | Create a calendar event (`calendarId`, `title`, `start`, `end`, `description?`, `location?`, `participants?`) |

### Identity & Utilities

| Tool | Mode | Description |
|------|------|-------------|
| `list_identities` | Read-only | List sending identities (email addresses available for sending) |
| `check_function_availability` | Read-only | Check which tools are available and get setup guidance |

## API Information

This server uses the JMAP (JSON Meta Application Protocol) API provided by Fastmail. JMAP is a modern, efficient alternative to IMAP for email access.

### Inspired by Fastmail JMAP-Samples

Many features in this MCP server are inspired by the official [Fastmail JMAP-Samples](https://github.com/fastmail/JMAP-Samples) repository, including:
- Recent emails retrieval (based on top-ten example)
- Email management operations
- Efficient chained JMAP method calls

### Authentication
The server uses bearer token authentication with Fastmail's API. API tokens provide secure access without exposing your main account password.

### Rate Limits
Fastmail applies rate limits to API requests. The server handles standard rate limiting, but excessive requests may be throttled.

## CalDAV Calendar Support

Fastmail does not currently expose calendar access via JMAP API tokens — the `urn:ietf:params:jmap:calendars` scope is not available because the JMAP Calendars specification is still an IETF Internet-Draft ([draft-ietf-jmap-calendars](https://datatracker.ietf.org/doc/draft-ietf-jmap-calendars/)). Fastmail has stated they will add JMAP calendar support once the spec becomes an RFC, but there is no public timeline.

However, Fastmail fully supports **CalDAV** for calendar access via `caldav.fastmail.com`. This server automatically falls back to CalDAV when JMAP calendar access is unavailable.

### Setup

1. Create an app-specific password on Fastmail:
   - Go to **Settings → Privacy & Security → Manage app passwords**
   - Create a new app password (you can name it "CalDAV MCP" or similar)

2. Set the following environment variables:
   ```bash
   export FASTMAIL_CALDAV_USERNAME="your-email@fastmail.com"
   export FASTMAIL_CALDAV_PASSWORD="your-app-specific-password"
   ```

When these variables are set, the calendar tools (`list_calendars`, `list_calendar_events`, `get_calendar_event`, `create_calendar_event`) will automatically fall back to CalDAV if JMAP calendars are not available. When these variables are not set, the server behaves exactly as before (JMAP only).

## Development

### Project Structure
```
src/
├── index.ts              # Main MCP server implementation
├── auth.ts              # Authentication handling
├── jmap-client.ts       # JMAP client wrapper
├── contacts-calendar.ts # Contacts and calendar extensions
├── caldav-client.ts     # CalDAV calendar client (fallback)
├── tools.ts             # Tool definitions with MCP operation annotations
└── tool-filters.ts      # DISABLE_TOOLS environment variable handling
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure that:
1. Code follows the existing style
2. All functions are properly typed
3. Error handling is implemented
4. Documentation is updated for new features

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your API token is valid and has the necessary permissions
2. **Missing Dependencies**: Run `npm install` to ensure all dependencies are installed  
3. **Build Errors**: Check that TypeScript compilation completes without errors using `npm run build`
4. **Calendar/Contacts "Forbidden" Errors**: Use `check_function_availability` to see setup guidance

### Email Tools Failing with Serialization Errors?

If `get_email`, `list_emails`, `search_emails`, or `advanced_search` fail with "content serialization" or "Cannot read properties of undefined" errors, upgrade to v1.7.1+. This was caused by incomplete JMAP response validation that surfaced after the MCP SDK v1.x upgrade added stricter result checking.

### Calendar/Contacts Not Working?

If calendar and contacts functions return "Forbidden" errors, this is likely due to:

1. **Account Plan**: Calendar/contacts API may require business/professional Fastmail plans
2. **API Token Scope**: Your API token may need calendar/contacts permissions enabled
3. **Feature Enablement**: These features may need explicit activation in your account

**Solution**: Run `check_function_availability` for step-by-step setup guidance.

### Testing Your Setup

Use the built-in testing tools:
- **check_function_availability**: See what's available and get setup help
- **test_bulk_operations**: Safely test bulk operations without making changes

For more detailed error information, check the console output when running the server.

## Privacy & Security

- API tokens are stored encrypted by Claude Desktop when installed via the DXT and are never logged by this server.
- The server avoids logging raw errors and sensitive data (tokens, email addresses, identities, attachment names/blobIds) in error messages.
- Tool responses may include your email metadata/content by design (e.g., listing emails) but internal identifiers and credentials are not disclosed beyond what Fastmail returns for the requested data.
- If you encounter errors, messages are sanitized and summarized to prevent leaking personal information.
