// Импортируем функцию для получения фонового изображения
import { getBackgroundImage } from './pixabay-api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
// Импортируем новую функцию для получения цитат из forismatic-api.js
import { getRandomQuote } from './forismatic-api.js';

// Пути указываются относительно render-functions.js, то есть два уровня вверх до src/, затем вниз до img/
import iconsSvg from '../img/icons.svg';

// Елементи DOM, необхідні для рендерингу
//const weatherApp = document.querySelector('.weather-app');
const locationElement = document.querySelector('.current-weather .location');
const temperatureElement = document.querySelector(
  '.current-weather .temperature'
);
const minTempElement = document.querySelector('.current-weather .min-temp');
const maxTempElement = document.querySelector('.current-weather .max-temp');
const weatherIconElement = document.querySelector('.weather-icon');
const dateElement = document.querySelector('.date-time-info .date');
const monthElement = document.querySelector('.date-time-info .month');
const timeElement = document.querySelector('.date-time-info .time');
const sunriseElement = document.querySelector('.sun-times .sunrise');
const sunsetElement = document.querySelector('.sun-times .sunset');

// Елементи для цитат
const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');

// Словарь IMG-иконок по коду OpenWeatherMap
const weatherIcons = {
  '01d': 'img/icon/sun-weather.png',
  '01n': 'img/icon/01n.png',
  '02d': 'img/icon/010-clouds-and-sun.png',
  '02n': 'img/icon/010-clouds-and-sun.png',
  '03d': 'img/icon/cloudy.png',
  '03n': 'img/icon/cloudy.png',
  '04d': 'img/icon/cloudy.png',
  '04n': 'img/icon/cloudy.png',
  '09d': 'img/icon/09d.png',
  '09n': 'img/icon/09n.png',
  '10d': 'img/icon/rain.png',
  '10n': 'img/icon/rain.png',
  '11d': 'img/icon/storm.png',
  '11n': 'img/icon/storm.png',
  '13d': 'img/icon/snow.png',
  '13n': 'img/icon/snow.png',
  '50d': 'img/icon/fog.png',
  '50n': 'img/icon/fog.png',
};
// Функция для получения IMG-иконки по коду
function getWeatherIconImg(iconCode) {
  //console.log('Icon code:', iconCode); // Для отладки
  const src = weatherIcons[iconCode] || 'img/icon/default.png';
  return `<img src="${src}" width="48" height="48" alt="weather icon">`;
}

/**
 * Функція для оновлення інтерфейсу даними про погоду.
 * @param {object} data - Дані про погоду.
 * @param {string} cityName - Назва міста.
 */
export function updateWeatherUI(data, cityName) {
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°`;
  minTempElement.textContent = `${Math.round(data.main.temp_min)}°`;
  maxTempElement.textContent = `${Math.round(data.main.temp_max)}°`;

  // Оновлення іконки погоди
  const iconCode = data.weather[0].icon;
  weatherIconElement.innerHTML = getWeatherIconImg(iconCode);

  // Оновлення дати та часу (время обновляется каждую секунду в main.js)
  const now = new Date();

  // Форматируем день месяца с суффиксом (например, 8th)
  const day = now.getDate();
  const daySuffix = getDaySuffix(day);
  // Форматируем день недели (например, Sat)
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
  dateElement.innerHTML = `${day}<sup>${daySuffix}</sup> <span class="day-of-week">${dayOfWeek}</span>`;

  // Форматируем месяц (например, February)
  const formattedMonth = now.toLocaleDateString('en-US', { month: 'long' });
  monthElement.textContent = formattedMonth;

  // Час сходу та заходу сонця
  const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    'en-US', // Изменено на 'en-US'
    { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
  );
  const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
    'en-US', // Изменено на 'en-US'
    { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
  );
  sunriseElement.innerHTML = `<svg width="24" height="24"><use href="${iconsSvg}#sunrise"></use></svg>${sunriseTime}`;
  sunsetElement.innerHTML = `<svg width="24" height="24"><use href="${iconsSvg}#sunset"></use></svg>${sunsetTime}`;

  // Оновлення фону
  updateBackground(cityName);
  // Оновлення цитати після оновлення погоди
  updateQuoteDisplay();
}

// Вспомогательная функция для определения суффикса дня (st, nd, rd, th)
function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Функція для оновлення фонового зображення додатка.
 * @param {string} query - Запит для Pixabay API.
 */
export async function updateBackground(query) {
  const imageUrl = await getBackgroundImage(query);
  if (imageUrl) {
    document.body.style.setProperty('--bg-image', `url('${imageUrl}')`);
    document.querySelector(
      '.weather-app'
    ).style.backgroundImage = `url('${imageUrl}')`;
  } else {
    document.body.style.setProperty('--bg-image', 'none');
    document.querySelector('.weather-app').style.backgroundImage = 'none';
  }
}

/**
 * Функція для відображення тегів міст.
 * @param {Array<string>} cities - Масив міст.
 * @param {Function} onCityClick - Функція-колбек при кліку на місто.
 * @param {Function} onCityRemove - Функція-колбек при видаленні міста.
 */
export function renderCityTags(cities, onCityClick, onCityRemove) {
  const cityTagsContainer = document.getElementById('city-tags-container');
  const cityTagsToggle = document.getElementById('city-tags-toggle');

  // Удаляем только старые города, не трогая кнопку
  Array.from(cityTagsContainer.querySelectorAll('.city-tag')).forEach(tag =>
    tag.remove()
  );

  const expanded = cityTagsContainer.classList.contains('expanded');
  const visibleCities =
    !expanded && cities.length > 4 ? cities.slice(0, 4) : cities;

  visibleCities.forEach(city => {
    const tag = document.createElement('span');
    tag.classList.add('city-tag');
    tag.textContent = city;
    tag.addEventListener('click', () => onCityClick(city));

    const closeButton = document.createElement('span');
    closeButton.classList.add('close-tag');
    closeButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M1 11L11 1" stroke="white" stroke-opacity="0.5" stroke-width="1.5" />
        </svg>
        `;
    closeButton.addEventListener('click', e => {
      e.stopPropagation();
      onCityRemove(city);
    });

    tag.appendChild(closeButton);
    cityTagsContainer.insertBefore(tag, cityTagsToggle); // Вставляем перед стрелкой
  });

  // Управление стрелкой
  if (cityTagsToggle) {
    if (cities.length > 4) {
      cityTagsToggle.style.display = 'flex';
      cityTagsToggle.onclick = () => {
        cityTagsContainer.classList.toggle('expanded');
        renderCityTags(cities, onCityClick, onCityRemove);
      };
    } else {
      cityTagsToggle.style.display = 'none';
      cityTagsContainer.classList.remove('expanded');
    }
  }
}

/**
 * Функція для відображення повідомлень iziToast.
 * @param {string} message - Повідомлення.
 * @param {string} type - Тип сповіщення ('success', 'error', 'warning', 'info').
 */
export function showNotification(message, type) {
  iziToast[type]({
    message: message,
    position: 'topRight',
    timeout: 3000,
    progressBar: false,
    theme: 'dark', // Приклад темної теми
    backgroundColor:
      type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#ffc107', // Червоний для помилок, зелений для успіху, помаранчевий для попереджень
    titleColor: '#fff',
    messageColor: '#fff',
    iconColor: '#fff',
  });
}

/**
 * Оновлює відображення випадкової цитати в блоці quote, використовуючи Forismatic API.
 */
export async function updateQuoteDisplay() {
  const quote = await getRandomQuote(); // Вызываем функцию из forismatic-api.js
  if (quote) {
    quoteTextElement.textContent = quote.text;
    quoteAuthorElement.textContent = quote.author;
  } else {
    // Fallback-цитата, если API не вернул данные или произошла ошибка
    quoteTextElement.textContent =
      '“The only way to do great work is to love what you do.”';
    quoteAuthorElement.textContent = 'Steve Jobs';
  }
}
