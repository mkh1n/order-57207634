document.addEventListener('DOMContentLoaded', function() {
    console.log('=== COMPLETE HEADER MANAGER INITIALIZATION ===');
    
    // ===== HEADER SCROLL BEHAVIOR =====
    class HeaderManager {
        constructor() {
            this.header = document.getElementById('header');
            this.lastScrollY = window.scrollY;
            this.isHidden = false;
            this.ticking = false;
            
            this.init();
        }
        
        init() {
            if (!this.header) {
                console.error('❌ Header element with id="header" not found!');
                return;
            }
            
            console.log('Header manager initialized');
            window.addEventListener('scroll', this.onScroll.bind(this));
        }
        
        onScroll() {
            if (!this.ticking) {
                requestAnimationFrame(this.updateHeader.bind(this));
                this.ticking = true;
            }
        }
        
        updateHeader() {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - this.lastScrollY;
            
            const isScrollingDown = scrollDelta > 0;
            const isScrollingUp = scrollDelta < 0;
            const isAtTop = currentScrollY < 50;
            
            // Скрываем хедер при скролле вниз (кроме верха страницы)
            if (isScrollingDown && currentScrollY > 100 && !isAtTop) {
                if (!this.isHidden) {
                    this.header.classList.add('hidden');
                    this.isHidden = true;
                }
            } 
            // Показываем хедер при скролле вверх или вверху страницы
            else if ((isScrollingUp || isAtTop) && this.isHidden) {
                this.header.classList.remove('hidden');
                this.isHidden = false;
            }
            
            this.lastScrollY = currentScrollY;
            this.ticking = false;
        }
        
        // Методы для ручного управления
        show() {
            this.header.classList.remove('hidden');
            this.isHidden = false;
        }
        
        hide() {
            this.header.classList.add('hidden');
            this.isHidden = true;
        }
        
        getHeight() {
            return this.header.offsetHeight;
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
            
            // Сначала ищем секцию в видимой области
            this.sections.forEach(({ id, element }) => {
                const rect = element.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionBottom = sectionTop + rect.height;
                
                const isInView = scrollPosition >= sectionTop && scrollPosition <= sectionBottom;
                const distanceToTop = Math.abs(sectionTop - scrollPosition);
                
                if (isInView && distanceToTop < minDistance) {
                    minDistance = distanceToTop;
                    activeSection = id;
                }
            });
            
            // Если нет активной секции в видимой области, ищем ближайшую сверху
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
    class SmoothScrollManager {
        constructor(headerManager) {
            this.headerManager = headerManager;
            this.init();
        }
        
        init() {
            // Обработка кликов по всем якорным ссылкам
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (link) {
                    this.handleClick(e, link);
                }
            });
            
            console.log('Smooth scroll manager initialized');
        }
        
        handleClick(e, link) {
            const href = link.getAttribute('href');
            
            // Пропускаем пустые якоря
            if (href === '#') return;
            
            const targetElement = document.getElementById(href.substring(1));
            if (!targetElement) {
                console.warn('Target element not found:', href);
                return;
            }
            
            e.preventDefault();
            
            // Показываем хедер перед скроллом
            this.headerManager.show();
            
            // Рассчитываем позицию с учетом высоты хедера
            const headerHeight = this.headerManager.getHeight();
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            console.log('Smooth scrolling to:', href, {
                targetOffset: targetElement.offsetTop,
                headerHeight: headerHeight,
                finalPosition: targetPosition,
                currentScroll: window.scrollY
            });
            
            // Плавный скролл
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ===== INITIALIZATION =====
    try {
        // Инициализируем менеджеры по порядку
        const headerManager = new HeaderManager();
        const navigationManager = new NavigationManager();
        const smoothScrollManager = new SmoothScrollManager(headerManager);
        
        // Глобальные функции для дебага
        window.debugHeader = {
            show: () => headerManager.show(),
            hide: () => headerManager.hide(),
            getState: () => ({
                scrollY: window.scrollY,
                lastScrollY: headerManager.lastScrollY,
                isHidden: headerManager.isHidden,
                hasHiddenClass: headerManager.header.classList.contains('hidden'),
                headerHeight: headerManager.getHeight()
            }),
            getSections: () => navigationManager.sections.map(s => s.id),
            getActiveSection: () => {
                const activeLink = document.querySelector('.main-nav a.active');
                return activeLink ? activeLink.getAttribute('href') : 'none';
            },
            testScroll: (sectionId) => {
                const target = document.getElementById(sectionId);
                if (target) {
                    const headerHeight = headerManager.getHeight();
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    console.log('Test scroll to:', sectionId, 'position:', targetPosition);
                }
            }
        };
        
        console.log('=== ALL SYSTEMS READY ===');
        console.log('Debug commands available:');
        console.log('- debugHeader.show() - show header');
        console.log('- debugHeader.hide() - hide header');
        console.log('- debugHeader.getState() - get header state');
        console.log('- debugHeader.getSections() - get available sections');
        console.log('- debugHeader.getActiveSection() - get active section');
        console.log('- debugHeader.testScroll("section-id") - test scroll to section');
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
});