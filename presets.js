// Preset configurations for common use cases
const PRESETS = {
    'material-comparison': {
        name: 'Material Comparison',
        description: 'Optimized for comparing finishes, tiles, and fabrics',
        icon: '🏗️',
        settings: {
            threshold: 0.6,
            blurRadius: 3,
            useBlockComparison: true,
            blockSize: 16,
            minRegionSize: 15,
            useFlexibleMatching: true,
            flexibleSensitivity: 0.9,
            autoAlign: true,
            showOutlines: true,
            opacity: 0.4
        }
    },
    'room-redesign': {
        name: 'Room Redesign',
        description: 'Settings for before/after room transformations',
        icon: '🏠',
        settings: {
            threshold: 0.5,
            blurRadius: 2,
            useBlockComparison: false,
            blockSize: 16,
            minRegionSize: 20,
            useFlexibleMatching: false,
            flexibleSensitivity: 0.8,
            autoAlign: true,
            showOutlines: true,
            opacity: 0.5
        }
    },
    'fixture-selection': {
        name: 'Fixture Selection',
        description: 'For comparing lighting, hardware, and fixtures',
        icon: '💡',
        settings: {
            threshold: 0.4,
            blurRadius: 1,
            useBlockComparison: false,
            blockSize: 16,
            minRegionSize: 10,
            useFlexibleMatching: false,
            flexibleSensitivity: 0.8,
            autoAlign: true,
            showOutlines: true,
            opacity: 0.6
        }
    },
    'color-matching': {
        name: 'Color Matching',
        description: 'Strict comparison for paint and color samples',
        icon: '🎨',
        settings: {
            threshold: 0.2,
            blurRadius: 0,
            useBlockComparison: false,
            blockSize: 16,
            minRegionSize: 5,
            useFlexibleMatching: false,
            flexibleSensitivity: 0.8,
            autoAlign: true,
            showOutlines: false,
            opacity: 0.7
        }
    },
    'construction-progress': {
        name: 'Construction Progress',
        description: 'For site photos with alignment focus',
        icon: '🚧',
        settings: {
            threshold: 0.7,
            blurRadius: 4,
            useBlockComparison: true,
            blockSize: 20,
            minRegionSize: 30,
            useFlexibleMatching: true,
            flexibleSensitivity: 1.0,
            autoAlign: true,
            showOutlines: true,
            opacity: 0.5
        }
    }
};

// Load custom presets from localStorage
function loadCustomPresets() {
    try {
        const custom = localStorage.getItem('customPresets');
        if (custom) {
            return JSON.parse(custom);
        }
    } catch (e) {
        console.error('Error loading custom presets:', e);
    }
    return {};
}

// Save custom preset
function saveCustomPreset(id, name, description, settings) {
    try {
        const custom = loadCustomPresets();
        custom[id] = {
            name: name,
            description: description,
            icon: '⭐',
            settings: settings
        };
        localStorage.setItem('customPresets', JSON.stringify(custom));
        return true;
    } catch (e) {
        console.error('Error saving custom preset:', e);
        return false;
    }
}

// Get all presets (built-in + custom)
function getAllPresets() {
    const custom = loadCustomPresets();
    return { ...PRESETS, ...custom };
}

// Apply preset settings to UI
function applyPreset(presetId) {
    const allPresets = getAllPresets();
    const preset = allPresets[presetId];
    
    if (!preset || !preset.settings) {
        console.error('Preset not found:', presetId);
        return false;
    }
    
    const settings = preset.settings;
    
    // Apply each setting to the UI
    if (settings.threshold !== undefined) {
        document.getElementById('threshold').value = settings.threshold;
        document.getElementById('thresholdValue').textContent = settings.threshold;
    }
    
    if (settings.blurRadius !== undefined) {
        document.getElementById('blurRadius').value = settings.blurRadius;
        document.getElementById('blurRadiusValue').textContent = settings.blurRadius + 'px';
    }
    
    if (settings.useBlockComparison !== undefined) {
        document.getElementById('useBlockComparison').checked = settings.useBlockComparison;
        document.getElementById('blockSizeControl').style.display = settings.useBlockComparison ? 'block' : 'none';
    }
    
    if (settings.blockSize !== undefined) {
        document.getElementById('blockSize').value = settings.blockSize;
        document.getElementById('blockSizeValue').textContent = settings.blockSize + 'px';
    }
    
    if (settings.minRegionSize !== undefined) {
        document.getElementById('minRegionSize').value = settings.minRegionSize;
        document.getElementById('minRegionSizeValue').textContent = settings.minRegionSize;
    }
    
    if (settings.useFlexibleMatching !== undefined) {
        document.getElementById('useFlexibleMatching').checked = settings.useFlexibleMatching;
        document.getElementById('flexibleMatchingSensitivityControl').style.display = settings.useFlexibleMatching ? 'block' : 'none';
    }
    
    if (settings.flexibleSensitivity !== undefined) {
        document.getElementById('flexibleMatchingSensitivity').value = settings.flexibleSensitivity;
        document.getElementById('flexibleMatchingSensitivityValue').textContent = settings.flexibleSensitivity;
    }
    
    if (settings.autoAlign !== undefined) {
        document.getElementById('autoAlign').checked = settings.autoAlign;
        const manualControl = document.getElementById('manualAlignmentControl');
        if (settings.autoAlign) {
            manualControl.style.display = 'block';
        } else {
            manualControl.style.display = 'none';
        }
    }
    
    if (settings.showOutlines !== undefined) {
        document.getElementById('showOutlines').checked = settings.showOutlines;
    }
    
    if (settings.opacity !== undefined) {
        document.getElementById('opacity').value = settings.opacity;
        document.getElementById('opacityValue').textContent = settings.opacity;
    }
    
    return true;
}

// Get current settings as object
function getCurrentSettings() {
    return {
        threshold: parseFloat(document.getElementById('threshold').value),
        blurRadius: parseInt(document.getElementById('blurRadius').value),
        useBlockComparison: document.getElementById('useBlockComparison').checked,
        blockSize: parseInt(document.getElementById('blockSize').value),
        minRegionSize: parseInt(document.getElementById('minRegionSize').value),
        useFlexibleMatching: document.getElementById('useFlexibleMatching').checked,
        flexibleSensitivity: parseFloat(document.getElementById('flexibleMatchingSensitivity').value),
        autoAlign: document.getElementById('autoAlign').checked,
        showOutlines: document.getElementById('showOutlines').checked,
        opacity: parseFloat(document.getElementById('opacity').value),
        highlightColor: document.getElementById('highlightColor').value
    };
}

