# Flowise Integration - Optimized & Seamless

## Overview
Flowise is now fully integrated into Framework in the most seamless and useful way possible. The integration leverages Flowise's full capabilities while maintaining Framework's beautiful UI.

## Key Optimizations

### 1. **Proper Flowise Node Structure**
Instead of just creating basic LLM nodes, we now use Flowise's proper node architecture:
- **PromptTemplate Nodes**: Each Framework block becomes a PromptTemplate node with proper input variables
- **LLM Nodes**: Connected to PromptTemplate nodes for execution
- **Edge Connections**: Properly connects previous step outputs to next step inputs
- **Metadata Preservation**: Framework block data is preserved in Flowise nodes

### 2. **Dual Execution Modes**
- **Flowise Execution** (Preferred): When workflow is saved and Flowise is available
  - Uses Flowise's execution engine
  - Better error handling and streaming support
  - Leverages Flowise's node system
- **Direct Execution** (Fallback): When Flowise is unavailable
  - Falls back to direct Gemini API calls
  - Maintains Framework's reasoning trace display
  - Works even without Flowise

### 3. **Seamless Save/Load**
- **Save to Flowise**: One-click save with proper format conversion
- **Load from Flowise**: Browse and load saved workflows
- **Auto-sync**: Workflow list refreshes after save
- **Status Indicators**: Shows if workflow is saved or not

### 4. **Smart Workflow Conversion**
```typescript
Framework Block → PromptTemplate Node → LLM Node → Output
```
- Each Framework step becomes a proper Flowise workflow
- Input variables are preserved
- Custom prompts are maintained
- Sequential execution is properly mapped

### 5. **User Experience Enhancements**
- **Load Dialog**: Beautiful modal to browse saved workflows
- **Status Badge**: Shows "Saved" when workflow is in Flowise
- **Smart Execution**: Automatically uses Flowise if available
- **Error Handling**: Graceful fallback if Flowise fails

## How It Works

### Saving a Workflow
1. User builds workflow in Framework UI
2. Clicks "Save" button
3. Framework converts steps to Flowise format:
   - Creates PromptTemplate nodes for each block
   - Creates LLM nodes connected to prompts
   - Connects nodes sequentially
4. Saves to Flowise via API
5. Updates status indicator

### Loading a Workflow
1. User clicks "Load" button
2. Framework fetches all saved chatflows from Flowise
3. Displays them in a beautiful dialog
4. User selects a workflow
5. Framework converts Flowise format back to Framework steps
6. Reconstructs the workflow in Framework UI

### Executing a Workflow
1. If saved to Flowise and Flowise is available:
   - Uses Flowise execution API
   - Better performance and error handling
   - Supports streaming (future enhancement)
2. If not saved or Flowise unavailable:
   - Falls back to direct Gemini execution
   - Still shows reasoning traces
   - Maintains Framework UI experience

## Benefits

### For Users
- **Seamless Experience**: Flowise is invisible - it just works
- **Best of Both Worlds**: Framework UI + Flowise execution
- **Reliability**: Fallback ensures it always works
- **Persistence**: Workflows saved to Flowise are never lost

### For Developers
- **Clean Architecture**: Proper separation of concerns
- **Extensible**: Easy to add more Flowise features
- **Maintainable**: Clear conversion functions
- **Testable**: Each component can be tested independently

## Future Enhancements

1. **Streaming Execution**: Real-time output as Flowise processes
2. **Flowise Node Library**: Access Flowise's full node catalog
3. **Visual Flowise Editor**: Option to edit in Flowise UI
4. **Workflow Versioning**: Track changes over time
5. **Collaboration**: Share workflows via Flowise
6. **Analytics**: Use Flowise's execution analytics

## Configuration

Ensure Flowise is running and configured:
```env
VITE_API_URL=http://localhost:5001
```

Backend should have Flowise configured:
```python
FLOWISE_BASE_URL=http://localhost:3001
FLOWISE_API_KEY=your_key
```

## Status Indicators

- **"Saved to Flowise"**: Workflow is saved and ready
- **"Not saved"**: Workflow exists only in Framework
- **"Flowise unavailable"**: Flowise is not running
- **"Saved" badge**: Visual indicator when workflow is saved

## Best Practices

1. **Save Early, Save Often**: Save workflows to Flowise regularly
2. **Use Flowise Execution**: Prefer Flowise execution when available
3. **Name Workflows**: Give meaningful names for easy loading
4. **Check Status**: Monitor Flowise status indicator
5. **Load Before Editing**: Load saved workflows to continue work

## Technical Details

### Node Conversion
- Framework blocks → Flowise PromptTemplate nodes
- Custom prompts → Template strings with variables
- Input requirements → Input variables array
- Sequential steps → Connected node edges

### Execution Flow
1. Check if Flowise is available
2. Check if workflow is saved
3. If both true: Use Flowise execution
4. Otherwise: Use direct Gemini execution
5. Display results in Framework UI

This integration makes Flowise feel like a native part of Framework, not a separate tool!

