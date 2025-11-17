function enableDragScrollWithInertia(element) {
    let isDragging = false;
    let startX;
    let scrollLeftStart;
    let lastScrollLeft;
    let velocity = 0;
    let lastTime;
    let animationFrame;

    function animateInertia() {
        if (Math.abs(velocity) > 0.5) {
            element.scrollLeft += velocity;
            velocity *= 0.92;
            
            animationFrame = requestAnimationFrame(animateInertia);
        } else {
            velocity = 0;
            cancelAnimationFrame(animationFrame);
        }
    }

    function handleMouseDown(e) {
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        
        cancelAnimationFrame(animationFrame);
        velocity = 0;
        
        isDragging = true;
        element.style.cursor = 'grabbing';
        element.style.scrollSnapType = 'none';
        startX = e.pageX;
        scrollLeftStart = element.scrollLeft;
        lastScrollLeft = element.scrollLeft;
        lastTime = performance.now();
        
        e.preventDefault();
        e.stopPropagation();
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        
        const x = e.pageX;
        const walk = x - startX;
        element.scrollLeft = scrollLeftStart - walk;
        
        // Расчет скорости на основе изменения scrollLeft
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            const currentScrollLeft = element.scrollLeft;
            velocity = (currentScrollLeft - lastScrollLeft) / deltaTime * 16;
            lastScrollLeft = currentScrollLeft;
        }
        
        lastTime = currentTime;
    }

    function handleMouseUp() {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.cursor = 'grab';
        element.style.scrollSnapType = '';
        
        if (Math.abs(velocity) > 1) {
            animationFrame = requestAnimationFrame(animateInertia);
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    function handleTouchStart(e) {
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        
        cancelAnimationFrame(animationFrame);
        velocity = 0;
        
        isDragging = true;
        element.style.scrollSnapType = 'none';
        startX = e.touches[0].pageX;
        scrollLeftStart = element.scrollLeft;
        lastScrollLeft = element.scrollLeft;
        lastTime = performance.now();
        
        // НЕ предотвращаем поведение по умолчанию для тача
        // e.preventDefault();
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        
        // Проверяем направление движения
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.pageX - startX);
        const deltaY = Math.abs(touch.pageY - startX);
        
        // Если вертикальное движение больше горизонтального - разрешаем скролл страницы
        if (deltaY > deltaX && deltaY > 10) {
            isDragging = false;
            element.style.scrollSnapType = '';
            return; // Разрешаем браузеру обработать вертикальный скролл
        }
        
        // Горизонтальное движение - обрабатываем наш скролл
        const x = touch.pageX;
        const walk = x - startX;
        element.scrollLeft = scrollLeftStart - walk;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
            const currentScrollLeft = element.scrollLeft;
            velocity = (currentScrollLeft - lastScrollLeft) / deltaTime * 16;
            lastScrollLeft = currentScrollLeft;
        }
        
        lastTime = currentTime;
        
        // Предотвращаем только для горизонтального скролла
        e.preventDefault();
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        element.style.scrollSnapType = '';
        
        if (Math.abs(velocity) > 1) {
            animationFrame = requestAnimationFrame(animateInertia);
        }
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    }

    // Разрешаем колесико мыши для вертикального скролла
    element.addEventListener('wheel', (e) => {
        // Если это в основном вертикальный скролл - разрешаем
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            return; // Разрешаем стандартное поведение браузера
        }
        
        // Если это горизонтальный скролл - обрабатываем сами
        element.scrollLeft += e.deltaY;
        e.preventDefault();
    }, { passive: false });

    // Обработчики
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Запрещаем контекстное меню при drag
    element.addEventListener('contextmenu', (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    });

    // Обработчик для принудительного отпускания
    document.addEventListener('mouseleave', handleMouseUp);
    window.addEventListener('blur', handleMouseUp);
}

// Использование
document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.querySelector('.catalog-grid');
    if (catalogGrid) {
        enableDragScrollWithInertia(catalogGrid);
    }
});