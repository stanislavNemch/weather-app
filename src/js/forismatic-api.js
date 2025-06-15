const PROXY_URL = 'https://corsproxy.io/?';
const FORISMATIC_API_URL = 'https://api.forismatic.com/api/1.0/';

/**
 * Ограничивает текст по количеству символов без пробелов.
 * Если длина превышает maxLength, обрезает и добавляет '...'.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function limitQuoteText(text, maxLength = 77) {
  let count = 0;
  let result = '';
  for (let char of text) {
    if (char !== ' ') count++;
    if (count > maxLength) break;
    result += char;
  }
  if (count > maxLength) {
    result = result.trimEnd() + '...';
  }
  return result;
}

/**
 * Асинхронная функция для получения случайной цитаты из Forismatic API.
 * Использует язык "en" для английских цитат.
 * @returns {Promise<{text: string, author: string}|null>} - Объект цитаты или null в случае ошибки.
 */
export async function getRandomQuote() {
  try {
    const response = await fetch(
      PROXY_URL + encodeURIComponent(FORISMATIC_API_URL),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          method: 'getQuote',
          format: 'json',
          lang: 'en',
        }),
      }
    );

    // Forismatic API может возвращать 200 OK даже с пустым ответом,
    // если запрос был некорректен или нет цитат.
    // Дополнительная проверка на пустой ответ.
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from Forismatic API.');
    }

    const data = JSON.parse(text);

    if (data.quoteText && data.quoteAuthor) {
      // Ограничиваем длину цитаты
      const limitedText = limitQuoteText(data.quoteText);
      return {
        text: `“${limitedText}”`, // Добавляем кавычки для стилизации
        author: data.quoteAuthor || 'Unknown', // Если автор пуст, указываем "Unknown"
      };
    } else {
      console.warn('Invalid quote data received from Forismatic:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching quote from Forismatic API:', error);
    // Возвращаем дефолтную цитату в случае ошибки
    return {
      text: '“Who cares about the clouds when we`re together? Just sing a song and bring the sunny weather.”',
      author: 'Steve Jobs',
    };
  }
}
