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

// API Configuration - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';
// Set to true to use demo mode (no backend required)
const DEMO_MODE = false;

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
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
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
        throw error;
    }
}
detectBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    detectBtn.disabled = true;
    const original = detectBtn.textContent;
    detectBtn.innerHTML = '<span class="spinner"></span> Detecting...';
    
    try {
        let result;
        
        if (DEMO_MODE) {
            status.textContent = 'Detecting — using demo mode...';
            await new Promise(r => setTimeout(r, 1500));
            result = fakeDetect(selectedFile);
        } else {
            status.textContent = 'Analyzing image with AI...';
            result = await detectMedicineWithAPI(selectedFile);
        }
        
        // Display results
        const { item, conf } = result;
        resName.textContent = item.name;
        resDesc.textContent = item.desc;
        resUses.textContent = item.uses;
        resConf.textContent = (parseFloat(conf) * 100).toFixed(0) + '%';
        status.textContent = 'Detection complete.';
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