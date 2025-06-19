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
const weatherApp = document.querySelector('.weather-app');
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const loaderElement = document.getElementById('loader');

// Контейнери видів
const todayViewContainer = document.getElementById('today-view-container');
const fiveDayViewContainer = document.getElementById('five-day-view-container');

// Отримуємо всі 4 кнопки вкладок
const todayTabTodayView = document.getElementById('today-tab-today-view');
const fiveDaysTabTodayView = document.getElementById('5-days-tab-today-view');
const todayTabFiveDayView = document.getElementById('today-tab-five-day-view');
const fiveDaysTabFiveDayView = document.getElementById(
  '5-days-tab-five-day-view'
);

let cities = JSON.parse(localStorage.getItem('weatherCities')) || ['Kyiv'];
let currentCity = cities[0] || 'Kyiv';

// --- Функції завантаження ---
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
    if (forecastData) renderFiveDayForecast(forecastData);
  } catch (error) {
    showNotification(`Не вдалося отримати прогноз для міста ${city}.`, 'error');
  } finally {
    hideLoader();
  }
}

// --- Функції керування видами ---
function showTodayView() {
  weatherApp.classList.remove('five-day-layout-active');
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
  weatherApp.classList.add('five-day-layout-active');
  if (fiveDaysTabTodayView.classList.contains('active')) return;

  todayTabTodayView.classList.remove('active');
  fiveDaysTabTodayView.classList.add('active');
  todayTabFiveDayView.classList.remove('active');
  fiveDaysTabFiveDayView.classList.add('active');

  todayViewContainer.style.display = 'none';

  // Встановлюємо 'flex' замість 'block', щоб активувати верстку з CSS
  fiveDayViewContainer.style.display = 'flex';

  fetchAndDisplayFiveDayForecast(currentCity);
}

// --- Функції керування містами ---
function handleCityClick(city) {
  currentCity = city;
  updateBackground(city);
  updateQuoteDisplay();

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
        updateBackground(newCity);
        cities.push(newCity);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        renderCityTags(cities, handleCityClick, handleCityRemove);
        cityInput.value = '';
        currentCity = newCity;
        updateQuoteDisplay();
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

// --- Ініціалізація ---
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

  updateBackground(currentCity);
  fetchAndDisplayWeather(currentCity);

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
  // Горизонтальный скролл для 5-дневного прогноза на мобильных
  const leftArrow = document.querySelector('.forecast-scroll-arrow.left');
  const rightArrow = document.querySelector('.forecast-scroll-arrow.right');
  const forecastContainer = document.querySelector(
    '.five-day-forecast-container'
  );

  function scrollForecast(direction) {
    if (!forecastContainer) return;
    const card = forecastContainer.querySelector('.forecast-card');
    if (!card) return;
    const scrollAmount = card.offsetWidth + 10; // 10px — gap между карточками
    forecastContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  if (leftArrow) {
    leftArrow.addEventListener('click', () => scrollForecast('left'));
  }
  if (rightArrow) {
    rightArrow.addEventListener('click', () => scrollForecast('right'));
  }
});

function moveForecastHeaderCity() {
  const header = document.getElementById('forecast-header-city');
  const forecastWrapper = document.querySelector('.five-day-forecast-wrapper');
  const fiveDayHeader = document.querySelector('.five-day-header');
  if (!header || !forecastWrapper || !fiveDayHeader) return;

  if (window.innerWidth <= 767) {
    // Вставить в начало five-day-forecast-wrapper, если ещё не там
    if (forecastWrapper.firstElementChild !== header) {
      forecastWrapper.insertBefore(header, forecastWrapper.firstChild);
    }
  } else {
    // Вернуть обратно в five-day-header, если ещё не там
    if (!fiveDayHeader.contains(header)) {
      fiveDayHeader.insertBefore(header, fiveDayHeader.firstChild);
    }
  }
}

window.addEventListener('DOMContentLoaded', moveForecastHeaderCity);
window.addEventListener('resize', moveForecastHeaderCity);
