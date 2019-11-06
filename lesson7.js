/*jslint devel: true, plusplus: true, vars: true, white: true*/
/*eslint-env browser*/
/*eslint no-console: 0*/


// Глобальные переменные:                            
var FIELD_SIZE_X = 20; //строки
var FIELD_SIZE_Y = 20; //столбцы
var SNAKE_SPEED = 200; // Интервал между перемещениями змейки
var BOMB_SPEED = 2000; // Интервал между появлениями бомбы
var snake = []; // Сама змейка
var direction = 'y+'; // Направление движения змейки
var gameIsRunning = false; // Запущена ли игра
var snake_timer; // Таймер змейки
var bomb_timer; // Таймер для бомбы
var food_timer; // Таймер для еды
var score = 0; // Результат
var scoreSpan = document.querySelector('.score');

function init() {
    "use strict";

    prepareGameField(); // Генерация поля

    var wrap = document.getElementsByClassName('wrap')[0];
    // Подгоняем размер контейнера под игровое поле

    /*
	if (16 * (FIELD_SIZE_X + 1) < 380) {
        wrap.style.width = '380px';
    }
    else {
        wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
    }
    */
    wrap.style.width = '400px';
    // События кнопок Старт и Новая игра
    document.getElementById('snake-start').addEventListener('click', startGame);
    document.getElementById('snake-renew').addEventListener('click', refreshGame);

    // Отслеживание клавиш клавиатур ы
    addEventListener('keydown', changeDirection);
}

/**
 * Функция генерации игрового поля
 */
function prepareGameField() {
    "use strict";
    // Создаём таблицу
    var game_table = document.createElement('table');
    game_table.setAttribute('class', 'game-table ');

    // Генерация ячеек игровой таблицы
    var i;
    for (i = 0; i < FIELD_SIZE_X; i++) {
        // Создание строки
        var row = document.createElement('tr');
        row.className = 'game-table-row row-' + i;

        var j;
        for (j = 0; j < FIELD_SIZE_Y; j++) {
            // Создание ячейки
            var cell = document.createElement('td');
            cell.className = 'game-table-cell cell-' + i + '-' + j;

            row.appendChild(cell); // Добавление ячейки
        }
        game_table.appendChild(row); // Добавление строки
    }

    document.getElementById('snake-field').appendChild(game_table); // Добавление таблицы
}

/**
 * Старт игры
 */
function startGame() {
    "use strict";
    gameIsRunning = true;
    respawn(); //создали змейку

    snake_timer = setInterval(move, SNAKE_SPEED); //каждые 200мс запускаем функцию move

    bomb_timer = setInterval(createFoodOrBomb, BOMB_SPEED, false); //каждые bomb_timer запускаем функцию createFoodOrBomb

    setTimeout(createFoodOrBomb(true), food_timer);
}

/**
 * Функция расположения змейки на игровом поле
 */
function respawn() {
    "use strict";
    // Змейка - массив td
    // Стартовая длина змейки = 2

    // Respawn змейки из центра
    var start_coord_x = Math.floor(FIELD_SIZE_X / 2);
    var start_coord_y = Math.floor(FIELD_SIZE_Y / 2);

    // Голова змейки
    var snake_head = document.getElementsByClassName('cell-' + start_coord_y + '-' + start_coord_x)[0];
    snake_head.setAttribute('class', snake_head.getAttribute('class') + ' snake-unit');
    // Тело змейки
    var snake_tail = document.getElementsByClassName('cell-' + (start_coord_y - 1) + '-' + start_coord_x)[0];
    snake_tail.setAttribute('class', snake_tail.getAttribute('class') + ' snake-unit');

    snake.push(snake_head);
    snake.push(snake_tail);
}

/**
 * Движение змейки
 */
function move() {
    "use strict";
    //console.log('move',direction);
    // Сборка классов
    var snake_head_classes = snake[snake.length - 1].getAttribute('class').split(' ');

    // Сдвиг головы
    var new_unit;
    var snake_coords = snake_head_classes[1].split('-'); //преобразовали строку в массив
    var coord_y = parseInt(snake_coords[1], 10);
    var coord_x = parseInt(snake_coords[2], 10);

    // Определяем новую точку
    if (direction === 'x-') {
        coord_x--;
        if (coord_x === -1) {
            coord_x = FIELD_SIZE_X - 1;
        }
    } else if (direction === 'x+') {
        coord_x++;
        if (coord_x === FIELD_SIZE_X) {
            coord_x = 0;
        }
    } else if (direction === 'y+') {
        coord_y--;
        if (coord_y === -1) {
            coord_y = FIELD_SIZE_Y - 1;
        }
    } else if (direction === 'y-') {
        coord_y++;
        if (coord_y === FIELD_SIZE_Y) {
            coord_y = 0;
        }
    }
    new_unit = document.getElementsByClassName('cell-' + (coord_y) + '-' + (coord_x))[0];

    // Проверки
    // 0) new_unit не бомба
    // 1) new_unit не часть змейки
    //console.log(new_unit);
    if (!isBombUnit(new_unit) && !isSnakeUnit(new_unit)) {
        // Добавление новой части змейки
        new_unit.setAttribute('class', new_unit.getAttribute('class') + ' snake-unit');
        snake.push(new_unit);

        // Проверяем, надо ли убрать хвост

        if (!haveFood(new_unit)) {
            // Находим хвост
            var removed = snake.splice(0, 1)[0];
            var classes = removed.getAttribute('class').split(' ');

            // удаляем хвост
            removed.setAttribute('class', classes[0] + ' ' + classes[1]);
        }
    } else {
        finishTheGame();
    }
}

/**
 * Проверка на змейку
 * @param unit
 * @returns {boolean}
 */
function isSnakeUnit(unit) { //проверка, что змейка не попала сама в себя в новой ячейке
    "use strict";
    var check = false;

    if (snake.includes(unit)) { //если в змейке содержится новая ячейка, значит возникло пересечение
        check = true;
    }
    return check;
}


/**
 * Проверка на бомбу
 * @param unit
 * @returns {boolean}
 */
function isBombUnit(unit) { //проверка, что змейка не попала сама в себя в новой ячейке
    "use strict";
    var check = false;
    if (unit.classList.contains('bomb-unit')) {
        check = true;
    }
    return check;
}



/**
 * проверка на еду или бомбу
 * @param unit
 * @returns {boolean}
 */
function haveFood(unit) {
    "use strict";
    var check = false;

    var unit_classes = unit.getAttribute('class').split(' ');

    // Если еда
    if (unit_classes.includes('food-unit')) {
        check = true;
        createFoodOrBomb(true);
        addScore();
    }
    return check;
}


function addScore() {
    score++;
    scoreSpan.innerText = 'Очки: ' + score;
}



/**
 * Создание еды или бомбы true - еда, false - бомба
 */
function createFoodOrBomb(food) {
    "use strict";
    var created = false;

    if (!food) {
        console.log('bomb');
    }

    while (!created) { //пока еду не создали
        // рандом
        var x = Math.floor(Math.random() * FIELD_SIZE_X);
        var y = Math.floor(Math.random() * FIELD_SIZE_Y);

        var cell = document.getElementsByClassName('cell-' + y + '-' + x)[0];
        var cell_classes = cell.getAttribute('class').split(' ');

        // проверка на занятость ячейки
        if (!cell_classes.includes('snake-unit') && !cell_classes.includes('food-unit') && !cell_classes.includes('bomb-unit')) {
            var classes = '';
            var i;
            for (i = 0; i < cell_classes.length; i++) {
                classes += cell_classes[i] + ' ';
            }
            if (food) {
                cell.setAttribute('class', classes + 'food-unit');
            } else {
                cell.setAttribute('class', classes + 'bomb-unit');
            }
            created = true;
        }
    }
}


/**
 * Изменение направления движения змейки
 * @param e - событие
 */
function changeDirection(e) {
    "use strict";
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 37: // Клавиша влево
            if (direction !== 'x+') {
                direction = 'x-';
            }
            break;
        case 38: // Клавиша вверх
            if (direction !== 'y-') {
                direction = 'y+';
            }
            break;
        case 39: // Клавиша вправо
            if (direction !== 'x-') {
                direction = 'x+';
            }
            break;
        case 40: // Клавиша вниз
            if (direction !== 'y+') {
                direction = 'y-';
            }
            break;
    }
}

/**
 * Функция завершения игры
 */
function finishTheGame() {
    "use strict";
    gameIsRunning = false;
    clearInterval(snake_timer);
    clearInterval(bomb_timer);
    alert('Вы проиграли! Ваш результат: ' + score.toString());
}

/**
 * Новая игра
 */
function refreshGame() {
    "use strict";
    location.reload();
}

// Инициализация
window.onload = init;
