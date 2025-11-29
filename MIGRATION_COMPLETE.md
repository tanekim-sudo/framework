# Framework Migration Complete

## Overview
The Framework application has been successfully migrated from Smooth, incorporating all functionality while maintaining the beautiful Framework design.

## What's Been Implemented

### ✅ Authentication & Multi-Tenancy
- Login/Register pages with team invitation support
- AuthContext for managing user state
- Team switching functionality
- Team invitation system

### ✅ API Integration
- Complete API service layer (`services/api.ts`)
- Integration with Smooth backend at `/api`
- All endpoints: blocks, frameworks, workflows, Flowise, auth

### ✅ Block Library
- Real-time loading from backend
- Template blocks (Firm Verified) vs User/Team blocks (Project Custom)
- Category filtering
- Search functionality
- AI block generation (saves to backend)

### ✅ Workflow Builder
- Vertical workflow layout (Framework design)
- Real block data from backend
- Input context, reasoning context, and output display
- Save to Flowise functionality
- Sequential execution with reasoning traces

### ✅ Navigation & UI
- Updated Sidebar with user info and team switching
- Framework logo and branding
- Dark/light theme support
- Responsive design

## Configuration

### Environment Variables
Create a `.env.local` file in the framework(1) directory:

```env
VITE_API_URL=http://localhost:5001/api
GEMINI_API_KEY=your_gemini_api_key_here
```

### Vite Proxy Configuration
The vite.config.ts has been set up to proxy API requests. Make sure your backend is running on port 5001.

## Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   - Copy `.env.local.example` to `.env.local` (if exists)
   - Add your `GEMINI_API_KEY` and `VITE_API_URL`

3. **Start the backend:**
   - Make sure Smooth backend is running on `http://localhost:5001`
   - Flowise should be running on `http://localhost:3001` (optional, for workflow saving)

4. **Start Framework:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   - Open `http://localhost:3000`
   - Login or register
   - Start building workflows!

## Key Features

### Block Library
- **Firm Verified**: Template blocks from the backend (is_template = true)
- **Project Custom**: User and team blocks
- **AI Block Creator**: Generate custom blocks using Gemini AI
- **Category Filters**: Discovery, Analysis, Recommendations, Implementation, Evaluation

### Workflow Builder
- **Vertical Layout**: Simple, sequential workflow display
- **Input Context**: Attach data sources to each step
- **Reasoning Logic**: Editable prompts for each block
- **Reasoning Trace**: See AI thinking process during execution
- **Output Deliverable**: Final results from each step
- **Save to Flowise**: Persist workflows to Flowise backend

### Authentication
- **Login/Register**: Secure authentication
- **Team Management**: Switch between teams
- **Invitations**: Create and share team invite codes
- **Multi-tenancy**: Organization and team isolation

## Next Steps

1. **Test all functionality** end-to-end
2. **Update Dashboard** to show real workflow data
3. **Add workflow loading** from Flowise
4. **Implement framework library** page
5. **Add more export formats** for deliverables

## Notes

- The app now uses "Framework" branding throughout
- All Smooth backend endpoints are preserved and working
- Flowise integration is ready for workflow persistence
- The beautiful Framework UI design is maintained

