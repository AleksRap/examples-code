document.addEventListener('DOMContentLoaded', async () => {
  const domain = `http://${document.location.hostname}/`;

  let projectCalendarInfo = null;

  /**
   * Получаем данные о проектах с сервера
   * Если ошибка - выводим алерт с предупреждением и выходим
   */
  try {
    const response = await Fetch.get(`${domain}api/project/get?token=${localStorage.getItem('token')}`);
    projectCalendarInfo = response.data;
  } catch (e) {
    alert(`Ошибка загрузки данных ${e}`);
    return;
  }

  /**
   * Переключение календарей (дневной/недельный/месячный/годовой)
   */
  new Tabs({
    btnWrap: document.querySelector('.selectpicker_calendar'),
    tabWrap: document.querySelector('.all-calendars'),
    tabActiveClass: 'active',
    btnClick: '.selectpicker_calendar',
    dataTab: 'data-calendar',
    type: 'change'
  });

  /**
   * Рендерим список проектов на текущий день
   */
  const listProjectDay = new ListProjectsDay({
    info: projectCalendarInfo
  });

  /**
   * Рендерим инфу о выбранном проекте
   */
  const projectInfo = new ProjectInfo({
    info: projectCalendarInfo
  });

  /**
   * Рендерим дневной календарь
   */
  const calendarDay = new CalendarDay({
    wrapSelector: '[data-calendar="day"]',
    info: projectCalendarInfo
  });

  /**
   * Рендерим недельный календарь
   */
  const calendarWeek = new CalendarWeek({
    wrapSelector: '[data-calendar="week"]',
    info: projectCalendarInfo
  });

  /**
   * Рендерим месячный календарь
   */
  const calendarMonth = new CalendarMonth({
    wrapSelector: '[data-calendar="month"]',
    info: projectCalendarInfo
  });

  /**
   * Рендерим годовой календарь
   */
  const calendarYear = new CalendarYear({
    wrapSelector: '[data-calendar="year"]',
    info: projectCalendarInfo
  });

  /**
   * При клике на задачу в дневном календаре
   * выделяем задачу в списке проектов
   * заменяем информацию о проекте
   * выделяем блок задачи в дневном календаре
   * выделяем блок задачи в нельном календаре
   */
  calendarDay.wrap.addEventListener('click', event => {
    const taskElem = event.target.closest('[data-project-id]');
    if (!taskElem) return;

    const id = +taskElem.dataset.projectId;

    listProjectDay.select(id);
    projectInfo.render(id);
    calendarDay.select(id);
  });

  /**
   * При клике на число или на ячейку в недельном календаре
   * перерендериваем список проектов с проектами на выбранную дату
   * перерендериваем дневной календарь
   * отмечаем число выделенным на недельном, месячном и годовом календарях
   * очищаем информацию о проекте
   */
  calendarWeek.wrap.addEventListener('click', event => {
    const dateElem = event.target.closest('[data-date]');
    if (!dateElem) return;

    const date = +dateElem.dataset.date;
    const dateElemInYearCalendar = calendarYear.wrap.querySelector(`[data-date="${dateElem.dataset.date}"]`);

    listProjectDay.render(date);
    calendarDay.render(date);
    calendarWeek.selectDay(dateElem);
    calendarMonth.selectDay(dateElem);
    calendarYear.selectDay(dateElemInYearCalendar);
    projectInfo.clear();
  });

  /**
   * При клике на число в месячном календаре
   * перерендериваем список проектов с проектами на выбранную дату
   * перерендериваем дневной календарь
   * перерендериваем недельный календарь
   * отмечаем число выделенным на недельном, месячном и годовом календарях
   * очищаем информацию о проекте
   */
  calendarMonth.wrap.addEventListener('click', event => {
    const dateElem = event.target.closest('[data-date]');
    if (!dateElem) return;

    const date = +dateElem.dataset.date;
    const dateElemInYearCalendar = calendarYear.wrap.querySelector(`[data-date="${dateElem.dataset.date}"]`);

    listProjectDay.render(date);
    calendarDay.render(date);
    calendarWeek.setDate(date);
    calendarWeek.render(date);
    calendarMonth.selectDay(dateElem);
    calendarYear.selectDay(dateElemInYearCalendar);
    projectInfo.clear();
  });

  /**
   * При клике на число в годовом календаре
   * перерендериваем список проектов с проектами на выбранную дату
   * перерендериваем дневной календарь
   * перерендериваем недельный календарь
   * отмечаем число выделенным на недельном, месячном и годовом календарях
   * очищаем информацию о проекте
   */
  calendarYear.wrap.addEventListener('click', event => {
    const dateElem = event.target.closest('[data-date]');
    if (!dateElem) return;

    const date = +dateElem.dataset.date;
    const dateElemInMonthCalendar = calendarMonth.wrap.querySelector(`[data-date="${dateElem.dataset.date}"]`);

    listProjectDay.render(date);
    calendarDay.render(date);
    calendarWeek.setDate(date);
    calendarWeek.render(date);
    calendarMonth.selectDay(dateElemInMonthCalendar);
    calendarYear.selectDay(dateElem);
    projectInfo.clear();
  });

  /**
   * При клике на проект в списке проектов на день
   * выводим инфу в блок "Информация о проекте"
   * отмечаем выбранный проект
   * выделяем блок задачи в дневном календаре
   * выделяем блок задачи в нельном календаре
   */
  listProjectDay.body.addEventListener('click', event => {
    const lineProject = event.target.closest('[data-project-id]');
    if (!lineProject) return;

    const id = lineProject.dataset.projectId;

    projectInfo.render(id);
    listProjectDay.select(id);
    calendarDay.select(id);
  });

  /**
   * Убираем прелоадер и показываем контент
   */
  document.querySelector('[data-calendar-preloader]').classList.add('d-none');
  document.querySelector('.projects-calendar').classList.remove('d-none');
});





class ListProjectsDay {
  constructor(data) {
    this.info = data.info
    this.wrap = document.querySelector('[data-project-calendar="list-project-day"]');
    this.body = this.wrap.querySelector('.project-per-day__wrap');

    this.render();
  }

  render(date) {
    this.body.innerHTML = this._generateList(date);
  }

  select(id) {
    [...this.body.children].forEach(elem => elem.classList.remove('active'));
    this.body.querySelector(`[data-project-id="${id}"]`).classList.add('active');
  }

  _generateList(date = new Date().getTime()) {

    /** Фильтруем массив проектов */
    const projectToday = this.info.filter(project => {
      const dateStart = new Date(project.dates.start * 1000).setHours(0, 0, 0, 0);
      const dateEnd = new Date(project.dates.end * 1000).setHours(23, 59, 59, 999);

      return date >= dateStart && date <= dateEnd;
    });

    const listProjectsDay = projectToday.map(project => {
      return `
        <div class="project-per-day__line" data-project-id="${project.id}">
          <div class="project-per-day__col project-per-day__text">${project.name}</div>
          <div class="project-per-day__col project-per-day__price">${project.budget.value} ${project.budget.currency}</div>
        </div>
      `;
    });

    return listProjectsDay.join('');
  }
}

class ProjectInfo {
  constructor(data) {
    this.info = data.info
    this.wrap = document.querySelector('[data-project-calendar="info-project"]');
    this.body = this.wrap.querySelector('.project-preview__wrap');
    this.footer = this.wrap.querySelector('.project-preview__line_btn');
    this.link = this.footer.querySelector('.button');
  }

  render(projectId) {
    this.body.innerHTML = this._generateInfo(projectId);
    this.footer.classList.remove('d-none');
    this.link.setAttribute('href', '#test');
  }

  clear() {
    this.body.innerHTML = null;
  }

  _generateInfo(projectId) {
    const rawInfo = this.info.find(project => project.id === +projectId);

    const info = {
      title: {
        name: 'Заголовок',
        value: rawInfo.name
      },
      category: {
        name: 'Категория',
        value: rawInfo.category.label
      },
      date: {
        name: 'Дата',
        value: `${new Date(rawInfo.dates.start * 1000).format('dd.mm.yyyy')} - ${new Date(rawInfo.dates.end * 1000).format('dd.mm.yyyy')}`
      },
      startTime: {
        name: 'Начало',
        value: new Date(rawInfo.dates.start * 1000).format('hh:MM')
      },
      endTime: {
        name: 'Конец',
        value: new Date(rawInfo.dates.end * 1000).format('hh:MM')
      },
      price: {
        name: 'Бюджет',
        value: `${rawInfo.budget.value} ${rawInfo.budget.currency}`
      },
    };

    return Object.keys(info).map(key => {
      return `
        <div class="project-preview__line">
          <div class="project-preview__item">
            <div class="project-preview__col project-preview__key">${info[key].name}:</div>
            <div class="project-preview__col project-preview__value ${key === 'price' ? 'green-text' : ''}">${info[key].value}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

class Calendar {
  constructor(data) {
    this.currentDate = new Date();
    this.info = data.info
    this.timeArr = this._generateTimeArr();

    this.oneHour = 1000 * 60 * 60;
    this.oneDay = this.oneHour * 24;

    this.monthName = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    this.dayName = ['П','В', 'С', 'Ч', 'П', 'С', 'В'];
    this.dayNameMiddle = ['Пн','Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    this.year = this.currentDate.getUTCFullYear();
    this.infoByMonth = this._getInfoByMonth(this.year);
    this.month = this.currentDate.getUTCMonth();
    this.today = this.currentDate.getUTCDate();

    this.wrap = document.querySelector(data.wrapSelector);
  }

  select(id) {
    [...this.body.querySelectorAll('[data-project-id]')].forEach(elem => elem.classList.remove('selected'));
    this.body.querySelector(`[data-project-id="${id}"]`).classList.add('selected');
  }

  checkingWhetherProjectsOnDate(date, zeroTime = true) {
    /**
     * Проверяем есть ли проекты в указанную дату
     */
    return this.info.findIndex(project => {

      const dateStart = zeroTime
        ? new Date(project.dates.start * 1000).setHours(0, 0, 0, 0)
        : new Date(project.dates.start * 1000);

      const dateEnd = zeroTime
        ? new Date(project.dates.end * 1000).setHours(23, 59, 59, 999)
        : new Date(project.dates.end * 1000);

      return date >= dateStart && date <= dateEnd;
    });
  }

  filterInfoByDate(date) {
    /**
     * Фильтруем массив проектов по указанной дате
     */
    return this.info.filter(project => {
      const dateStart = new Date(project.dates.start * 1000).setHours(0, 0, 0, 0);
      const dateEnd = new Date(project.dates.end * 1000).setHours(23, 59, 59, 999);

      return date >= dateStart && date <= dateEnd;
    });
  }

  selectDay(el) {
    [...this.wrap.querySelectorAll('[data-date]')]
      .forEach(elem => elem.classList.remove('selected'));
    el && el.classList.add('selected');
  }

  _getInfoByMonth(year) {
    const arrInfo = [];

    for (let i = 0; i < 12; i++) {
      const objInfo = {};

      objInfo.firstDay = new Date(year, i, 1);
      objInfo.firstWeekDay = objInfo.firstDay.getUTCDay();
      objInfo.lastDay = Math.ceil((new Date(year, i + 1, 1).getTime() - objInfo.firstDay.getTime() - this.oneHour) / this.oneDay);

      arrInfo.push(objInfo);
    }

    return arrInfo;
  }

  _generateTimeArr() {
    const timeArr = [];
    const minutesInDay = 24 * 60;

    let currentHours = 0;
    let currentMinutes = 0;

    for (let i = 0; i < minutesInDay / 60; i++) {
      const time = new Date(new Date().setHours(currentHours, currentMinutes)).format('hh:MM');
      timeArr.push(time);

      if (currentMinutes + 60 >= 60) {
        currentHours++;
        currentMinutes = 0;
      } else {
        currentMinutes = currentMinutes + 60;
      }
    }

    return timeArr;
  }
}

class CalendarDay extends Calendar {
  constructor(data) {
    super(data);
    this.body = this.wrap.querySelector('.calendar__inner__timelist');

    this.render();
  }

  render(date = new Date()) {
    this._setDay(date);
    this.body.innerHTML = this._generateTimeRow();
    this._generateTasksOnCalendar(date);
  }

  _setDay(date) {
    const titleEl = this.wrap.querySelector('.current-day-title');
    const dateEl = this.wrap.querySelector('.current-day-date');

    titleEl.textContent = this.dayNameMiddle[new Date(date).getDay() - 1];
    dateEl.textContent = new Date(date).getDate();
  }

  _generateTimeRow() {
    return this.timeArr.map(time => `
      <div class="calendar__row__day">
        <div class="calendar__timearea">
          <div class="calendar__time">${time}</div>
        </div>
        <div class="calendar__taskarea">
          <div class="calendar__task" data-time="${time}"></div>
        </div>
      </div>
    `).join('');
  }

  _generateTasksOnCalendar(date) {
    const projectOnDate = this.filterInfoByDate(date);

    projectOnDate.forEach((project, index) => {
      /**
       * Высота строки с временем, нужна для вычисления отступов плашки с задачей
       */
      const rowTimeHeight = +window.getComputedStyle(this.body.querySelector('.calendar__row__day')).height.split('px').join('');

      /**
       * Высота всего календаря, нужна для задач, которые начинаются раньше, а заканчиваются позже
       * определяется как сумма высот всех строк
       * clientHeight на обертке строк нельзя использовать, т.к у предка display: none
       */
      const rows = this.body.querySelectorAll('.calendar__row__day');
      const calendarTimeHeight = rows.length * rowTimeHeight;

      /**
       * Час начала задачи, для того, чтоб найти блок в который вставить задачу
       */
      const hourStart = new Date(project.dates.start * 1000).format('hh');

      /**
       * Час конца задачи, для того, чтоб найти высоту блока задачи
       */
      const hourEnd = new Date(project.dates.end * 1000).format('hh');

      /**
       * Минуты начала задачи, нужна для вычисления отступов плашки с задачей
       * @type {number}
       */
      const minutesStart = +new Date(project.dates.start * 1000).format('MM');

      /**
       * Минуты конца задачи, нужна для вычисления отступов плашки с задачей
       * @type {number}
       */
      const minutesEnd = +new Date(project.dates.end * 1000).format('MM');

      /**
       * Дата в строковом формате для сравнения с датами задач
       */
      const dateStr = new Date(date).format('dd-mm-yyyy');

      /**
       * Дата начала задачи, нужна для сравнения с отрендеренной датой, если они не совпадают,
       * то плашка идет с начала таблицы и вверху не имеет закруглений
       */
      const dateStart = new Date(project.dates.start * 1000).format('dd-mm-yyyy');
      const gluedTop = dateStr !== dateStart;

      /**
       * Дата окончания задачи, нужна для сравнения с отрендеренной датой, если они не совпадают,
       * то плашка идет до конца таблицы и внизу не имеет закруглений
       */
      const dateEnd = new Date(project.dates.end * 1000).format('dd-mm-yyyy');
      const gluedBottom = dateStr !== dateEnd;

      /**
       * Находим сроку с нужным временем начала
       */
      const rowTime = this.body.querySelector(`[data-time="${hourStart}:00"]`);

      /**
       * Находим сроку с нужным временем конца
       */
      const rowTimeEnd = this.body.querySelector(`[data-time="${hourEnd}:00"]`);

      /**
       * Число элементов предшествующих строки со временем начала задачи
       * Для вычисления отрицательного отступа сверху для плашки с задачей, которая начинается раньше
       */
      const countPrevEl = [...rows].indexOf(rowTime.closest('.calendar__row__day'));

      /**
       * Число элементов после строки со временем конца задачи
       * Для вычисления высоты плашки с задачей, которая заканчивается в этот день
       */
      const countNextEl = rows.length - [...rows].indexOf(rowTimeEnd.closest('.calendar__row__day'));

      /**
       * Если задача начинается раньше, то предыдущих строк 0
       * @type {number}
       */
      const countPrevElGluedTop = gluedTop ? 0 : countPrevEl;

      /**
       * Высота плашки с задачей, которая заканчивается в этот день
       */
      const heightTaskBlock = (rows.length - countPrevElGluedTop - countNextEl) * rowTimeHeight + minutesEnd * rowTimeHeight / 60;

      /**
       * Стили для плашки с задачей
       */
      const height = gluedTop && gluedBottom
        ? `${calendarTimeHeight}px`
        : gluedBottom
          ? `${(rows.length - countPrevEl) * rowTimeHeight - (minutesStart * rowTimeHeight / 60)}px`
          : `${heightTaskBlock}px`;
      const top = gluedTop ? `${-countPrevEl * rowTimeHeight}px` : `${minutesStart * rowTimeHeight / 60}px`;
      const borderRadiusTop = gluedTop ? '0' : '5px';
      const borderRadiusBottom = gluedBottom ? '0' : '5px';
      const style = `
        top: ${top}; 
        left: ${100 * index + 15 * (index + 1)}px; 
        height: ${height};
        border-radius: ${borderRadiusTop} ${borderRadiusTop} ${borderRadiusBottom} ${borderRadiusBottom};
      `;

      /**
       * Вставляем в блок задачу
       */
      rowTime.insertAdjacentHTML('beforeend', `
        <div class="calendar__task__block" style="${style}" data-project-id="${project.id}">
          <div class="calendar__task__block__text">${project.name}</div>
        </div>
      `);
    });
  }
}

class CalendarWeek extends Calendar {
  constructor(data) {
    super(data);
    this.currentDate = new Date();
    this.dayNameWrap = this.wrap.querySelector('.days-name');
    this.body = this.wrap.querySelector('.calendar__inner__timelist_scroll');

    this.btnPrev = this.wrap.querySelector('.calendar__arrow_left');
    this.btnNext = this.wrap.querySelector('.calendar__arrow_right');

    this.render();
    this._bind();
  }

  render(date = new Date()) {
    this.setDate(date);
    this.body.innerHTML = this._generateTimeRow();
  }

  goPrevDay() {
    this.currentDate = new Date(this.currentDate.getTime() - (24 * 60 * 60 * 1000));
    this._renderDaysName();
    this.body.innerHTML = this._generateTimeRow();
  }

  goNextDay() {
    this.currentDate = new Date(this.currentDate.getTime() + (24 * 60 * 60 * 1000));
    this._renderDaysName();
    this.body.innerHTML = this._generateTimeRow();
  }

  setDate(date) {
    this.currentDate = new Date(date);
    this._renderDaysName();
  }

  _bind() {
    this.btnPrev.addEventListener('click', () => this.goPrevDay());
    this.btnNext.addEventListener('click', () => this.goNextDay());
  }

  _renderDaysName() {
    this.dayNameWrap.innerHTML = this._generateDayName();
  }

  _generateDayName() {
    let templateDayName = '';

    for (let i = 0; i < 7; i++) {
      const renderDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + i);

      const tasks = this.checkingWhetherProjectsOnDate(renderDate);

      /**
       * Если результат меньше 0, то ставим 6 индекс (в js неделя начинается с воскресения)
       * @type {number}
       */
      const index = renderDate.getDay() - 1 >= 0 ? renderDate.getDay() - 1 : 6
      const dayName = this.dayNameMiddle[index];
      const date = renderDate.getDate();

      const today = renderDate.format('dd-mm-yyyy') === new Date().format('dd-mm-yyyy');

      templateDayName += `
        <div class="current-day">
          <span class="current-day-title">${dayName}</span>
          <div class="calendar__cell ${today ? 'current' : ''} ${tasks !== -1 ? 'task' : ''}" data-date="${renderDate.getTime()}">${date}</div>
        </div>
      `;
    }

    return templateDayName;
  }

  _generateDay(index) {
    let templateDay = '';

    for (let i = 0; i < 7; i++) {

      /**
       * Генерируем даты для ячеек
       * @type {Date}
       */
      const renderDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        this.currentDate.getDate() + i
      );
      renderDate.setHours(index);
      renderDate.setMinutes(0);
      renderDate.setSeconds(0);

      const tasks = this.checkingWhetherProjectsOnDate(renderDate, false);

      templateDay += tasks !== -1
        ? `<div class="calendar__day_cell task" data-date="${renderDate.getTime()}"></div>`
        : `<div class="calendar__day_cell" data-date="${renderDate.getTime()}"></div>`;
    }

    return templateDay;
  }

  _generateTimeRow() {
    return this.timeArr.map((time, index) => `
      <div class="calendar__row__day">
        <div class="calendar__timearea">
          <div class="calendar__time">${time}</div>
        </div>
        <div class="calendar__taskarea">
          <div class="calendar__task week">
            ${this._generateDay(index)}
          </div>
        </div>
      </div>
    `).join('');
  }
}

class CalendarMonth extends Calendar {
  constructor(data) {
    super(data);
    this.monthNameBlock = this.wrap.querySelector('.calendar__nav-text');
    this.btnPrev = this.wrap.querySelector('.calendar__nav-btn_left');
    this.btnNext = this.wrap.querySelector('.calendar__nav-btn_right');

    this.body = this.wrap.querySelector('.calendar__body')

    this.currentMonth = new Date().getMonth();

    this.render();
    this._bind();
  }

  render() {
    this.monthNameBlock.textContent = this.monthName[this.infoByMonth[this.currentMonth].firstDay.getMonth()];
    this.body.innerHTML = this._generateMonthCalendar();
  }

  goPrevMonth() {
    this.currentMonth = this.currentMonth === 0 ? 0 : this.currentMonth - 1;
    this.render();
  }

  goNextMonth() {
    this.currentMonth = this.currentMonth === 11 ? 11 : this.currentMonth + 1;
    this.render();
  }

  _bind() {
    this.btnPrev.addEventListener('click', () => this.goPrevMonth());
    this.btnNext.addEventListener('click', () => this.goNextMonth());
  }

  _generateMonthCalendar() {
    return `
      <div class="calendar__inner calendar__inner_project">
        <div class="calendar__head">
          ${this._generateDayName()}
        </div>
        <div class="calendar__body">
          ${this._generateDays(this.infoByMonth[this.currentMonth])}
        </div>
      </div>
    `;
  }

  _generateDayName() {
    return this.dayNameMiddle.map(dayName => {
      return `<div class="calendar__cell">${dayName}</div>`
    }).join('');
  }

  _generateDays(infoByMonth) {
    let templateDays = '';

    /** Генерируем пустые ячейки */
    for (let i = 0; i < infoByMonth.firstWeekDay; i++) {
      templateDays += '<div class="calendar__cell calendar__cell_empty"></div>';
    }

    /** Генерируем ячейки с числами */
    for (let i = 1; i <= infoByMonth.lastDay; i++) {
      const date = new Date(new Date(infoByMonth.firstDay).getTime() + (24 * 60 * 60 * 1000 * (i - 1)));

      const projectToday = this.checkingWhetherProjectsOnDate(date);

      projectToday !== -1
        ? templateDays += `<div class="calendar__cell task" data-date="${date.getTime()}">${i}</div>`
        : date.format('dd-mm-yyyy') === new Date().format('dd-mm-yyyy')
          ? templateDays += `<div class="calendar__cell current" data-date="${date.getTime()}">${i}</div>`
          : templateDays += `<div class="calendar__cell" data-date="${date.getTime()}">${i}</div>`;
    }

    return templateDays;
  }
}

class CalendarYear extends Calendar {
  constructor(data) {
    super(data);
    this.render();
  }

  render() {
    this.wrap.innerHTML = this._generateYearCalendar();
  }

  _generateYearCalendar() {
    let templateYear = '';

    for (let i = 0; i < this.infoByMonth.length; i++) {
      templateYear += this._generateMonthBlock(this.infoByMonth[i], i);
    }

    return `
      <div class="calendar-page">
        <div class="calendar-page__year">
          ${templateYear}
        </div>
      </div>
    `;
  }
  _generateMonthBlock(infoByMonth, index) {
    return `
      <div class="calendar-page__year__month-block">
        <div class="calendar-page__year__month-block__title">${this.monthName[index]}</div>
        <div class="calendar-page__year__month-block__table">
          <div class="calendar-page__year__month-block__day-name">
            ${this._generateDayName()}
          </div>
          <div class="calendar-page__year__month-block__days">
            ${this._generateDays(infoByMonth)}
          </div>
        </div>
      </div>
    `;
  };
  _generateDayName() {
    return this.dayName.map(dayName => {
      return `<div class="calendar-page__year__month-block__table__day day__name">${dayName}</div>`
    }).join('');
  };
  _generateDays(infoByMonth) {
    let templateDays = '';

    /** Генерируем пустые ячейки */
    for (let i = 0; i < infoByMonth.firstWeekDay; i++) {
      templateDays += '<div class="calendar-page__year__month-block__table__day"></div>';
    }

    /** Генерируем ячейки с числами */
    for (let i = 1; i <= infoByMonth.lastDay; i++) {
      const date = new Date(infoByMonth.firstDay).getTime() + (24 * 60 * 60 * 1000 * (i - 1));

      const projectToday = this.checkingWhetherProjectsOnDate(date);

      projectToday !== -1
        ? templateDays += `<div class="calendar-page__year__month-block__table__day red-label" data-date="${date}">${i}</div>`
        : new Date(date).format('dd-mm-yyyy') === new Date().format('dd-mm-yyyy')
          ? templateDays += `<div class="calendar-page__year__month-block__table__day current" data-date="${date}">${i}</div>`
          : templateDays += `<div class="calendar-page__year__month-block__table__day" data-date="${date}">${i}</div>`;
    }

    return templateDays;
  }
}

class Fetch {

  static async get(url) {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status === 'error') throw new Error(json.message);

    return json
  }

  static async post(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(body)
    });
    const json = await response.json();

    if (json.status === 'error') throw new Error(json.message);

    return json;
  }

  static async put(url, body) {
    const response = await fetch(url, {
      method: 'PUT',
      body
    });
    const json = await response.json();

    if (json.status === 'error') throw new Error(json.message);

    return json;
  }

  static async delete(url) {
    const response = await fetch(url);
    const json = await response.json();

    if (json.status === 'error') throw new Error(json.message);

    return json;
  }
}
