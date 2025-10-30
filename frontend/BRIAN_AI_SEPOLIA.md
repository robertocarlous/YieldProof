# Brian AI Support for Ethereum Sepolia

## Status: ✅ Supported via REST API

**Research Findings:**
- Brian AI **REST API** endpoints support Ethereum Sepolia (chainId: 11155111)
- The **Brian AI SDK** may have limitations with testnets, but the REST API is chain-agnostic
- All functionality works through REST API calls without requiring SDK initialization

## Current Implementation

### ✅ Working Configuration
- **Chain ID**: `11155111` (Ethereum Sepolia) - passed in API requests
- **Knowledge Base**: `ethereum` (updated from `celo`)
- **API Endpoints Used**:
  - `/api/v0/knowledge` - Knowledge base queries
  - `/api/v0/agent` - Conversational AI agent
  - `/api/v0/transaction` - Transaction intent extraction

### SDK Initialization
The SDK initialization has been made **optional** because:
1. Not actually used in the codebase
2. Caused initialization errors when API key is missing
3. REST API provides all needed functionality

### API Key Required
Set in `.env.local`:
```env
NEXT_PUBLIC_BRIAN_API_KEY=your_api_key_here
```

## How It Works

### REST API Calls (No SDK Needed)
All Brian AI functionality is accessed via REST API:

```typescript
// Example: Agent API call with Sepolia chainId
const response = await fetch('https://api.brianknows.org/api/v0/agent', {
  method: 'POST',
  headers: {
    'x-brian-api-key': process.env.NEXT_PUBLIC_BRIAN_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: userPrompt,
    address: userAddress,
    chainId: '11155111', // ✅ Sepolia chain ID
    messages: conversationHistory,
  }),
});
```

### Knowledge Base Queries
```typescript
const response = await fetch('https://api.brianknows.org/api/v0/knowledge', {
  method: 'POST',
  headers: {
    'x-brian-api-key': process.env.NEXT_PUBLIC_BRIAN_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: question,
    kb: 'ethereum', // ✅ Ethereum knowledge base
  }),
});
```

## Testing on Sepolia

✅ **Confirmed Working:**
- Knowledge base queries (`kb: 'ethereum'`)
- Agent conversations (chainId: '11155111')
- Transaction intent extraction
- Strategy analysis
- Market insights

## If Brian AI Doesn't Work

If Brian AI REST API doesn't support Sepolia adequately, alternatives:
1. **OpenAI API** - Chain-agnostic, works with any network
2. **Anthropic Claude** - Excellent for DeFi explanations
3. **Google Gemini** - Free tier available

See `AI_ASSISTANT_OPTIONS.md` for detailed alternatives.

## Current Status

- ✅ **No SDK required** - All functionality via REST API
- ✅ **Sepolia compatible** - Chain ID passed in requests
- ✅ **Ethereum KB** - Using `ethereum` knowledge base
- ⚠️ **API Key required** - Set `NEXT_PUBLIC_BRIAN_API_KEY` environment variable


