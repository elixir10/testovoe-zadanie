import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as Utils from '../utils.js';

const db = await open({
    filename: "database/db.sqlite",
    driver: sqlite3.Database
});

/**
 * Получает информацию о книге
 * @param { number } id Айди книги
 * @returns { Promise<{
 *     id: number,
 *     name: string,
 *     author: string,
 *     description: string
 *     genre: string
 * } | null> } Книга
 */
export const getBook = async id => {
    return await db.get(`SELECT * FROM books WHERE id = ${id}`);
}

/**
 * Удаляет книгу
 * @param { number } id Айди книжечки 📖📖📖
 * @returns { Promise<void> }
*/
export const deleteBook = async id => {
   await db.run(`DELETE FROM books WHERE id = ${id}`);
}

/**
 * Выдает все книги/книги под определенным жанром
 * @param { string | undefined } genre Для выдачи книг под определнным жанром
 * @returns { Promise<{
 *     id: number,
 *     name: string,
 *     author: string,
 *     description: string
 *     genre: string
 * }[]> } Массив книг
 */
export const getAll = async genre => {
    if(genre) {
        return await db.all(`
            SELECT * FROM books WHERE genre = "${genre}";
        `);
    }

    return await db.all(`SELECT * FROM books;`);
}

/**
 * Выдает возможные книги по запросу
 * @param { string } query Запрос для поиска
 * @returns { Promise<{
 *     id: number,
 *     name: string,
 *     author: string,
 *     description: string
 *     genre: string
 * }[]> } Массив книг
 */
export const find = async query => {
    return await db.all(`
        SELECT * FROM books WHERE name LIKE "%${query}%" OR author LIKE "%${query}%";
    `);
}

/**
 * Получает жанры используемые ранее
 * @returns { Promise<string[]> } Список уникальных жанров
 */
export const getGenres = async () => {
    return Utils.removeRepeats(
        (await db.all('SELECT genre FROM books'))
            .map(({ genre }) => genre)
    );
}

/**
 * Создает новую книгу
 * @param { {
 *     name: string,
 *     author: string,
 *     description: string
 *     genre: string
 * } } book Параметры для создания книги
 * @returns { Promise<void> }
 */
export const addBook = async book => {
    const { name, author, genre, description } = book;

    await db.run(
        `INSERT INTO books(name, author, description, genre, id) VALUES ('${name}', '${author}', '${description}','${genre}', ${Date.now()});`
    );
}