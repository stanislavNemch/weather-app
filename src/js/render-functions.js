// Импортируем функцию для получения фонового изображения
import { getBackgroundImage } from './pixabay-api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
// Импортируем новую функцию для получения цитат из forismatic-api.js
import { getRandomQuote } from './forismatic-api.js';

// Елементи DOM, необхідні для рендерингу
const weatherApp = document.querySelector('.weather-app');
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
const cityTagsContainer = document.getElementById('city-tags-container');

// Елементи для цитат
const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');

/**
 * Генерує SVG-код для іконки погоди на основі коду іконки OpenWeatherMap.
 * @param {string} iconCode - Код іконки OpenWeatherMap (наприклад, "01d", "04n").
 * @returns {string} SVG-код іконки.
 */
function getWeatherIconSvg(iconCode) {
  let svgPath = '';
  // Вы можете додати більше умов для різних іконок
  switch (iconCode) {
    case '01d': // Ясне небо (день)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>';
      break;
    case '01n': // Ясне небо (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      break;
    case '02d': // Декілька хмар (день)
    case '02n': // Декілька хмар (ніч)
    case '03d': // Розсіяні хмари (день)
    case '03n': // Розсіяні хмари (ніч)
    case '04d': // Хмарно (день)
    case '04n': // Хмарно (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/></svg>';
      break;
    case '09d': // Злива (день)
    case '09n': // Злива (ніч)
    case '10d': // Дощ (день)
    case '10n': // Дощ (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M2 13v0a1 1 0 0 0 1 1h1"/><path d="M16 13v0a1 1 0 0 0 1 1h1"/><path d="M8 13v0a1 1 0 0 0 1 1h1"/></svg>';
      break;
    case '11d': // Гроза (день)
    case '11n': // Гроза (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="m8 14 4 6 4-6"/><path d="M12 10v4"/></svg>';
      break;
    case '13d': // Сніг (день)
    case '13n': // Сніг (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-snow"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M10 16h.01"/><path d="M14 16h.01"/><path d="M12 18h.01"/><path d="M12 14h.01"/></svg>';
      break;
    case '50d': // Туман (день)
    case '50n': // Туман (ніч)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-fog"><path d="M3 14s.5-2 2-2 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2"/><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M18 10H6"/></svg>';
      break;
    default:
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucude-cloud"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"></path></svg>';
  }
  return svgPath;
}

/**
 * Функція для оновлення інтерфейсу даними про погоду.
 * @param {object} data - Дані про погоду.
 * @param {string} cityName - Назва міста.
 */
export function updateWeatherUI(data, cityName) {
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°`;
  minTempElement.textContent = `мін ${Math.round(data.main.temp_min)}°`;
  maxTempElement.textContent = `макс ${Math.round(data.main.temp_max)}°`;

  // Оновлення іконки погоди
  const iconCode = data.weather[0].icon;
  weatherIconElement.innerHTML = getWeatherIconSvg(iconCode); // Використовуємо функцію для SVG

  // Оновлення дати та часу (час оновлюється щосекунди в main.js)
  const now = new Date();
  // Використовуємо 'uk-UA' для української локалізації
  const formattedDate = now.toLocaleDateString('uk-UA', {
    day: 'numeric',
    weekday: 'long',
  });
  const formattedMonth = now.toLocaleDateString('uk-UA', { month: 'long' });

  // Форматуємо дату для відображення як "8 Субота"
  dateElement.textContent = `${formattedDate.split(',')[0]} ${formattedDate
    .split(',')[1]
    .trim()}`;
  monthElement.textContent = formattedMonth;

  // Час сходу та заходу сонця
  const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    'uk-UA',
    { hour: '2-digit', minute: '2-digit' }
  );
  const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
    'uk-UA',
    { hour: '2-digit', minute: '2-digit' }
  );
  sunriseElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>${sunriseTime}`;
  sunsetElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>${sunsetTime}`;

  // Оновлення фону
  updateBackground(cityName);
  // Оновлення цитати після оновлення погоди
  updateQuoteDisplay();
}

/**
 * Функція для оновлення фонового зображення додатка.
 * @param {string} query - Запит для Pixabay API.
 */
export async function updateBackground(query) {
  const imageUrl = await getBackgroundImage(query);
  if (imageUrl) {
    weatherApp.style.backgroundImage = `url('${imageUrl}')`;
  } else {
    // Якщо зображення не знайдено, використовуємо фоновий колір із CSS
    weatherApp.style.backgroundImage = 'none';
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
    closeButton.textContent = 'x';
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
 * Управляет отображением стрелки и раскрытием списка городов.
 * @param {Array<string>} cities - Массив городов.
 */
export function updateCityTagsToggle(cities) {
  const cityTagsToggle = document.getElementById('city-tags-toggle');
  if (!cityTagsToggle) return;
  if (cities.length > 4) {
    cityTagsToggle.style.display = 'flex';
  } else {
    cityTagsToggle.style.display = 'none';
    cityTagsContainer.classList.remove('expanded');
  }
  cityTagsToggle.onclick = () => {
    cityTagsContainer.classList.toggle('expanded');
  };
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
