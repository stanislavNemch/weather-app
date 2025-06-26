const PIXABAY_API_KEY = '50678696-ed6f097088bf5690dd98584b9';
const PIXABAY_BASE_URL = 'https://pixabay.com/api/';
const forbiddenTags = ['tank', 'war', 'danger', 'military', 'army', 'battle'];

/**
 * Асинхронная функция для получения фоновых изображений из Pixabay API.
 * @param {string} query - Запрос для поиска изображений (например, название города или тип погоды).
 * @returns {Promise<string|null>} - URL изображения или null в случае ошибки.
 */

export async function getBackgroundImage(query) {
  try {
    const response = await fetch(
      `${PIXABAY_BASE_URL}?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=horizontal&min_width=1280&min_height=720`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch background image from Pixabay: ${response.statusText}`
      );
    }
    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      // Фильтрация по запрещённым тегам
      const filteredHits = data.hits.filter(
        hit =>
          !forbiddenTags.some(tag =>
            hit.tags
              .toLowerCase()
              .split(',')
              .map(t => t.trim())
              .includes(tag)
          )
      );
      if (filteredHits.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredHits.length);
        return filteredHits[randomIndex].largeImageURL;
      } else {
        return null; // Нет подходящих изображений
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
