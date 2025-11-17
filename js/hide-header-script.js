let lastScrollY = window.scrollY;
let ticking = false;

function updateHeader() {
    const header = document.getElementById('header');
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скролл вниз
        header.style.transform = 'translateY(-200%)';
    } else {
        // Скролл вверх
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

function onScroll() {
    if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll);