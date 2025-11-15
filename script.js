let allCategoriesData = [];

let infoPanel;

// Function to load hotspots from the categorized JSON file
async function loadHotspots() {
    try {
        const response = await fetch('hotspots.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allCategoriesData = data.categories; // Store the array of categories

        // Store a global reference to the info panel
        infoPanel = document.getElementById('infoPanel');

        createFilters();
        renderAllHotspots();

    } catch (error) {
        console.error('Error loading hotspots:', error);
        const infoContent = document.getElementById('info-content');
        if (infoContent) {
            infoContent.innerHTML = `<h2>Error</h2><p>Could not load hotspot data. Please check 'hotspots-v3.json' and ensure it is correct.</p>`;
        }
    }
}

// Function to create the filter buttons
function createFilters() {
    const filterContainer = document.getElementById('filter-container');
    if (!filterContainer) return;

    // 1. Create a "Show All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active'; // 'Show All' is active by default
    allBtn.innerText = 'Show All';
    allBtn.dataset.category = 'all';
    allBtn.onclick = () => filterHotspots('all');
    filterContainer.appendChild(allBtn);

    // 2. Create a button for each category
    allCategoriesData.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.innerText = `${category.emoji} ${category.name}`;
        btn.dataset.category = category.emoji; // Use emoji as the category ID
        btn.onclick = () => filterHotspots(category.emoji);
        filterContainer.appendChild(btn);
    });
}

// Function to render ALL hotspots from all categories onto the map
function renderAllHotspots() {
    const container = document.querySelector('.image-section');
    if (!container) return;

    // Clear any existing hotspots
    container.querySelectorAll('.hotspot').forEach(spot => spot.remove());

    // Loop through each category and then each hotspot in that category
    allCategoriesData.forEach(category => {
        category.hotspots.forEach(spot => {
            const btn = document.createElement('button');
            btn.className = 'hotspot';
            btn.style.position = 'absolute';
            btn.style.top = spot.top + '%';
            btn.style.left = spot.left + '%';
            btn.innerText = category.emoji; 

            // Add data for tooltip and filtering
            btn.dataset.tooltip = spot.name;
            btn.dataset.category = category.emoji;
            btn.setAttribute('aria-label', spot.name);

            btn.onclick = () => showInfo(spot);

            container.appendChild(btn);
        });
    });
}

// Function to filter which hotspots are visible
function filterHotspots(categoryToShow) {
    if (infoPanel && infoPanel.classList.contains('fullscreen')) {
        infoPanel.classList.remove('fullscreen');
    }

    showDefaultInfo();

    const hotspotElements = document.querySelectorAll('.hotspot');

    // Show or hide each hotspot button
    hotspotElements.forEach(spotBtn => {
        if (categoryToShow === 'all' || spotBtn.dataset.category === categoryToShow) {
            spotBtn.style.display = 'flex'; // Show it
        } else {
            spotBtn.style.display = 'none'; // Hide it
        }
    });

    // Update the 'active' class on the filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.category === categoryToShow) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function showDefaultInfo() {
    const infoContent = document.getElementById('info-content');
    if (!infoContent) return;
    infoContent.innerHTML = `
        <div class="info-default">
            <div class="info-default-icon">🗺️</div>
            <h2>Explore Rajasthan</h2>
            <p>Click a hotspot on the map to explore the wonders of Rajasthan: Land of Palaces, Forts, and Timeless Wonders</p>
        </div>`;

    if (infoPanel) infoPanel.classList.remove('fullscreen');
}


function showInfo(spot) {
    const infoContent = document.getElementById('info-content');
    if (!infoContent) return;

    // Exit fullscreen if it's active
    if (infoPanel && infoPanel.classList.contains('fullscreen')) {
        infoPanel.classList.remove('fullscreen');
    }

    // Populate the short info card
    infoContent.innerHTML = `
        <img src="${spot.image}" alt="${spot.name}" class="info-image" onerror="this.src='https://placehold.co/600x400/ccc/999?text=Image+Not+Found';">
        <h2>${spot.name}</h2>
        <p>${spot.shortDetails}</p>
        <button class="read-more-btn">Read More</button>
    `;

    // Add event listener to the new "Read More" button
    const readMoreBtn = infoContent.querySelector('.read-more-btn');
    if (readMoreBtn) {
        readMoreBtn.onclick = () => showLongDetails(spot);
    }
}

function showLongDetails(spot) {
    const infoContent = document.getElementById('info-content');
    if (!infoContent) return;

    const formattedDetails = spot.longDetails.replace(/\n/g, '<br><br>');

    infoContent.innerHTML = `
        <div class="long-details-header">
            <div class="info-panel-btn-group">
                <button class="close-details-btn" title="Close" aria-label="Close details">&times;</button>
                <button class="fullscreen-btn" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">⛶</button>
            </div>
        </div>
        <h2>${spot.name}</h2>
        <div class="long-details-body">
            <p>${formattedDetails}</p>
        </div>
    `;

    // Add event listeners for the new buttons
    const closeBtn = infoContent.querySelector('.close-details-btn');
    const fullscreenBtn = infoContent.querySelector('.fullscreen-btn');

    if (closeBtn) {
        // Go back to the short info card
        closeBtn.onclick = () => showInfo(spot);
    }
    if (fullscreenBtn) {
        fullscreenBtn.onclick = () => toggleFullscreen();
    }
}

// --- Function to toggle fullscreen mode ---
function toggleFullscreen() {
    if (infoPanel) {
        infoPanel.classList.toggle('fullscreen');
    }
}

window.onload = loadHotspots;