class Quiz {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.answers = {};
        this.init();
    }

    init() {
        this.updateProgress();
        this.bindEvents();
        this.setMinDate();
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelector('input[name="merch-deadline"]').min = today;
    }

    bindEvents() {
        // Обработчики для кнопок
        document.querySelectorAll('.quiz-btn.next').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        document.querySelector('.quiz-btn.submit').addEventListener('click', () => this.submitQuiz());

        // Обработчики для выбора вариантов
        document.querySelectorAll('.quiz-option input[type="checkbox"], .quiz-option input[type="radio"]').forEach(input => {
            input.addEventListener('change', (e) => this.handleOptionSelect(e.target));
        });

        // Обработчики для полей ввода
        document.querySelectorAll('.quiz-input').forEach(input => {
            input.addEventListener('input', (e) => this.handleInputChange(e.target));
            input.addEventListener('blur', (e) => this.validateInput(e.target));
        });
    }

    handleOptionSelect(input) {
        const option = input.closest('.quiz-option');

        if (input.type === 'checkbox') {
            // Для чекбоксов - множественный выбор
            if (input.checked) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        } else {
            // Для радио-кнопок - одиночный выбор
            const allOptions = option.closest('.quiz-options').querySelectorAll('.quiz-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        }

        this.updateButtonState();
    }

    handleInputChange(input) {
        // Сразу скрываем ошибку при вводе
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.style.display = 'none';
            input.classList.remove('error');
        }
    }

    validateInput(input) {
        let isValid = true;
        const value = input.value.trim();
        const errorElement = input.nextElementSibling;

        if (!errorElement || !errorElement.classList.contains('error-message')) {
            return true;
        }

        switch (input.name) {
            case 'merch-circulation':
                if (!value || parseInt(value) < 50) {
                    isValid = false;
                    errorElement.textContent = 'Тираж должен быть не менее 50 шт';
                }
                break;

            case 'merch-deadline':
                if (!value) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, укажите дату';
                } else if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                    isValid = false;
                    errorElement.textContent = 'Дата не может быть раньше сегодняшнего дня';
                }
                break;
        }

        if (!isValid) {
            errorElement.style.display = 'block';
            input.classList.add('error');
        } else {
            errorElement.style.display = 'none';
            input.classList.remove('error');
        }

        this.updateButtonState();
        return isValid;
    }

    updateButtonState() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        const nextButton = currentStepElement.querySelector('.quiz-btn.next');
        const submitButton = currentStepElement.querySelector('.quiz-btn.submit');

        let isStepValid = false;

        switch (this.currentStep) {
            case 1:
            case 2:
                // Для вопросов 1 и 2 - хотя бы один выбранный чекбокс
                const checkboxes = currentStepElement.querySelectorAll('input[type="checkbox"]:checked');
                isStepValid = checkboxes.length > 0;
                break;

            case 3:
                // Для вопроса 3 - выбран один вариант (радио)
                const radio = currentStepElement.querySelector('input[type="radio"]:checked');
                isStepValid = !!radio;
                break;

            case 4:
                // Для вопроса 4 - валидный тираж
                const circulationInput = currentStepElement.querySelector('input[name="merch-circulation"]');
                isStepValid = circulationInput.value && parseInt(circulationInput.value) >= 50;
                break;

            case 5:
                // Для вопроса 5 - валидная дата
                const deadlineInput = currentStepElement.querySelector('input[name="merch-deadline"]');
                isStepValid = deadlineInput.value && new Date(deadlineInput.value) >= new Date().setHours(0, 0, 0, 0);
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
        }
    }

    nextStep() {
        if (this.currentStep >= this.totalSteps) return;

        this.collectAnswers();
        this.currentStep++;
        this.showStep();
    }

    prevStep() {
        if (this.currentStep <= 1) return;

        this.currentStep--;
        this.showStep();
    }

    showStep() {
        // Скрываем все шаги
        document.querySelectorAll('.quiz-step').forEach(step => {
            step.classList.remove('active');
        });

        // Показываем текущий шаг
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);
        currentStepElement.classList.add('active');

        this.updateProgress();
        this.updateButtonState();
        this.restoreAnswers();
    }

    restoreAnswers() {
        const currentStepElement = document.querySelector(`.quiz-step[data-step="${this.currentStep}"]`);

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
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        // Прогресс уменьшается справа налево
        const progressPercentage = 100 - ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        progressFill.style.width = `calc(${progressPercentage}% - 20%`;
    }

    submitQuiz() {
        this.collectAnswers();

        // Собираем все ответы
        const allAnswers = {
            ...this.answers,
            timestamp: new Date().toISOString()
        };

        // Выводим в консоль для дебага
        console.log('Ответы пользователя:', allAnswers);

        // Показываем форму захвата (пункт 6.3)
        this.showCaptureForm();
    }

    showCaptureForm() {
        // Скрываем квиз
        document.querySelector('.quiz-container').style.display = 'none';

        // Создаем и показываем форму захвата
        const captureForm = this.createCaptureForm();
        document.body.appendChild(captureForm);
    }

    createCaptureForm() {
        const form = document.createElement('div');
        form.className = 'quiz-container';
        form.innerHTML = `
                    <div class="quiz-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">Дополнительная информация</div>
                    </div>

                    <form id="captureForm">
                        <!-- Вопрос 6 - Контактные данные -->
                        <div class="quiz-step active" data-step="6">
                            <h3 class="quiz-question">ВАШИ КОНТАКТНЫЕ ДАННЫЕ</h3>
                            <input type="text" class="quiz-input" name="user-name" placeholder="Ваше имя" required>
                            <div class="error-message" id="nameError">Пожалуйста, введите ваше имя</div>
                            
                            <input type="tel" class="quiz-input" name="user-phone" placeholder="Номер телефона" required>
                            <div class="error-message" id="phoneError">Пожалуйста, введите корректный номер телефона</div>
                            
                            <input type="email" class="quiz-input" name="user-email" placeholder="Электронная почта" required>
                            <div class="error-message" id="emailError">Пожалуйста, введите корректный email</div>
                            
                            <div class="quiz-buttons">
                                <button type="button" class="quiz-btn btn-secondary submit">Получить КП с идеями</button>
                            </div>
                        </div>
                    </form>
                `;

        // Добавляем обработчики для формы захвата
        this.bindCaptureFormEvents(form);

        return form;
    }

    bindCaptureFormEvents(form) {
        // Кнопка "Назад к опросу"

        // Кнопка отправки
        form.querySelector('.quiz-btn.submit').addEventListener('click', () => {
            this.submitCaptureForm(form);
        });

        // Валидация полей в реальном времени
        form.querySelectorAll('.quiz-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const errorElement = e.target.nextElementSibling;
                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.style.display = 'none';
                    e.target.classList.remove('error');
                }
            });

            input.addEventListener('blur', (e) => {
                this.validateCaptureField(e.target);
            });
        });
    }

    validateCaptureField(field) {
        let isValid = true;
        const value = field.value.trim();
        const errorElement = field.nextElementSibling;

        if (!errorElement || !errorElement.classList.contains('error-message')) {
            return true;
        }

        switch (field.name) {
            case 'user-name':
                if (!value) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, введите ваше имя';
                }
                break;

            case 'user-phone':
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!value) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, введите номер телефона';
                } else if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, введите корректный номер телефона';
                }
                break;

            case 'user-email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, введите email';
                } else if (!emailRegex.test(value)) {
                    isValid = false;
                    errorElement.textContent = 'Пожалуйста, введите корректный email';
                }
                break;
        }

        if (!isValid) {
            errorElement.style.display = 'block';
            field.classList.add('error');
        } else {
            errorElement.style.display = 'none';
            field.classList.remove('error');
        }

        this.updateCaptureButtonState(form);
        return isValid;
    }

    updateCaptureButtonState(form) {
        const submitButton = form.querySelector('.quiz-btn.submit');
        const inputs = form.querySelectorAll('.quiz-input');
        const allValid = Array.from(inputs).every(input => {
            const errorElement = input.nextElementSibling;
            return !errorElement || errorElement.style.display === 'none';
        });

        submitButton.disabled = !allValid;
    }

    submitCaptureForm(form) {
        const formData = new FormData(form.querySelector('#captureForm'));
        const contactData = {
            name: formData.get('user-name'),
            phone: formData.get('user-phone'),
            email: formData.get('user-email')
        };

        // Объединяем все данные
        const allData = {
            quizAnswers: this.answers,
            contactInfo: contactData,
            submittedAt: new Date().toISOString()
        };

        // Выводим в консоль для дебага
        console.log('Все данные формы:', allData);

        // Здесь можно добавить отправку данных на сервер
        alert('Спасибо! Ваши ответы приняты. Мы свяжемся с вами в ближайшее время для предоставления КП с идеями.');

        // Можно добавить редирект или очистку формы
        // window.location.href = '/thank-you';
    }
}

// Инициализация квиза при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});