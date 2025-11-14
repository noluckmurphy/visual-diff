# Three Branch Enhancement Plan

This plan splits three major enhancements into separate branches, each workable independently by different agents.

## Branch 1: Performance Improvements (Web Workers)

**Branch Name:** `feature/performance-web-workers`

**Goal:** Move heavy image processing to Web Workers to prevent browser "wait on tab" warnings and improve responsiveness for large images.

**Key Changes:**
- Create `image-processor-worker.js` Web Worker file
- Move `pixelmatch()`, `blockCompare()`, `applyGaussianBlur()`, and `applyMorphology()` to worker
- Implement message passing between main thread and worker
- Add progress reporting from worker to main thread
- Update `processImages()` to orchestrate worker communication
- Add background processing indicator UI (popover menu showing active processes)
- Keep UI responsive during processing

**Files to Modify:**
- `visual-diff-app.html` - Main file (add worker initialization, message handling)
- Create `image-processor-worker.js` - New worker file

**Testing Focus:**
- Large images (e.g., 4K photos from device)
- Verify no browser tab warnings
- UI remains interactive during processing
- Progress updates work correctly

---

## Branch 2: Flexible Matching with Gradient Heatmap

**Branch Name:** `feature/flexible-matching-gradient`

**Goal:** Improve "close enough" detection with flexible matching modes and gradient heatmap showing magnitude of differences.

**Key Changes:**
- Enhance `pixelmatch()` to return difference magnitude (not just binary)
- Add "Flexible Matching" mode toggle (new UI control)
- Implement perceptual matching algorithm (SSIM-inspired or similar)
- Update heatmap mode to use gradient based on actual difference magnitude
- Add "Difference Intensity" visualization mode (separate from current heatmap)
- Update `intensityToHeatColor()` to properly map magnitude to colors
- Store magnitude data in diff array instead of binary 0/255
- Add controls for flexible matching sensitivity

**Files to Modify:**
- `visual-diff-app.html` - Update comparison logic, add UI controls, enhance heatmap rendering

**Testing Focus:**
- Verify gradient heatmap shows smooth color transitions
- Test flexible matching with various image types
- Ensure "very different" vs "pretty close" areas are visually distinct
- Compare results with current strict matching

---

## Branch 3: Image Alignment/Registration

**Branch Name:** `feature/image-alignment-registration`

**Goal:** Automatically align images with slight crop/position differences to minimize false differences.

**Key Changes:**
- Add "Auto-Align" checkbox in controls section
- Implement image registration algorithm (template matching or feature-based)
- Add background processing queue UI (popover menu for background tasks)
- Create alignment worker for computationally intensive alignment
- Add manual alignment controls (X/Y offset sliders) as fallback
- Store alignment offset and apply before comparison
- Show alignment preview before processing
- Add "Alignment Results" view in background processing popover

**Files to Modify:**
- `visual-diff-app.html` - Add alignment UI, registration logic, background task UI
- Create `alignment-worker.js` - New worker for alignment processing (optional, can be in main thread with chunking)

**Testing Focus:**
- Images with 1-50px crop differences
- Verify alignment reduces false positives
- Test with various image types and sizes
- Performance with large images (may need chunking)

---

## Implementation Strategy

### Branch Independence
Each branch can be developed independently:
- **Branch 1** doesn't require changes to matching logic
- **Branch 2** works with current processing (can add worker later)
- **Branch 3** can use current processing or integrate with Branch 1's workers

### Merge Order Recommendation
1. Merge Branch 1 first (performance foundation)
2. Merge Branch 2 (matching improvements)
3. Merge Branch 3 last (can leverage workers from Branch 1)

### Shared UI Components
- Background processing popover (Branch 1 & 3 both need this)
- Consider extracting to shared pattern if both branches merge

### Conflict Prevention
- Each branch touches different code sections
- Branch 1: Worker setup, message passing
- Branch 2: Comparison algorithms, heatmap rendering
- Branch 3: Alignment logic, registration algorithms
- Minimal overlap expected

---

## Additional Enhancements (Future Consideration)

Beyond the three main enhancements, consider:
- Export functionality (download results)
- Real-time preview (debounced settings updates)
- Side-by-side view mode
- Comparison presets
- Region selection/interaction
- Keyboard shortcuts
- Drag and drop uploads

