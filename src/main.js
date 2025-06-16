// Импортируем функции из других модулей
import { getWeatherData, getFiveDayForecast } from './js/openweathermap-api.js';
import {
  updateWeatherUI,
  renderCityTags,
  showNotification,
  updateQuoteDisplay,
  renderFiveDayForecast,
  updateBackground,
} from './js/render-functions.js';

// Елементи DOM
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const timeElement = document.querySelector('.date-time-info .time');
const todayTabButton = document.getElementById('today-tab');
const fiveDaysTabButton = document.getElementById('5-days-tab');
const loaderElement = document.getElementById('loader');

// Контейнеры для переключения видимости
const currentWeatherContainer = document.querySelector('.current-weather');
const dateTimeInfoContainer = document.querySelector('.date-time-info');
const fiveDayForecastContainer = document.querySelector(
  '.five-day-forecast-container'
);
const quoteContainer = document.querySelector('.quote'); // 1. Получаем ссылку на блок с цитатой

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
 * Асинхронна функція для отримання та відображення даних про погоду "Сьогодні".
 * @param {string} city - Місто для запиту.
 */
async function fetchAndDisplayWeather(city) {
  showLoader();
  try {
    const weatherData = await getWeatherData(city);
    if (weatherData) {
      updateWeatherUI(weatherData, city);
    }
  } catch (error) {
    // Ошибки уже обработаны
  } finally {
    hideLoader();
  }
}

/**
 * Асинхронна функція для отримання та відображення прогнозу на 5 днів.
 * @param {string} city - Місто для запиту.
 */
async function fetchAndDisplayFiveDayForecast(city) {
  showLoader();
  try {
    const forecastData = await getFiveDayForecast(city);
    if (forecastData) {
      updateBackground(city);
      renderFiveDayForecast(forecastData);
    }
  } catch (error) {
    showNotification(`Не вдалося отримати прогноз для міста ${city}.`, 'error');
  } finally {
    hideLoader();
  }
}

/**
 * Функція для обробки кліку по тегу міста.
 * @param {string} city - Місто, на яке клікнули.
 */
function handleCityClick(city) {
  currentCity = city;
  if (fiveDaysTabButton.classList.contains('active')) {
    fetchAndDisplayFiveDayForecast(city);
  } else {
    fetchAndDisplayWeather(city);
  }
}

/**
 * Функція для додавання нового міста до списку та оновлення тегів.
 */
function addCity() {
  const newCity = cityInput.value.trim();

  if (!newCity || newCity.split(' ').join('').length === 0) {
    showNotification('Поле вводу міста не може бути порожнім.', 'error');
    cityInput.value = '';
    return;
  }

  if (cities.some(city => city.toLowerCase() === newCity.toLowerCase())) {
    showNotification('Це місто вже додано.', 'warning');
    cityInput.value = '';
    return;
  }

  showLoader();
  getWeatherData(newCity)
    .then(data => {
      if (data) {
        cities.push(newCity);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        renderCityTags(cities, handleCityClick, handleCityRemove);
        cityInput.value = '';
        currentCity = newCity;
        todayTabButton.click();
      }
    })
    .catch(error => {
      if (error.message.includes('City not found')) {
        showNotification(
          `Місто "${newCity}" не знайдено. Будь ласка, перевірте назву.`,
          'error'
        );
      } else {
        showNotification(
          `Сталася помилка під час додавання міста: ${error.message}`,
          'error'
        );
      }
      cityInput.value = '';
    })
    .finally(() => {
      hideLoader();
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

  if (currentCity.toLowerCase() === cityToRemove.toLowerCase()) {
    currentCity = cities.length > 0 ? cities[0] : 'Kyiv';
    handleCityClick(currentCity);
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
  if (todayTabButton.classList.contains('active')) return;

  todayTabButton.classList.add('active');
  fiveDaysTabButton.classList.remove('active');

  fiveDayForecastContainer.style.display = 'none';
  currentWeatherContainer.style.display = 'flex';
  dateTimeInfoContainer.style.display = 'flex';
  quoteContainer.style.display = 'block'; // 3. Показываем цитату

  fetchAndDisplayWeather(currentCity);
});

fiveDaysTabButton.addEventListener('click', () => {
  if (fiveDaysTabButton.classList.contains('active')) return;

  fiveDaysTabButton.classList.add('active');
  todayTabButton.classList.remove('active');

  currentWeatherContainer.style.display = 'none';
  dateTimeInfoContainer.style.display = 'none';
  fiveDayForecastContainer.style.display = 'flex';
  quoteContainer.style.display = 'none'; // 2. Скрываем цитату

  fetchAndDisplayFiveDayForecast(currentCity);
});

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
  renderCityTags(cities, handleCityClick, handleCityRemove);
  fetchAndDisplayWeather(currentCity);
  updateQuoteDisplay();
  setInterval(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    timeElement.textContent = formattedTime;
  }, 1000);
});
