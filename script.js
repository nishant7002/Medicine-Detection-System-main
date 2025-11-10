const fileInput = document.getElementById('fileInput');
const detectBtn = document.getElementById('detectBtn');
const removeBtn = document.getElementById('removeBtn');
const status = document.getElementById('status');
const previewImg = document.getElementById('previewImg');
const previewMeta = document.getElementById('previewMeta');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const resName = document.getElementById('resName');
const resDesc = document.getElementById('resDesc');
const resUses = document.getElementById('resUses');
const resConf = document.getElementById('resConf');
let selectedFile = null;

// API Configuration - Automatically detects environment
// For GitHub Pages: Uses demo mode (backend not available)
// For local development: Tries to use localhost API, falls back to demo if unavailable
// To use a custom backend URL, set it here: const API_BASE_URL = 'https://your-backend-url.com/api';

// Detect if we're on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io') || 
                       window.location.hostname.includes('githubpages.io');

// Determine API URL based on environment
let API_BASE_URL = 'http://localhost:5000/api';
if (isGitHubPages) {
    // On GitHub Pages, we'll use demo mode (no backend available)
    API_BASE_URL = null;
}

// Auto-detect API availability
let API_AVAILABLE = false;
let API_CHECK_COMPLETE = false;
let DEMO_MODE = isGitHubPages; // Start with demo mode on GitHub Pages

// Check if API is available (async check on page load)
async function checkAPIAvailability() {
    if (isGitHubPages || !API_BASE_URL) {
        DEMO_MODE = true;
        API_CHECK_COMPLETE = true;
        console.log('📦 Running in demo mode (GitHub Pages detected)');
        return;
    }
    
    try {
        // Add timeout for health check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            API_AVAILABLE = true;
            DEMO_MODE = false;
            console.log('✅ API is available - using backend');
        } else {
            throw new Error('API health check failed');
        }
    } catch (error) {
        API_AVAILABLE = false;
        DEMO_MODE = true;
        console.log('⚠️ API not available - falling back to demo mode');
        console.log('   (This is normal on GitHub Pages. Deploy backend separately to use API.)');
    } finally {
        API_CHECK_COMPLETE = true;
    }
}

// Check API availability when page loads
checkAPIAvailability();

function niceBytes(bytes) {
    if (!bytes) return '';
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < u.length - 1) { bytes /= 1024; i++ } return `${bytes.toFixed(1)} ${u[i]}`
}
fileInput.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return resetSelection();
    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    previewImg.style.display = 'block';
    imagePlaceholder.style.display = 'none';
    previewMeta.textContent = `${file.name} • ${niceBytes(file.size)} • ${file.type || 'image'}`;
    status.textContent = 'Image ready. Click Detect Medicine.';
    detectBtn.disabled = false; removeBtn.disabled = false; clearResults();
});
function resetSelection() {
    selectedFile = null;
    previewImg.src = '';
    previewImg.style.display = 'none';
    imagePlaceholder.style.display = 'block';
    previewMeta.textContent = '';
    status.textContent = 'No image selected.';
    detectBtn.disabled = true;
    removeBtn.disabled = true;
    clearResults();
    fileInput.value = '';
}
function clearResults() {
    resName.textContent = '—';
    resDesc.textContent = '—';
    resUses.textContent = '—';
    resConf.textContent = '—';
}
function fakeDetect(file) {
    // Demo mode - returns mock data
    const db = [{ name: 'Paracetamol', desc: 'Common analgesic and antipyretic.', uses: 'Fever, mild to moderate pain' }, { name: 'Aspirin', desc: 'Nonsteroidal anti-inflammatory drug (NSAID).', uses: 'Pain, inflammation, blood thinning' }, { name: 'Amoxicillin', desc: 'Broad-spectrum antibiotic.', uses: 'Bacterial infections' }, { name: 'Cetirizine', desc: 'Antihistamine for allergy relief.', uses: 'Allergic rhinitis, hives' }, { name: 'Omeprazole', desc: 'Proton pump inhibitor for stomach acid.', uses: 'Acid reflux, ulcers' }];
    const f = (file && file.name || '').toLowerCase();
    if (f.includes('para') || f.includes('pcm') || f.includes('acet')) return { item: db[0], conf: 0.93 };
    if (f.includes('asp') || f.includes('acetyl')) return { item: db[1], conf: 0.89 };
    if (f.includes('amox') || f.includes('amoxi')) return { item: db[2], conf: 0.86 };
    if (f.includes('cet') || f.includes('cetir')) return { item: db[3], conf: 0.82 };
    if (f.includes('omep') || f.includes('prazole')) return { item: db[4], conf: 0.85 };
    if (file && file.size < 60000) return { item: db[3], conf: 0.62 }; if (file && file.size > 1500000) return { item: db[2], conf: 0.68 };
    const pick = db[Math.floor(Math.random() * db.length)];
    return { item: pick, conf: (0.6 + Math.random() * 0.3).toFixed(2) };
}

async function detectMedicineWithAPI(file) {
    // Wait for API check to complete if it's still running
    if (!API_CHECK_COMPLETE && !isGitHubPages && API_BASE_URL) {
        // Wait a bit for the health check to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // If API is not available or we're in demo mode, use demo detection
    if (DEMO_MODE || !API_BASE_URL || (API_CHECK_COMPLETE && !API_AVAILABLE)) {
        console.log('Using demo mode for detection');
        return fakeDetect(file);
    }
    
    // If we're not sure yet (API check not complete), try the API and fall back if it fails
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Mark API as available if we got a successful response
            API_AVAILABLE = true;
            DEMO_MODE = false;
            return {
                item: {
                    name: data.medicine.name,
                    desc: data.medicine.description,
                    uses: data.medicine.uses
                },
                conf: data.confidence
            };
        } else {
            throw new Error(data.error || 'Detection failed');
        }
    } catch (error) {
        console.error('API detection error:', error);
        // If API fails, mark as unavailable and fall back to demo mode
        API_AVAILABLE = false;
        DEMO_MODE = true;
        API_CHECK_COMPLETE = true;
        if (error.name === 'AbortError') {
            console.log('API request timed out, using demo mode');
        } else {
            console.log('API request failed, falling back to demo mode');
        }
        // Automatically fall back to demo mode
        return fakeDetect(file);
    }
}
detectBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    detectBtn.disabled = true;
    const original = detectBtn.textContent;
    detectBtn.innerHTML = '<span class="spinner"></span> Detecting...';
    
    try {
        // Show appropriate status message
        if (DEMO_MODE || isGitHubPages) {
            status.textContent = 'Detecting medicine (demo mode)...';
        } else {
            status.textContent = 'Analyzing image with AI...';
        }
        
        // Small delay for better UX
        await new Promise(r => setTimeout(r, 500));
        
        // This function will automatically handle demo mode fallback
        const result = await detectMedicineWithAPI(selectedFile);
        
        // Display results
        const { item, conf } = result;
        resName.textContent = item.name;
        resDesc.textContent = item.desc;
        resUses.textContent = item.uses;
        resConf.textContent = (parseFloat(conf) * 100).toFixed(0) + '%';
        
        // Update status with mode info
        if (DEMO_MODE || isGitHubPages) {
            status.textContent = 'Detection complete (demo mode).';
        } else {
            status.textContent = 'Detection complete.';
        }
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        console.error('Detection failed:', error);
    } finally {
        detectBtn.disabled = false;
        detectBtn.textContent = original;
    }
});
removeBtn.addEventListener('click', () => resetSelection());
resetSelection();