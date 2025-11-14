# Agent Task 1: Performance Improvements with Web Workers

## Objective
Move heavy image processing operations to Web Workers to prevent browser "wait on tab" warnings and improve responsiveness for large images (e.g., 4K photos from device).

## Current State
All image processing happens on the main thread in `processImages()` function, causing the browser to show "wait on tab" warnings for large images. The UI updates but other operations are blocked.

## Required Changes

### 1. Create Web Worker File
**File:** `image-processor-worker.js` (new file)

Move these functions from `visual-diff-app.html` to the worker:
- `pixelmatch()` - Pixel comparison algorithm
- `blockCompare()` - Block-based comparison
- `applyGaussianBlur()` - Blur preprocessing
- `applyMorphology()` - Morphological operations
- `labelRegions()` - Connected components labeling
- `floodFill()` - Flood fill algorithm
- Helper functions: `rgbToY()`, `rgbToI()`, `rgbToQ()`

### 2. Implement Message Passing
**File:** `image-processor-worker.js`

- Listen for messages from main thread with:
  - `beforeImageData` (ImageData)
  - `afterImageData` (ImageData)
  - Processing settings (threshold, blurRadius, useBlockComparison, blockSize, minRegionSize, width, height)
- Process images using moved functions
- Send progress updates during processing (e.g., every 10% complete)
- Send final result with:
  - `diff` array (Uint8Array)
  - `numDiffPixels` (number)
  - `processed` array (Uint8Array) - result of morphology

### 3. Update Main Thread
**File:** `visual-diff-app.html`

**Changes to `processImages()` function:**
- Create worker instance: `const worker = new Worker('image-processor-worker.js')`
- Convert ImageData to transferable format (use `ImageData.data.buffer` for transfer)
- Send processing job to worker
- Listen for progress updates and update UI
- Listen for completion and render results
- Handle errors gracefully
- Terminate worker when done

**Add progress UI:**
- Update `loadingProgress` element with worker progress messages
- Show percentage complete if available

**Add background processing indicator:**
- Create popover/menu showing active background processes
- Display when worker is processing
- Show status and progress

### 4. Keep UI Responsive
- Ensure all UI interactions remain functional during processing
- Update loading spinner/progress text
- Allow cancellation if needed (optional enhancement)

## Implementation Details

### Worker Message Format
```javascript
// Main thread -> Worker
{
  type: 'process',
  beforeImageData: ImageData,
  afterImageData: ImageData,
  settings: {
    threshold: number,
    blurRadius: number,
    useBlockComparison: boolean,
    blockSize: number,
    minRegionSize: number,
    width: number,
    height: number
  }
}

// Worker -> Main thread (progress)
{
  type: 'progress',
  message: string,
  percent: number
}

// Worker -> Main thread (complete)
{
  type: 'complete',
  diff: Uint8Array,
  numDiffPixels: number,
  processed: Uint8Array
}

// Worker -> Main thread (error)
{
  type: 'error',
  message: string
}
```

### Key Considerations
- Use `transferable` objects for ImageData to avoid copying large arrays
- Handle worker errors (e.g., file not found, processing errors)
- Ensure worker cleanup (terminate after use)
- Maintain backward compatibility with existing UI code
- Keep visualization code (overlay/heatmap rendering) on main thread

## Files to Modify/Create

1. **Create:** `image-processor-worker.js`
2. **Modify:** `visual-diff-app.html`
   - Update `processImages()` function (around line 1019)
   - Add worker initialization and message handling
   - Update progress UI elements
   - Add background processing indicator UI

## Testing Requirements

1. **Large Images:** Test with 4K+ resolution images from device
2. **No Tab Warnings:** Verify browser doesn't show "wait on tab" warnings
3. **UI Responsiveness:** Confirm UI remains interactive during processing
4. **Progress Updates:** Verify progress messages appear correctly
5. **Error Handling:** Test with invalid inputs, missing worker file
6. **Results Accuracy:** Compare results with current main-thread implementation (should be identical)

## Success Criteria

- ✅ No browser tab warnings for large images
- ✅ UI remains fully responsive during processing
- ✅ Progress updates visible to user
- ✅ Processing results identical to current implementation
- ✅ Worker properly cleaned up after processing
- ✅ Error handling works correctly

## Notes

- This is a performance enhancement - functionality should remain the same
- Can be developed independently of other branches
- Worker file must be in same directory as HTML file (or adjust path)
- Consider browser compatibility (Web Workers supported in all modern browsers)

