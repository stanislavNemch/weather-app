const OPENWEATHER_API_KEY = '62fa32c094715186239c67b0c3fd6133';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/';

/**
 * Асинхронная функция для получения данных о погоде из OpenWeatherMap API.
 * @param {string} city - Название города.
 * @returns {Promise<object|null>} - Объект данных о погоде или null в случае ошибки.
 */
export async function getWeatherData(city) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) {
      // Проверяем статус ответа для более конкретной ошибки
      if (response.status === 404) {
        throw new Error(`City not found: ${city}`);
      } else {
        throw new Error(`Failed to fetch weather data: ${response.statusText}`);
      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Вместо alert() будет использовать iziToast в main.js
    throw error; // Перебрасываем ошибку для обработки в main.js
  }
}

/**
 * Асинхронная функция для получения прогноза погоды на 5 дней.
 * @param {string} city - Название города.
 * @returns {Promise<object|null>} - Объект данных о прогнозе или null в случае ошибки.
 */
export async function getFiveDayForecast(city) {
  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`City not found for forecast: ${city}`);
      } else {
        throw new Error(
          `Failed to fetch 5-day forecast data: ${response.statusText}`
        );
      }
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching 5-day forecast:', error);
    throw error;
  }
}
