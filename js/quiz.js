class Quiz {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6; // 5 вопросов + контактные данные
        this.answers = {};
        this.init();
    }

    init() {
        this.updateProgress();
        this.bindEvents();
        this.setMinDate();
        this.bindFormEvents();
        this.bindModalEvents();
        this.initPhoneMask();
    }

    initPhoneMask() {
        // Инициализация масок для телефонов
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => this.formatPhoneNumber(e.target));
            input.addEventListener('keydown', (e) => this.handlePhoneKeyDown(e));
            // Устанавливаем плейсхолдер
            input.placeholder = '+7(999) 999 99 99';
        });
    }

    formatPhoneNumber(input) {
        // Удаляем все нецифровые символы, кроме +
        let value = input.value.replace(/[^\d+]/g, '');
        
        // Если первый символ 8, заменяем на +7
        if (value.startsWith('8')) {
            value = '+7' + value.substring(1);
        }
        // Если первый символ цифра (не 8) и нет + в начале, добавляем +
        else if (/^\d/.test(value) && !value.startsWith('+')) {
            value = '+' + value;
        }
        // Если начинается с 7 и нет +, добавляем +
        else if (value.startsWith('7') && !value.startsWith('+7')) {
            value = '+7' + value.substring(1);
        }
        
        // Ограничиваем длину (11 цифр + символ +)
        const digits = value.replace(/\D/g, '');
        if (digits.length > 11) {
            value = value.substring(0, value.length - (digits.length - 11));
        }

        // Форматируем номер только если есть достаточно цифр
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length >= 1) {
            let formattedValue = '+';
            
            if (cleanValue.startsWith('7')) {
                formattedValue += '7';
                const restDigits = cleanValue.substring(1);
                
                if (restDigits.length > 0) {
                    formattedValue += '(' + restDigits.substring(0, 3);
                }
                if (restDigits.length > 3) {
                    formattedValue += ') ' + restDigits.substring(3, 6);
                }
                if (restDigits.length > 6) {
                    formattedValue += ' ' + restDigits.substring(6, 8);
                }
                if (restDigits.length > 8) {
                    formattedValue += ' ' + restDigits.substring(8, 10);
                }
            } else {
                // Для других стран просто добавляем цифры
                formattedValue += cleanValue;
            }
            
            input.value = formattedValue;
        } else {
            input.value = value;
        }

        // Скрываем ошибку если она была показана ранее
        this.hideError(input);
        this.updateButtonState();
    }

    handlePhoneKeyDown(e) {
        // Разрешаем: backspace, delete, tab, escape, enter
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
            // Разрешаем: Ctrl+A
            (e.keyCode === 65 && e.ctrlKey === true) ||
            // Разрешаем: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
        }
        
        // Запрещаем все, кроме цифр и +
        if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 187 && e.keyCode !== 107) {
            e.preventDefault();
        }
    }

    validatePhone(phone) {
        // Проверяем, что номер содержит 11 цифр (включая 7)
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 && digits.startsWith('7');
    }

    bindModalEvents() {
        // Открытие модального окна при клике на элементы с классом open-form (кроме кнопок в квизе)
        document.querySelectorAll('.open-form').forEach(element => {
            // Проверяем, не находится ли элемент внутри квиза
            if (!element.closest('#quizForm')) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openFormModal();
                });
            }
        });

        // Закрытие модального окна
        const modal = document.getElementById('formModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            this.closeFormModal();
        });

        // Закрытие при клике вне модального окна
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFormModal();
            }
        });
    }

    openFormModal() {
        const modal = document.getElementById('formModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeFormModal() {
        const modal = document.getElementById('formModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const deadlineInput = document.querySelector('input[name="merch-deadline"]');
        if (deadlineInput) {
            deadlineInput.min = today;
        }
    }

    bindEvents() {
        // Обработчики для кнопок квиза
        document.querySelectorAll('.quiz-btn.next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.validateAndNextStep();
            });
        });

        document.querySelectorAll('.quiz-btn.submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.validateAndSubmitQuiz();
            });
        });

        // Обработчики для выбора вариантов
        document.querySelectorAll('.quiz-option input[type="checkbox"], .quiz-option input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => this.handleOptionSelect(e.target));
        });

        // Обработчики для полей ввода - только скрываем ошибки при вводе
        document.querySelectorAll('.quiz-input').forEach(input => {
            input.addEventListener('input', (e) => {
                // Скрываем ошибку при вводе
                this.hideError(e.target);
                this.updateButtonState();
            });
        });
    }

    bindFormEvents() {
        const contactForm = document.getElementById('main-contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitContactForm(contactForm);
            });

            // Скрываем ошибки при вводе в попапе
            const popupInputs = contactForm.querySelectorAll('input, textarea');
            popupInputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    this.hideError(e.target);
                    this.updateContactFormButton();
                });
            });
        }
    }

    hideError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
            input.classList.remove('error');
        }
    }

    showError(input, message) {
        let errorElement = input.nextElementSibling;
        
        // Если элемента ошибки нет, создаем его
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        input.classList.add('error');
    }

    validateAndNextStep() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        // Сначала скрываем все ошибки на текущем шаге
        currentStepElement.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        currentStepElement.querySelectorAll('.quiz-input.error').forEach(input => {
            input.classList.remove('error');
        });

        // Валидируем текущий шаг
        const isValid = this.validateCurrentStep();
        
        if (isValid) {
            this.nextStep();
        }
    }

    validateAndSubmitQuiz() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        // Сначала скрываем все ошибки на текущем шаге
        currentStepElement.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        currentStepElement.querySelectorAll('.quiz-input.error').forEach(input => {
            input.classList.remove('error');
        });

        // Валидируем текущий шаг
        const isValid = this.validateCurrentStep();
        
        if (isValid) {
            this.submitQuiz();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return false;

        let isValid = true;

        switch (this.currentStep) {
            case 1:
            case 2:
                const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"]:checked');
                if (checkboxes.length === 0) {
                    isValid = false;
                    // Показываем общую ошибку для чекбоксов
                    const errorElement = currentStepElement.querySelector('.quiz-options').nextElementSibling;
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.style.display = 'block';
                    }
                }
                break;

            case 3:
                const radio = currentStepElement.querySelector('input[type="radio"]:checked');
                if (!radio) {
                    isValid = false;
                    // Показываем общую ошибку для радио-кнопок
                    const errorElement = currentStepElement.querySelector('.quiz-options').nextElementSibling;
                    if (errorElement && errorElement.classList.contains('error-message')) {
                        errorElement.style.display = 'block';
                    }
                }
                break;

            case 4:
                const circulationInput = currentStepElement.querySelector('input[name="merch-circulation"]');
                const circulationValue = circulationInput ? circulationInput.value.trim() : '';
                
                if (!circulationValue) {
                    isValid = false;
                    this.showError(circulationInput, 'Пожалуйста, укажите тираж');
                } else if (parseInt(circulationValue) < 50) {
                    isValid = false;
                    this.showError(circulationInput, 'Тираж должен быть не менее 50 шт');
                }
                break;

            case 5:
                const deadlineInput = currentStepElement.querySelector('input[name="merch-deadline"]');
                const deadlineValue = deadlineInput ? deadlineInput.value.trim() : '';
                
                if (!deadlineValue) {
                    isValid = false;
                    this.showError(deadlineInput, 'Пожалуйста, укажите дату');
                } else if (new Date(deadlineValue) < new Date().setHours(0, 0, 0, 0)) {
                    isValid = false;
                    this.showError(deadlineInput, 'Дата не может быть раньше сегодняшнего дня');
                }
                break;

            case 6:
                const nameInput = currentStepElement.querySelector('input[name="user-name"]');
                const nameValue = nameInput ? nameInput.value.trim() : '';
                const phoneInput = currentStepElement.querySelector('input[name="user-phone"]');
                const phoneValue = phoneInput ? phoneInput.value.trim() : '';
                const emailInput = currentStepElement.querySelector('input[name="user-email"]');
                const emailValue = emailInput ? emailInput.value.trim() : '';
                
                if (!nameValue) {
                    isValid = false;
                    this.showError(nameInput, 'Пожалуйста, введите ваше имя');
                }
                
                if (!phoneValue) {
                    isValid = false;
                    this.showError(phoneInput, 'Пожалуйста, введите номер телефона');
                } else if (!this.validatePhone(phoneValue)) {
                    isValid = false;
                    this.showError(phoneInput, 'Пожалуйста, введите корректный номер телефона');
                }
                
                if (!emailValue) {
                    isValid = false;
                    this.showError(emailInput, 'Пожалуйста, введите email');
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailValue)) {
                        isValid = false;
                        this.showError(emailInput, 'Пожалуйста, введите корректный email');
                    }
                }
                break;
        }

        return isValid;
    }

    updateContactFormButton() {
        const contactForm = document.getElementById('main-contact-form');
        if (!contactForm) return;

        const submitBtn = contactForm.querySelector('.submit-btn');
        const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
        
        let allValid = true;
        
        inputs.forEach(input => {
            if (input.name === 'quantity') {
                const value = input.value.trim();
                if (!value || parseInt(value) < 50) {
                    allValid = false;
                }
            } else if (input.type === 'tel') {
                if (!input.value.trim() || !this.validatePhone(input.value)) {
                    allValid = false;
                }
            } else {
                if (!input.value.trim()) {
                    allValid = false;
                }
            }
        });

        submitBtn.disabled = !allValid;
    }

    handleOptionSelect(input) {
        const option = input.closest('.quiz-option');

        if (input.type === 'checkbox') {
            if (input.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        } else {
            const allOptions = option.closest('.quiz-options').querySelectorAll('.quiz-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        }

        this.updateButtonState();
    }

    updateButtonState() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        const nextButton = currentStepElement.querySelector('.quiz-btn.next');
        const submitButton = currentStepElement.querySelector('.quiz-btn.submit');

        let isStepValid = false;

        switch (this.currentStep) {
            case 1:
            case 2:
                const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"]:checked');
                isStepValid = checkboxes.length > 0;
                break;

            case 3:
                const radio = currentStepElement.querySelector('input[type="radio"]:checked');
                isStepValid = !!radio;
                break;

            case 4:
                const circulationInput = currentStepElement.querySelector('input[name="merch-circulation"]');
                isStepValid = circulationInput && circulationInput.value && parseInt(circulationInput.value) >= 50;
                break;

            case 5:
                const deadlineInput = currentStepElement.querySelector('input[name="merch-deadline"]');
                isStepValid = deadlineInput && deadlineInput.value && new Date(deadlineInput.value) >= new Date().setHours(0, 0, 0, 0);
                break;

            case 6:
                const nameInput = currentStepElement.querySelector('input[name="user-name"]');
                const phoneInput = currentStepElement.querySelector('input[name="user-phone"]');
                const emailInput = currentStepElement.querySelector('input[name="user-email"]');
                
                isStepValid = nameInput && nameInput.value && 
                             phoneInput && phoneInput.value && this.validatePhone(phoneInput.value) && 
                             emailInput && emailInput.value;
                break;
        }

        if (nextButton) {
            nextButton.disabled = !isStepValid;
        }
        if (submitButton) {
            submitButton.disabled = !isStepValid;
        }
    }

    collectAnswers() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        switch (this.currentStep) {
            case 1:
                const merchFor = Array.from(currentStepElement.querySelectorAll('input[name="merch-for"]:checked'))
                    .map(input => input.value);
                this.answers.merchFor = merchFor;
                break;

            case 2:
                const merchEvent = Array.from(currentStepElement.querySelectorAll('input[name="merch-event"]:checked'))
                    .map(input => input.value);
                this.answers.merchEvent = merchEvent;
                break;

            case 3:
                const merchDesign = currentStepElement.querySelector('input[name="merch-design"]:checked');
                this.answers.merchDesign = merchDesign ? merchDesign.value : null;
                break;

            case 4:
                const circulation = currentStepElement.querySelector('input[name="merch-circulation"]').value;
                this.answers.circulation = circulation;
                break;

            case 5:
                const deadline = currentStepElement.querySelector('input[name="merch-deadline"]').value;
                this.answers.deadline = deadline;
                break;

            case 6:
                const name = currentStepElement.querySelector('input[name="user-name"]').value;
                const phone = currentStepElement.querySelector('input[name="user-phone"]').value;
                const email = currentStepElement.querySelector('input[name="user-email"]').value;
                
                this.answers.contactInfo = {
                    name: name,
                    phone: phone,
                    email: email
                };
                break;
        }
    }

    nextStep() {
        if (this.currentStep >= this.totalSteps) return;

        this.collectAnswers();
        this.currentStep++;
        this.showStep();
    }

    showStep() {
        document.querySelectorAll('.quiz-step').forEach(step => {
            step.classList.remove('active');
        });

        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        this.updateProgress();
        this.updateButtonState();
        this.restoreAnswers();
    }

    restoreAnswers() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;

        switch (this.currentStep) {
            case 1:
                if (this.answers.merchFor) {
                    this.answers.merchFor.forEach(value => {
                        const input = currentStepElement.querySelector(`input[value="${value}"]`);
                        if (input) {
                            input.checked = true;
                            input.closest('.quiz-option').classList.add('selected');
                        }
                    });
                }
                break;

            case 2:
                if (this.answers.merchEvent) {
                    this.answers.merchEvent.forEach(value => {
                        const input = currentStepElement.querySelector(`input[value="${value}"]`);
                        if (input) {
                            input.checked = true;
                            input.closest('.quiz-option').classList.add('selected');
                        }
                    });
                }
                break;

            case 3:
                if (this.answers.merchDesign) {
                    const input = currentStepElement.querySelector(`input[value="${this.answers.merchDesign}"]`);
                    if (input) {
                        input.checked = true;
                        input.closest('.quiz-option').classList.add('selected');
                    }
                }
                break;

            case 4:
                if (this.answers.circulation) {
                    currentStepElement.querySelector('input[name="merch-circulation"]').value = this.answers.circulation;
                }
                break;

            case 5:
                if (this.answers.deadline) {
                    currentStepElement.querySelector('input[name="merch-deadline"]').value = this.answers.deadline;
                }
                break;

            case 6:
                if (this.answers.contactInfo) {
                    currentStepElement.querySelector('input[name="user-name"]').value = this.answers.contactInfo.name || '';
                    currentStepElement.querySelector('input[name="user-phone"]').value = this.answers.contactInfo.phone || '';
                    currentStepElement.querySelector('input[name="user-email"]').value = this.answers.contactInfo.email || '';
                }
                break;
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            // Для шагов 1-5 прогресс заполняется полностью на 5-м шаге
            if (this.currentStep <= 5) {
                const progressPercentage =  100 - ((100 / 5) * (this.currentStep -1)) - 20;
                progressFill.style.width = `calc(${progressPercentage}% - 20px)`;
                
                // На 5-м шаге убираем отступы полностью
                if (this.currentStep === 5) {
                    progressFill.style.width = '100%';
                    progressFill.style.padding = '0';
                } else {
                    progressFill.style.padding = '';
                }
            } else {
                // На 6-м шаге (контактные данные) прогресс бар скрываем или оставляем полным
                progressFill.style.width = '100%';
                progressFill.style.padding = '0';
            }
        }
    }

    submitQuiz() {
        this.collectAnswers();

        // Проверяем, находимся ли мы на последнем шаге с контактными данными
        if (this.currentStep === 6) {
            this.finalSubmit();
        } else {
            // Переходим к контактным данным (шаг 6)
            this.currentStep = 6;
            this.showStep();
        }
    }

    finalSubmit() {
        this.collectAnswers();

        const allAnswers = {
            ...this.answers,
            timestamp: new Date().toISOString(),
            source: 'quiz' // Помечаем, что данные пришли из квиза
        };

        console.log('Все данные формы квиза:', allAnswers);

        // Отправляем данные (и квиз, и контактные)
        this.submitToServer(allAnswers, 'quiz');
    }

    submitContactForm(form) {
        // Валидируем все поля перед отправкой
        let allValid = true;

        // Сначала скрываем все ошибки
        form.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        form.querySelectorAll('.error').forEach(input => {
            input.classList.remove('error');
        });

        const quantityInput = form.querySelector('input[name="quantity"]');
        const quantityValue = quantityInput ? quantityInput.value.trim() : '';
        if (!quantityValue) {
            allValid = false;
            this.showError(quantityInput, 'Пожалуйста, укажите тираж');
        } else if (parseInt(quantityValue) < 50) {
            allValid = false;
            this.showError(quantityInput, 'Тираж должен быть не менее 50 шт');
        }

        const nameInput = form.querySelector('input[name="name"]');
        const nameValue = nameInput ? nameInput.value.trim() : '';
        if (!nameValue) {
            allValid = false;
            this.showError(nameInput, 'Пожалуйста, введите ваше имя');
        }

        const phoneInput = form.querySelector('input[name="phone"]');
        const phoneValue = phoneInput ? phoneInput.value.trim() : '';
        if (!phoneValue) {
            allValid = false;
            this.showError(phoneInput, 'Пожалуйста, введите номер телефона');
        } else if (!this.validatePhone(phoneValue)) {
            allValid = false;
            this.showError(phoneInput, 'Пожалуйста, введите корректный номер телефона');
        }

        const emailInput = form.querySelector('input[name="email"]');
        const emailValue = emailInput ? emailInput.value.trim() : '';
        if (!emailValue) {
            allValid = false;
            this.showError(emailInput, 'Пожалуйста, введите email');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                allValid = false;
                this.showError(emailInput, 'Пожалуйста, введите корректный email');
            }
        }

        if (!allValid) {
            return;
        }

        const formData = new FormData(form);
        const contactData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message'),
            quantity: formData.get('quantity'),
            timestamp: new Date().toISOString(),
            source: 'contact_form' // Помечаем, что данные пришли из контактной формы
        };

        console.log('Данные контактной формы:', contactData);

        // Отправляем только контактные данные
        this.submitToServer(contactData, 'contact');
    }

    submitToServer(data, type) {
        // Имитация отправки на сервер
        const isSuccess = Math.random() > 0.2; // 80% шанс успеха для демонстрации

        setTimeout(() => {
            if (isSuccess) {
                this.showSuccessMessage(type);
            } else {
                this.showErrorMessage(type);
            }
        }, 1000);
    }

    showSuccessMessage(type) {
        if (type === 'quiz') {
            const quizForm = document.querySelector('#quizForm');
            if (quizForm) {
                quizForm.innerHTML = `
                    <div class="quiz-success active">
                        <h2>Спасибо!</h2>
                        <p>Мы свяжемся с вами в ближайшее время</p>
                    </div>
                `;
            }
        } else if (type === 'contact') {
            const contactForm = document.getElementById('main-contact-form');
            if (contactForm) {
                contactForm.innerHTML = `
                    <div class="status-message status-success">
                        <h2>Спасибо!</h2>
                        <p>Мы свяжемся с вами в ближайшее время</p>
                    </div>
                `;
            }
            
            // Автоматически закрываем модальное окно через 3 секунды
            setTimeout(() => {
                this.closeFormModal();
                // Восстанавливаем форму для следующего использования
                setTimeout(() => {
                    this.restoreContactForm();
                }, 1000);
            }, 3000);
        }
    }

    showErrorMessage(type) {
        if (type === 'quiz') {
            const quizHolder = document.querySelector('.quiz-holder');
            if (quizHolder) {
                quizHolder.innerHTML = `
                    <div class="quiz-error active">
                        <h2>Произошла ошибка</h2>
                        <p>Попробуйте позже</p>
                    </div>
                `;
            }
        } else if (type === 'contact') {
            const contactForm = document.getElementById('main-contact-form');
            if (contactForm) {
                const submitBtn = contactForm.querySelector('.submit-btn');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = 'Произошла ошибка. Попробуйте позже';
                submitBtn.style.backgroundColor = '#dc3545';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        }
    }

    restoreContactForm() {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            // Здесь можно восстановить оригинальную форму
            // Для простоты перезагружаем страницу
            location.reload();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});