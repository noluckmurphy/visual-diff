// Web Worker for image processing
// Handles heavy computation to keep main thread responsive

// YIQ color space conversion for better perceptual difference detection
function rgbToY(r, g, b) {
    return r * 0.29889531 + g * 0.58662247 + b * 0.11448223;
}

function rgbToI(r, g, b) {
    return r * 0.59597799 - g * 0.27417610 - b * 0.32180189;
}

function rgbToQ(r, g, b) {
    return r * 0.21147017 - g * 0.52261711 + b * 0.31114694;
}

// Pixelmatch implementation with flexible matching support
function pixelmatch(img1, img2, output, width, height, options) {
    options = options || {};
    const threshold = options.threshold === undefined ? 0.1 : options.threshold;
    const includeAA = options.includeAA !== undefined ? options.includeAA : true;
    const useFlexibleMatching = options.useFlexibleMatching || false;
    const flexibleSensitivity = options.flexibleSensitivity || 0.8;

    let diff = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4;
            
            // Get RGB values
            const r1 = img1[pos];
            const g1 = img1[pos + 1];
            const b1 = img1[pos + 2];
            const a1 = img1[pos + 3];
            
            const r2 = img2[pos];
            const g2 = img2[pos + 1];
            const b2 = img2[pos + 2];
            const a2 = img2[pos + 3];
            
            // If alpha channels are different, consider it different
            if (Math.abs(a1 - a2) > 1) {
                if (output) {
                    output[y * width + x] = 255;
                }
                diff++;
                continue;
            }
            
            let delta;
            
            if (useFlexibleMatching) {
                // SSIM-inspired perceptual matching
                // Consider local neighborhood for structural similarity
                let localSimilarity = 0;
                let count = 0;
                
                for (let wy = -1; wy <= 1; wy++) {
                    for (let wx = -1; wx <= 1; wx++) {
                        const nx = x + wx;
                        const ny = y + wy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const npos = (ny * width + nx) * 4;
                            
                            // Calculate local difference
                            const nr1 = img1[npos];
                            const ng1 = img1[npos + 1];
                            const nb1 = img1[npos + 2];
                            
                            const nr2 = img2[npos];
                            const ng2 = img2[npos + 1];
                            const nb2 = img2[npos + 2];
                            
                            const nyDiff = rgbToY(nr1, ng1, nb1) - rgbToY(nr2, ng2, nb2);
                            const niDiff = rgbToI(nr1, ng1, nb1) - rgbToI(nr2, ng2, nb2);
                            const nqDiff = rgbToQ(nr1, ng1, nb1) - rgbToQ(nr2, ng2, nb2);
                            
                            const nDelta = Math.sqrt(nyDiff * nyDiff + niDiff * niDiff + nqDiff * nqDiff);
                            localSimilarity += nDelta;
                            count++;
                        }
                    }
                }
                
                const avgLocalSimilarity = localSimilarity / count;
                
                // Calculate pixel difference
                const yDiff = rgbToY(r1, g1, b1) - rgbToY(r2, g2, b2);
                const iDiff = rgbToI(r1, g1, b1) - rgbToI(r2, g2, b2);
                const qDiff = rgbToQ(r1, g1, b1) - rgbToQ(r2, g2, b2);
                
                const pixelDelta = Math.sqrt(yDiff * yDiff + iDiff * iDiff + qDiff * qDiff);
                
                // Combine pixel difference with local context
                // If local area is similar, be more forgiving
                const contextWeight = Math.max(0, 1 - (avgLocalSimilarity / (threshold * flexibleSensitivity)));
                delta = pixelDelta * (1 - contextWeight * 0.5);
            } else {
                // Standard YIQ color space difference
                const yDiff = rgbToY(r1, g1, b1) - rgbToY(r2, g2, b2);
                const iDiff = rgbToI(r1, g1, b1) - rgbToI(r2, g2, b2);
                const qDiff = rgbToQ(r1, g1, b1) - rgbToQ(r2, g2, b2);
                
                delta = Math.sqrt(yDiff * yDiff + iDiff * iDiff + qDiff * qDiff);
            }
            
            // Store magnitude (0-255) instead of binary
            if (output) {
                // Normalize delta to 0-255 range, scaled by threshold
                const normalizedDelta = Math.min(255, Math.floor((delta / threshold) * 255));
                output[y * width + x] = normalizedDelta;
            }
            
            // Count as different if above threshold
            if (delta > threshold) {
                diff++;
            }
        }
        
        // Report progress every 10 rows
        if (y % 10 === 0) {
            self.postMessage({
                type: 'progress',
                progress: (y / height) * 100,
                stage: 'pixel-comparison'
            });
        }
    }
    
    return diff;
}

// Block comparison
function blockCompare(img1, img2, output, width, height, blockSize, threshold) {
    let diffBlocks = 0;
    const totalBlocks = Math.ceil(height / blockSize) * Math.ceil(width / blockSize);
    let processedBlocks = 0;
    
    for (let by = 0; by < height; by += blockSize) {
        for (let bx = 0; bx < width; bx += blockSize) {
            // Calculate average color for this block in both images
            let r1_sum = 0, g1_sum = 0, b1_sum = 0;
            let r2_sum = 0, g2_sum = 0, b2_sum = 0;
            let pixelCount = 0;
            
            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    const pos = (y * width + x) * 4;
                    
                    r1_sum += img1[pos];
                    g1_sum += img1[pos + 1];
                    b1_sum += img1[pos + 2];
                    
                    r2_sum += img2[pos];
                    g2_sum += img2[pos + 1];
                    b2_sum += img2[pos + 2];
                    
                    pixelCount++;
                }
            }
            
            // Calculate average colors
            const r1 = r1_sum / pixelCount;
            const g1 = g1_sum / pixelCount;
            const b1 = b1_sum / pixelCount;
            
            const r2 = r2_sum / pixelCount;
            const g2 = g2_sum / pixelCount;
            const b2 = b2_sum / pixelCount;
            
            // Calculate block difference
            const yDiff = rgbToY(r1, g1, b1) - rgbToY(r2, g2, b2);
            const iDiff = rgbToI(r1, g1, b1) - rgbToI(r2, g2, b2);
            const qDiff = rgbToQ(r1, g1, b1) - rgbToQ(r2, g2, b2);
            
            const delta = Math.sqrt(yDiff * yDiff + iDiff * iDiff + qDiff * qDiff);
            
            const isDifferent = delta > threshold;
            
            // Mark all pixels in this block with magnitude
            const magnitude = isDifferent ? Math.min(255, Math.floor((delta / threshold) * 255)) : 0;
            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    const idx = y * width + x;
                    output[idx] = magnitude;
                }
            }
            
            if (isDifferent) {
                diffBlocks += pixelCount;
            }
            
            processedBlocks++;
            if (processedBlocks % 10 === 0) {
                self.postMessage({
                    type: 'progress',
                    progress: (processedBlocks / totalBlocks) * 100,
                    stage: 'block-comparison'
                });
            }
        }
    }
    
    return diffBlocks;
}

// Gaussian blur (box blur approximation)
function applyGaussianBlur(imageData, width, height, radius) {
    const data = new Uint8ClampedArray(imageData.data);
    const result = new ImageData(width, height);
    
    const kernelSize = radius * 2 + 1;
    const kernelSum = kernelSize * kernelSize;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;
            
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = x + kx;
                    const py = y + ky;
                    
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const idx = (py * width + px) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        a += data[idx + 3];
                        count++;
                    }
                }
            }
            
            const idx = (y * width + x) * 4;
            result.data[idx] = Math.floor(r / count);
            result.data[idx + 1] = Math.floor(g / count);
            result.data[idx + 2] = Math.floor(b / count);
            result.data[idx + 3] = Math.floor(a / count);
        }
        
        // Report progress every 10 rows
        if (y % 10 === 0) {
            self.postMessage({
                type: 'progress',
                progress: (y / height) * 100,
                stage: 'blur'
            });
        }
    }
    
    return result;
}

// Morphological operations
function applyMorphology(diff, width, height, minSize) {
    const result = new Uint8Array(diff);
    const kernel = 3; // 3x3 kernel
    const offset = Math.floor(kernel / 2);

    // Dilation
    const dilated = new Uint8Array(diff.length);
    for (let y = offset; y < height - offset; y++) {
        for (let x = offset; x < width - offset; x++) {
            let maxVal = 0;
            for (let ky = -offset; ky <= offset; ky++) {
                for (let kx = -offset; kx <= offset; kx++) {
                    const idx = (y + ky) * width + (x + kx);
                    maxVal = Math.max(maxVal, diff[idx]);
                }
            }
            dilated[y * width + x] = maxVal;
        }
        
        if (y % 10 === 0) {
            self.postMessage({
                type: 'progress',
                progress: (y / (height - offset * 2)) * 100,
                stage: 'morphology'
            });
        }
    }

    // Filter out small regions
    const labeled = labelRegions(dilated, width, height);
    const regionSizes = new Map();
    
    labeled.forEach(label => {
        if (label > 0) {
            regionSizes.set(label, (regionSizes.get(label) || 0) + 1);
        }
    });

    // Remove small regions
    for (let i = 0; i < labeled.length; i++) {
        const label = labeled[i];
        if (label > 0 && regionSizes.get(label) < minSize) {
            result[i] = 0;
        } else if (label > 0) {
            result[i] = 255;
        }
    }

    return result;
}

function labelRegions(data, width, height) {
    const labels = new Uint32Array(data.length);
    let nextLabel = 1;

    for (let i = 0; i < data.length; i++) {
        if (data[i] > 0 && labels[i] === 0) {
            floodFill(data, labels, width, height, i, nextLabel);
            nextLabel++;
        }
    }

    return labels;
}

function floodFill(data, labels, width, height, start, label) {
    const stack = [start];
    
    while (stack.length > 0) {
        const idx = stack.pop();
        if (labels[idx] !== 0 || data[idx] === 0) continue;
        
        labels[idx] = label;
        const x = idx % width;
        const y = Math.floor(idx / width);

        // Check 4-connected neighbors
        if (x > 0) stack.push(idx - 1);
        if (x < width - 1) stack.push(idx + 1);
        if (y > 0) stack.push(idx - width);
        if (y < height - 1) stack.push(idx + width);
    }
}

// Message handler
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    if (type === 'process') {
        const {
            beforeData,
            afterData,
            width,
            height,
            threshold,
            blurRadius,
            useBlockComparison,
            blockSize,
            minRegionSize,
            useFlexibleMatching,
            flexibleSensitivity
        } = data;
        
        try {
            // Convert ArrayBuffer to Uint8ClampedArray
            const beforeArray = new Uint8ClampedArray(beforeData);
            const afterArray = new Uint8ClampedArray(afterData);
            
            // Create ImageData objects
            const beforeImageData = new ImageData(beforeArray, width, height);
            const afterImageData = new ImageData(afterArray, width, height);
            
            let processedBefore = beforeImageData;
            let processedAfter = afterImageData;
            
            // Apply blur if needed
            if (blurRadius > 0) {
                self.postMessage({ type: 'progress', progress: 0, stage: 'blur-before' });
                processedBefore = applyGaussianBlur(beforeImageData, width, height, blurRadius);
                self.postMessage({ type: 'progress', progress: 50, stage: 'blur-after' });
                processedAfter = applyGaussianBlur(afterImageData, width, height, blurRadius);
            }
            
            // Create diff array
            const diff = new Uint8Array(width * height);
            let numDiffPixels;
            
            if (useBlockComparison) {
                self.postMessage({ type: 'progress', progress: 0, stage: 'block-comparison' });
                numDiffPixels = blockCompare(
                    processedBefore.data,
                    processedAfter.data,
                    diff,
                    width,
                    height,
                    blockSize,
                    threshold
                );
            } else {
                self.postMessage({ type: 'progress', progress: 0, stage: 'pixel-comparison' });
                numDiffPixels = pixelmatch(
                    processedBefore.data,
                    processedAfter.data,
                    diff,
                    width,
                    height,
                    { 
                        threshold: threshold, 
                        includeAA: true,
                        useFlexibleMatching: useFlexibleMatching || false,
                        flexibleSensitivity: flexibleSensitivity || 0.8
                    }
                );
            }
            
            // Apply morphology
            self.postMessage({ type: 'progress', progress: 0, stage: 'morphology' });
            const processed = applyMorphology(diff, width, height, minRegionSize);
            
            // Send result back
            self.postMessage({
                type: 'result',
                diff: processed.buffer,
                numDiffPixels: numDiffPixels,
                diffArray: diff.buffer // Original diff for heatmap
            }, [processed.buffer, diff.buffer]);
            
        } catch (error) {
            self.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
});
