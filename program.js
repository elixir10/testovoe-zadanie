import { input, wait } from "./utils.js";
import * as manager from './database/manager.js';

// Решил классом сделать ну типо умею
export default class Program {
    /**
     * Главное меню
     * @returns { Promise<void> }
     */
    async start() {
        console.clear();
        console.log('[    ГЛАВНОЕ МЕНЮ    ]');
        console.log();
        console.log('Выберите действие:');
        console.log('[1] Посмотреть список книг');
        console.log('[2] Поиск книг');
        console.log();
    
        const answer = +(await input('>>> '));
    
        switch(answer) {
            case 1:
                await this.showBooks();
                break;
            case 2:
                await this.search();
                break;
            default:
                await this.start();       
        }
    }

    /**
     * Просмотр книг
     * @param { string | undefined } genre Жанр
     * @returns { Promise<void> }
     */
    async showBooks(genre) {
        console.clear();
        console.log('[    СПИСОК КНИГ    ]');
        if(genre) console.log(`Жанр: ${genre}`);
        console.log();
        console.log('Выберите книгу:');
        console.log();

        const books = await manager.getAll(genre);

        if(!books.length)
            console.log('У вас ещё нет ни одной книги');
        else
            console.log(
                books
                    .map(({ name, author}, index) => {
                        return `[${++index}] ${name} от ${author}`
                    })
                    .join('\n')
            );

        console.log();
        console.log('[0] Назад');
        console.log(`[${books.length + 1}] Фильтр по жанру`);
        console.log(`[${books.length + 2}] Добавить книгу`);

        console.log();
    
        const answer = +(await input('>>> '));

        switch(answer) {
            case 0:
                await this.start();
                break;
            case books.length + 2:
                await this.createBook();
                break;
            case books.length + 1:
                await this.selectGenre();
                break;
            default:
                if(!books[answer - 1]) {
                    await this.showBooks();
                    return;
                }

                await this.viewBook(books[answer - 1].id);
                break;
        }
    }

    /**
     * Выводит информацию о книге
     * @param { number } id Айди книги 
     * @returns { Promise<void> }
     */
    async viewBook(id) {
        // Я знаю что можно было бы передавать сразу объект книги, но представим что мы пишем апишку для сайта :)
        console.clear();
        console.log('[    ПРОСМОТР КНИГИ    ]');
        console.log();

        const book = await manager.getBook(id);

        // Если вдруг книгу удалили из дб...
        if(!book) {
            console.log('Книга не найдена...');
        } else {
            console.log(`> Название: ${book.name}`);
            console.log(`> Автор: ${book.author}`);
            console.log(`> Описание: ${book.description}`)
            console.log(`> Жанр: ${book.genre}`);
        }

        console.log();
        console.log('Выберите действие:');
        if(book) console.log('[1] Удалить книгу');
        console.log('[2] В главное меню');
        console.log();

        const answer = +(await input('>>> '));

        switch(answer) {
            case 2:
                await this.start();
                break;
            case 1:
                if(book) {
                    await manager.deleteBook(id);
                    console.clear();
                    console.log(`Удалено, вы вернетесь в главное меню через секунду`);

                    await wait(1000);
                    await this.start();

                    break;
                }
            default:
                await this.viewBook(id);
                break;
        }
    }

    async selectGenre() {
        console.clear();
        console.log('[    ВЫБЕРИТЕ ЖАНР    ]');
        console.log();

        const genres = await manager.getGenres();
        if(!genres.length) {
            console.log('У вас ещё нет ни одного доступного жанра');
            console.log('Вы отправитесь назад через пару секунд...');

            await wait(2000);
            await this.showBooks();

            return;
        }

        console.log(
            genres.map((genre, index) => {
                return `[${++index}] ${genre}`
            })
            .join('\n')
        )

        console.log();
        const answer = +(await input('>>> '));

        if(!genres[answer - 1]) {
            await this.selectGenre();
            return;
        }

        await this.showBooks(genres[answer - 1]);
    }

    /**
     * Добавить книгу
     * @param { string } name название книги 
     * @param { string } author автор книги
     * @param { string } genre жанр книги
     * @returns { Promise<void> }
     */
    async createBook(name, author, description, genre) {
        console.clear();

        while(!name || !author || !genre || !description) {
            const genres = await manager.getGenres();

            if(!name) console.log('Введите название');
            else if(!author) console.log('Введите автора');
            else if(!description) console.log('Введите описание');
            else if(!genre) {
                console.log('Введите жанр');

                if(genres.length) {
                    console.log(
                        genres.map((genre, index) => {
                            return `[${++index}] ${genre}`
                        })
                        .join('\n')
                    );
                    console.log('Или введите свой вариант');
                }
            }

            let answer = await input('>>> ');

            // Проверка на валид
            if(!new RegExp('^[?!,.а-яА-ЯёЁ0-9\\s]+$').test(answer)) {
                console.clear();
                console.log('Ввод должен быть исключительно из русских букв!!');

                continue;
            }

            // Выбор жанра из предложеных
            if(author && !isNaN(+answer)) {
                answer = genres[+answer - 1];

                if(!answer) {
                    console.clear();
                    console.log('Недопустимый ввод');

                    continue;
                }
            }
            
            await this.createBook(
                name || answer,
                author || (name? answer : undefined),
                description || (author? answer : undefined),
                genre || (description? answer : undefined),
            );
            return;
        }

        await manager.addBook({ name, author, genre, description });

        console.log(`[+] Книга добавлена!`);
        await wait(1500);

        await this.showBooks();
    }

    /**
     * Поиск книги по запросу
     * @returns { Promise<void> }
     */
    async search() {
        console.clear();
        console.log('[    ПОИСК КНИГ    ]');
        console.log();
        console.log('Введите запрос');
        console.log();

        const query = await input('>>> ');

        const books = await manager.find(query);

        if(!books.length) {
            console.clear();
            console.log('Ничего не найдено :(');

            await wait(1500);
            await this.start();

            return;
        }

        console.clear();
        console.log('[    ВЫБЕРИТЕ КНИГУ    ]');

        console.log();
        console.log(
            books
                .map(({ name, author}, index) => {
                    return `[${++index}] ${name} от ${author}`
                })
                .join('\n')
        );
        console.log();

        while(true) {
            const answer = +(await input('>>> '));

            if(books[answer - 1]) {
                await this.viewBook(books[answer - 1].id);
                return;
            }


            console.log('Неверный ввод');
        }
    }
}