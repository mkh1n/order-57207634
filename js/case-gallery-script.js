document.addEventListener('DOMContentLoaded', function() {
    class MobileSwipeManager {
        constructor() {
            this.slider = document.querySelector('.cases-slider');
            this.caseCards = document.querySelectorAll('.case-card');
            this.isMobile = false;
            this.startX = 0;
            this.currentX = 0;
            this.isDragging = false;
            this.currentTranslate = 0;
            this.prevTranslate = 0;
            this.animationID = 0;
            this.currentIndex = 0;
            
            this.init();
        }
        
        init() {
            if (!this.slider || this.caseCards.length === 0) return;
            
            this.slider.style.overflow = 'hidden';
            this.slider.style.cursor = 'grab';
            this.slider.style.display = 'flex';
            
            this.checkViewport();
            
            window.addEventListener('resize', this.debounce(() => {
                this.checkViewport();
            }, 250));
        }
        
        checkViewport() {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.handleViewportChange(this.isMobile);
            }
        }
        
        handleViewportChange(isMobile) {
            if (isMobile) {
                this.enableSwipe();
                this.setSliderPosition(0);
            } else {
                this.disableSwipe();
                this.setSliderPosition(0);
            }
        }
        
        enableSwipe() {
            this.caseCards.forEach(card => {
                card.classList.remove('uc-leftscroll');
            });
            
            this.slider.addEventListener('mousedown', this.touchStart.bind(this));
            this.slider.addEventListener('touchstart', this.touchStart.bind(this));
            this.slider.addEventListener('mousemove', this.touchMove.bind(this));
            this.slider.addEventListener('touchmove', this.touchMove.bind(this));
            this.slider.addEventListener('mouseup', this.touchEnd.bind(this));
            this.slider.addEventListener('touchend', this.touchEnd.bind(this));
            this.slider.addEventListener('mouseleave', this.touchEnd.bind(this));
            
            this.slider.addEventListener('contextmenu', (e) => e.preventDefault());
            this.slider.style.cursor = 'grab';
        }
        
        disableSwipe() {
            this.slider.removeEventListener('mousedown', this.touchStart);
            this.slider.removeEventListener('touchstart', this.touchStart);
            this.slider.removeEventListener('mousemove', this.touchMove);
            this.slider.removeEventListener('touchmove', this.touchMove);
            this.slider.removeEventListener('mouseup', this.touchEnd);
            this.slider.removeEventListener('touchend', this.touchEnd);
            this.slider.removeEventListener('mouseleave', this.touchEnd);
            
            this.slider.style.cursor = 'default';
            this.setSliderPosition(0);
        }
        
        touchStart(event) {
            if (!this.isMobile) return;
            if (event.target.closest('.case-gallery')) return;
            
            this.isDragging = true;
            this.startX = this.getPositionX(event);
            this.prevTranslate = this.currentTranslate;
            this.slider.style.cursor = 'grabbing';
            this.animationID = requestAnimationFrame(this.animation.bind(this));
        }
        
        touchMove(event) {
            if (!this.isDragging || !this.isMobile) return;
            
            this.currentX = this.getPositionX(event);
            this.currentTranslate = this.prevTranslate + this.currentX - this.startX;
        }
        
        touchEnd() {
            if (!this.isMobile) return;
            
            this.isDragging = false;
            cancelAnimationFrame(this.animationID);
            this.slider.style.cursor = 'grab';
            
            const movedBy = this.currentTranslate - this.prevTranslate;
            
            if (Math.abs(movedBy) > 50) {
                if (movedBy > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            } else {
                this.setSliderPosition(this.currentIndex);
            }
        }
        
        getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }
        
        animation() {
            this.setSliderPosition(this.currentTranslate);
            if (this.isDragging) {
                requestAnimationFrame(this.animation.bind(this));
            }
        }
        
        setSliderPosition(position) {
            const maxTranslate = 0;
            const minTranslate = -((this.caseCards.length - 1) * this.getCardWidth());
            
            let newPosition = position;
            
            if (newPosition > maxTranslate) {
                newPosition = maxTranslate;
            } else if (newPosition < minTranslate) {
                newPosition = minTranslate;
            }
            
            this.currentTranslate = newPosition;
            this.slider.style.transform = `translateX(${newPosition}px)`;
            
            this.currentIndex = Math.round(-newPosition / this.getCardWidth());
        }
        
        getCardWidth() {
            return this.caseCards[0].offsetWidth + 
                   parseInt(getComputedStyle(this.caseCards[0]).marginRight || 0) +
                   parseInt(getComputedStyle(this.caseCards[0]).marginLeft || 0);
        }
        
        nextSlide() {
            if (this.currentIndex < this.caseCards.length - 1) {
                this.currentIndex++;
                this.smoothSlideTo(this.currentIndex);
            }
        }
        
        prevSlide() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.smoothSlideTo(this.currentIndex);
            }
        }
        
        smoothSlideTo(index) {
            const targetPosition = -index * this.getCardWidth();
            this.currentTranslate = targetPosition;
            this.slider.style.transition = 'transform 0.3s ease';
            this.slider.style.transform = `translateX(${targetPosition}px)`;
            
            setTimeout(() => {
                this.slider.style.transition = '';
            }, 300);
        }
        
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    }

    // Ваш класс галереи с небольшими изменениями
    class CaseGallery {
        constructor(container) {
            this.container = container;
            this.galleries = [];
            this.init();
        }

        init() {
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
                if (existingControls) {
                    existingControls.style.display = 'none';
                }
                return;
            }

            this.updateExistingControls(gallery, items, caseIndex, existingControls);
            this.showSlide(gallery, 0, caseIndex);
        }

        updateExistingControls(gallery, items, caseIndex, controls) {
            if (!controls) return;

            const dotsContainer = controls.querySelector('.slider-dots');
            if (dotsContainer) {
                dotsContainer.innerHTML = Array.from(items).map((_, index) => 
                    `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
                ).join('');
            }

            this.addEventListeners(gallery, items, caseIndex, controls);
        }

        addEventListeners(gallery, items, caseIndex, controls) {
            const prevBtn = gallery.querySelector('.slider-arrow.prev');
            const nextBtn = gallery.querySelector('.slider-arrow.next');
            const dots = controls.querySelectorAll('.dot[data-index]');

            let currentSlide = 0;

            // Обработчики кнопок
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide - 1 + items.length) % items.length;
                this.showSlide(gallery, currentSlide, caseIndex);
                this.updateDots(controls, currentSlide);
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSlide = (currentSlide + 1) % items.length;
                this.showSlide(gallery, currentSlide, caseIndex);
                this.updateDots(controls, currentSlide);
            });

            // Обработчики точек
            dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slideIndex = parseInt(dot.getAttribute('data-index'));
                    currentSlide = slideIndex;
                    this.showSlide(gallery, currentSlide, caseIndex);
                    this.updateDots(controls, currentSlide);
                });
            });

            // Свайп для галереи
            let startX = 0;
            let currentX = 0;

            const touchStart = (e) => {
                startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            };

            const touchMove = (e) => {
                if (!startX) return;
                currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
            };

            const touchEnd = () => {
                if (!startX) return;
                
                const diff = startX - currentX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0 && currentSlide < items.length - 1) {
                        currentSlide++;
                    } else if (diff < 0 && currentSlide > 0) {
                        currentSlide--;
                    }
                    this.showSlide(gallery, currentSlide, caseIndex);
                    this.updateDots(controls, currentSlide);
                }
                
                startX = 0;
                currentX = 0;
            };

            gallery.addEventListener('touchstart', touchStart);
            gallery.addEventListener('mousedown', touchStart);
            gallery.addEventListener('touchmove', touchMove);
            gallery.addEventListener('mousemove', touchMove);
            gallery.addEventListener('touchend', touchEnd);
            gallery.addEventListener('mouseup', touchEnd);
            gallery.addEventListener('mouseleave', touchEnd);

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

            items.forEach(item => {
                item.style.display = 'none';
            });

            items[slideIndex].style.display = 'block';

            if (this.galleries[caseIndex]) {
                this.galleries[caseIndex].currentSlide = slideIndex;
            }
        }
    }

    // Инициализация
    new MobileSwipeManager();
    
    const casesSections = document.querySelectorAll('.cases-section');
    casesSections.forEach(section => {
        new CaseGallery(section);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.catalog-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок и галерей
            document.querySelectorAll('.catalog-filter.active').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.catalog-grid.active').forEach(gallery => gallery.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Показываем выбранную галерею
            const galleryId = this.getAttribute('data-catalog');
            document.getElementById(galleryId).classList.add('active');
        });
    });
});