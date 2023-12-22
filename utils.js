import readline from 'readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).pause();

/**
 * Запрашивает данные с консоли
 * @param  { ...string } query 
 * @returns { Promise<string> } Введенные данные
 */
export const input = async (...query) => {
    rl.resume();
    const result = await rl.question(query.join(" "));
    rl.pause();

    return result;
}

/**
 * Задержка
 * @param { number } ms Время в мс
 * @returns { Promise<void> }
 */
export const wait = ms => new Promise(resolve => {
    setTimeout(resolve, ms);
})

/**
 * Делаем массив уникальным
 * @param { any[] } array Входной массив
 * @returns { any[] } Уникальный массив
 */
export const removeRepeats = array => {
    return Array.from(
        new Set(array)
    );
}