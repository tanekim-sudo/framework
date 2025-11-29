# Backend API Dependency

## Important Note

The Framework frontend requires the Smooth backend API to run. The backend is a Python/Flask application that provides:

- Database (SQLite with 106 prebuilt template blocks)
- Authentication & authorization
- API endpoints for blocks, workflows, frameworks
- Flowise integration
- Configuration & outputs management

## Backend Location

The backend API should run from: `C:\Users\tanek\Downloads\smoothproto\smoothv1\`

**Start the backend:**
```powershell
cd "C:\Users\tanek\Downloads\smoothproto\smoothv1"
python start_backend_port5001.py
```

Or use the PowerShell script:
```powershell
.\start_backend.ps1
```

## Framework Configuration

Framework is configured to proxy API requests to `http://localhost:5001` (see `vite.config.ts`).

The backend must be running for Framework to function properly.

## Database

The database file is: `smoothv1/smooth.db`
- Contains 106 template/prebuilt blocks
- Contains user data, teams, organizations
- Contains saved workflows and frameworks

## Future Consideration

If you want to fully self-contain everything in Framework folder, you would need to:
1. Move backend Python code to Framework folder
2. Update paths and imports
3. Keep the database in Framework folder

However, the current setup (separate backend) is a standard architecture and works well.

