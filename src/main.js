// main.js

// Импортируем функции из других модулей
import { getWeatherData } from './js/openweathermap-api.js';
import {
  updateWeatherUI,
  renderCityTags,
  showNotification,
} from './js/render-functions.js';

// Элементы DOM
const cityInput = document.getElementById('city-input');
const addCityButton = document.getElementById('add-city-button');
const timeElement = document.querySelector('.date-time-info .time');
const todayTabButton = document.getElementById('today-tab');
const fiveDaysTabButton = document.getElementById('5-days-tab');

// Массив для хранения добавленных городов
let cities = JSON.parse(localStorage.getItem('weatherCities')) || ['Kyiv'];
let currentCity = cities[0] || 'Kyiv'; // Текущий отображаемый город

/**
 * Функция для добавления нового города в список и обновления тегов.
 */
function addCity() {
  const newCity = cityInput.value.trim();

  if (!newCity) {
    showNotification('Поле ввода города не может быть пустым.', 'error');
    return;
  }

  // Проверка на наличие только пробелов
  if (newCity.split(' ').join('') === '') {
    showNotification(
      'Название города не может состоять только из пробелов.',
      'error'
    );
    return;
  }

  if (cities.some(city => city.toLowerCase() === newCity.toLowerCase())) {
    showNotification('Этот город уже добавлен.', 'warning');
    cityInput.value = '';
    return;
  }

  // Проверяем, существует ли город, прежде чем добавлять его
  getWeatherData(newCity)
    .then(data => {
      if (data) {
        cities.push(newCity);
        localStorage.setItem('weatherCities', JSON.stringify(cities));
        renderCityTags(cities, handleCityClick, handleCityRemove);
        cityInput.value = ''; // Очистить поле ввода
        currentCity = newCity; // Сделать новый город текущим
        fetchAndDisplayWeather(currentCity); // Отобразить погоду для нового города
        showNotification(`Город "${newCity}" успешно добавлен.`, 'success');
      } else {
        // Если getWeatherData вернул null (из-за ошибки сети или 404),
        // сообщение об ошибке уже будет показано из getWeatherData,
        // поэтому здесь не нужно дублировать.
      }
    })
    .catch(error => {
      // Обработка ошибок, которые были переброшены из getWeatherData
      if (error.message.includes('City not found')) {
        showNotification(
          `Город "${newCity}" не найден. Пожалуйста, проверьте название.`,
          'error'
        );
      } else {
        showNotification(
          `Произошла ошибка при добавлении города: ${error.message}`,
          'error'
        );
      }
    });
}

/**
 * Функция для удаления города из списка и обновления тегов.
 * @param {string} cityToRemove - Город, который нужно удалить.
 */
function handleCityRemove(cityToRemove) {
  cities = cities.filter(
    city => city.toLowerCase() !== cityToRemove.toLowerCase()
  );
  localStorage.setItem('weatherCities', JSON.stringify(cities));
  renderCityTags(cities, handleCityClick, handleCityRemove);
  showNotification(`Город "${cityToRemove}" удален.`, 'info');

  // Если удалили текущий город, переключаемся на первый в списке (если есть)
  if (currentCity.toLowerCase() === cityToRemove.toLowerCase()) {
    currentCity = cities.length > 0 ? cities[0] : 'Kyiv'; // Возвращаемся к 'Kyiv' если нет других городов
    fetchAndDisplayWeather(currentCity);
  }
  if (cities.length === 0 && currentCity === 'Kyiv') {
    fetchAndDisplayWeather('Kyiv'); // If all cities are removed and current city is 'Kyiv', reload 'Kyiv'
  }
}

/**
 * Функция для обработки клика по тегу города.
 * @param {string} city - Город, на который кликнули.
 */
function handleCityClick(city) {
  currentCity = city;
  fetchAndDisplayWeather(city);
  showNotification(`Отображается погода для города: ${city}`, 'info');
}

/**
 * Асинхронная функция для получения и отображения данных о погоде.
 * @param {string} city - Город для запроса.
 */
async function fetchAndDisplayWeather(city) {
  try {
    const weatherData = await getWeatherData(city);
    if (weatherData) {
      updateWeatherUI(weatherData, city);
    }
  } catch (error) {
    // Ошибки уже обработаны в getWeatherData и показаны через iziToast
    // Здесь можно добавить дополнительную логику, если необходимо
  }
}

// Обработчики событий
addCityButton.addEventListener('click', addCity);
cityInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    addCity();
  }
});

todayTabButton.addEventListener('click', () => {
  todayTabButton.classList.add('active');
  fiveDaysTabButton.classList.remove('active');
  showNotification('Отображаются текущие данные о погоде.', 'info');
  // Здесь будет логика для отображения данных "Сегодня"
  // (сейчас всегда отображается текущая погода)
});

fiveDaysTabButton.addEventListener('click', () => {
  fiveDaysTabButton.classList.add('active');
  todayTabButton.classList.remove('active');
  showNotification(
    'Прогноз на 5 дней пока не реализован. Эта функция будет добавлена позже!',
    'warning'
  );
  // Здесь будет логика для отображения прогноза на 5 дней
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  renderCityTags(cities, handleCityClick, handleCityRemove);
  fetchAndDisplayWeather(currentCity);
  // Обновляем время каждую секунду для демонстрации
  setInterval(() => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    timeElement.textContent = formattedTime;
  }, 1000);
});
