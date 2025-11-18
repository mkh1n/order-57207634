// ===== HEADER SCROLL BEHAVIOR =====
class HeaderManager {
    constructor() {
        this.lastScrollY = window.scrollY;
        this.header = document.querySelector('.site-header');
        this.isHidden = false;
        this.scrollThreshold = 100;
        this.ticking = false;
        
        this.init();
    }
    
    init() {
        if (!this.header) {
            console.warn('Header element not found');
            return;
        }
        
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this));
        
        console.log('Header manager initialized');
    }
    
    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateHeader();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    handleResize() {
        // На мобильных всегда показываем хедер
        if (window.innerWidth <= 780) {
            this.showHeader();
        }
    }
    
    updateHeader() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - this.lastScrollY;
        const isMobile = window.innerWidth <= 780;
        
        if (isMobile) {
            // На мобильных не скрываем хедер
            this.showHeader();
            this.lastScrollY = currentScrollY;
            return;
        }
        
        // Скролл вниз и проскроллили больше порога
        if (scrollDelta > 0 && currentScrollY > this.scrollThreshold && !this.isHidden) {
            this.hideHeader();
        } 
        // Скролл вверх или вверху страницы
        else if (scrollDelta < 0 || currentScrollY <= this.scrollThreshold) {
            this.showHeader();
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    hideHeader() {
        this.header.style.transform = 'translateY(-100%)';
        this.header.style.transition = 'transform 0.3s ease';
        this.isHidden = true;
    }
    
    showHeader() {
        this.header.style.transform = 'translateY(0)';
        this.header.style.transition = 'transform 0.3s ease';
        this.isHidden = false;
    }
}

// ===== ACTIVE NAVIGATION =====
class NavigationManager {
    constructor() {
        this.navLinks = document.querySelectorAll('.main-nav a');
        this.sections = [];
        
        this.init();
    }
    
    init() {
        if (this.navLinks.length === 0) {
            console.warn('Navigation links not found');
            return;
        }
        
        // Собираем все секции с ID
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                const section = document.getElementById(sectionId);
                if (section) {
                    this.sections.push({
                        id: sectionId,
                        element: section,
                        link: link
                    });
                }
            }
        });
        
        window.addEventListener('scroll', this.throttle(this.updateActiveNav.bind(this), 100));
        this.updateActiveNav();
        
        console.log('Navigation manager initialized with', this.sections.length, 'sections');
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    updateActiveNav() {
        if (this.sections.length === 0) return;
        
        const scrollPosition = window.scrollY + 100;
        let activeSection = null;
        let minDistance = Infinity;
        
        this.sections.forEach(({ id, element, link }) => {
            const rect = element.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            // Проверяем, находится ли секция в видимой области
            const isInView = scrollPosition >= sectionTop && scrollPosition < sectionBottom;
            const distanceToTop = Math.abs(sectionTop - scrollPosition);
            
            if (isInView && distanceToTop < minDistance) {
                minDistance = distanceToTop;
                activeSection = id;
            }
        });
        
        // Если нет активной секции в видимой области, ищем ближайшую
        if (!activeSection) {
            this.sections.forEach(({ id, element }) => {
                const rect = element.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const distance = Math.abs(sectionTop - scrollPosition);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeSection = id;
                }
            });
        }
        
        // Обновляем активные классы
        this.sections.forEach(({ id, link }) => {
            link.classList.toggle('active', id === activeSection);
        });
    }
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !document.querySelector(href)) return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем менеджеры
    const headerManager = new HeaderManager();
    const navigationManager = new NavigationManager();
    
    // Инициализируем плавную прокрутку
    initSmoothScroll();
    
    console.log('All scripts initialized');
});

// ===== FALLBACK - простой вариант если классы не работают =====
document.addEventListener('DOMContentLoaded', function() {
    // Простой вариант скрытия хедера
    let lastScroll = window.pageYOffset;
    const header = document.querySelector('.site-header') || document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            const isMobile = window.innerWidth <= 780;
            
            if (isMobile) {
                header.style.transform = 'translateY(0)';
                return;
            }
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Скролл вниз
                header.style.transform = 'translateY(-100%)';
            } else {
                // Скролл вверх
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
});