import './css/main.css';
import './css/weather.css';
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
  renderWeatherChart,
} from './js/render-functions.js';

// DOM-элементы
const weatherApp = document.querySelector('.weather-app');
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const loaderElement = document.getElementById('loader');

const todayViewContainer = document.getElementById('today-view-container');
const fiveDayViewContainer = document.getElementById('five-day-view-container');

const todayTabTodayView = document.getElementById('today-tab-today-view');
const fiveDaysTabTodayView = document.getElementById('5-days-tab-today-view');
const todayTabFiveDayView = document.getElementById('today-tab-five-day-view');
const fiveDaysTabFiveDayView = document.getElementById(
  '5-days-tab-five-day-view'
);

const showChartContainer = document.getElementById('show-chart-container');
const showChartLink = document.getElementById('show-chart-link');
const chartSection = document.getElementById('chart-section');
const hideChartLink = document.getElementById('hide-chart-link');
const chartLegend = document.getElementById('chart-legend');
const forecastMainSection = document.querySelector('.forecast-main-section');

let cities = JSON.parse(localStorage.getItem('weatherCities')) || ['Kyiv'];
let currentCity = cities[0] || 'Kyiv';
let fiveDayForecastData = null;

function setupCustomScrollbar(config) {
  const {
    wrapperSelector,
    scrollbarId,
    thumbId,
    scrollbarVisibleWidth, // e.g., 248 or 250
  } = config;

  const scrollbarElement = document.getElementById(scrollbarId);
  const thumbElement = document.getElementById(thumbId);
  const wrapperElement = document.querySelector(wrapperSelector);

  if (!scrollbarElement || !thumbElement || !wrapperElement) {
    // console.warn('Scrollbar elements not found for:', config);
    return;
  }

  // Prevent re-initialization
  if (scrollbarElement.dataset.customScrollbarInitialized === 'true') {
    // console.log('Scrollbar already initialized for:', scrollbarId);
    // Ensure visuals are up-to-date if called again (e.g. after content change)
    setTimeout(updateThumbVisuals, 0);
    return;
  }
  scrollbarElement.dataset.customScrollbarInitialized = 'true';

  let isDragging = false;
  let dragStartX = 0;

  function updateThumbVisuals() {
    if (!wrapperElement || !thumbElement || !scrollbarElement) return;

    const scrollWidth = wrapperElement.scrollWidth;
    const clientWidth = wrapperElement.clientWidth;

    if (scrollWidth <= clientWidth) {
      scrollbarElement.classList.add('hidden');
      return;
    }
    scrollbarElement.classList.remove('hidden');

    const minThumbWidth = 32; // Minimum width for the thumb
    const calculatedThumbWidth =
      (clientWidth / scrollWidth) * scrollbarVisibleWidth;
    const thumbWidth = Math.max(calculatedThumbWidth, minThumbWidth);
    const maxThumbMove = scrollbarVisibleWidth - thumbWidth;

    let thumbX = 0;
    if (scrollWidth - clientWidth > 0) {
      thumbX =
        (wrapperElement.scrollLeft / (scrollWidth - clientWidth)) *
        maxThumbMove;
    }

    // Ensure thumbX is within bounds
    thumbX = Math.max(0, Math.min(thumbX, maxThumbMove));

    thumbElement.setAttribute('x1', String(thumbX));
    thumbElement.setAttribute('x2', String(thumbX + thumbWidth));
  }

  // Interactive dragging part
  const onMouseDown = e => {
    e.preventDefault();
    const rect = scrollbarElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // X position within the scrollbar SVG

    const currentThumbX1 = parseFloat(thumbElement.getAttribute('x1')) || 0;
    const currentThumbWidth =
      (parseFloat(thumbElement.getAttribute('x2')) || 0) - currentThumbX1;

    if (
      clickX >= currentThumbX1 &&
      clickX <= currentThumbX1 + currentThumbWidth
    ) {
      // Clicked on the thumb itself
      isDragging = true;
      dragStartX = clickX - currentThumbX1; // Position of click relative to thumb's start
      document.body.style.userSelect = 'none'; // Prevent text selection during drag
    } else {
      // Clicked on the track, not the thumb - jump to position
      const scrollWidth = wrapperElement.scrollWidth;
      const clientWidth = wrapperElement.clientWidth;
      if (scrollWidth <= clientWidth) return; // No scroll needed

      const minThumbWidth = 32;
      const calculatedThumbWidth =
        (clientWidth / scrollWidth) * scrollbarVisibleWidth;
      const thumbWidth = Math.max(calculatedThumbWidth, minThumbWidth);
      const maxThumbMove = scrollbarVisibleWidth - thumbWidth;

      // Target position for the start of the thumb
      let targetThumbX = clickX - thumbWidth / 2;
      targetThumbX = Math.max(0, Math.min(targetThumbX, maxThumbMove));

      const percent = maxThumbMove > 0 ? targetThumbX / maxThumbMove : 0;
      wrapperElement.scrollLeft = percent * (scrollWidth - clientWidth);
      updateThumbVisuals(); // Update immediately
    }
  };

  const onMouseMove = e => {
    if (!isDragging) return;

    const rect = scrollbarElement.getBoundingClientRect();
    const moveX = e.clientX - rect.left; // Current X position within the scrollbar SVG

    const scrollWidth = wrapperElement.scrollWidth;
    const clientWidth = wrapperElement.clientWidth;
    if (scrollWidth <= clientWidth) return;

    const minThumbWidth = 32;
    const calculatedThumbWidth =
      (clientWidth / scrollWidth) * scrollbarVisibleWidth;
    const thumbWidth = Math.max(calculatedThumbWidth, minThumbWidth);
    const maxThumbMove = scrollbarVisibleWidth - thumbWidth;

    let newThumbX = moveX - dragStartX; // Calculate new thumb start position
    newThumbX = Math.max(0, Math.min(newThumbX, maxThumbMove)); // Clamp within bounds

    const percent = maxThumbMove > 0 ? newThumbX / maxThumbMove : 0;
    wrapperElement.scrollLeft = percent * (scrollWidth - clientWidth);
    // updateThumbVisuals will be called by the 'scroll' event on wrapperElement
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = ''; // Re-enable text selection
    }
  };

  scrollbarElement.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  wrapperElement.addEventListener('scroll', updateThumbVisuals);
  window.addEventListener('resize', updateThumbVisuals);

  // Initial visual setup
  // Use setTimeout to ensure layout is stable, especially if content is dynamic
  setTimeout(updateThumbVisuals, 0);
}

function showLoader() {
  loaderElement.classList.remove('hidden');
}
function hideLoader() {
  loaderElement.classList.add('hidden');
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
      fiveDayForecastData = forecastData;
      renderFiveDayForecast(forecastData);
      if (showChartContainer) showChartContainer.classList.remove('hidden'); // Assuming flex is handled by CSS or default
    }
  } catch (error) {
    showNotification(`Не вдалося отримати прогноз для міста ${city}.`, 'error');
  } finally {
    hideLoader();
  }
}

function showTodayView() {
  weatherApp.classList.remove('five-day-layout-active');
  if (todayTabTodayView.classList.contains('active')) return;
  todayTabTodayView.classList.add('active');
  fiveDaysTabTodayView.classList.remove('active');
  todayTabFiveDayView.classList.add('active');
  fiveDaysTabFiveDayView.classList.remove('active');
  fiveDayViewContainer.classList.add('hidden');
  todayViewContainer.classList.remove('hidden'); // Assuming flex is handled by CSS or default
  hideHourlyForecast();
  fetchAndDisplayWeather(currentCity);
  if (chartSection) chartSection.classList.add('hidden');
  if (showChartContainer) showChartContainer.classList.add('hidden');
  if (forecastMainSection) forecastMainSection.classList.remove('hidden'); // Assuming block is handled by CSS or default
}

function showFiveDayView() {
  weatherApp.classList.add('five-day-layout-active');
  if (fiveDaysTabTodayView.classList.contains('active')) return;
  todayTabTodayView.classList.remove('active');
  fiveDaysTabTodayView.classList.add('active');
  todayTabFiveDayView.classList.remove('active');
  fiveDaysTabFiveDayView.classList.add('active');
  todayViewContainer.classList.add('hidden');
  fiveDayViewContainer.classList.remove('hidden'); // Assuming flex is handled by CSS or default
  fetchAndDisplayFiveDayForecast(currentCity);
}

function showChart() {
  if (!fiveDayForecastData) {
    showNotification(
      'Будь ласка, зачекайте завантаження даних прогнозу.',
      'info'
    );
    return;
  }
  if (showChartContainer) showChartContainer.classList.add('hidden');
  hideHourlyForecast();
  if (chartSection) chartSection.classList.remove('hidden'); // Assuming flex is handled by CSS or default
  renderWeatherChart(fiveDayForecastData);
  if (window.innerWidth <= 767) {
    // Replaced attachChartScrollbarEvents with setupCustomScrollbar
    setupCustomScrollbar({
      wrapperSelector: '#chart-wrapper',
      scrollbarId: 'chart-custom-scrollbar',
      thumbId: 'chart-scrollbar-thumb',
      scrollbarVisibleWidth: 250,
    });
  }
}

function hideChart() {
  if (chartSection) chartSection.classList.add('hidden');
  if (showChartContainer) showChartContainer.classList.remove('hidden'); // Assuming flex is handled by CSS or default
}

function handleCityClick(city) {
  currentCity = city;
  updateBackground(city);
  updateQuoteDisplay();
  hideHourlyForecast();
  if (fiveDaysTabTodayView.classList.contains('active')) {
    hideChart();
    fetchAndDisplayFiveDayForecast(city);
  } else {
    fetchAndDisplayWeather(city);
  }
}

function addCity() {
  const newCity = cityInput.value.trim();
  if (!newCity || newCity.split(' ').join('').length === 0) {
    showNotification('Поле вводу міста не може бути порожнім.', 'error');
    return;
  }
  if (cities.some(city => city.toLowerCase() === newCity.toLowerCase())) {
    showNotification('Це місто вже додано.', 'warning');
    return;
  }
  if (cities.length >= 5) {
    cities.shift();
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
      showNotification(
        error.message.includes('City not found')
          ? `Місто "${newCity}" не знайдено.`
          : `Сталася помилка: ${error.message}`,
        'error'
      );
    })
    .finally(hideLoader);
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

  const leftArrow = document.querySelector('.forecast-scroll-arrow.left');
  const rightArrow = document.querySelector('.forecast-scroll-arrow.right');
  const forecastContainer = document.querySelector(
    '.five-day-forecast-container'
  );

  if (leftArrow)
    leftArrow.addEventListener('click', () => scrollForecast('left'));
  if (rightArrow)
    rightArrow.addEventListener('click', () => scrollForecast('right'));

  function scrollForecast(direction) {
    if (!forecastContainer) return;
    const card = forecastContainer.querySelector('.forecast-card');
    if (!card) return;
    const scrollAmount = card.offsetWidth + 10;
    forecastContainer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  const fiveDayContainer = document.querySelector(
    '.five-day-forecast-container'
  );
  let lastActiveMoreInfo = null;

  // Функція для очищення підсвітки з "more info" та дня тижня
  function clearMoreInfoHighlights() {
    if (lastActiveMoreInfo) {
      lastActiveMoreInfo.classList.remove('active');
      const prevCard = lastActiveMoreInfo.closest('.forecast-card');
      if (prevCard) {
        const dayOfWeek = prevCard.querySelector('.forecast-day-of-week');
        if (dayOfWeek) {
          dayOfWeek.classList.remove('active');
        }
      }
      lastActiveMoreInfo = null;
    }
  }

  if (fiveDayContainer) {
    fiveDayContainer.addEventListener('click', e => {
      const moreInfoLink = e.target.closest('.forecast-more-info');
      if (!moreInfoLink) return;

      e.preventDefault();
      hideChart();

      const forecastCard = moreInfoLink.closest('.forecast-card');

      // Якщо клікнули на той самий активний елемент, щоб закрити його
      if (lastActiveMoreInfo === moreInfoLink) {
        hideHourlyForecast();
        clearMoreInfoHighlights(); // Очищуємо підсвітку
        return;
      }

      clearMoreInfoHighlights(); // Очищуємо попередню підсвітку

      // Встановлюємо нову підсвітку
      moreInfoLink.classList.add('active');
      if (forecastCard) {
        forecastCard
          .querySelector('.forecast-day-of-week')
          .classList.add('active');
      }

      lastActiveMoreInfo = moreInfoLink;

      // Рендеримо контент
      const dayData = JSON.parse(moreInfoLink.dataset.dayData);
      renderHourlyForecast(dayData, moreInfoLink.dataset.dateString);
      // Replaced attachHourlyScrollbarEvents with setupCustomScrollbar
      setTimeout(() => {
        setupCustomScrollbar({
          wrapperSelector:
            '#hourly-forecast-container .hourly-forecast-cards-wrapper',
          scrollbarId: 'hourly-custom-scrollbar',
          thumbId: 'hourly-scrollbar-thumb',
          scrollbarVisibleWidth: 248,
        });
      }, 0);
    });
  }

  if (showChartLink) {
    showChartLink.addEventListener('click', e => {
      e.preventDefault();

      //Приховуємо "more info" та знімаємо всі підсвітки
      hideHourlyForecast();
      clearMoreInfoHighlights();

      showChart();
      // оновлюємо селектор для інтерактивного скролу
      // Replaced enableInteractiveScrollbar with setupCustomScrollbar
      setupCustomScrollbar({
        wrapperSelector: '#chart-wrapper',
        scrollbarId: 'chart-custom-scrollbar',
        thumbId: 'chart-scrollbar-thumb',
        scrollbarVisibleWidth: 250,
      });
    });
  }
  if (hideChartLink) {
    hideChartLink.addEventListener('click', e => {
      e.preventDefault();
      // Знімаємо підсвітку при закритті графіка
      clearMoreInfoHighlights();
      hideChart();
    });
  }
  if (chartLegend) {
    const checkboxes = chartLegend.querySelectorAll('input[type="checkbox"]');

    // Функція для оновлення стилів (перекреслення)
    const updateLegendStyles = () => {
      checkboxes.forEach(cb => {
        const label = cb.closest('.chart-legend-item');
        if (label) {
          if (cb.checked) {
            label.classList.remove('disabled');
          } else {
            label.classList.add('disabled');
          }
        }
      });
    };

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const currentCheckbox = e.target;

        // Забороняємо знімати галочку, якщо вона остання
        if (!currentCheckbox.checked) {
          currentCheckbox.checked = true;
          return;
        }

        // Знімаємо галочки з усіх інших чекбоксів
        checkboxes.forEach(cb => {
          if (cb !== currentCheckbox) {
            cb.checked = false;
          }
        });

        // Оновлюємо стилі для всіх елементів легенди
        updateLegendStyles();

        // Перемальовуємо графік з одним вибраним показником
        if (
          fiveDayForecastData &&
          chartSection &&
          chartSection.style.display !== 'none'
        ) {
          renderWeatherChart(fiveDayForecastData);
        }
      });
    });

    // Ініціалізуємо стилі при першому завантаженні
    updateLegendStyles();
  }

  if (showChartContainer) showChartContainer.classList.add('hidden');
});

// === ЛОГІКА ДЛЯ ПЕРЕМІЩЕННЯ ЗАГОЛОВКУ МІСТА ===
/**
 * Переміщує заголовок з назвою міста в залежності від ширини екрану
 * для коректного відображення на мобільних та десктопних версіях.
 */
function moveForecastHeaderCity() {
  const header = document.getElementById('forecast-header-city');
  const forecastWrapper = document.querySelector('.five-day-forecast-wrapper');
  const fiveDayHeader = document.querySelector('.five-day-header');
  if (!header || !forecastWrapper || !fiveDayHeader) return;

  if (window.innerWidth <= 767) {
    // На мобільних: вставляємо заголовок на початок обгортки з картками
    if (forecastWrapper.firstElementChild !== header) {
      forecastWrapper.insertBefore(header, forecastWrapper.firstChild);
    }
  } else {
    // На десктопі: повертаємо заголовок у блок .five-day-header
    if (!fiveDayHeader.contains(header)) {
      fiveDayHeader.insertBefore(header, fiveDayHeader.firstChild);
    }
  }
}

// Додаємо обробники подій для завантаження сторінки та зміни розміру вікна
window.addEventListener('DOMContentLoaded', moveForecastHeaderCity);
window.addEventListener('resize', moveForecastHeaderCity);
