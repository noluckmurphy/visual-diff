# Visual Diff Tool

A powerful, standalone web-based application for comparing before and after images with intelligent difference highlighting. Perfect for interior design comparisons, UI/UX changes, photo editing verification, and AI-generated image analysis.

**Now optimized for architects, interior designers, and selections coordinators** working on residential and luxury custom home projects with simplified workflows, project organization, and client presentation features.

## 🎯 Features

### Core Functionality
- **Dual Image Comparison**: Upload and compare two images side-by-side
- **Three Display Modes**:
  - **Overlay Mode**: Highlights differences with a customizable color overlay
  - **Heatmap Mode**: Shows difference intensity using a color gradient (blue → cyan → green → yellow → red)
  - **Intensity Mode**: Shows raw difference magnitude in grayscale

### Advanced Comparison Options
- **Adjustable Sensitivity**: Control how sensitive the comparison is (0.05-2.0)
  - Higher values = more forgiving (ignores subtle variations)
  - Lower values = stricter comparison (catches minor differences)
- **Blur Preprocessing**: Smooth textures before comparing (0-10px radius)
  - Reduces noise from AI generation artifacts
  - Minimizes JPEG compression artifacts
- **Block Comparison Mode**: Compare regions instead of individual pixels
  - Less sensitive to texture regeneration differences
  - Configurable block size (4-32px)
- **Morphological Filtering**: 
  - Groups nearby changed pixels together
  - Filters out small noise regions (configurable minimum size)
  - Creates cleaner, more meaningful difference regions

### Visualization Tools
- **Interactive Magnifier**: 2x zoom tool showing side-by-side before/after views
  - Follows mouse cursor over the comparison result
  - Pixel-perfect rendering for detailed inspection
- **Region Outlines**: Optional white outlines around changed regions
- **Statistics Display**: Shows percentage of image changed and pixel count
- **Image Metadata**: Displays file information, dimensions, format, and size
  - Warnings for format mismatches and lossy compression
  - Automatic recommendations for settings adjustments

### User Experience
- **Flexible Upload**: Upload images separately, both at once, or drag and drop
- **Real-time Preview**: See uploaded images before processing
- **Customizable Highlight Color**: Choose any color for difference highlighting
- **Adjustable Opacity**: Control overlay intensity (0.1-1.0)
- **Responsive Design**: Modern, clean interface that works on various screen sizes
- **No Dependencies**: Completely standalone - no external libraries required

### New Features for Design Professionals

#### Quick Start Presets
- **Material Comparison**: Optimized for comparing finishes, tiles, and fabrics
- **Room Redesign**: Settings for before/after room transformations
- **Fixture Selection**: For comparing lighting, hardware, and fixtures
- **Color Matching**: Strict comparison for paint and color samples
- **Construction Progress**: For site photos with alignment focus
- **Save Custom Presets**: Save your preferred settings as reusable presets

#### Simplified Interface
- **Simple Mode**: Hide technical settings, show only essential controls
- **Advanced Mode**: Full access to all comparison settings
- **One-Click Presets**: Start comparing immediately with optimized settings

#### Project Organization
- **Projects System**: Organize comparisons by project (e.g., "Smith Residence - Kitchen")
- **Comparison History**: Automatically save all comparisons with thumbnails
- **Quick Access**: Reopen previous comparisons with one click
- **Project Filtering**: Filter history by project

#### Export & Sharing
- **Multiple Export Formats**: PNG, JPEG, PDF reports
- **Side-by-Side Export**: Download before, after, and comparison in one image
- **Copy to Clipboard**: Quick sharing of comparison results
- **PDF Reports**: Professional reports with metadata and statistics

#### Annotation Tools
- **Draw on Comparisons**: Add freehand drawings
- **Arrow Markers**: Point out specific areas
- **Text Notes**: Add text annotations
- **Highlight Regions**: Highlight important areas
- **Export with Annotations**: Annotations included in exports

#### Presentation Mode
- **Full-Screen View**: Present comparisons in full-screen mode
- **Navigation**: Browse through comparison history
- **Keyboard Controls**: Arrow keys and spacebar for navigation
- **Minimal UI**: Clean presentation interface

#### Mobile Optimization
- **Touch-Friendly**: Optimized for tablets and phones
- **Camera Integration**: Direct photo capture from mobile devices
- **Responsive Layout**: Adapts to all screen sizes
- **Touch Gestures**: Swipe and touch support for annotations

#### Keyboard Shortcuts
- **Space**: Generate comparison
- **E**: Export comparison
- **M**: Toggle magnifier
- **Arrow Keys**: Navigate in presentation mode
- **Escape**: Exit presentation mode

## 🚀 Getting Started

### Installation
No installation required! This is a single-file HTML application.

1. Download or clone `visual-diff-app.html`
2. Open it in any modern web browser
3. Start comparing images!

### Basic Usage

1. **Upload Images**:
   - Click "Choose File" in either the "Before Image" or "After Image" section
   - Or use "choose both files at once" to select both images simultaneously
   - First file = Before, Second file = After

2. **Configure Settings** (optional):
   - Adjust sensitivity if you see too many or too few differences
   - Enable blur if comparing AI-generated or compressed images
   - Enable block comparison for texture-heavy images
   - Customize highlight color and opacity to your preference

3. **Generate Comparison**:
   - Click "Generate Comparison" button
   - Wait for processing to complete
   - View the result with highlighted differences

4. **Inspect Details** (optional):
   - Click "Enable Magnifier" to activate the zoom tool
   - Hover over the comparison result to see magnified before/after views
   - Move mouse to explore different areas

## ⚙️ Settings Reference

### Comparison Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| **Sensitivity** | 0.05 - 2.0 | 0.5 | Threshold for detecting differences. Higher = more forgiving, lower = stricter |
| **Blur Radius** | 0 - 10px | 2px | Applies smoothing before comparison. Helps reduce noise from AI/compression artifacts |
| **Block Comparison** | On/Off | Off | Compare average colors of blocks instead of individual pixels |
| **Block Size** | 4 - 32px | 16px | Size of blocks when block comparison is enabled |
| **Overlay Opacity** | 0.1 - 1.0 | 0.5 | Transparency of the difference overlay |
| **Highlight Color** | Any color | #ff6b6b (red) | Color used to mark changed areas |
| **Min Region Size** | 1 - 100px | 10px | Minimum size for a difference region to be displayed |
| **Show Outlines** | On/Off | On | Draw white outlines around changed regions |

### Tips for AI-Generated Images

When comparing AI-generated images or images with compression artifacts:

1. **Start with Sensitivity = 0.5-1.0** to ignore AI noise and JPEG artifacts
2. **Use Blur = 2-5px** to smooth out texture regeneration differences
3. **Enable Block Comparison** to focus on regional color changes instead of pixel-perfect matching
4. **Increase Sensitivity and Blur** if you see 99% differences - adjust until only real changes show
5. **For lossy formats** (JPEG, WebP): Increase Sensitivity to 0.8+ and enable Blur (3-5px)

## 🛠️ Technical Details

### Architecture
- **Pure HTML/CSS/JavaScript**: No build process, no dependencies
- **Canvas API**: All image processing happens in the browser
- **Client-side Only**: All processing is local - images never leave your device

### Algorithms

#### Pixel Comparison
- Custom implementation inspired by pixelmatch
- Uses **YIQ color space** for perceptual difference detection
- More accurate than simple RGB distance for human visual perception

#### Block Comparison
- Divides images into blocks and compares average block colors
- Reduces sensitivity to texture variations
- Useful for AI-generated images where textures are regenerated differently

#### Image Processing Pipeline
1. **Load & Resize**: Both images are normalized to the same dimensions
2. **Optional Blur**: Apply Gaussian blur (box blur approximation) if enabled
3. **Difference Detection**: Run pixel-based or block-based comparison
4. **Morphological Filtering**: 
   - Dilation to group nearby changed pixels
   - Connected components labeling to identify regions
   - Size filtering to remove noise
5. **Visualization**: Apply overlay or heatmap based on selected mode

#### Morphological Operations
- **Dilation**: 3x3 kernel to expand difference regions
- **Connected Components**: Flood fill algorithm to label regions
- **Size Filtering**: Removes regions smaller than minimum size threshold

### Browser Compatibility
- Modern browsers with Canvas API support
- Tested on: Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled

### Performance
- Processing happens entirely in JavaScript
- Performance depends on image size and browser
- Typical processing time: < 1 second for images up to 1920x1080
- Larger images may take longer

### File Support
- Accepts all standard image formats (PNG, JPEG, WebP, GIF, etc.)
- Handles different image dimensions (before image is resized to match after)
- Preserves aspect ratio during resizing

## 📊 Use Cases

- **Interior Design**: Compare room redesigns and furniture placement
- **UI/UX Design**: Visual regression testing for web/app interfaces
- **Photo Editing**: Verify edits and retouching work
- **AI Image Comparison**: Analyze differences in AI-generated variants
- **Quality Assurance**: Compare screenshots across different versions
- **Documentation**: Create visual change documentation
- **Education**: Demonstrate before/after transformations

## 🔍 How It Works

1. **Image Normalization**: Both images are converted to the same dimensions
2. **Preprocessing**: Optional Gaussian blur reduces noise
3. **Comparison**: Pixel-by-pixel or block-by-block comparison using YIQ color space
4. **Post-processing**: Morphological operations clean up the difference map
5. **Visualization**: Differences are highlighted using overlay or heatmap mode
6. **Display**: Results shown with statistics and optional magnifier tool

## 📝 License

This is a standalone tool. Feel free to use, modify, and distribute as needed.

## 🤝 Contributing

This is a single-file application. To contribute:
1. Make your changes to `visual-diff-app.html`
2. Test thoroughly
3. Submit improvements

## ⚠️ Notes

- Images are processed entirely in your browser - no data is uploaded
- Large images may cause browser performance issues
- The tool automatically handles dimension mismatches by resizing the "before" image
- Lossy compression formats (JPEG, WebP) may show higher difference rates due to compression artifacts

## 💡 Tips

- **For best results**: Use PNG format when possible to avoid compression artifacts
- **Quick comparison**: Upload both files at once for faster workflow
- **Fine-tuning**: Adjust sensitivity and blur interactively until you see meaningful differences
- **Detailed inspection**: Use the magnifier tool to verify specific areas
- **Multiple comparisons**: Refresh the page to start a new comparison

