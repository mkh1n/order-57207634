document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mainNav = document.querySelector('.main-nav');
    const headerContainer = document.querySelector('.header-container');
    const body = document.body;
    
    // Создаем контейнер для мобильного меню
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mob'
    
    // Клонируем лого и навигацию для мобильного меню
    const logoClone = document.querySelector('.header-left').cloneNode(true);
    const navClone = mainNav.cloneNode(true);
    
    // Убираем кнопку бургера из клонированного лого
    const hamburgerInClone = logoClone.querySelector('.hamburger-btn');
    const logoTextClone = logoClone.querySelector('.logo-text');

    if (hamburgerInClone) {
        hamburgerInClone.remove();
    }
    if (logoTextClone) {
        logoTextClone.remove();
    }
    
    mobileMenu.appendChild(logoClone);
    mobileMenu.appendChild(navClone);
    
    // Добавляем мобильное меню в body
    body.appendChild(mobileMenu);
    
    // Функция для открытия/закрытия меню
    function toggleMenu() {
        const isOpen = mobileMenu.classList.contains('active');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        mobileMenu.classList.add('active');
        hamburgerBtn.classList.add('active');
        body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        body.style.overflow = ''; // Разблокируем скролл страницы
    }
    
    // Обработчик клика по бургер-кнопке
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Обработчик клика по ссылкам в меню
    mobileMenu.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
            closeMenu();
        }
    });
    
    // Закрытие меню при клике вне его области
    document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !hamburgerBtn.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Адаптация к изменению размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
});