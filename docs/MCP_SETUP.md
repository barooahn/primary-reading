# Supabase MCP Server Setup Guide

## ✅ What's Already Done
1. ✅ Installed `@supabase/mcp-server-supabase` package
2. ✅ Created MCP configuration in `.mcp/config.json`
3. ✅ Added npm script `yarn mcp` to run the server
4. ✅ Configured with your Supabase URL

## 🔧 What You Need to Do

### 1. Get Your Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nvmcpuwrpdfkycijqvpw`
3. Navigate to **Settings → API**
4. Copy the **Service Role Key** (not the anon key)

### 2. Update the Configuration
Replace `your-supabase-service-role-key-get-from-dashboard` in `.mcp/config.json` with your actual service role key.

### 3. Set Environment Variables
Add to your `.env.local` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

### 4. Test the MCP Server
Run the MCP server to test:
```bash
cd primary-reading
yarn mcp
```

## 🎯 Usage Once Setup is Complete

After the MCP server is configured, Claude Code should have access to these tools:
- `supabase_select` - Query your database
- `supabase_insert` - Insert new records  
- `supabase_update` - Update existing records
- `supabase_delete` - Delete records
- `supabase_rpc` - Call stored procedures

## 🔒 Security Notes
- Service Role Key has full database access - keep it secure
- Only add it to `.env.local` (which is in .gitignore)
- Consider using Row Level Security (RLS) policies for protection

## 🚀 Benefits
Once working, I'll be able to:
- Directly fix your database schema issues
- Create and manage tables
- Insert test data
- Debug database problems in real-time
- Help with complex queries and migrations