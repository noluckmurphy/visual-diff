# Agent Task 3: Image Alignment/Registration

## Objective
Automatically align images with slight crop/position differences to minimize false differences. If images are offset by a few pixels, automatically detect and correct the alignment before comparison.

## Current State
Images are compared pixel-by-pixel at the same position. If one image is cropped or shifted slightly, this creates many false differences even though the images are visually similar.

## Required Changes

### 1. Add Alignment UI Controls
**File:** `visual-diff-app.html`

**Add to controls section (around line 530):**
- Checkbox: "Auto-Align Images" (enable/disable automatic alignment)
- Manual alignment controls (fallback):
  - X Offset slider (-50 to +50 pixels)
  - Y Offset slider (-50 to +50 pixels)
  - "Reset Alignment" button
- Alignment preview toggle: "Show Alignment Preview"

**Add background processing UI:**
- Popover/menu showing background processing tasks
- Display alignment progress
- Show alignment results when complete
- Allow viewing alignment offset values

### 2. Implement Image Registration Algorithm
**File:** `visual-diff-app.html`

**Create alignment function:**
- `findBestAlignment(beforeImage, afterImage)` - Main alignment function
- Use template matching or feature-based approach
- Search for best offset in range (e.g., -50 to +50 pixels in both directions)
- Return optimal X and Y offset values

**Alignment algorithm options:**

**Option A: Template Matching (Simpler)**
- Use normalized cross-correlation
- Search for best match position
- Works well for similar images with translation
- Computationally intensive but straightforward

**Option B: Feature-Based (More Robust)**
- Detect key features/edges in both images
- Match features to find offset
- More complex but handles rotation/scale better

**Recommendation:** Start with template matching for translation-only alignment

### 3. Apply Alignment Before Comparison
**File:** `visual-diff-app.html`

**Modify `processImages()` function (around line 1019):**
- If auto-align is enabled, run alignment first
- Apply alignment offset to before image before comparison
- Store alignment offset for display
- Show alignment preview if enabled

**Alignment application:**
- Create aligned canvas for before image
- Draw before image at offset position
- Use aligned version for comparison
- Handle edge cases (cropping, padding)

### 4. Background Processing Support
**File:** `visual-diff-app.html`

**Add background processing queue:**
- Create popover UI element for background tasks
- Show alignment progress
- Display alignment results (offset values, confidence score)
- Allow user to accept/reject alignment
- Show processing status

**Chunking for large images:**
- Break alignment search into chunks
- Process in batches to avoid blocking
- Update progress during processing
- Use requestAnimationFrame or setTimeout for yielding

### 5. Alignment Preview
**File:** `visual-diff-app.html`

**Add preview functionality:**
- Show before/after images with alignment overlay
- Display offset values
- Show alignment confidence/quality metric
- Allow manual adjustment if auto-alignment isn't good

## Implementation Details

### Template Matching Algorithm
```javascript
function findBestAlignment(img1, img2, searchRange = 50) {
  let bestOffset = { x: 0, y: 0 };
  let bestScore = -Infinity;
  
  // Search in range
  for (let dy = -searchRange; dy <= searchRange; dy++) {
    for (let dx = -searchRange; dx <= searchRange; dx++) {
      const score = calculateCorrelation(img1, img2, dx, dy);
      if (score > bestScore) {
        bestScore = score;
        bestOffset = { x: dx, y: dy };
      }
    }
  }
  
  return bestOffset;
}
```

### Alignment Application
```javascript
// Create aligned canvas
const alignedCanvas = document.createElement('canvas');
alignedCanvas.width = afterImage.width;
alignedCanvas.height = afterImage.height;
const alignedCtx = alignedCanvas.getContext('2d');

// Draw before image at offset
alignedCtx.drawImage(
  beforeImage,
  offset.x, offset.y,
  afterImage.width, afterImage.height,
  0, 0,
  afterImage.width, afterImage.height
);
```

### Background Processing UI
- Create popover element (similar to magnifier)
- Show list of active background tasks
- Display progress bars and status
- Allow cancellation if needed
- Show results when complete

## Files to Modify/Create

1. **Modify:** `visual-diff-app.html`
   - Add alignment UI controls (around line 530)
   - Add alignment functions (new functions)
   - Modify `processImages()` to apply alignment (around line 1019)
   - Add background processing popover UI
   - Add alignment preview functionality

2. **Optional:** Create `alignment-worker.js`
   - If alignment is too slow, move to Web Worker
   - Can leverage Branch 1's worker infrastructure if available
   - Otherwise, use chunking in main thread

## Testing Requirements

1. **Crop Differences:** Test with images offset by 1-50 pixels
2. **False Positive Reduction:** Verify alignment reduces false differences
3. **Various Image Types:** Test with photos, UI screenshots, AI-generated images
4. **Large Images:** Test performance with large images (may need chunking)
5. **Edge Cases:** Test with very different images (should not align incorrectly)
6. **Manual Override:** Test manual alignment controls work correctly
7. **Preview:** Verify alignment preview shows correct offset

## Success Criteria

- ✅ Auto-alignment detects and corrects small offsets (1-50px)
- ✅ Alignment reduces false positive differences
- ✅ Manual alignment controls work as fallback
- ✅ Background processing UI shows alignment progress
- ✅ Alignment preview displays correctly
- ✅ Performance acceptable for large images (or chunked appropriately)
- ✅ No incorrect alignment for very different images

## Notes

- This is computationally intensive - consider chunking or Web Workers
- Can leverage Branch 1's Web Worker infrastructure if available
- Template matching is simpler to implement than feature-based
- Search range should be configurable (default 50px)
- Consider adding rotation detection if needed (more complex)
- Alignment should be optional (checkbox) - not always needed
- May want to add confidence threshold to reject poor alignments

