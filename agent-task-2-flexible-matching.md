# Agent Task 2: Flexible Matching with Gradient Heatmap

## Objective
Improve "close enough" detection with flexible matching modes and enhance heatmap visualization to show magnitude of differences using a gradient (distinguishing "VERY DIFFERENT" from "pretty close, but still different").

## Current State
- `pixelmatch()` returns binary results (0 or 255) - doesn't capture magnitude
- Heatmap mode exists but may not be working as expected
- Block comparison helps but may still be too strict
- No way to distinguish between "very different" and "slightly different" areas

## Required Changes

### 1. Enhance Difference Detection
**File:** `visual-diff-app.html`

**Modify `pixelmatch()` function (around line 630):**
- Instead of storing binary 0/255, store actual difference magnitude (0-255)
- Calculate `delta` value (already computed) and store it directly
- Return magnitude array instead of just counting differences
- Keep threshold for "is different" but store magnitude for visualization

**Modify `blockCompare()` function (around line 1201):**
- Store magnitude of block difference instead of binary
- Calculate and store delta value for each block
- Apply to all pixels in the block

### 2. Add Flexible Matching Mode
**File:** `visual-diff-app.html`

**Add new UI control:**
- Add checkbox/toggle: "Flexible Matching Mode" in controls section
- Add sensitivity slider for flexible matching (if needed)
- Place near "Use block comparison" checkbox

**Implement flexible matching algorithm:**
- When enabled, use perceptual matching approach
- Consider local neighborhood when determining if pixels match
- Use SSIM-inspired approach or local variance comparison
- Allow slight variations in similar regions to be considered "close enough"

### 3. Fix and Enhance Heatmap Mode
**File:** `visual-diff-app.html`

**Update `intensityToHeatColor()` function (around line 1380):**
- Ensure it properly maps magnitude (0-255) to heat colors
- Verify gradient transitions are smooth
- Test that it's being called with actual magnitude values

**Update heatmap rendering (around line 1128):**
- Use stored magnitude values from diff array (not binary)
- Map magnitude directly to heat colors
- Ensure gradient shows: Blue (small differences) → Cyan → Green → Yellow → Red (large differences)

**Fix heatmap mode display:**
- Verify heatmap mode actually uses the magnitude data
- Ensure it's visually distinct from overlay mode
- Test that gradient is smooth and meaningful

### 4. Add Difference Intensity Visualization
**File:** `visual-diff-app.html`

**Enhance visualization modes:**
- Keep existing "Overlay Mode" and "Heatmap Mode"
- Ensure heatmap mode properly shows gradient based on magnitude
- Consider adding third mode "Intensity Mode" if needed (or enhance existing heatmap)

**Update overlay mode:**
- Optionally use magnitude to adjust opacity (more different = more opaque)
- Or keep current binary overlay behavior

## Implementation Details

### Magnitude Storage
```javascript
// Instead of:
output[idx] = isDifferent ? 255 : 0;

// Store:
output[idx] = Math.min(255, Math.floor(delta * 255 / threshold));
// Or similar magnitude-preserving calculation
```

### Flexible Matching Algorithm
Consider implementing:
- Local variance comparison (compare pixel neighborhoods)
- Perceptual color distance (already using YIQ, enhance it)
- Adaptive threshold based on local image characteristics
- SSIM-inspired structural similarity

### Heatmap Color Mapping
Ensure gradient properly represents:
- **Blue (0-63)**: Very similar, barely different
- **Cyan (64-127)**: Slightly different
- **Green (128-191)**: Moderately different
- **Yellow (192-223)**: Quite different
- **Red (224-255)**: Very different

## Files to Modify

1. **Modify:** `visual-diff-app.html`
   - Update `pixelmatch()` function (line ~630)
   - Update `blockCompare()` function (line ~1201)
   - Add flexible matching UI controls (around line 530)
   - Update `intensityToHeatColor()` function (line ~1380)
   - Update heatmap rendering (line ~1128)
   - Update overlay rendering if using magnitude (line ~1096)

## Testing Requirements

1. **Gradient Heatmap:** Verify smooth color transitions based on difference magnitude
2. **Flexible Matching:** Test with various image types, ensure "close enough" areas are detected
3. **Visual Distinction:** Ensure "very different" vs "pretty close" areas are clearly distinguishable
4. **Comparison:** Compare results with current strict matching
5. **Mode Switching:** Test switching between overlay and heatmap modes
6. **Block Comparison:** Verify block comparison still works with magnitude storage

## Success Criteria

- ✅ Heatmap shows smooth gradient based on actual difference magnitude
- ✅ "Very different" areas appear red, "slightly different" appear blue/cyan
- ✅ Flexible matching mode allows "close enough" detection
- ✅ Magnitude data is properly stored and used throughout
- ✅ Heatmap mode works correctly and is visually distinct from overlay
- ✅ No regression in existing functionality

## Notes

- This enhancement focuses on matching algorithms and visualization
- Can be developed independently (doesn't require Web Workers)
- May benefit from Web Workers (Branch 1) but not required
- Test with various image types (AI-generated, photos, UI screenshots)
- Consider user feedback on what "close enough" means visually

