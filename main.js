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
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to nav links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('text-warning');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('text-warning');
        }
    });
});
