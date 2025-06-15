// Импортируем функции из других модулей
import { getWeatherData } from './js/openweathermap-api.js';
import {
  updateWeatherUI,
  renderCityTags,
  showNotification,
  updateQuoteDisplay,
} from './js/render-functions.js';

// Елементи DOM
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const timeElement = document.querySelector('.date-time-info .time');
const todayTabButton = document.getElementById('today-tab');
const fiveDaysTabButton = document.getElementById('5-days-tab');
const loaderElement = document.getElementById('loader'); // Отримуємо елемент завантажувача

// Масив для зберігання доданих міст
let cities = JSON.parse(localStorage.getItem('weatherCities')) || ['Kyiv'];
let currentCity = cities[0] || 'Kyiv'; // Поточне відображуване місто

/**
 * Показує індикатор завантаження.
 */
function showLoader() {
  loaderElement.style.display = 'block';
}

/**
 * Ховає індикатор завантаження.
 */
function hideLoader() {
  loaderElement.style.display = 'none';
}

/**
 * Функція для додавання нового міста до списку та оновлення тегів.
 */
function addCity() {
  const newCity = cityInput.value.trim();

  if (!newCity) {
    showNotification('Поле вводу міста не може бути порожнім.', 'error');
    cityInput.value = ''; // очищаем поле
    return;
  }

  // Перевірка на наявність лише пробілів
  if (newCity.split(' ').join('') === '') {
    showNotification(
      'Назва міста не може складатися лише з пробілів.',
      'error'
    );
    cityInput.value = ''; // очищаем поле
    return;
  }

  if (cities.some(city => city.toLowerCase() === newCity.toLowerCase())) {
    showNotification('Це місто вже додано.', 'warning');
    cityInput.value = '';
    return;
  }

  showLoader(); // Показуємо завантажувач перед запитом
  // Перевіряємо, чи існує місто, перш ніж додавати його
  getWeatherData(newCity)
    .then(data => {
      if (data) {
        cities.push(newCity);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        renderCityTags(cities, handleCityClick, handleCityRemove);
        cityInput.value = ''; // Очистити поле вводу
        currentCity = newCity; // Зробити нове місто поточним
        fetchAndDisplayWeather(currentCity); // Відобразити погоду для нового міста
        // showNotification(`Місто "${newCity}" успішно додано.`, 'success');
      } else {
        // Якщо getWeatherData повернув null (через помилку мережі або 404),
        // повідомлення про помилку вже буде показано з getWeatherData,
        // тому тут не потрібно дублювати.
      }
    })
    .catch(error => {
      // Обробка помилок, які були перекинуті з getWeatherData
      if (error.message.includes('City not found')) {
        showNotification(
          `Місто "${newCity}" не знайдено. Будь ласка, перевірте назву.`,
          'error'
        );
        cityInput.value = ''; // очищаем поле
      } else {
        showNotification(
          `Сталася помилка під час додавання міста: ${error.message}`,
          'error'
        );
        cityInput.value = ''; // очищаем поле
      }
    })
    .finally(() => {
      hideLoader(); // Ховаємо завантажувач після завершення запиту
    });
}

/**
 * Функція для видалення міста зі списку та оновлення тегів.
 * @param {string} cityToRemove - Місто, яке потрібно видалити.
 */
function handleCityRemove(cityToRemove) {
  cities = cities.filter(
    city => city.toLowerCase() !== cityToRemove.toLowerCase()
  );
  localStorage.setItem('weatherCities', JSON.stringify(cities));
  renderCityTags(cities, handleCityClick, handleCityRemove);
  //showNotification(`Місто "${cityToRemove}" видалено.`, 'info');

  // Якщо видалили поточне місто, переключаємося на перше у списку (якщо є)
  if (currentCity.toLowerCase() === cityToRemove.toLowerCase()) {
    currentCity = cities.length > 0 ? cities[0] : 'Kyiv'; // Повертаємося до 'Kyiv', якщо немає інших міст
    fetchAndDisplayWeather(currentCity);
  }
  if (cities.length === 0 && currentCity === 'Kyiv') {
    fetchAndDisplayWeather('Kyiv'); // If all cities are removed and current city is 'Kyiv', reload 'Kyiv'
  }
}

/**
 * Функція для обробки кліку по тегу міста.
 * @param {string} city - Місто, на яке клікнули.
 */
function handleCityClick(city) {
  currentCity = city;
  fetchAndDisplayWeather(city);
  //showNotification(`Відображається погода для міста: ${city}`, 'info');
}

/**
 * Асинхронна функція для отримання та відображення даних про погоду.
 * @param {string} city - Місто для запиту.
 */
async function fetchAndDisplayWeather(city) {
  showLoader(); // Показуємо завантажувач перед запитом
  try {
    const weatherData = await getWeatherData(city);
    if (weatherData) {
      updateWeatherUI(weatherData, city);
    }
  } catch (error) {
    // Помилки вже оброблені в getWeatherData та показані через iziToast
    // Тут можна додати додаткову логіку, якщо необхідно
  } finally {
    hideLoader(); // Ховаємо завантажувач після завершення запиту (успішно або з помилкою)
  }
}

// Обробники подій
addCityButton.addEventListener('click', addCity);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    addCity();
  }
});

todayTabButton.addEventListener('click', () => {
  todayTabButton.classList.add('active');
  fiveDaysTabButton.classList.remove('active');
  showNotification('Відображаються поточні дані про погоду.', 'info');
  // Тут буде логіка для відображення даних "Сьогодні"
  // (зараз завжди відображається поточна погода)
});

fiveDaysTabButton.addEventListener('click', () => {
  fiveDaysTabButton.classList.add('active');
  todayTabButton.classList.remove('active');
  showNotification(
    'Прогноз на 5 днів поки не реалізований. Ця функція буде додана пізніше!',
    'warning'
  );
  // Тут буде логіка для відображення прогнозу на 5 днів
});

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  renderCityTags(cities, handleCityClick, handleCityRemove);
  fetchAndDisplayWeather(currentCity);
  updateQuoteDisplay(); // Викликаємо відображення цитати при завантаженні сторінки
  // Оновлюємо час щосекунди для демонстрації
  setInterval(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    timeElement.textContent = formattedTime;
  }, 1000);
});
