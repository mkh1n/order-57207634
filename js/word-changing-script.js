function rotateWords() {
    const heroWords = ["клиентов", "партнеров", "сотрудников"];
    const heroWordElement = document.getElementById('changable-hero-word');
    const segWordElement = document.getElementById('changable-seg-word');
    const presentSegWordElement = document.getElementById('changable-present-seg-word');
    const presentQuizWordElement = document.getElementById('changable-present-quiz-word');
    // const holidayQuizWordElement = document.getElementById('changable-quiz-word');

    const presentSegWords = ["онбординг", "др сотрудника", "велком наборы", "Новый год", "гендерные праздники", "под успешный реализ проекта"];

    let heroCurrentIndex = 0;
    let giftCurrentIndex = 0;

    function changeWord(wordEl, words, indexRef) {
        wordEl.style.opacity = '0';
        wordEl.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            wordEl.textContent = words[indexRef];
            wordEl.style.opacity = '1';
            wordEl.style.transform = 'translateY(0)';
        }, 300);
    }

    function changeAllWords() {
        // Обновляем индексы
        heroCurrentIndex = (heroCurrentIndex + 1) % heroWords.length;
        giftCurrentIndex = (giftCurrentIndex + 1) % presentSegWords.length;

        // Меняем слова с новыми индексами
        changeWord(heroWordElement, heroWords, heroCurrentIndex);
        changeWord(segWordElement, heroWords, heroCurrentIndex);
        changeWord(presentSegWordElement, presentSegWords, giftCurrentIndex);
        changeWord(presentQuizWordElement, presentSegWords, giftCurrentIndex);
        // changeWord(holidayQuizWordElement, presentSegWords, giftCurrentIndex);

    }

    // Запускаем смену слов каждые 3 секунды
    setInterval(changeAllWords, 2000);
}

// Запускаем когда документ загружен
document.addEventListener('DOMContentLoaded', rotateWords);