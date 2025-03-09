// Update copyright year
document.getElementById('year').textContent = new Date().getFullYear();

// Testimonials rotation
function rotateTestimonials() {
    const groups = document.querySelectorAll('.testimonial-group');
    let activeGroup = document.querySelector('.testimonial-group.active');
    let nextGroup = activeGroup.nextElementSibling || groups[0];

    activeGroup.classList.remove('active');
    nextGroup.classList.add('active');
}

// Initialize testimonials rotation
setInterval(rotateTestimonials, 10000);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Check if burger menu is open and we're on mobile
        const navbarCollapse = document.getElementById('navbarNav');
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        
        // If the menu is open and we're on mobile, close it
        if (window.innerWidth < 992 && bsCollapse && navbarCollapse.classList.contains('show')) {
            bsCollapse.hide();
        }
        
        if (targetElement) {
            // Get the height of the fixed navbar
            const navbarHeight = document.querySelector('header').offsetHeight;
            
            // Get the current position of the target
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            
            // Calculate the position with the offset (navbar height + extra space)
            const offsetPosition = targetPosition - navbarHeight;
            
            // Scroll to the calculated position
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to nav links based on scroll position
function updateActiveNavLink() {
    // Only run on desktop (not when burger menu is visible)
    if (window.innerWidth < 992) return; // 992px is Bootstrap's lg breakpoint
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Get current scroll position with some offset
    const scrollPosition = window.scrollY + 100; // Adding offset to trigger earlier
    
    // Find the current section
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Special case: if we're at the bottom of the page, highlight the last nav item (Kontakt)
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        currentSection = 'kontakt';
    }
    
    // If we're at the top of the page, highlight the first nav item (Home)
    if (window.scrollY < 100) {
        currentSection = 'home';
    }
    
    // Special case: When in testimonials or demo section, highlight Home
    if (currentSection === 'testimonials' || currentSection === 'demo') {
        currentSection = 'home';
    }
    
    // Update active link
    navLinks.forEach(link => {
        // Remove existing highlight from all links
        link.classList.remove('text-warning');
        
        // Add highlight to current section's link
        const href = link.getAttribute('href').substring(1);
        if (href === currentSection) {
            link.classList.add('text-warning');
        }
    });
}

// Run on scroll and on page load
window.addEventListener('scroll', updateActiveNavLink);
window.addEventListener('resize', updateActiveNavLink);
document.addEventListener('DOMContentLoaded', updateActiveNavLink);

// Song Table Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Variables for song table
    let allSongs = [];
    let filteredSongs = [];
    let currentPage = 1;
    const songsPerPageDesktop = 8;
    const songsPerPageMobile = 8;
    let songsPerPage = window.innerWidth >= 992 ? songsPerPageDesktop : songsPerPageMobile;
    
    // DOM elements
    const songTableBody = document.getElementById('songTableBody');
    const songSearch = document.getElementById('songSearch');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    // Fetch songs from JSON file
    fetch('assets/data/songs.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allSongs = data;
            filteredSongs = [...allSongs];
            renderSongs();
            updatePaginationControls();
        })
        .catch(error => {
            console.error('Error loading songs:', error);
            songTableBody.innerHTML = `
                <tr>
                    <td class="text-center text-danger">
                        Fehler beim Laden der Songs. Bitte versuchen Sie es später erneut.
                    </td>
                </tr>
            `;
        });
    
    // Function to render songs based on current page and filter
    function renderSongs() {
        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * songsPerPage;
        const endIndex = Math.min(startIndex + songsPerPage, filteredSongs.length);
        
        // Clear table body
        songTableBody.innerHTML = '';
        
        // Check if we have songs to display
        if (filteredSongs.length === 0) {
            songTableBody.innerHTML = `
                <tr>
                    <td class="text-center">
                        Keine Songs gefunden.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Add songs to table
        for (let i = startIndex; i < endIndex; i++) {
            const song = filteredSongs[i];
            
            // Skip if we're out of bounds
            if (i >= filteredSongs.length) {
                break;
            }
            
            const row = document.createElement('tr');
            
            // Create cell for song title
            const cell = document.createElement('td');
            cell.textContent = song.title;
            row.appendChild(cell);
            
            songTableBody.appendChild(row);
        }
        
        // Update page info
        updatePageInfo();
    }
    
    // Function to filter songs based on search input
    function filterSongs(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            filteredSongs = [...allSongs];
        } else {
            searchTerm = searchTerm.toLowerCase().trim();
            filteredSongs = allSongs.filter(song => 
                song.title.toLowerCase().includes(searchTerm)
            );
        }
        
        // Reset to first page when filtering
        currentPage = 1;
        renderSongs();
        updatePaginationControls();
    }
    
    // Function to update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
        
        // Disable/enable previous button
        prevPageBtn.disabled = currentPage <= 1;
        
        // Disable/enable next button
        nextPageBtn.disabled = currentPage >= totalPages;
        
        // Update page info
        updatePageInfo();
    }
    
    // Function to update page info text
    function updatePageInfo() {
        const totalPages = Math.max(1, Math.ceil(filteredSongs.length / songsPerPage));
        pageInfo.textContent = `Seite ${currentPage} von ${totalPages}`;
    }
    
    // Event listener for search input
    songSearch.addEventListener('input', () => {
        filterSongs(songSearch.value);
    });
    
    // Event listeners for pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSongs();
            updatePaginationControls();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderSongs();
            updatePaginationControls();
        }
    });
    
    // Update songs per page on window resize
    window.addEventListener('resize', () => {
        const newSongsPerPage = window.innerWidth >= 992 ? songsPerPageDesktop : songsPerPageMobile;
        
        // Only update if the value changed
        if (newSongsPerPage !== songsPerPage) {
            songsPerPage = newSongsPerPage;
            renderSongs();
            updatePaginationControls();
        }
    });
});
