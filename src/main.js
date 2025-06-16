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

// DOM-элементы
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const loaderElement = document.getElementById('loader');

// Контейнеры видов
const todayViewContainer = document.getElementById('today-view-container');
const fiveDayViewContainer = document.getElementById('five-day-view-container');

// Получаем все 4 кнопки вкладок
const todayTabTodayView = document.getElementById('today-tab-today-view');
const fiveDaysTabTodayView = document.getElementById('5-days-tab-today-view');
const todayTabFiveDayView = document.getElementById('today-tab-five-day-view');
const fiveDaysTabFiveDayView = document.getElementById(
  '5-days-tab-five-day-view'
);

let cities = JSON.parse(localStorage.getItem('weatherCities')) || ['Kyiv'];
let currentCity = cities[0] || 'Kyiv';

// --- Функции загрузки и рендеринга ---
function showLoader() {
  loaderElement.style.display = 'block';
}
function hideLoader() {
  loaderElement.style.display = 'none';
}
async function fetchAndDisplayWeather(city) {
  showLoader();
  try {
    const weatherData = await getWeatherData(city);
    if (weatherData) updateWeatherUI(weatherData, city);
  } catch (error) {
    console.error(error);
  } finally {
    hideLoader();
  }
}
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

// --- Функции управления видами ---
function showTodayView() {
  if (todayTabTodayView.classList.contains('active')) return;

  todayTabTodayView.classList.add('active');
  fiveDaysTabTodayView.classList.remove('active');
  todayTabFiveDayView.classList.add('active');
  fiveDaysTabFiveDayView.classList.remove('active');

  fiveDayViewContainer.style.display = 'none';
  todayViewContainer.style.display = 'block';

  fetchAndDisplayWeather(currentCity);
}

function showFiveDayView() {
  if (fiveDaysTabTodayView.classList.contains('active')) return;

  todayTabTodayView.classList.remove('active');
  fiveDaysTabTodayView.classList.add('active');
  todayTabFiveDayView.classList.remove('active');
  fiveDaysTabFiveDayView.classList.add('active');

  todayViewContainer.style.display = 'none';
  fiveDayViewContainer.style.display = 'block';

  fetchAndDisplayFiveDayForecast(currentCity);
}

// --- Функции управления городами ---
function handleCityClick(city) {
  currentCity = city;
  if (fiveDaysTabTodayView.classList.contains('active')) {
    fetchAndDisplayFiveDayForecast(city);
  } else {
    fetchAndDisplayWeather(city);
  }
}
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
        showTodayView();
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
    .finally(() => hideLoader());
}
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

// --- Инициализация ---
// Назначаем обработчики на все 4 кнопки
todayTabTodayView.addEventListener('click', showTodayView);
todayTabFiveDayView.addEventListener('click', showTodayView);
fiveDaysTabTodayView.addEventListener('click', showFiveDayView);
fiveDaysTabFiveDayView.addEventListener('click', showFiveDayView);

addCityButton.addEventListener('click', addCity);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addCity();
});

document.addEventListener('DOMContentLoaded', () => {
  const timeElement = document.querySelector('.date-time-info .time');

  renderCityTags(cities, handleCityClick, handleCityRemove);

  // ======================= ИСПРАВЛЕНИЕ ЗДЕСЬ =======================
  // Прямой вызов для загрузки погоды и фона при первой загрузке
  fetchAndDisplayWeather(currentCity);
  // =================================================================

  updateQuoteDisplay();

  if (timeElement) {
    setInterval(() => {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      });
    }, 1000);
  }
});
