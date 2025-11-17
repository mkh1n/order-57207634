
document.addEventListener('DOMContentLoaded', function() {
function getDeclension(number, words) {
    console.log('kkkk')
    number = Math.abs(number);
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return words[2]; // "дней", "часов", "минут", "секунд"
    }

    if (lastDigit === 1) {
        return words[0]; // "день", "час", "минута", "секунда"
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return words[1]; // "дня", "часа", "минуты", "секунды"
    }

    return words[2]; // "дней", "часов", "минут", "секунд"
}

// Получаем элементы таймера
const daysElement = document.querySelector('.timer-unit.days .timer-value');
const hoursElement = document.querySelector('.timer-unit.hours .timer-value');
const minutesElement = document.querySelector('.timer-unit.minutes .timer-value');
const secondsElement = document.querySelector('.timer-unit.seconds .timer-value');

const daysLabel = document.querySelector('.timer-unit.days .timer-label');
const hoursLabel = document.querySelector('.timer-unit.hours .timer-label');
const minutesLabel = document.querySelector('.timer-unit.minutes .timer-label');
const secondsLabel = document.querySelector('.timer-unit.seconds .timer-label');

// Начальное время (можно изменить на нужное)
let totalSeconds = (
    parseInt(daysElement.textContent) * 86400 +
    parseInt(hoursElement.textContent) * 3600 +
    parseInt(minutesElement.textContent) * 60 +
    parseInt(secondsElement.textContent)
);

// Обновляем таймер
function updateTimer() {
    if (totalSeconds <= 0) {
        daysElement.textContent = '0';
        hoursElement.textContent = '0';
        minutesElement.textContent = '0';
        secondsElement.textContent = '0';
        daysLabel.textContent = 'дней';
        hoursLabel.textContent = 'часов';
        minutesLabel.textContent = 'минут';
        secondsLabel.textContent = 'секунд';
        return;
    }

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysElement.textContent = days;
    hoursElement.textContent = hours;
    minutesElement.textContent = minutes;
    secondsElement.textContent = seconds;

    // Обновляем подписи с правильным склонением
    daysLabel.textContent = getDeclension(days, ['день', 'дня', 'дней']);
    hoursLabel.textContent = getDeclension(hours, ['час', 'часа', 'часов']);
    minutesLabel.textContent = getDeclension(minutes, ['минута', 'минуты', 'минут']);
    secondsLabel.textContent = getDeclension(seconds, ['секунда', 'секунды', 'секунд']);

    totalSeconds--;
}

// Запускаем таймер (обновляем каждую секунду)
setInterval(updateTimer, 1000);

// Сразу обновляем таймер при загрузке страницы
updateTimer();
})