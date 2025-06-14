// Импортируем функцию для получения фонового изображения
import { getBackgroundImage } from './pixabay-api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// Элементы DOM, необходимые для рендеринга
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

/**
 * Генерирует SVG-код для иконки погоды на основе кода иконки OpenWeatherMap.
 * @param {string} iconCode - Код иконки OpenWeatherMap (например, "01d", "04n").
 * @returns {string} SVG-код иконки.
 */
function getWeatherIconSvg(iconCode) {
  let svgPath = '';
  // Вы можете добавить больше условий для разных иконок
  switch (iconCode) {
    case '01d': // Ясное небо (день)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>';
      break;
    case '01n': // Ясное небо (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
      break;
    case '02d': // Несколько облаков (день)
    case '02n': // Несколько облаков (ночь)
    case '03d': // Рассеянные облака (день)
    case '03n': // Рассеянные облака (ночь)
    case '04d': // Облачно (день)
    case '04n': // Облачно (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/></svg>';
      break;
    case '09d': // Ливень (день)
    case '09n': // Ливень (ночь)
    case '10d': // Дождь (день)
    case '10n': // Дождь (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M2 13v0a1 1 0 0 0 1 1h1"/><path d="M16 13v0a1 1 0 0 0 1 1h1"/><path d="M8 13v0a1 1 0 0 0 1 1h1"/></svg>';
      break;
    case '11d': // Гроза (день)
    case '11n': // Гроза (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="m8 14 4 6 4-6"/><path d="M12 10v4"/></svg>';
      break;
    case '13d': // Снег (день)
    case '13n': // Снег (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-snow"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M10 16h.01"/><path d="M14 16h.01"/><path d="M12 18h.01"/><path d="M12 14h.01"/></svg>';
      break;
    case '50d': // Туман (день)
    case '50n': // Туман (ночь)
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-fog"><path d="M3 14s.5-2 2-2 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2"/><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"/><path d="M18 10H6"/></svg>';
      break;
    default:
      svgPath =
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud"><path d="M17.5 19H17a4.5 4.5 0 1 0 0-9h-.03a8 8 0 1 0-7.85 9"></path></svg>';
  }
  return svgPath;
}

/**
 * Функция для обновления интерфейса данными о погоде.
 * @param {object} data - Данные о погоде.
 * @param {string} cityName - Название города.
 */
export function updateWeatherUI(data, cityName) {
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°`;
  minTempElement.textContent = `мин ${Math.round(data.main.temp_min)}°`;
  maxTempElement.textContent = `макс ${Math.round(data.main.temp_max)}°`;

  // Обновление иконки погоды
  const iconCode = data.weather[0].icon;
  weatherIconElement.innerHTML = getWeatherIconSvg(iconCode); // Используем функцию для SVG

  // Обновление даты и времени
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    weekday: 'long',
  });
  const formattedMonth = now.toLocaleDateString('ru-RU', { month: 'long' });
  // время обновляется каждую секунду в main.js

  dateElement.textContent =
    formattedDate.split(' ')[0] + '-е ' + formattedDate.split(' ')[1];
  monthElement.textContent = formattedMonth;

  // Время восхода и захода солнца
  const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    'ru-RU',
    { hour: '2-digit', minute: '2-digit' }
  );
  const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
    'ru-RU',
    { hour: '2-digit', minute: '2-digit' }
  );
  sunriseElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>${sunriseTime}`;
  sunsetElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M4.93 19.07l1.41-1.41"></path><path d="M17.66 6.34l1.41-1.41"></path></svg>${sunsetTime}`;

  // Обновление фона
  updateBackground(cityName);
}

/**
 * Функция для обновления фонового изображения приложения.
 * @param {string} query - Запрос для Pixabay API.
 */
export async function updateBackground(query) {
  const imageUrl = await getBackgroundImage(query);
  if (imageUrl) {
    weatherApp.style.backgroundImage = `url('${imageUrl}')`;
  } else {
    // Если изображение не найдено, используем фоновый цвет из CSS
    weatherApp.style.backgroundImage = 'none';
  }
}

/**
 * Функция для отображения тегов городов.
 * @param {Array<string>} cities - Массив городов.
 * @param {Function} onCityClick - Функция-колбэк при клике на город.
 * @param {Function} onCityRemove - Функция-колбэк при удалении города.
 */
export function renderCityTags(cities, onCityClick, onCityRemove) {
  cityTagsContainer.innerHTML = ''; // Очистить существующие теги
  cities.forEach(city => {
    const tag = document.createElement('span');
    tag.classList.add('city-tag');
    tag.textContent = city;
    tag.addEventListener('click', () => onCityClick(city));

    const closeButton = document.createElement('span');
    closeButton.classList.add('close-tag');
    closeButton.textContent = 'x';
    closeButton.addEventListener('click', e => {
      e.stopPropagation(); // Предотвратить срабатывание обработчика на теге
      onCityRemove(city);
    });

    tag.appendChild(closeButton);
    cityTagsContainer.appendChild(tag);
  });
}

/**
 * Функция для отображения сообщений iziToast.
 * @param {string} message - Сообщение.
 * @param {string} type - Тип уведомления ('success', 'error', 'warning', 'info').
 */
export function showNotification(message, type) {
  iziToast[type]({
    message: message,
    position: 'topRight',
    timeout: 3000,
    progressBar: false,
    theme: 'dark', // Пример темной темы
    backgroundColor: type === 'error' ? '#dc3545' : '#28a745', // Красный для ошибок, зеленый для успеха
    titleColor: '#fff',
    messageColor: '#fff',
    iconColor: '#fff',
  });
}
