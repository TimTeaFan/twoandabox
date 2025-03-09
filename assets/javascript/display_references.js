document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('#referenzen .tab');
    const searchInput = document.querySelector('#referenzen .search-input');
    const referencesContainer = document.getElementById('references-container');
    const referencesPagination = document.getElementById('references-pagination');
    const prevButton = document.getElementById('referencesPrev');
    const nextButton = document.getElementById('referencesNext');
    
    // Current state
    let activeCategory = 'all';
    let searchTerm = '';
    let referencesData = {};
    let currentPage = 1;
    let totalPages = 1;
    
    // Configuration
    let itemsPerPage = getItemsPerPage();
    
    // Function to determine items per page based on screen size
    function getItemsPerPage() {
        const width = window.innerWidth;
        if (width >= 1036) { // Large screens: 4 rows x 3 columns
            return 12;
        } else if (width >= 756) { // Medium screens: 4 rows x 2 columns
            return 8;
        } else { // Mobile: 4 rows x 1 column
            return 4;
        }
    }
    
    // Update items per page on window resize
    window.addEventListener('resize', () => {
        const newItemsPerPage = getItemsPerPage();
        if (newItemsPerPage !== itemsPerPage) {
            itemsPerPage = newItemsPerPage;
            displayReferences();
        }
    });
    
    // Initialize tooltips after DOM is fully loaded
    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Load references data
    fetch('assets/data/referenzen.json')
        .then(response => response.json())
        .then(data => {
            referencesData = data;
            displayReferences();
        })
        .catch(error => {
            console.error('Error loading references:', error);
            referencesContainer.innerHTML = `
                <div class="no-results">
                    <p>Fehler beim Laden der Referenzen</p>
                </div>
            `;
        });
    
    // Event Listeners
    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => {
            tabButtons.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.category;
            currentPage = 1; // Reset to first page when changing category
            displayReferences();
        });
    });
    
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1; // Reset to first page when searching
        displayReferences();
    });
    
    // Navigation buttons
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayReferences();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayReferences();
        }
    });
    
    // Function to display references based on current filters and page
    function displayReferences() {
        // Clear the containers
        referencesContainer.innerHTML = '';
        referencesPagination.innerHTML = '';
        
        if (!referencesData || Object.keys(referencesData).length === 0) {
            return;
        }
        
        // Get all references that match the current filters
        let allFilteredReferences = [];
        
        if (activeCategory === 'all') {
            Object.keys(referencesData).forEach(category => {
                referencesData[category].forEach(ref => {
                    allFilteredReferences.push({...ref, category});
                });
            });
        } else {
            allFilteredReferences = referencesData[activeCategory].map(ref => ({...ref, category: activeCategory}));
        }
        
        // Apply search filtering
        if (searchTerm) {
            allFilteredReferences = allFilteredReferences.filter(ref => 
                ref.name.toLowerCase().includes(searchTerm) || 
                ref.ort.toLowerCase().includes(searchTerm)
            );
        }
        
        // Calculate total pages
        totalPages = Math.ceil(allFilteredReferences.length / itemsPerPage);
        
        // Adjust current page if needed
        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }
        
        // Update navigation buttons state
        prevButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= totalPages;
        
        // Display the references for the current page
        if (allFilteredReferences.length === 0) {
            referencesContainer.innerHTML = `
                <div class="no-results">
                    <p>Keine Ergebnisse gefunden</p>
                </div>
            `;
            return;
        }
        
        // Calculate start and end indices for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allFilteredReferences.length);
        
        // Get references for the current page
        const referencesToShow = allFilteredReferences.slice(startIndex, endIndex);
        
        // Create and append reference elements
        referencesToShow.forEach(ref => {
            const referenceElement = document.createElement('div');
            referenceElement.className = 'reference-item';
            
            // Add category-specific class for styling
            if (ref.category === 'Weingüter und Hoffeste') {
                referenceElement.classList.add('category-weingüter');
            } else if (ref.category === 'Wein- und Straßenfeste') {
                referenceElement.classList.add('category-feste');
            } else if (ref.category === 'Firmen, Vereine, Stadtverwaltungen') {
                referenceElement.classList.add('category-firmen');
            }
            
            // Add tooltip only if the text is likely to be truncated
            // We'll use a character length check as a heuristic
            const MAX_NAME_LENGTH = 29; // Adjust based on your design
            const MAX_LOCATION_LENGTH = 35; // Adjust based on your design
            
            if (ref.name.length > MAX_NAME_LENGTH || ref.ort.length > MAX_LOCATION_LENGTH) {
                const tooltip = `${ref.name} - ${ref.ort}`;
                referenceElement.setAttribute('title', tooltip);
                referenceElement.setAttribute('data-bs-toggle', 'tooltip');
                referenceElement.setAttribute('data-bs-placement', 'top');
            }
            
            // Use a simpler structure to ensure text truncation
            referenceElement.innerHTML = `
                <div class="reference-name" title="${ref.name}">${ref.name}</div>
                <div class="reference-location" title="${ref.ort}">${ref.ort}</div>
            `;
            
            referencesContainer.appendChild(referenceElement);
        });
        
        // Initialize tooltips after adding references
        setTimeout(initTooltips, 100);
        
        // Create pagination dots
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const pageDot = document.createElement('span');
                pageDot.className = `page-dot${i === currentPage ? ' active' : ''}`;
                pageDot.dataset.page = i;
                pageDot.addEventListener('click', () => {
                    currentPage = parseInt(pageDot.dataset.page);
                    displayReferences();
                });
                referencesPagination.appendChild(pageDot);
            }
        }
    }
});
