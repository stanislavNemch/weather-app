import { getWeatherData, getFiveDayForecast } from './js/openweathermap-api.js';
import {
  updateWeatherUI,
  renderCityTags,
  showNotification,
  updateQuoteDisplay,
  renderFiveDayForecast,
  updateBackground,
  renderHourlyForecast,
  hideHourlyForecast,
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

  hideHourlyForecast(); // Сховуємо годинний прогноз, якщо він був відкритий
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
  hideHourlyForecast();

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

  const fiveDayContainer = document.querySelector(
    '.five-day-forecast-container'
  );
  let lastActiveMoreInfo = null;

  if (fiveDayContainer) {
    fiveDayContainer.addEventListener('click', e => {
      const moreInfoLink = e.target.closest('.forecast-more-info');

      if (!moreInfoLink) {
        return;
      }
      e.preventDefault();

      if (lastActiveMoreInfo === moreInfoLink) {
        hideHourlyForecast();
        moreInfoLink.classList.remove('active');
        lastActiveMoreInfo = null;
        return;
      }

      if (lastActiveMoreInfo) {
        lastActiveMoreInfo.classList.remove('active');
      }

      moreInfoLink.classList.add('active');
      lastActiveMoreInfo = moreInfoLink;

      const dayData = JSON.parse(moreInfoLink.dataset.dayData);
      const dateString = moreInfoLink.dataset.dateString;

      if (dayData && dayData.length > 0) {
        renderHourlyForecast(dayData, dateString);
        if (window.attachHourlyScrollbarEvents)
          window.attachHourlyScrollbarEvents();
      }
    });
  }

  // --- Кастомная полоса прокрутки для hourly-forecast-container ---
  const hourlyContainer = document.getElementById('hourly-forecast-container');
  const customScrollbar = document.getElementById('hourly-custom-scrollbar');
  const thumb = document.getElementById('hourly-scrollbar-thumb');
  const scrollbarWidth = 248; // px

  function updateHourlyScrollbar() {
    if (!hourlyContainer || !customScrollbar || !thumb) return;
    const wrapper = hourlyContainer.querySelector(
      '.hourly-forecast-cards-wrapper'
    );
    if (!wrapper) return;

    // Показываем/скрываем кастомную полосу только если есть горизонтальный скролл
    if (wrapper.scrollWidth > wrapper.clientWidth) {
      customScrollbar.style.display = 'block';
    } else {
      customScrollbar.style.display = 'none';
      return;
    }

    const scrollWidth = wrapper.scrollWidth;
    const clientWidth = wrapper.clientWidth;
    const scrollLeft = wrapper.scrollLeft;

    const thumbWidth = Math.max(
      (clientWidth / scrollWidth) * scrollbarWidth,
      32
    ); // min 32px
    const maxScroll = scrollWidth - clientWidth;
    const maxThumbMove = scrollbarWidth - thumbWidth;
    const thumbX = maxScroll > 0 ? (scrollLeft / maxScroll) * maxThumbMove : 0;

    thumb.setAttribute('x1', thumbX);
    thumb.setAttribute('x2', thumbX + thumbWidth);
  }

  function attachHourlyScrollbarEvents() {
    if (!hourlyContainer) return;
    const wrapper = hourlyContainer.querySelector(
      '.hourly-forecast-cards-wrapper'
    );
    if (!wrapper) return;
    wrapper.addEventListener('scroll', updateHourlyScrollbar);
    window.addEventListener('resize', updateHourlyScrollbar);
    updateHourlyScrollbar();
  }

  // Если hourly-forecast-container появляется динамически, вызывайте attachHourlyScrollbarEvents()
  // после рендера часового прогноза:
  window.attachHourlyScrollbarEvents = attachHourlyScrollbarEvents;
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
