# Backend AI Setup - Claude Integration

## Overview

The frontend has been updated to use **Claude via the Backend API** using the **exact same pattern as Smooth**. This uses the same environment variables, same API key, and same Claude client initialization.

## Frontend Changes

✅ **Completed:**
- Created `backendAIService.ts` - Service that routes AI calls through backend
- Updated `WorkflowBuilder.tsx` to use `backendAIService` instead of `geminiService`
- Added API endpoints in `api.ts`:
  - `POST /api/ai/execute` - Execute workflow steps with reasoning
  - `POST /api/ai/generate-block` - Generate new workflow blocks

## Backend Implementation

✅ **Completed:**
- Added endpoints to `api_server.py` using **exact same pattern as `workflow_engine.py`**
- Uses same `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` from `.env` file
- Uses same `Anthropic` client initialization
- Uses same API call pattern: `client.messages.create()`

The endpoints are already implemented in your backend at:
- `POST /api/ai/execute` 
- `POST /api/ai/generate-block`

## Environment Variables

The backend uses the **exact same `.env` file** as Smooth:

```env
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
```

These are loaded via `config.py` using `dotenv`, exactly like Smooth does.

## How It Works

The implementation uses the **exact same code pattern** as `workflow_engine.py`:

1. **Load config**: `cfg.ANTHROPIC_API_KEY` and `cfg.ANTHROPIC_MODEL` from `.env`
2. **Initialize client**: `client = Anthropic(api_key=cfg.ANTHROPIC_API_KEY)`
3. **Make API call**: `client.messages.create(model=cfg.ANTHROPIC_MODEL, max_tokens=4000, messages=[...])`
4. **Extract response**: `response.content[0].text`

## Testing

The endpoints are ready to use. No additional backend setup needed - just ensure your `.env` file has:
- `ANTHROPIC_API_KEY` set
- `ANTHROPIC_MODEL` set (defaults to `claude-sonnet-4-5-20250929`)

---

## Old Documentation (for reference)

You need to implement these endpoints in your backend API:

### 1. `POST /api/ai/execute`

**Purpose:** Execute a workflow step using Claude with reasoning trace

**Request Body:**
```json
{
  "prompt": "Analyze the market trends for Q4...",
  "context_data": "Previous step output or input data"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reasoning": "I'm analyzing market trends using Porter's Five Forces framework...",
    "output": "Market Analysis Results:\n1. Competitive intensity is high...\n2. Barriers to entry are moderate..."
  }
}
```

**OR** (if backend returns formatted text with separators):
```json
{
  "success": true,
  "data": {
    "text": "===REASONING===\nI'm analyzing...\n===OUTPUT===\nResults here..."
  }
}
```

**Backend Implementation Notes:**
- Use Claude API (configured via `anthropic_api_key` from config)
- Use the model specified in config (`anthropic_model`, default: `claude-sonnet-4-5-20250929`)
- Structure the prompt to include:
  - The user's workflow step prompt
  - Context from previous steps
  - Instructions to return reasoning and output with separators
- Return both reasoning trace and final output

**Example Backend Code (Python/Flask):**
```python
@app.route('/api/ai/execute', methods=['POST'])
def execute_ai():
    data = request.json
    prompt = data.get('prompt', '')
    context_data = data.get('context_data', '')
    
    # Get Claude config from your config system
    config = get_config()
    api_key = config.get('anthropic_api_key')
    model = config.get('anthropic_model', 'claude-sonnet-4-5-20250929')
    
    if not api_key:
        return jsonify({
            'success': False,
            'error': 'Claude API key not configured'
        }), 400
    
    # Build full prompt
    full_prompt = f"""You are an expert strategy consultant (McKinsey/Bain/BCG style).

Your task is to execute the following step in a workflow:
"{prompt}"

Context Data:
{context_data}

Structure your response EXACTLY as follows using these separators:

===REASONING===
(Explain your thought process here. What frameworks are you using? What patterns are you seeing? Be transparent.)

===OUTPUT===
(The final deliverable. High quality, structured, professional.)
"""
    
    # Call Claude API
    from anthropic import Anthropic
    client = Anthropic(api_key=api_key)
    
    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": full_prompt
        }]
    )
    
    response_text = message.content[0].text
    
    # Parse reasoning and output
    reasoning_match = re.search(r'===REASONING===([\s\S]*?)===OUTPUT===', response_text)
    output_match = re.search(r'===OUTPUT===([\s\S]*)', response_text)
    
    reasoning = reasoning_match.group(1).strip() if reasoning_match else "Reasoning process executed."
    output = output_match.group(1).strip() if output_match else response_text
    
    return jsonify({
        'success': True,
        'data': {
            'reasoning': reasoning,
            'output': output
        }
    })
```

### 2. `POST /api/ai/generate-block`

**Purpose:** Generate a new workflow block definition based on user intent

**Request Body:**
```json
{
  "intent": "Create a block that analyzes customer feedback"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "title": "Customer Feedback Analyzer",
    "category": "Analysis",
    "description": "Analyzes customer feedback to extract key themes and sentiment",
    "defaultPrompt": "Analyze the provided customer feedback. Identify the top 5 recurring themes, sentiment scores, and actionable recommendations.",
    "inputRequirements": ["Customer Feedback (Text/CSV)", "Survey Data"]
  }
}
```

**Backend Implementation Notes:**
- Use Claude to generate block definitions
- Ensure category is one of: `Discovery`, `Analysis`, `Recommendations`, `Implementation`, `Evaluation`
- Return structured JSON that matches `PromptBlock` interface

**Example Backend Code:**
```python
@app.route('/api/ai/generate-block', methods=['POST'])
def generate_block():
    data = request.json
    intent = data.get('intent', '')
    
    config = get_config()
    api_key = config.get('anthropic_api_key')
    model = config.get('anthropic_model', 'claude-sonnet-4-5-20250929')
    
    if not api_key:
        return jsonify({
            'success': False,
            'error': 'Claude API key not configured'
        }), 400
    
    prompt = f"""Create a consulting workflow block definition for the following user request: "{intent}".

Return ONLY a JSON object with keys: title, category (one of: Discovery, Analysis, Recommendations, Implementation, Evaluation), description (short), defaultPrompt (detailed), inputRequirements (array of strings representing data needed).

JSON:"""
    
    from anthropic import Anthropic
    client = Anthropic(api_key=api_key)
    
    message = client.messages.create(
        model=model,
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": prompt
        }]
    )
    
    # Parse JSON from response
    response_text = message.content[0].text
    # Extract JSON (might be wrapped in markdown code blocks)
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
        block_data = json.loads(json_match.group(0))
    else:
        return jsonify({
            'success': False,
            'error': 'Failed to parse block definition'
        }), 500
    
    return jsonify({
        'success': True,
        'data': block_data
    })
```

## Configuration

Ensure your backend has:
1. **Anthropic API Key** configured (via `/api/config` endpoint)
2. **Anthropic Model** selected (default: `claude-sonnet-4-5-20250929`)
3. **CORS** enabled for your frontend domain
4. **Error handling** for missing API keys

## Testing

1. **Test AI Execution:**
   ```bash
   curl -X POST http://localhost:5001/api/ai/execute \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Analyze market trends", "context_data": "Test data"}'
   ```

2. **Test Block Generation:**
   ```bash
   curl -X POST http://localhost:5001/api/ai/generate-block \
     -H "Content-Type: application/json" \
     -d '{"intent": "Create a customer feedback analyzer"}'
   ```

## Benefits

✅ **Security:** API keys stay on backend, never exposed to frontend
✅ **Consistency:** All AI calls use the same Claude model
✅ **Centralized:** Easy to switch models or add rate limiting
✅ **Better Control:** Backend can add caching, logging, etc.

## Migration Notes

- Frontend will gracefully fallback if backend endpoints are unavailable
- Old `geminiService` is still available but not used
- You can remove `GEMINI_API_KEY` from frontend environment variables once backend is ready
