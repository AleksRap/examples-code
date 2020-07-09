/** Раздел список гостей */

/** Для запросов */
const domain = 'http://dev.beamore.ru';
const projectId = localStorage.getItem('projectId');

/**
 * Data атрибуты используемые в скриптах
 *
 * data-guest-group            id группы
 * data-guest-residense        @type {boolean}
 * data-guest-transfer         @type {boolean}
 * data-guest-meet             @type {boolean}
 * data-guest-tickets          @type {boolean}
 * data-guest-filter-status    @type {boolean}
 * data-guest-filter-type      тип фильтра
 * data-guest-btn              имя кнопки
 * data-guest-form             без значения
 * data-guest-wrap             имя обертки
 * data-guest-status           @type {boolean}
 * data-guest-id               id гостя
 * data-guest-filters          без значения
 */

document.addEventListener('DOMContentLoaded', async () => {

  class DisplayElement {
    static show(...arrEl) {
      arrEl.forEach(el => el.classList.contains('d-none') ? el.classList.remove('d-none') : null);
    }

    static hide(...arrEl) {
      arrEl.forEach(el => el.classList.contains('d-none') ? null : el.classList.add('d-none'));
    }

    static toggle(...arrEl) {
      arrEl.forEach(el => el.classList.toggle('d-none'));
    }
  }

  class ManagementEvents {

    /**
     * На входе принимаем объект с параметрами
     * arr   - массив куда сохраняем события
     * el    - элемент, на который навешиваем обработчик
     * event - событие (str)
     * fn    - анонимная функция без вызова
     * @param data
     */
    static addEventToArr(data) {
      /** Добавляем событие в массив */
      data.arr.push({el: data.el, event: data.event, fn: data.fn});

      /** Вешаем слушатель */
      data.el.addEventListener(data.event, data.fn);
      return true
    }

    /**
     * На входе принимаем массив событий
     * @param arr
     */
    static removeEvents(arr) {
      /** Снимаем обработчики события */
      arr.forEach(item => {
        item.el.removeEventListener(item.event, item.fn)
      });

      /** Очищаем массив */
      arr.splice(0, arr.length);

      return true;
    }
  }

  class Pagination {
    constructor(selector) {
      this.pagination = document.querySelector(selector);

      this.activePage = 0;
      this.quantityPage = 0;

      /** Элементы управления */
      this.elements = this._getElements();

      /** Массив событий */
      this.arrEvents = [];

      /** Биндим события */
      this._bind();
    }

    render(quantityPage, activePage) {
      if (quantityPage > 1) DisplayElement.show(this.pagination);
      else DisplayElement.hide(this.pagination);

      /** Устанавливаем активную страницу и общее число страниц */
      this.activePage = activePage;
      this.quantityPage = quantityPage;

      /** Шаблон стрелок влево */
      const arrowLeft = `
      <a class="pagination__arrow pagination__double-arrow_left" href="#"></a>
      <a class="pagination__arrow pagination__arrow_left" href="#"></a>
    `;

      /** Шаблон стрелок вправо */
      const arrowRight = `
      <a class="pagination__arrow pagination__arrow_right" href="#"></a>
      <a class="pagination__arrow pagination__double-arrow_right" href="#"></a>
    `;

      /** Шаблон точек */
      const dots = '<span class="pagination__dots">...</span>';

      /** Шаблон последней страницы */
      const lastPage = `<a class="pagination__item" href="#">${quantityPage}</a>`;
      const lastPageActive = `<a class="pagination__item active" href="#">${quantityPage}</a>`;

      /** Шаблон остальных пяти страниц */
      let fivePages = '';
      const startPage = (quantityPage - activePage) > 5
        ? activePage
        : quantityPage > 5
          ? quantityPage - 5
          : 1;
      for (let i = startPage; i < startPage + 5 && i < quantityPage; i++) {
        if (i === activePage) {
          fivePages += `<a class="pagination__item active" href="#">${i}</a>`;
          continue;
        }
        fivePages += `<a class="pagination__item" href="#">${i}</a>`
      }

      /** Шаблон пагинации */
      const templatePagination = `
      ${activePage === 1 ? '' : arrowLeft}
      ${fivePages}
      ${(quantityPage - activePage) > 5 ? dots : ''}
      ${activePage === quantityPage ? lastPageActive : lastPage}
      ${activePage === quantityPage ? '' : arrowRight}
    `;

      this.pagination.querySelector('.pagination__inner').innerHTML = templatePagination;

      this.update();
    }
    action() {
      const el = event.target.closest('a');
      if (!el) return;

      event.preventDefault();

      if (el.classList.contains('pagination__double-arrow_left')) this.firstPage();
      if (el.classList.contains('pagination__arrow_left')) this.prevPage();
      if (el.classList.contains('pagination__arrow_right')) this.nextPage();
      if (el.classList.contains('pagination__double-arrow_right')) this.lastPage();
      if (el.classList.contains('pagination__item')) this.numberPage(el);
    }
    firstPage() {
      this.render(this.quantityPage, 1);
    }
    prevPage() {
      this.render(this.quantityPage, --this.activePage);
    }
    nextPage() {
      this.render(this.quantityPage, ++this.activePage);
    }
    lastPage() {
      this.render(this.quantityPage, this.quantityPage);
    }
    numberPage(el) {
      const page = +el.textContent;
      this.render(this.quantityPage, page);
    }
    update() {
      /** Удаляем старые события */
      ManagementEvents.removeEvents(this.arrEvents);

      /** Находим элементы заново */
      this.elements = this._getElements();

      /** Биндим события */
      this._bind();
    }

    /**
     * @private
     */
    _bind() {
      /** Обработчик на всю пагинцию */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.pagination,
        event: 'click',
        fn: () => this.action()
      });

      /** Первая страница */
      if (this.elements.firstPage) {
        ManagementEvents.addEventToArr({
          arr: this.arrEvents,
          el:  this.elements.firstPage,
          event: 'click',
          fn: () => this._createEventFirstPage()
        });
      }

      /** Предыдущая страница */
      if (this.elements.prevPage) {
        ManagementEvents.addEventToArr({
          arr: this.arrEvents,
          el:  this.elements.prevPage,
          event: 'click',
          fn: () => this._createEventPrevPage()
        });
      }

      /** Следующая страница */
      if (this.elements.nextPage) {
        ManagementEvents.addEventToArr({
          arr: this.arrEvents,
          el:  this.elements.nextPage,
          event: 'click',
          fn: () => this._createEventNextPage()
        });
      }

      /** Последняя страница */
      if (this.elements.lastPage) {
        ManagementEvents.addEventToArr({
          arr: this.arrEvents,
          el:  this.elements.lastPage,
          event: 'click',
          fn: () => this._createEventLastPage()
        });
      }

      /** Номер страницы */
      if (this.elements.numPage.length) {
        this.elements.numPage.forEach(num => {
          ManagementEvents.addEventToArr({
            arr: this.arrEvents,
            el:  num,
            event: 'click',
            fn: () => this._createEventNumPage(num)
          });
        });
      }
    }
    _getElements() {
      return {
        firstPage: this.pagination.querySelector('.pagination__double-arrow_left'),
        prevPage: this.pagination.querySelector('.pagination__arrow_left'),
        nextPage: this.pagination.querySelector('.pagination__arrow_right'),
        lastPage: this.pagination.querySelector('.pagination__double-arrow_right'),
        numPage: this.pagination.querySelectorAll('.pagination__item')
      }
    }
    _createEventFirstPage() {
      const firstPage = new Event('firstPage', {bubbles: true});
      this.elements.firstPage.dispatchEvent(firstPage);
    }
    _createEventPrevPage() {
      const prevPage = new Event('prevPage', {bubbles: true});
      this.elements.prevPage.dispatchEvent(prevPage);
    }
    _createEventNextPage() {
      const nextPage = new Event('nextPage', {bubbles: true});
      this.elements.nextPage.dispatchEvent(nextPage);
    }
    _createEventLastPage() {
      const lastPage = new Event('lastPage', {bubbles: true});
      this.elements.lastPage.dispatchEvent(lastPage);
    }
    _createEventNumPage(elem) {
      const numPage = new Event('numPage', {bubbles: true});
      elem.dispatchEvent(numPage);
    }
  }

  class GuestList {
    list = document.querySelector('.list-guests');
    picListEmpty = this.list.querySelector('.list-guests__not-guest');
    modalView = this.list.querySelector('#view-info-guest');
    page = 1;
    allPages;
    filterPage = 1;
    allFilterPages;

    /** Массив событий */
    arrEvents = [];

    /** При открытии модалки удаления сюда записывается id гостя которого нужно удалить */
    delGuestId;

    constructor() {
      this.wraps = {
        list: this.list.querySelector('.list-guests__wrap'),
        filters: this.list.querySelector('.list-guests__filters')
      };
      this.elements = {
        mainCheckbox: this.list.querySelector('#all-checkbox'),
        allCheckbox: this.wraps.list.querySelectorAll('input[type=checkbox]'),
      };

      /** Биндим события */
      this._bind();

      /** Проверяем пустой ли список */
      this._togglePicListEmpty();

      /** Получаем список гостей */
      this.getGuestList(this.page);
    }

    async getGuestList(page, filters) {
      /** Очищаем список */
      this.wraps.list.innerHTML = '';

      let filtersStr = '';
      if (filters) {
        filtersStr = Object.keys(filters).map(key => {
          if (typeof filters[key] === 'object') {

            return Object.keys(filters[key]).map(key2 => {
              return `&${key}[${key2}]=${filters[key][key2]}`
            }).join('');

          } else {
            return `&${key}=${filters[key]}`;
          }
        }).join('');
      }

      try {
        const result = await Fetch.get(`${domain}/api/project-guest/page?token=${localStorage.getItem('token')}&project=${projectId}&page=${page}${filtersStr}`);
        if (result.data) result.data.forEach(person => this.addGroupPerson(person, false));

        this.update();
      } catch (e) {
        console.log(e);
        alert(`Ошибка получения информации о гостях.\n${e}`);
      }
    }
    addGroupPerson(obj, addUp = true) {
      if (this.wraps.list.childElementCount >= 15) this._delLastGuestOnPage();

      const templateFull = `
      <div class="list-guests__row" data-guest-group="1" data-guest-id="${obj.id}">
        <div class="list-guests__checkbox">
          <div class="checkbox area">
            <input class="checkbox__input" type="checkbox" id="${obj.id}">
            <label class="checkbox__label" for="${obj.id}">
              <div class="checkbox__icon"></div>
            </label>
          </div>
        </div>
        <div class="list-guests__info-guest js-open-modal" data-href="#view-info-guest">
          <div class="list-guests__cell">${obj.name}</div>
          <div class="list-guests__cell">${obj.phone}</div>
          <div class="list-guests__cell">${obj.email}</div>
          <div class="list-guests__cell">
            <div class="list-guests__people-icon" style="background-image: ${obj.type.code === 1 ? 'url(images/icons/one-person.svg)' : 'url(images/icons/two-person.svg)'}"></div>
          </div>
          <div class="list-guests__cell list-guests__cell_row">
            <div class="up-title">
              <div class="up-title__wrap">
                <div class="list-guests__icon list-guests__icon_residence mr5" data-guest-residence="${obj.require.accommodation.code === 5 ? 'true' : 'false'}"></div>
              </div>
              <div class="up-title__alert">Нужно проживание</div>
            </div>
            <div class="up-title">
              <div class="up-title__wrap">
                <div class="list-guests__icon list-guests__icon_transfer mr5" data-guest-transfer="${obj.require.transfer.code === 5 ? 'true' : 'false'}"></div>
              </div>
              <div class="up-title__alert">Нужен трансфер</div>
            </div>
            <div class="up-title">
              <div class="up-title__wrap">
                <div class="list-guests__icon list-guests__icon_meet mr5" data-guest-meet="${obj.require.meet.code === 5 ? 'true' : 'false'}"></div>
              </div>
              <div class="up-title__alert">Нужно встретить</div>
            </div>
            <div class="up-title">
              <div class="up-title__wrap">
                <div class="list-guests__icon list-guests__icon_tickets" data-guest-tickets="${obj.require.ticket.code === 5 ? 'true' : 'false'}"></div>
              </div>
              <div class="up-title__alert">Нужны билеты</div>
            </div>
          </div>
          <div class="list-guests__cell">
            <a class="tooltip icon-edit icon js-open-modal tooltipstered" href="#edit-info-guest"></a>
            <a class="tooltip icon-delete icon js-open-modal tooltipstered" href="#confirm-del"></a>
          </div>
        </div>
      </div>
    `;

      if (addUp) this.wraps.list.insertAdjacentHTML('afterbegin', templateFull);
      else this.wraps.list.insertAdjacentHTML('beforeend', templateFull);

      /**
       * Проверяем пустой ли список
       * пустой - отображаем инфу о пустом списке
       * нет - скрываем ее
       */
      this._togglePicListEmpty();

      /** Обновляем список чекбоксов */
      this.elements.allCheckbox = this.wraps.list.querySelectorAll('input[type=checkbox]');
    }
    editPerson(obj) {
      const {id, name, phone, email, type, require} = obj;

      const row = this.list.querySelector(`[data-guest-id="${id}"]`);
      if (!row) return;

      const cells = row.querySelectorAll('.list-guests__cell');
      const [nameOld, phoneOld, emailOld, typeOld, entityOld] = [...cells];

      nameOld.textContent = name;
      phoneOld.textContent = phone;
      emailOld.textContent = email;

      const icon = typeOld.querySelector('.list-guests__people-icon');
      icon.style.backgroundImage = type.code === 1 ? 'url(images/icons/one-person.svg)' : 'url(images/icons/two-person.svg)';

      const requireAccommodation = entityOld.querySelector('[data-guest-residence]');
      const requireTransfer = entityOld.querySelector('[data-guest-transfer]');
      const requireMeet = entityOld.querySelector('[data-guest-meet]');
      const requireTicket = entityOld.querySelector('[data-guest-tickets]');

      requireAccommodation.dataset.guestResidence = require.accommodation.code === 5 ? 'true' : 'false';
      requireTransfer.dataset.guestTransfer = require.transfer.code === 5 ? 'true' : 'false';
      requireMeet.dataset.guestMeet = require.meet.code === 5 ? 'true' : 'false';
      requireTicket.dataset.guestTickets = require.ticket.code === 5 ? 'true' : 'false';
    }
    async delPerson() {
      try {
        const result = await Fetch.delete(`${domain}/api/project-guest/delete?token=${localStorage.getItem('token')}&project=${projectId}&guest=${this.delGuestId}`);
        const resultData = result.data;

        if (resultData) {
          const delPerson = this.wraps.list.querySelector(`[data-guest-id="${this.delGuestId}"]`);
          if (delPerson) delPerson.remove();

          /**
           * Проверяем пустой ли список
           * пустой - отображаем инфу о пустом списке
           * нет - скрываем ее
           */
          this._togglePicListEmpty();
        }
      } catch (e) {
        console.log(e);
        alert(`Ошибка удаления гостя.\n${e}`);
      }
    }
    async getQuantityPages(filters) {
      let filtersStr = '';
      if (filters) {
        filtersStr = Object.keys(filters).map(key => {
          if (typeof filters[key] === 'object') {

            return Object.keys(filters[key]).map(key2 => {
              return `&${key}[${key2}]=${filters[key][key2]}`
            }).join('');

          } else {
            return `&${key}=${filters[key]}`;
          }
        }).join('');
      }

      try {
        const guestQuantity = await Fetch.get(`${domain}/api/project-guest/amount?token=${localStorage.getItem('token')}&project=${projectId}${filtersStr}`);
        return Math.ceil(+guestQuantity.data / 15);
      } catch (e) {
        console.log(e);
        alert(`Ошибка получения числа страниц.\n${e}`);
        return 1;
      }
    }
    firstPage(filters) {
      if (Object.keys(filters).length) {
        this.filterPage = 1;
        this.getGuestList(this.filterPage, filters);
      } else {
        this.page = 1;
        this.getGuestList(this.page);
      }
    }
    prevPage(filters) {
      if (Object.keys(filters).length) {
        this.filterPage--;
        this.getGuestList(this.filterPage, filters);
      } else {
        this.page--;
        this.getGuestList(this.page);
      }
    }
    nextPage(filters) {
      if (Object.keys(filters).length) {
        this.filterPage++;
        this.getGuestList(this.filterPage, filters);
      } else {
        this.page++;
        this.getGuestList(this.page);
      }
    }
    lastPage(filters) {
      if (Object.keys(filters).length) {
        this.filterPage = this.allFilterPages;
        this.getGuestList(this.filterPage, filters);
      } else {
        this.page = this.allPages;
        this.getGuestList(this.page);
      }
    }
    numPage(filters) {
      if (Object.keys(filters).length) {
        this.filterPage = +event.target.textContent;
        this.getGuestList(this.filterPage, filters);
      } else {
        this.page = +event.target.textContent;
        this.getGuestList(this.page);
      }
    }
    update() {
      this.wraps.list.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
        ManagementEvents.addEventToArr({
          arr: this.arrEvents,
          el:  checkbox,
          event: 'change',
          fn: () => this._toggleMainCheckbox()
        });
      });
    }

    /**
     * @private
     */
    _bind() {
      /** Добавить инфу в модалку просмотра */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.list,
        event: 'click',
        fn: () => this._changeInfoInModalView(event)
      });

      /** Переключение всех чекбоксов */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.mainCheckbox,
        event: 'change',
        fn: () => this._toggleAllCheckbox()
      });

      /** Добавить id на удаление */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.list,
        event: 'click',
        fn: event => {
          const btnDel = event.target.closest('.icon-delete');
          if (!btnDel) return;

          this.delGuestId = event.target.closest('[data-guest-id]').dataset.guestId;
        }
      });

      /** Удалить персону */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  document.querySelector('[data-guest-btn="del-guest"]'),
        event: 'click',
        fn: () => this.delPerson()
      });

      /** При закрытии модалки вернуть прелоадер и скрыть контент */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.modalView,
        event: 'click',
        fn: () => this._returnModal(this.modalView)
      });
    }
    _togglePicListEmpty() {
      const personArr = this.wraps.list.childElementCount;
      if (personArr > 0) {
        DisplayElement.hide(this.picListEmpty);
        DisplayElement.show(this.wraps.filters.parentElement);
      } else {
        DisplayElement.show(this.picListEmpty);
        DisplayElement.hide(this.wraps.filters.parentElement);
      }
    }
    async _changeInfoInModalView(event) {
      const line = event.target.closest('.list-guests__row');
      const btnEdit = event.target.closest('.icon-edit');
      if (!line || btnEdit) return;

      const idGuest = line.dataset.guestId;

      try {
        const infoGuestResponse = await Fetch.get(`${domain}/api/project-guest/get?token=${localStorage.getItem('token')}&project=${projectId}&guest=${idGuest}`);
        const infoGuest = infoGuestResponse.data;

        let residence = '';
        if (infoGuest.entity.accommodation.length) {
          const people = infoGuest.entity.accommodation.map(person => `
            <div class="form-block_color-line-result">
              <div class="form-block__cell">${person.name}</div>
              <div class="form-block__cell">${person.age.label}</div>
            </div>
          `).join('');

          residence = `
            <hr class="form__hr">
            <div class="form-block__wrap">
              <h5 class="form-block__title">Нужно проживание</h5>
              <div class="form-block__color-line form-block__color-line_gray">
                ${people}
              </div>
            </div>
          `;
        }

        let transfer = '';
        if (infoGuest.entity.transfer.length) {
          const stops = infoGuest.entity.transfer[0].stops.map(stop => `
            <div class="area">
              <div class="area__title">Заехать</div>
              <div class="area__text">${stop.address}</div>
            </div>
          `).join('');

          transfer = `
            <hr class="form__hr">
            <div class="form-block__wrap">
              <h5 class="form-block__title">Нужен трансфер</h5>
              <div class="form-block_transfer-result">
                <div class="area">
                  <div class="area__title">Откуда</div>
                  <div class="area__text">${infoGuest.entity.transfer[0].from}</div>
                </div>
                <div class="area">
                  <div class="area__title">Куда</div>
                  <div class="area__text">${infoGuest.entity.transfer[0].to}</div>
                </div>
                <div class="area">
                  <div class="area__title">Количество человек</div>
                  <div class="area__text">${infoGuest.entity.transfer[0].amount}</div>
                </div>
                ${stops}
              </div>
            </div>
          `;
        }

        let meet = '';
        if (infoGuest.entity.meet.length) {
          const date = new Date(+infoGuest.entity.meet[0].date * 1000).format('dd.mm.yyyy');
          const time = new Date(infoGuest.entity.meet[0].time).format('hh:MM');

          meet = `
            <hr class="form__hr">
            <div class="form-block__wrap">
              <h5 class="form-block__title">Нужно встретить</h5>
              <div class="form-block_meet-result">
                <div class="area">
                  <div class="area__title">Дата и время встречи</div>
                  <div class="area__text">${date} в ${time}</div>
                </div>
                <div class="area">
                  <div class="area__title">Адрес встречи</div>
                  <div class="area__text">${infoGuest.entity.meet[0].address}</div>
                </div>
              </div>
            </div>
          `;
        }

        let tickets = '';
        if (infoGuest.entity.ticket.length) {
          const arrTickets = infoGuest.entity.ticket.map(ticket => `
            <div class="form-block_color-line-result">
              <div class="form-block__cell">${ticket.from} - ${ticket.to}</div>
              <div class="form-block__cell">${ticket.date}</div>
            </div>
          `).join('');

          tickets = `
            <hr class="form__hr">
            <div class="form-block__wrap">
              <h5 class="form-block__title">Нужны билеты</h5>
              <div class="form-block__color-line form-block__color-line_gray">
                ${arrTickets}
              </div>
            </div>
          `;
        }

        const templateFull = `
          <div class="form-block form-block__tabs-new">
            <div class="form-block_guests-result">
              <div class="area">
                <div class="area__title">ФИО</div>
                <div class="area__text">${infoGuest.name}</div>
              </div>
              <div class="area">
                <div class="area__title">Категория гостя</div>
                <div class="area__text">${infoGuest.category ? infoGuest.category.label : 'Не выбрана'}</div>
              </div>
              <div class="area">
                <div class="area__title">Тип гостя</div>
                <div class="area__text">${infoGuest.type.code ? infoGuest.type.label : 'Не выбрано'}</div>
              </div>
              <div class="area">
                <div class="area__title">Телефон</div>
                <div class="area__text">${infoGuest.phone}</div>
              </div>
              <div class="area">
                <div class="area__title">E-mail</div>
                <div class="area__text">${infoGuest.email}</div>
              </div>
            </div>
            ${residence}
            ${transfer}
            ${meet}
            ${tickets}
          </div>
        `;

        this.modalView.querySelector('.popup__body').innerHTML = templateFull;

        DisplayElement.hide(this.modalView.querySelector('.preloader'));
        DisplayElement.show(this.modalView.querySelector('.popup__body'));
      } catch (e) {
        console.log(e);
        alert(`Ошибка загрузки информации о госте.\n${e}`);
      }

    }
    _toggleAllCheckbox() {
      const mainChecked = this.elements.mainCheckbox.checked;
      this.elements.allCheckbox.forEach(checkbox => checkbox.checked = mainChecked);
    }
    _toggleMainCheckbox() {
      /** Проверяем есть ли невыбранные чекбоксы */
      for (let i = 0; i < this.elements.allCheckbox.length; i++) {
        if (!this.elements.allCheckbox[i].checked) {
          this.elements.mainCheckbox.checked = false;
          return;
        }
      }

      this.elements.mainCheckbox.checked = true;
    }
    _returnModal(modal) {
      const btnClose = event.target.closest('.js-close-modal');
      if (!btnClose) return;

      DisplayElement.show(modal.querySelector('.preloader'));
      DisplayElement.hide(modal.querySelector('.popup__body'));
    }
    _delLastGuestOnPage() {
      const children = this.wraps.list.children;

      /** Генерируем событие, для перерендера пагинации */
      const eventPagination = new Event('pagination', {bubbles: true});
      children[children.length - 1].dispatchEvent(eventPagination);

      /** Удаляем элемент */
      children[children.length - 1].remove();
    }
  }

  class GuestListForm {
    arrEvents = [];
    modalEdit = document.querySelector('#edit-info-guest');

    /** id редактируемого гостя */
    editId;

    constructor(data) {
      this.form = data.form;
      this.elements = this._getElements();
      this.wraps = this._getWraps();
      this.areas = this._getAreas();
      this.selects = this._getSelects();
      this.selectBox = this.form.querySelectorAll('.append-select-box2');
      this.allSelectBox = document.querySelectorAll('.append-select-box2');

      /** Биндим события */
      this._bind();

      /** .добавляем валидацию на поля */
      this._setValidateAreas();
    }

    update() {
      /** Удаляем старые события */
      ManagementEvents.removeEvents(this.arrEvents);

      /** Заново находим элементы */
      this.elements = this._getElements();

      /** Заново находим обертки */
      this.wraps = this._getWraps();

      /** Заново находим поля */
      this.areas = this._getAreas();

      /** Заново находим выпадающие списки */
      this.selects = this._getSelects();

      /** Оживляем выпадающие списки */
      this._updateSelects();

      /** Оживляем добавление новых категорий */
      this._updateSelectBoxBtn();

      /** Оживляем добавление даты */
      this._updateDateTimes();

      /** Биндим события */
      this._bind();

      /** Оживляем кнопки закрытия попапа */
      this._updateBtnCloseModal();

      /** Возвращаем валидацию */
      this._setValidateAreas();
    }
    getInfoForm() {
      if (!this.validate()) return;

      const obj = {
        project: projectId,
        category: this.selects.category.value.trim() === '' ? '' : +this.selects.category.value.trim(),
        name: this.areas.name.value,
        type: this.form.querySelector('[data-id=type]').value.trim() === '' ? '' : +this.form.querySelector('[data-id=type]').value.trim(),
        phone: this.areas.phone.value,
        email: this.areas.email.value,
        require: {},
        entity: {}
      };

      /**
       * Проверяем:
       * выбран ли чекбокс
       * отмечен ли раздел как выполненный
       */
      if (this.elements.checkboxResidence.checked) {
        const check = this.wraps.residence.querySelector('[data-guest-status]');
        if (!check || check.dataset.guestStatus === 'false') {
          obj.require.accommodation = 5;

          const people = this.wraps.guestsInGroup.querySelectorAll('.form-block_color-line');
          const peopleInfo = [...people].map(person => {
            const cell = person.querySelectorAll('.form-block__cell');
            if (!cell) return;

            return {
              name: cell[0].textContent,
              age: cell[1].textContent === 'Взрослый' ? 2 : 1
            }
          });

          obj.entity.accommodation = peopleInfo;
        } else {
          obj.entity.accommodation = [];
          obj.require.accommodation = 0;
        }
      } else {
        obj.entity.accommodation = [];
        obj.require.accommodation = 0;
      }
      if (this.elements.checkboxTransfer.checked) {
        const check = this.wraps.transfer.querySelector('[data-guest-status]');
        if (!check || check.dataset.guestStatus === 'false') {
          obj.require.transfer = 5;

          const stopsArr = this.wraps.transfer.querySelectorAll('[data-id=transfer-stop]');
          const stops = [...stopsArr].map(stop => {
            return {address: stop.value}
          });

          const dataObj = {
            from: this.areas.transferFrom.value,
            to: this.areas.transferTo.value,
            amount: this.areas.transferAmount.value,
            stops
          };

          /** Проверяем нет ли пустых значений */
          const emptyArea = Object.keys(dataObj).some(key => dataObj[key] === '');
          if (emptyArea) {
            alert('Заполните все поля раздела "Нужен трансфер"!');
            return;
          }

          obj.entity.transfer = [dataObj];
        } else {
          obj.entity.transfer = [];
          obj.require.transfer = 0;
        }
      } else {
        obj.entity.transfer = [];
        obj.require.transfer = 0;
      }
      if (this.elements.checkboxMeet.checked) {
        const check = this.wraps.meet.querySelector('[data-guest-status]');
        if (!check || check.dataset.guestStatus === 'false') {
          obj.require.meet = 5;

          const timeValue = this.wraps.meet.querySelector('[data-id=meet-time]').value;
          let time;
          if (timeValue) {
            const timeArr = timeValue.split(':');
            time = +timeArr[0] * 60 * 60 + +timeArr[1] * 60;
          }

          const dateValue = this.wraps.meet.querySelector('[data-id=meet-date]').value;
          let date;
          if (dateValue) {
            const dateStr = dateValue.split('.').reverse().join('-');
            date = new Date(`${dateStr}T00:00`).getTime() / 1000;
          }

          const dataObj = {
            date,
            time,
            address: this.wraps.meet.querySelector('[data-id=meet-address]').value
          };

          /** Проверяем нет ли пустых значений */
          const emptyArea = Object.keys(dataObj).some(key => dataObj[key] === '');
          if (emptyArea) {
            alert('Заполните все поля раздела "Нужно встретить"!');
            return;
          }

          obj.entity.meet = [dataObj];
        } else {
          obj.entity.meet = [];
          obj.require.meet = 0;
        }
      } else {
        obj.entity.meet = [];
        obj.require.meet = 0;
      }
      if (this.elements.checkboxTickets.checked) {
        const check = this.wraps.tickets.querySelector('[data-guest-status]');
        if (!check || check.dataset.guestStatus === 'false') {
          obj.require.ticket = 5;
          const flights = this.wraps.flight.querySelectorAll('.form-block_color-line');

          const flightInfo = [...flights].map(flight => {
            const cell = flight.querySelectorAll('.form-block__cell');
            if (!cell) return;

            const dateValue = cell[1].textContent;
            let date;
            if (dateValue) {
              const dateStr = dateValue.split('.').reverse().join('-');
              date = new Date(`${dateStr}T00:00`).getTime() / 1000;
            }

            return {
              from: cell[0].textContent.split(' - ')[0],
              to: cell[0].textContent.split(' - ')[1],
              date
            }
          });

          obj.entity.ticket = flightInfo;
        } else {
          obj.entity.ticket = [];
          obj.require.ticket = 0;
        }
      } else {
        obj.entity.ticket = [];
        obj.require.ticket = 0;
      }

      $.magnificPopup.close();
      return obj
    }
    clearForm() {
      /** Очистка полей */
      Object.keys(this.areas).forEach(key => this.areas[key].value = '');

      /** Возвращаем select в исходное состояние */
      $(this.selects.category).val(' ').trigger('change');
      $(this.selects.type).val('').trigger('change');

      /** Удаление людей */
      this.wraps.guestsInGroup.indexHTML = '';
      DisplayElement.hide(this.wraps.guestsInGroup);

      /** Удаление билетов */
      this.wraps.flight.indexHTML = '';
      DisplayElement.hide(this.wraps.flight);

      /** Удаление заездов */
      const arrAddress = this.wraps.transfer.querySelectorAll('.form-block_transfer');
      for (let i = 1; i < arrAddress.length; i++) {
        arrAddress[i].remove();
      }

      /** Снимаем чекбоксы и скрываем соответсвующие разделы */
      this.elements.checkboxResidence.checked = false;
      DisplayElement.hide(this.wraps.residence);
      this.elements.checkboxTransfer.checked = false;
      DisplayElement.hide(this.wraps.transfer);
      this.elements.checkboxMeet.checked = false;
      DisplayElement.hide(this.wraps.meet);
      this.elements.checkboxTickets.checked = false;
      DisplayElement.hide(this.wraps.tickets);

      return true;
    }
    validate() {
      const arrChecks = [
        Validation.check(this.areas.phone, 'number'),
        Validation.check(this.areas.email, 'email')
      ];

      for (let i = 0; i < arrChecks.length; i++) {
        if (!arrChecks[i]) return false
      }

      return true;
    }
    async getCategories() {
      try {
        const result = await Fetch.get(`${domain}/api/project-guest/get-categories?token=${localStorage.getItem('token')}&project=${projectId}`);
        return result.data;
      } catch (e) {
        console.log(e);
        alert(`Ошибка получения категорий гостей.\n${e}`);
        return [];
      }
    }
    async getTypes() {
      try {
        const result = await Fetch.get(`${domain}/api/project-guest/get-types?token=${localStorage.getItem('token')}&project=${projectId}`);
        return result.data;
      } catch (e) {
        console.log(e);
        alert(`Ошибка получения типов гостей.\n${e}`);
        return [];
      }
    }
    renderCategories(arrCategories) {
      const templateOptionsCategories = arrCategories.map(category => `<option value="${category.id}">${category.label}</option>`).join('');
      const templateCategories = `
      <div class="form__field append-select-box__col append-select-box__col_new">
        <select class="form__select" data-id="category">
          <option value=" " selected>Не выбрано</option>
          ${templateOptionsCategories}
        </select>
      </div>
      <div class="form__field append-select-box__col append-select-box__col_new">
        <div class="new-item">
          <input class="new-item__input append-select-box__input" type="text" placeholder="Добавьте категорию">
          <button class="new-item__icon append-select-box__button" type="button"></button>
        </div>
      </div>
    `;

      this.selects.category.parentElement.parentElement.innerHTML = templateCategories;
    }
    renderTypes(objTypes) {
      const templateOptionsTypes = Object.keys(objTypes).map(key => `<option value="${key}">${objTypes[key]}</option>`).join('');
      const templateTypes = `
      <div class="area__title">Тип гостя</div>
      <select class="form__select selectpicker" data-id="type">
        <option value="" selected>Не выбрано</option>
        ${templateOptionsTypes}
      </select>
    `;

      this.selects.type.parentElement.innerHTML = templateTypes;
    }
    async changeInfoInModalEdit(event) {
      /** Проверяем что клик был по кнопке редактирования */
      const btnEdit = event.target.closest('.icon-edit');
      if (!btnEdit) return;

      /** Запрашиваем инфу с сервера */
      const line = event.target.closest('.list-guests__row');
      this.editId = line.dataset.guestId;

      try {
        const infoGuestResult = await Fetch.get(`${domain}/api/project-guest/get?token=${localStorage.getItem('token')}&project=${projectId}&guest=${this.editId}`);
        const infoGuest = infoGuestResult.data;

        if (!infoGuest.category) infoGuest.category = {id: 0};
        if (!infoGuest.type.code) infoGuest.type.label = 'Не выбрано';


        /** Убираем все чекбоксы */
        this.elements.checkboxResidence.checked = false;
        this.elements.checkboxTransfer.checked = false;
        this.elements.checkboxMeet.checked = false;
        this.elements.checkboxTickets.checked = false;

        /** Скрываем все разделы */
        DisplayElement.hide(this.wraps.residence);
        DisplayElement.hide(this.wraps.transfer);
        DisplayElement.hide(this.wraps.meet);
        DisplayElement.hide(this.wraps.tickets);
        DisplayElement.hide(this.wraps.flight);
        DisplayElement.hide(this.wraps.guestsInGroup);

        /** Меняем значения в полях, отображая нужные разделы */
        this.areas.name.value = infoGuest.name;
        this.areas.phone.value = infoGuest.phone;
        this.areas.email.value = infoGuest.email;
        if (infoGuest.entity.transfer.length) {
          this.elements.checkboxTransfer.checked = true;
          DisplayElement.show(this.wraps.transfer);

          this.areas.transferFrom.value = infoGuest.entity.transfer[0].from;
          this.areas.transferTo.value = infoGuest.entity.transfer[0].to;
          this.areas.transferAmount.value = infoGuest.entity.transfer[0].amount;

          /** Формируем список заездов */
          if (infoGuest.entity.transfer[0].stops.length) {
            const transferStops = infoGuest.entity.transfer[0].stops.map(stop => `
            <div class="form-block_transfer">
              <div class="area">
                <div class="area__title">Заехать</div>
                <input class="area__input" type="text" placeholder="Россия, Москва, Кригоровский переулок, д.7" data-id="transfer-stop" value="${stop.address}">
              </div>
              <div class="area">
                <a class="tooltip icon-delete icon tooltipstered mt30" href="#"></a>
              </div>
            </div>
          `).join('');

            this.wraps.addressStops.innerHTML = transferStops;
          }
        }
        if (infoGuest.entity.meet.length) {
          this.elements.checkboxMeet.checked = true;
          DisplayElement.show(this.wraps.meet);

          this.areas.meetDate.value = new Date(infoGuest.entity.meet[0].date * 1000).format('dd.mm.yyyy');
          this.areas.meetTime.value = new Date(infoGuest.entity.meet[0].time * 1000 + infoGuest.entity.meet[0].date * 1000).format('hh:MM');
          this.areas.meetAddress.value = infoGuest.entity.meet[0].address;
        }

        /** Добавляем информацию в блоки-обертки */
        if (infoGuest.entity.ticket.length) {
          this.elements.checkboxTickets.checked = true;
          DisplayElement.show(this.wraps.tickets);
          DisplayElement.show(this.wraps.flight);

          /** Формируем список билетов */
          const tickets = infoGuest.entity.ticket.map(ticket => `
          <div class="form-block_color-line">
            <div class="form-block__cell">${ticket.from} - ${ticket.to}</div>
            <div class="form-block__cell">${new Date(ticket.date * 1000).format('dd.mm.yyyy')}</div>
            <a class="tooltip icon-delete icon tooltipstered" href="#"></a>
          </div>
        `).join('');

          this.wraps.flight.innerHTML = tickets;
        }
        if (infoGuest.entity.accommodation.length) {
          this.elements.checkboxResidence.checked = true;
          DisplayElement.show(this.wraps.residence);
          DisplayElement.show(this.wraps.guestsInGroup);

          /** Формируем список сопровождающих лиц */
          const people = infoGuest.entity.accommodation.map(person => `
          <div class="form-block_color-line">
            <div class="form-block__cell">${person.name}</div>
            <div class="form-block__cell">${person.age.label}</div>
            <a class="tooltip icon-delete icon tooltipstered" href="#"></a>
          </div>
        `).join('');

          this.wraps.guestsInGroup.innerHTML = people;
        }

        /** Меняем значения selects */
        infoGuest.category.id === 0
          ? $(this.selects.category).val(' ').trigger('change')
          : $(this.selects.category).val(infoGuest.category.id).trigger('change');
        infoGuest.type.code === 0
          ? $(this.selects.type).val('').trigger('change')
          : $(this.selects.type).val(infoGuest.type.code).trigger('change');


        /** Показываем контент */
        DisplayElement.hide(this.modalEdit.querySelector('.preloader'));
        DisplayElement.show(this.modalEdit.querySelector('.popup__body'));
      } catch (e) {
        console.log(e);
        alert(`Ошибка загрузки информации о госте.\n${e}`);
      }

    }
    async editGuest() {
      const obj = this.getInfoForm();
      if (!obj) return;

      obj.guest = this.editId;

      try {
        const result = await Fetch.post(`${domain}/api/project-guest/update?token=${localStorage.getItem('token')}`, obj);
        return result.data;
      } catch (e) {
        console.log(e);
        alert(`Ошибка редактирования информации о госте.\n${e}`);
        return false;
      }
    }
    async createGuestCategory(obj) {
      try {
        const result = await Fetch.post(`${domain}/api/project-guest/category-create?token=${localStorage.getItem('token')}`, obj);
        return result.data;
      } catch (e) {
        console.log(e);
        alert(`Ошибка создания категории.\n${e}`);
        return false;
      }
    }

    /**
     * @private
     */
    _bind() {
      /** Показывать/скрывать раздел проживание */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.checkboxResidence,
        event: 'change',
        fn: () => this._displayResidencePart(event, this.wraps.residence)
      });

      /** Показывать/скрывать раздел трансфер */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.checkboxTransfer,
        event: 'change',
        fn: () => this._displayResidencePart(event, this.wraps.transfer)
      });

      /** Показывать/скрывать раздел встреча */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.checkboxMeet,
        event: 'change',
        fn: () => this._displayResidencePart(event, this.wraps.meet)
      });

      /** Показывать/скрывать раздел билеты */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.checkboxTickets,
        event: 'change',
        fn: () => this._displayResidencePart(event, this.wraps.tickets)
      });

      /** Добавить билет */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.btnAddTicket,
        event: 'click',
        fn: () => this._addTicket()
      });

      /** Удалить билет */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.tickets,
        event: 'click',
        fn: () => this._delTicket(event)
      });

      /** Добавить гостя в группу гостей */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.btnAddGuestInGroup,
        event: 'click',
        fn: () => this._addGuestInGroup()
      });

      /** Удалить гостя из группы гостей */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.residence,
        event: 'click',
        fn: () => this._delGuestInGroup(event)
      });

      /** Добавить адрес */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.elements.btnAddress,
        event: 'click',
        fn: () => this._addAddress()
      });

      /** Удалить адрес */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.address.parentElement,
        event: 'click',
        fn: () => this._delAddress(event)
      });

      /** Изменить состояние готовности раздела */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.residence,
        event: 'click',
        fn: () => this._toggleReadinessSection(event)
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.transfer,
        event: 'click',
        fn: () => this._toggleReadinessSection(event)
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.meet,
        event: 'click',
        fn: () => this._toggleReadinessSection(event)
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.wraps.tickets,
        event: 'click',
        fn: () => this._toggleReadinessSection(event)
      });

      /** При закрытии модалки вернуть прелоадер и скрыть контент */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el:  this.modalEdit,
        event: 'click',
        fn: () => this._returnModal(this.modalEdit)
      });
    }
    _getElements() {
      return {
        checkboxResidence: this.form.querySelector('[data-guest-btn=residence]'),
        checkboxTransfer: this.form.querySelector('[data-guest-btn=transfer]'),
        checkboxMeet: this.form.querySelector('[data-guest-btn=meet]'),
        checkboxTickets: this.form.querySelector('[data-guest-btn=tickets]'),
        btnAddTicket: this.form.querySelector('[data-guest-btn=add-tickets]'),
        btnAddGuestInGroup: this.form.querySelector('[data-guest-btn=add-guest-in-group]'),
        btnAddress: this.form.querySelector('[data-guest-btn=add-address]'),
        btnAddGuest: this.form.querySelector('[data-guest-btn=add-guest]'),
        btnCreateGuestCategory: this.form.querySelector('[data-guest-btn=create-guest-category]'),
        btnEditGuest: this.form.querySelector('[data-guest-btn=edit-guest]')
      };
    }
    _getWraps() {
      return {
        residence: this.form.querySelector('[data-guest-wrap=residence]'),
        transfer: this.form.querySelector('[data-guest-wrap=transfer]'),
        meet: this.form.querySelector('[data-guest-wrap=meet]'),
        tickets: this.form.querySelector('[data-guest-wrap=tickets]'),
        flight: this.form.querySelector('[data-guest-wrap=flight]'),
        guestsInGroup: this.form.querySelector('[data-guest-wrap=guests-in-group]'),
        address: this.form.querySelector('[data-guest-wrap=address]'),
        addressStops: this.form.querySelector('[data-guest-wrap=address-stops]')
      };
    }
    _getAreas() {
      return {
        name: this.form.querySelector('[data-id=name]'),
        phone: this.form.querySelector('[data-id=phone]'),
        email: this.form.querySelector('[data-id=email]'),
        person: this.form.querySelector('[data-id=guest-in-group-name-person]'),
        transferFrom: this.form.querySelector('[data-id=transfer-from]'),
        transferTo: this.form.querySelector('[data-id=transfer-to]'),
        transferAmount: this.form.querySelector('[data-id=transfer-num-person]'),
        meetDate: this.form.querySelector('[data-id=meet-date]'),
        meetTime: this.form.querySelector('[data-id=meet-time]'),
        meetAddress: this.form.querySelector('[data-id=meet-address]'),
        ticketsFrom: this.form.querySelector('[data-id=tickets-from]'),
        ticketsTo: this.form.querySelector('[data-id=tickets-to]'),
        ticketsDate: this.form.querySelector('[data-id=tickets-date]')
      }
    }
    _getSelects() {
      return {
        category: this.form.querySelector('[data-id=category]'),
        type: this.form.querySelector('[data-id=type]'),
        guestInGroupAge: this.form.querySelector('[data-id=guest-in-group-age]')
      }
    }
    _displayResidencePart(event, el) {
      const checkboxBoolean = event.target.checked;
      checkboxBoolean ? DisplayElement.show(el) : DisplayElement.hide(el)
    }
    _checkAreas(...areas) {
      for (let i = 0; i < areas.length; i++) {
        if (!areas[i].value.length) return false;
      }

      return true;
    }
    _addTicket() {
      const areas = [this.areas.ticketsFrom, this.areas.ticketsTo, this.areas.ticketsDate];

      /** Если поля не заполнены - прерываем функцию */
      if (!this._checkAreas(...areas)) {
        alert('Заполните все поля раздела "Нужны билеты"');
        return;
      }

      const info = {
        from: this.areas.ticketsFrom.value,
        to: this.areas.ticketsTo.value,
        date: this.areas.ticketsDate.value
      };

      const template = `
      <div class="form-block_color-line">
        <div class="form-block__cell">${info.from} - ${info.to}</div>
        <div class="form-block__cell">${info.date}</div><a class="tooltip icon-delete icon tooltipstered" href="#"></a>
      </div>
    `;

      this.wraps.flight.insertAdjacentHTML('afterbegin', template);
      DisplayElement.show(this.wraps.flight);

      /** Очищаем поля формы */
      areas.forEach(area => area.value = '');
    }
    _delTicket(event) {
      const btnDel = event.target.closest('.icon-delete');
      if (!btnDel) return;

      event.preventDefault();
      const parentWrap = event.target.closest('.form-block_color-line').parentElement;

      event.target.closest('.form-block_color-line').remove();
      if (!parentWrap.children.length) DisplayElement.hide(parentWrap);
    }
    _addGuestInGroup() {
      /** Если поля не заполнены - прерываем функцию */
      if (!this._checkAreas(this.areas.person)) {
        alert('Заполните все поля раздела "Нужно проживание"');
        return;
      }

      const info = {
        namePerson: this.areas.person.value,
        age: this.selects.guestInGroupAge.value
      };

      const template = `
      <div class="form-block_color-line">
        <div class="form-block__cell">${info.namePerson}</div>
        <div class="form-block__cell">${info.age}</div><a class="tooltip icon-delete icon tooltipstered" href="#"></a>
      </div>
    `;

      this.wraps.guestsInGroup.insertAdjacentHTML('afterbegin', template);
      DisplayElement.show(this.wraps.guestsInGroup);

      /** Очищаем поля формы */
      this.areas.person.value = '';
      $(this.selects.guestInGroupAge).val('Взрослый').trigger('change');
    }
    _delGuestInGroup(event) {
      const btnDel = event.target.closest('.icon-delete');
      if (!btnDel) return;

      event.preventDefault();
      const parentWrap = event.target.closest('.form-block_color-line').parentElement;

      event.target.closest('.form-block_color-line').remove();
      if (!parentWrap.children.length) DisplayElement.hide(parentWrap);
    }
    _addAddress() {
      const template = `
      <div class="form-block_transfer">
        <div class="area">
          <div class="area__title">Заехать</div>
          <input class="area__input" type="text" placeholder="Россия, Москва, Кригоровский переулок, д.7" data-id="transfer-stop">
        </div>
        <div class="area">
          <a class="tooltip icon-delete icon tooltipstered mt30" href="#"></a>
        </div>
      </div>
    `;

      this.wraps.addressStops.insertAdjacentHTML('beforeend', template);
    }
    _delAddress(event) {
      event.preventDefault();

      const btnDel = event.target.closest('.icon-delete');
      if (!!btnDel) {
        event.target.closest('.form-block_transfer').remove();
      }
    }
    _toggleReadinessSection(event) {
      const box = event.target.closest('.form-block__icon-status');
      if (!box) return;

      const status = box.dataset.guestStatus;
      box.dataset.guestStatus = `${status === 'false'}`;
    }
    _updateBtnCloseModal() {
      $('.js-close-modal').on('click', function (e) {
        e.preventDefault();
        $.magnificPopup.close();
      });
    }
    _updateSelects() {
      $('.selectpicker').select2({
        width: '100%',
        minimumResultsForSearch: 20,
      });
    }
    _setValidateAreas() {
      $(this.areas.phone).mask('+7 (999) 999-9999');
    }
    _returnModal(modal) {
      const btnClose = event.target.closest('.js-close-modal');
      if (!btnClose) return;

      DisplayElement.show(modal.querySelector('.preloader'));
      DisplayElement.hide(modal.querySelector('.popup__body'));
    }
    _updateDateTimes() {
      $('.date-picker').datetimepicker({
        format: 'd.m.Y',
        timepicker: false,

        onSelectDate(date, input) {
          const ctx = input[0].closest('.form__field-icon');
          const block = ctx.querySelector('.form__icon-box');
          block.style.display = "none";
        }
      });

      $('.time-picker').datetimepicker({
        format: 'H:i',
        datepicker: false,
        step: 15
      });
    }
    _updateSelectBoxBtn() {
      this.selectBox.forEach(box => {
        const select = box.querySelector('select');
        const input = box.querySelector('.append-select-box__input');
        const button = box.querySelector('.append-select-box__button');

        const placeholder = select.getAttribute('placeholder');

        $(select).select2({
          width: '100%',
          minimumResultsForSearch: 20,
          placeholder: placeholder ? placeholder : ' '
        });

        /** Проверяем есть ли такое событие на этом элементе */
        const indexEvent = this.arrEvents.findIndex(obj => obj.el === button);
        if (indexEvent === -1) {
          ManagementEvents.addEventToArr({
            arr: this.arrEvents,
            el:  button,
            event: 'click',
            fn: async () => {
              const newStateVal = input.value;

              /** Отправляем категорию на сервер */
              const obj = {
                project: projectId,
                name: newStateVal
              };
              const result = await this.createGuestCategory(obj);
              input.value = '';
              if (!result) return;

              /** После ответа сервера формируем категорию */
              this.allSelectBox.forEach(el => {
                const select = el.querySelector('select');

                const newState = new Option(result.label, result.id, true, true);
                $(select).append(newState).trigger('change');
              });

              const newStateFilter = new Option(result.label, result.id, false, false);
              $('[data-id=filter-category]').append(newStateFilter);
            }
          });
        }
      });
    }
  }

  class GuestListFilters {
    filtersWrap = document.querySelector('[data-guest-filters]');
    filters = this._getFilters();
    btns = {
      sendEmail: this.filtersWrap.querySelector('[data-guest-btn=send-email]'),
      sendSms: this.filtersWrap.querySelector('[data-guest-btn=send-sms]'),
      orderResidence: this.filtersWrap.querySelector('[data-guest-btn=order-residence]'),
      orderTransfer: this.filtersWrap.querySelector('[data-guest-btn=order-transfer]')
    };

    /** Массив событий */
    arrEvents = [];

    filterStatus = '';
    filterCategory = '';
    filterType = '';

    emailInvitation = false;
    smsInvitation = false;

    constructor() {
      /** Биндим события */
      this._bind();
    }

    getFiltersObj() {
      const obj = {};

      if (this.filterStatus !== '') {
        obj.require = {};

        switch (this.filterStatus) {
          case 'residence-true':
            obj.require.accommodation = 5;
            break;
          case 'residence-false':
            obj.require.accommodation = 0;
            break;
          case 'transfer-true':
            obj.require.transfer = 5;
            break;
          case 'transfer-false':
            obj.require.transfer = 0;
            break;
          case 'meet-true':
            obj.require.meet = 5;
            break;
          case 'meet-false':
            obj.require.meet = 0;
            break;
          case 'tickets-true':
            obj.require.ticket = 5;
            break;
          case 'tickets-false':
            obj.require.ticket = 0;
            break;
          case 'email-false':
            delete obj.require;
            break;
          case 'email-true':
            delete obj.require;
            break;
          case 'sms-false':
            delete obj.require;
            break;
          case 'sms-true':
            delete obj.require;
            break;
        }
      }
      if (this.filterCategory !== '') obj.category = this.filterCategory;
      if (this.filterType !== '') obj.type = this.filterType;

      return obj;
    }
    renderCategories(arrCategories) {
      const templateOptionsCategories = arrCategories.map(category => `<option value="${category.id}">${category.label}</option>`).join('');
      const templateCategories = `
      <div class="area__title">Категория гостя</div>
      <select class="form__select selectpicker" data-id="filter-category">
        <option value="" selected>Не выбрано</option>
        ${templateOptionsCategories}
      </select>
    `;

      this.filters.category.parentElement.innerHTML = templateCategories;
    }
    renderTypes(objTypes) {
      const templateOptionsTypes = Object.keys(objTypes).map(key => `<option value="${key}">${objTypes[key]}</option>`).join('');
      const templateTypes = `
      <div class="area__title">Тип гостя</div>
      <select class="form__select selectpicker" data-id="filter-type">
        <option value="" selected>Не выбрано</option>
        ${templateOptionsTypes}
      </select>
    `;

      this.filters.type.parentElement.innerHTML = templateTypes;
    }
    update() {
      this.filters = this._getFilters();
    }

    /**
     * @private
     */
    _bind() {
      /** Меняем кнопки в зависимости от значения выпадающего списка */
      $(this.filters.status).on('change', async event => this._changeBtn(event.target.value));

      /** Показать модалку при нажатии на кнопку около фильтров если никто не выбран */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.btns.sendEmail,
        event: 'click',
        fn: (event) => {
          if (!this._checkSelectPerson(event)) return;
          this._goToInv(event, this.emailInvitation);
        }
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.btns.sendSms,
        event: 'click',
        fn: (event) => {
          if (!this._checkSelectPerson(event)) return;
          this._goToInv(event, this.smsInvitation);
        }
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.btns.orderResidence,
        event: 'click',
        fn: (event) => {
          if (!this._checkSelectPerson(event)) {
            return;
          }
          // тут будет логика по заказу проживания
        }
      });
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.btns.orderTransfer,
        event: 'click',
        fn: (event) => {
          if (!this._checkSelectPerson(event)) {
            return;
          }
          // тут будет логика по заказу трансфера
        }
      });
    }
    _getFilters() {
      return {
        status: this.filtersWrap.querySelector('[data-id=filter-status]'),
        category: this.filtersWrap.querySelector('[data-id=filter-category]'),
        type: this.filtersWrap.querySelector('[data-id=filter-type]')
      }
    }
    async _changeBtn(value) {
      /** Скрываем все кнопки */
      Object.keys(this.btns).forEach(key => DisplayElement.hide(this.btns[key]));

      let arrInv = [];
      /** Показываем кнопку, если значение соответсвует */
      switch (value) {
        case 'residence-true':
          DisplayElement.show(this.btns.orderResidence);
          break;
        case 'transfer-true':
          DisplayElement.show(this.btns.orderTransfer);
          break;
        case 'email-true':
          DisplayElement.show(this.btns.sendEmail);

          /** Получаем список приглашений и рендерим его */
          arrInv = await invitations.getInvitations();
          if (arrInv.length) {
            this.emailInvitation = arrInv.some(obj => obj.type.code === 'email');
            invitations.render('email');
          }
          break;
        case 'sms-true':
          DisplayElement.show(this.btns.sendSms);

          /** Получаем список приглашений и рендерим его */
          arrInv = await invitations.getInvitations();
          if (arrInv.length) {
            this.smsInvitation = arrInv.some(obj => obj.type.code === 'sms');
            invitations.render('sms');
          }
          break;
      }
    }
    _goToInv(event, type) {
      event.preventDefault();

      if (!type) {
        openModal('#not-inv', false);
        setTimeout(function() {
          $.magnificPopup.close();
        }, 2000);

        return;
      }

      /** Записываем инфу о выбранных чекбоксах в localStorage */
      const allCheckbox = document.querySelectorAll('.list-guests__wrap input[type=checkbox]');
      const arrIdCheckGuest = [];
      for (let i = 0; i < allCheckbox.length; i++) {
        if (allCheckbox[i].checked) {
          arrIdCheckGuest.push(+allCheckbox[i].closest('[data-guest-id]').dataset.guestId);
        }
      }
      localStorage.setItem('arrIdCheckGuest', JSON.stringify(arrIdCheckGuest));

      /** Переключаем вкладку */
      tabsMyGuests.openTab('3');
    }
    _checkSelectPerson(event) {
      const allCheckbox = document.querySelectorAll('.list-guests__wrap input[type=checkbox]');

      /** Проверяем есть ли выбранные чекбоксы */
      let check = false;
      for (let i = 0; i < allCheckbox.length; i++) {
        if (allCheckbox[i].checked) {
          check = true;
          break;
        }
      }

      if (!check) {
        event.preventDefault();
        openModal('#not-guest', false);

        setTimeout(function() {
          $.magnificPopup.close();
        }, 2000)
      }

      return check;
    }
  }

  class Invitations {
    listInvitations;
    wrapInv = document.querySelector('[data-tab="3"] .row');
    delInvId;
    arrEvents = [];

    constructor() {
      /** Получаем и рендерим все шаблоны рассылок */
      this.getInvitations().then(() => this.render('all'));

      /** Биндим события */
      this._bind();
    }

    async getInvitations() {
      try {
        const arrInvResult = await Fetch.get(`${domain}/api/project-guest-invite/page?token=${localStorage.getItem('token')}&project=${projectId}`);
        this.listInvitations = arrInvResult.data;
      } catch (e) {
        console.log(e);
        alert(`Ошибка загрузки информации о шаблонах приглашений.\n${e}`);
        this.listInvitations = [];
      }

      return this.listInvitations;
    }
    /**
     * 'all', 'sms', 'email'
     * @param typeInv
     */
    render(typeInv) {
      const templateInv = this.listInvitations.map(inv => {
        if (inv.type.code !== typeInv && typeInv !== 'all') return '';

        const {id, type, title, linkToEditPage} = inv;

        return `
          <div class="col-lg-4 col-sm-6">
            <div class="preview-item preview-item_offer" data-id="${id}">
              <div class="preview-item__top">
                <div class="preview-item__title preview-item__title_action">
                  <a class="td-n" href="${linkToEditPage}">
                    ${title}
                  </a>
                </div>
                <div class="preview-item__actions">
                  <a class="tooltip icon-edit icon tooltipstered mr5" href="${linkToEditPage}"></a>
                  <div class="tooltip icon-delete icon js-open-modal tooltipstered" data-href="#delete-template"></div>
                </div>
              </div>
              <a class="preview-item__link" href="${linkToEditPage}">
                <div class="preview-item__img-box">
                  <img class="preview-item__img preview-item__img_no-full" src="./images/icons/letter-template.svg">
                </div>
              </a>
              <div class="preview-item__text-box preview-item__text-box_big-button">
                <a class="preview-item__other td-n" href="${linkToEditPage}">
                  <div class="preview-item__text mb0">${type.code === 'email' ? 'Email' : 'SMS'} - шаблон</div>
                  <div class="preview-item__square button button-arrow-dark-square"><span>Выбрать</span></div>
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      this.wrapInv.innerHTML = templateInv;
    }
    async del() {
      try {
        await Fetch.delete(`${domain}/api/project-guest-invite/delete?token=${localStorage.getItem('token')}&project=${projectId}&template=${this.delInvId}`);
        this._delCardInv();
        return true;
      } catch (e) {
        console.log(e);
        alert(`Ошибка удаления шаблона приглашения.\n${e}`);
        return false;
      }
    }

    /**
     * @private
     */
    _bind() {
      /** Добавляем id удаляемой карточки */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.wrapInv,
        event: 'click',
        fn: async event => {
          if (!event.target.closest('.icon-delete')) return;
          this.delInvId = event.target.closest('[data-id]').dataset.id;
        }
      });

      /** Удаляем шаблон */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: document.querySelector('[data-guest-btn="del-inv"]'),
        event: 'click',
        fn: async () => await this.del()
      });

      /** Записать id щаблона в localStorage */
      ManagementEvents.addEventToArr({
        arr: this.arrEvents,
        el: this.wrapInv,
        event: 'click',
        fn: event => {
          if (event.target.closest('[data-id]')) {
            localStorage.setItem('templateInvId', event.target.closest('[data-id]').dataset.id)
          }
        }
      });
    }
    _delCardInv() {
      this.wrapInv.querySelector(`[data-id="${this.delInvId}"]`).remove();
    }
  }






  /** Переключение вкладок */
  const tabsMyGuests = new BtnActive({
    btnWrap:document.querySelector('.tabs-new__links'),
    tabWrap: document.querySelector('.tabs-new__wraps'),
    tabActiveClass: 'active',
    btnClick: '[data-tab-value]',
    dataTab: 'data-tab'
  });

  /** Прелоадер и контент*/
  const preloader = document.querySelector('.preloader');
  const content = document.querySelector('[data-tab="1"] .content-wrap');

  /** Инициализация списка гостей */
  const guestList = new GuestList();

  /** Инициализация пагинации в списке гостей */
  const pagination = new Pagination('.pagination');

  /** Инициализация фильтров в списке гостей */
  const guestListFilters = new GuestListFilters({});

  /** Инициализация списка приглашений */
  const invitations = new Invitations();

  const guestListForms = document.querySelectorAll('[data-guest-form]');
  /** Инициализация формы добавления гостей */
  const guestListFormPage = new GuestListForm({form: guestListForms[0]});
  /** Инициализация формы добавления гостей в модалке */
  const guestListFormModal = new GuestListForm({form: guestListForms[1]});

  /** Подгружаем все нужные данные с сервера */
  const promises = await Promise.all([
    guestList.getQuantityPages(),
    guestListFormPage.getCategories(),
    guestListFormPage.getTypes()
  ]);
  const [quantityPages, arrCategories, objTypes] = promises;

  /** Рендерим пагинацию */
  pagination.render(quantityPages, guestList.page);

  /** Добавляем инфу о числе страниц в объект списка */
  guestList.allPages = quantityPages;

  /** Ловим событие удаления последнего элемента на странице, для перерендера пагинации */
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'pagination',
    fn: async () => {
      const quantityPages = await guestList.getQuantityPages();
      pagination.render(quantityPages, guestList.page);
    }
  });

  /**
   * Рендерим категории
   */
  guestListFormPage.renderCategories(arrCategories);
  guestListFormModal.renderCategories(arrCategories);
  guestListFilters.renderCategories(arrCategories);

  /**
   * Рендерим типы гостей
   */
  guestListFormPage.renderTypes(objTypes);
  guestListFormModal.renderTypes(objTypes);
  guestListFilters.renderTypes(objTypes);

  /**
   * Оживляем элементы
   */
  guestListFormPage.update();
  guestListFormModal.update();
  guestListFilters.update();

  /**
   * Показываем контент
   */
  DisplayElement.hide(preloader);
  DisplayElement.show(content);

  /**
   * Добавить инфу о госте в модалку редактирования
   */
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'click',
    fn: async () => {
      /** Обновляем модалку */
      await guestListFormModal.changeInfoInModalEdit(event);
    }
  });

  /**
   * Добавить гостя в список
   */
  ManagementEvents.addEventToArr({
    arr: guestListFormPage.arrEvents,
    el:  guestListFormPage.elements.btnAddGuest,
    event: 'click',
    fn: async () => {
      /** Получаем инфу и добавляем персону */
      const obj = guestListFormPage.getInfoForm();
      if (!obj) return;

      try {
        const person = await Fetch.post(`${domain}/api/project-guest/create?token=${localStorage.getItem('token')}`, obj);
        guestList.addGroupPerson(person.data);

        /** Очищаем форму */
        guestListFormPage.clearForm();
      } catch (e) {
        console.log(e);
        alert(`Ошибка добавления гостя в список.\n${e}`);
      }
    }
  });

  /**
   * Редактировать гостя
   */
  ManagementEvents.addEventToArr({
    arr: [],
    el: guestListFormModal.modalEdit,
    event: 'click',
    fn: async () => {
      const btnEdit = event.target.closest('[data-guest-btn=edit-guest]');
      if (!btnEdit) return;

      /** Отправляем отредактированную инфу о госте на сервер */
      const obj = await guestListFormModal.editGuest();
      if (!obj) return;

      /** Рендерим изменения */
      guestList.editPerson(obj);

      /** Сбрасываем модалку */
      DisplayElement.show(guestListFormModal.modalEdit.querySelector('.preloader'));
      DisplayElement.hide(guestListFormModal.modalEdit.querySelector('.popup__body'));
    }
  });

  /** Добавить события листания списка */
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'firstPage',
    fn: () => {
      const filters = guestListFilters.getFiltersObj();
      guestList.firstPage(filters);
    }
  });
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'prevPage',
    fn: () => {
      const filters = guestListFilters.getFiltersObj();
      guestList.prevPage(filters)
    }
  });
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'nextPage',
    fn: () => {
      const filters = guestListFilters.getFiltersObj();
      guestList.nextPage(filters)
    }
  });
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'lastPage',
    fn: () => {
      const filters = guestListFilters.getFiltersObj();
      guestList.lastPage(filters)
    }
  });
  ManagementEvents.addEventToArr({
    arr: guestList.arrEvents,
    el:  guestList.list,
    event: 'numPage',
    fn: () => {
      const filters = guestListFilters.getFiltersObj();
      guestList.numPage(filters)
    }
  });

  /**
   * События фильтрации
   */
  guestListFilters.filters.status.addEventListener('change', async event => {
    guestListFilters.filterStatus = event.target.value;
    filter();
  });
  guestListFilters.filters.category.addEventListener('change', async event => {
    guestListFilters.filterCategory = +event.target.value;
    filter();
  });
  guestListFilters.filters.type.addEventListener('change', async event => {
    guestListFilters.filterType = +event.target.value;
    filter();
  });

  async function filter() {
    /** Собираем объект для фильтров и фильтруем*/
    const filters = guestListFilters.getFiltersObj();
    guestList.getGuestList(guestList.filterPage, filters);

    /** Рендерим пагинацию */
    const quantityPages = await guestList.getQuantityPages(filters);
    pagination.render(quantityPages, guestList.page);

    /** Добавляем инфу о числе страниц */
    guestList.allFilterPages = quantityPages;
  }

});

function onLoad(ymaps) {

  const transferFromNew = document.querySelectorAll('[data-id="transfer-from"]');
  const transferToNew = document.querySelectorAll('[data-id="transfer-to"]');
  const meetAddressNew = document.querySelectorAll('[data-id="meet-address"]');
  const ticketsFromNew = document.querySelectorAll('[data-id="tickets-from"]');
  const ticketsToNew = document.querySelectorAll('[data-id="tickets-to"]');

  const arrAreas = [...transferFromNew, ...transferToNew, ...meetAddressNew, ...ticketsFromNew, ...ticketsToNew];

  arrAreas.forEach((el, index) => {
    new ymaps.SuggestView(arrAreas[index]);
  });
}





