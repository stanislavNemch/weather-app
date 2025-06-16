// Импортируем функцию для получения фонового изображения
import { getBackgroundImage } from './pixabay-api.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { getRandomQuote } from './forismatic-api.js';
import iconsSvg from '../img/icons.svg';

// Елементи DOM для "Сегодня"
const locationElement = document.querySelector('.current-weather .location');
const temperatureElement = document.querySelector(
  '.current-weather .temperature'
);
const minTempElement = document.querySelector('.current-weather .min-temp');
const maxTempElement = document.querySelector('.current-weather .max-temp');
const weatherIconElement = document.querySelector('.weather-icon');
const dateElement = document.querySelector('.date-time-info .date');
const monthElement = document.querySelector('.date-time-info .month');
const sunriseElement = document.querySelector('.sun-times .sunrise');
const sunsetElement = document.querySelector('.sun-times .sunset');

// Елементи для цитат
const quoteTextElement = document.getElementById('quote-text');
const quoteAuthorElement = document.getElementById('quote-author');

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

function getWeatherIconImg(iconCode) {
  const src = weatherIcons[iconCode] || 'img/icon/default.png';
  return `<img src="${src}" width="48" height="48" alt="weather icon">`;
}

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

export function updateWeatherUI(data, cityName) {
  locationElement.textContent = `${data.name}, ${data.sys.country}`;
  temperatureElement.textContent = `${Math.round(data.main.temp)}°`;
  minTempElement.textContent = `${Math.round(data.main.temp_min)}°`;
  maxTempElement.textContent = `${Math.round(data.main.temp_max)}°`;

  const iconCode = data.weather[0].icon;
  weatherIconElement.innerHTML = getWeatherIconImg(iconCode);

  const now = new Date();
  const day = now.getDate();
  const daySuffix = getDaySuffix(day);
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
  dateElement.innerHTML = `${day}<sup>${daySuffix}</sup> <span class="day-of-week">${dayOfWeek}</span>`;

  const formattedMonth = now.toLocaleDateString('en-US', { month: 'long' });
  monthElement.textContent = formattedMonth;

  const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
    'en-US',
    { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
  );
  const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
    'en-US',
    { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
  );
  sunriseElement.innerHTML = `<svg width="24" height="24"><use href="${iconsSvg}#sunrise"></use></svg>${sunriseTime}`;
  sunsetElement.innerHTML = `<svg width="24" height="24"><use href="${iconsSvg}#sunset"></use></svg>${sunsetTime}`;

  updateBackground(cityName);
  updateQuoteDisplay();
}

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

export function renderCityTags(cities, onCityClick, onCityRemove) {
  const cityTagsContainer = document.getElementById('city-tags-container');
  const cityTagsToggle = document.getElementById('city-tags-toggle');

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
    closeButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L11 11M1 11L11 1" stroke="white" stroke-opacity="0.5" stroke-width="1.5" /></svg>`;
    closeButton.addEventListener('click', e => {
      e.stopPropagation();
      onCityRemove(city);
    });
    tag.appendChild(closeButton);
    cityTagsContainer.insertBefore(tag, cityTagsToggle);
  });

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

export function showNotification(message, type) {
  iziToast[type]({
    message: message,
    position: 'topRight',
    timeout: 3000,
    progressBar: false,
    theme: 'dark',
    backgroundColor:
      type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#ffc107',
    titleColor: '#fff',
    messageColor: '#fff',
    iconColor: '#fff',
  });
}

export async function updateQuoteDisplay() {
  const quote = await getRandomQuote();
  if (quote) {
    quoteTextElement.textContent = quote.text;
    quoteAuthorElement.textContent = quote.author;
  } else {
    quoteTextElement.textContent =
      '“The only way to do great work is to love what you do.”';
    quoteAuthorElement.textContent = 'Steve Jobs';
  }
}

// --- ФУНКЦИИ ДЛЯ 5-ДНЕВНОГО ПРОГНОЗА ---

function processForecastData(forecastData) {
  const dailyData = {};
  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });
  return dailyData;
}

function aggregateDailyData(dailyData) {
  return Object.keys(dailyData)
    .map(date => {
      const dayMeasurements = dailyData[date];
      const temp_min = Math.min(...dayMeasurements.map(m => m.main.temp_min));
      const temp_max = Math.max(...dayMeasurements.map(m => m.main.temp_max));
      const middayMeasurement =
        dayMeasurements.find(m => m.dt_txt.includes('12:00:00')) ||
        dayMeasurements[0];
      return {
        date: new Date(date),
        temp_min: Math.round(temp_min),
        temp_max: Math.round(temp_max),
        icon: middayMeasurement.weather[0].icon,
      };
    })
    .slice(0, 5);
}

export function renderFiveDayForecast(forecastData) {
  const container = document.querySelector('.five-day-forecast-container');
  const cityHeader = document.getElementById('forecast-header-city');
  if (!container || !cityHeader) return;

  cityHeader.textContent = `${forecastData.city.name}, ${forecastData.city.country}`;

  const dailyData = processForecastData(forecastData);
  const aggregatedData = aggregateDailyData(dailyData);

  container.innerHTML = '';

  aggregatedData.forEach(day => {
    const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfMonth = day.date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });

    const card = document.createElement('div');
    card.classList.add('forecast-card');

    card.innerHTML = `
      <p class="forecast-day-of-week">${dayOfWeek}</p>
      <p class="forecast-date">${dayOfMonth}</p>
      <div class="forecast-icon">
        ${getWeatherIconImg(day.icon)}
      </div>
      <div class="forecast-min-max">
        <div>
          <p class="label">min</p>
          <p class="temp-value">${day.temp_min}°</p>
        </div>
        <div class="divider">|</div>
        <div>
          <p class="label">max</p>
          <p class="temp-value">${day.temp_max}°</p>
        </div>
      </div>
      <a class="forecast-more-info">more info</a>
    `;
    container.appendChild(card);
  });
}
