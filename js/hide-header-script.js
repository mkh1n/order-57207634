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

function updateActiveNav() {
    const navLinks = document.querySelectorAll('.main-nav a');
    const sectionIds = Array.from(navLinks).map(link => 
        link.getAttribute('href').replace('#', '')
    );
    
    let closestSection = null;
    let minDistance = Infinity;
    
    const scrollPosition = window.scrollY + 100; // Отступ от верха
    
    // Находим ближайшую секцию из тех, что есть в меню
    sectionIds.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            // Расстояние до верха секции
            const distanceToTop = Math.abs(sectionTop - scrollPosition);
            // Расстояние до низа секции (если мы прокрутили дальше)
            const distanceToBottom = Math.abs(sectionBottom - scrollPosition);
            
            // Берем минимальное расстояние
            const distance = Math.min(distanceToTop, distanceToBottom);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSection = sectionId;
            }
        }
    });
    
    // Обновляем активную ссылку
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${closestSection}`) {
            link.classList.add('active');
        }
    });
}

// Троттлинг для производительности
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(updateActiveNav, 50);
});

document.addEventListener('DOMContentLoaded', updateActiveNav);