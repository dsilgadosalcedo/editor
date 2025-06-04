# localStorage Security: Project Limit Enforcement

## Problem

Users could potentially bypass the 10-project limit by manipulating localStorage directly through browser developer tools:

1. Open browser dev tools
2. Go to Application > Local Storage
3. Modify the `canvas-projects` key to add more than 10 projects
4. Refresh the page
5. App would load all projects, bypassing the limit

## Solution

Implemented a comprehensive validation system that enforces the project limit at multiple layers:

### 1. **Load-Time Validation** (`getProjects()`)

Every time projects are loaded from localStorage, the system:

- Validates the data structure of each project
- Removes invalid/corrupted projects
- **Enforces the 10-project limit** by keeping only the most recently updated projects
- Automatically saves the cleaned/limited data back to localStorage

### 2. **Manipulation Detection** (`validateAndFixLocalStorage()`)

Provides detailed analysis of localStorage state:

- Detects when more than 10 projects were found
- Reports how many excess projects were removed
- Identifies and removes invalid data structures
- Returns comprehensive statistics for logging and user feedback

### 3. **Real-Time Monitoring** (in `useHybridProjects`)

For unauthenticated users:

- **Initial load validation**: Checks localStorage when component mounts
- **Refresh validation**: Validates when projects list is manually refreshed
- **Operation validation**: Validates during any project operation
- **User feedback**: Shows warning toasts when manipulation is detected

### 4. **Multi-Layer Protection**

The system protects against:

- ✅ Adding excess projects via dev tools
- ✅ Corrupted/invalid project data
- ✅ Malformed JSON in localStorage
- ✅ Wrong data types in project fields
- ✅ Missing required project properties
- ✅ Ongoing manipulation attempts during app usage

## Implementation Details

### Core Functions

**`getProjects()`**: Enhanced with validation

```typescript
// Before: Simple JSON parse
return stored ? JSON.parse(stored) : [];

// After: Comprehensive validation
- Validates JSON structure
- Validates each project's data types and required fields
- Enforces 10-project limit automatically
- Auto-saves cleaned data back to localStorage
```

**`validateAndFixLocalStorage()`**: Manipulation detection

```typescript
return {
  wasManipulated: boolean, // True if >10 projects found
  originalCount: number, // Projects found in localStorage
  finalCount: number, // Projects after validation
  removedCount: number, // How many were removed
  hadInvalidData: boolean, // True if invalid data was found
};
```

### User Experience

**For legitimate users**: Transparent operation, no interruption
**For manipulation attempts**: Clear feedback without breaking the app

```typescript
// Example user feedback
toast.warning(
  "Project limit enforced: Removed 15 excess projects. Maximum allowed: 10 projects."
);
```

### Performance Considerations

- **Validation is fast**: O(n) where n is number of projects
- **Smart detection**: Only shows warnings when actual manipulation is detected
- **Minimal overhead**: Validation happens during normal project loading and operations
- **No background processes**: No periodic checks or timers running

## Security Benefits

1. **Prevents resource abuse**: Users can't create unlimited local projects
2. **Maintains data integrity**: Invalid projects are automatically removed
3. **Consistent limits**: Same 10-project limit applies regardless of how projects are added
4. **Transparent enforcement**: Users understand why projects were removed
5. **Operation-based protection**: Catches manipulation attempts during normal app usage

## Testing

Use the provided test script (`test-localStorage-security.js`) to verify protection:

```bash
# Test with 25 fake projects
node test-localStorage-security.js
```

Expected output:

```
🚨 SECURITY: Successfully detected and prevented localStorage manipulation!
   - Original count: 25
   - Removed: 15
   - Final count: 10
```

## Constants

All project limits use the centralized constant:

```typescript
export const MAX_PROJECTS = 10; // lib/project-storage.ts
```

To change the limit, update this single constant and the entire system will adapt.

## Backwards Compatibility

The validation system is backwards compatible with existing localStorage data:

- Existing valid projects are preserved
- Only excess or invalid projects are removed
- No breaking changes to existing functionality
