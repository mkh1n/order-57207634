class CaseGallery {
    constructor(container) {
        this.container = container;
        this.galleries = [];
        this.init();
    }

    init() {
        // Находим все галереи внутри контейнера
        const caseCards = this.container.querySelectorAll('.case-card');
        
        caseCards.forEach((card, index) => {
            const gallery = card.querySelector('.case-gallery');
            if (gallery) {
                this.initGallery(gallery, index);
            }
        });
    }

    initGallery(gallery, caseIndex) {
        const items = gallery.querySelectorAll('.case-gallery-item');
        const existingControls = gallery.querySelector('.slider-controls');
        
        if (items.length <= 1) {
            // Скрываем контролы если изображение одно
            if (existingControls) {
                existingControls.style.display = 'none';
            }
            return;
        }

        // Обновляем существующие контролы вместо создания новых
        this.updateExistingControls(gallery, items, caseIndex, existingControls);
        
        // Инициализируем состояние
        this.showSlide(gallery, 0, caseIndex);
    }

    updateExistingControls(gallery, items, caseIndex, controls) {
        if (!controls) return;

        // Обновляем точки
        const dotsContainer = controls.querySelector('.slider-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = Array.from(items).map((_, index) => 
                `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
            ).join('');
        }

        // Добавляем обработчики событий
        this.addEventListeners(gallery, items, caseIndex, controls);
    }

    addEventListeners(gallery, items, caseIndex, controls) {
        const prevBtn = gallery.querySelector('.slider-arrow.prev');
        const nextBtn = gallery.querySelector('.slider-arrow.next');
        const dots = controls.querySelectorAll('.dot[data-index]');

        let currentSlide = 0;

        // Обработчик для кнопки "назад"
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + items.length) % items.length;
            this.showSlide(gallery, currentSlide, caseIndex);
            this.updateDots(controls, currentSlide);
        });

        // Обработчик для кнопки "вперед"
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % items.length;
            this.showSlide(gallery, currentSlide, caseIndex);
            this.updateDots(controls, currentSlide);
        });

        // Обработчики для точек
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-index'));
                currentSlide = slideIndex;
                this.showSlide(gallery, currentSlide, caseIndex);
                this.updateDots(controls, currentSlide);
            });
        });

        // Сохраняем состояние для этой галереи
        this.galleries[caseIndex] = {
            gallery,
            items,
            controls,
            currentSlide
        };
    }

    updateDots(controls, currentSlide) {
        const dots = controls.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    showSlide(gallery, slideIndex, caseIndex) {
        const items = gallery.querySelectorAll('.case-gallery-item');

        // Скрываем все изображения
        items.forEach(item => {
            item.style.display = 'none';
        });

        // Показываем текущее изображение
        items[slideIndex].style.display = 'block';

        // Обновляем состояние
        if (this.galleries[caseIndex]) {
            this.galleries[caseIndex].currentSlide = slideIndex;
        }
    }
}


// Инициализация галереи при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем все галереи на странице
    const casesSections = document.querySelectorAll('.cases-section');
    casesSections.forEach(section => {
        new CaseGallery(section);
    });
});

// Альтернативный вариант для простого использования
function initCaseGalleries() {
    const casesSections = document.querySelectorAll('.cases-section');
    casesSections.forEach(section => {
        new CaseGallery(section);
    });
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CaseGallery, initCaseGalleries };
}