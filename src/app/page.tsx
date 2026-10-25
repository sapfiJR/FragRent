"use client";

import { useEffect, useState, type CSSProperties } from "react";

type SkinCategory =
  | "knife-gloves" // только нож + перчатки 
  | "additional-skins" // доп скины к сету 
  | "full-inventory"; // фулл инвентарь или что то приближенное к этому

type Account = {                                         // от сюда 
  id: number;
  name: string;
  elo: number;
  level: number;
  pricesByHour: number[];
  tags: string[];
  theme: string;
  skinCategory: SkinCategory;
  inventoryType: "Нож + перчатки" | "Полный инвентарь";
  isRented: boolean;
  images: string[];
};

type LightboxState = {
  account: Account;
  index: number;
};

const accounts: Account[] = [
  {                                                  // до сюда, не трогать
    id: 1,
    name: "Фиолетовые Волны",     // имя сета 
    elo: 1000,
    level: 4,
    pricesByHour: [299, 499, 699, 859, 999, 1099, 1199, 1299], // ценообразование с шагом в час
    tags: ["Дополнительные скины"],
    theme: "purple",
    skinCategory: "additional-skins",
    inventoryType: "Дополнительные скины", 
    isRented: 1,
    images: [
      "/images/accounts/purple-wave/purple-wave.jpg",
      "/images/accounts/purple-wave/purple-wave-2.jpg",
      "/images/accounts/purple-wave/purple-wave-3.jpg",
    ],
  },

  {
    id: 2,
    name: "Снежный",
    elo: 1000,
    level: 4,
    pricesByHour: [149, 229, 299, 369, 429, 489, 549, 599],
    tags: ["Нож + перчатки"],
    theme: "white",
    skinCategory: "knife-gloves",
    inventoryType: "Нож + перчатки",
    isRented: true,
    images: [
      "/images/accounts/snow/1.jpg",
      "/images/accounts/snow/2.jpg",
    ],
  },

  {
    id: 3,
    name: "Омега-тигр",
    elo: 1100,
    level: 5,
    pricesByHour: [189, 279, 349, 419, 469, 519, 579, 619],
    tags: ["Полный инвентарь"],
    theme: "orange",
    skinCategory: "full-inventory",
    inventoryType: "Полный инвентарь",
    isRented: false,
    images: [
      "/images/accounts/tiger/1.png",
      "/images/accounts/tiger/2.png",
      "/images/accounts/tiger/3.png",
      "/images/accounts/tiger/4.png",
      "/images/accounts/tiger/5.png",
      "/images/accounts/tiger/6.png",
      "/images/accounts/tiger/7.jpg",
    ],

  },

  {
    id: 4,
    name: "Кристаллический",
    elo: 1000,
    level: 4,
    pricesByHour: [229, 319, 399, 479, 559, 629, 699, 769],
    tags: ["Нож + перчатки"],
    theme: "blue",
    skinCategory: "knife-gloves",
    inventoryType: "Нож + перчатки",
    isRented: false,
    images: [
      "/images/accounts/doppler3/1.png",
      "/images/accounts/doppler3/2.png",
    ],

  },

  {
    id: 5,
    name: "Неоново-розовый",
    elo: 890,
    level: 3,
    pricesByHour: [199, 299, 399, 499, 599, 699, 719, 769],
    tags: ["Нож + перчатки"],
    theme: "green",
    skinCategory: "knife-gloves",
    inventoryType: "Нож + перчатки",
    isRented: false,
    images: [
      "/images/accounts/pink/1.jpg",
      "/images/accounts/pink/2.jpg",
    ],
  },

];

const skinOptions: {
  value: SkinCategory | "all";
  label: string;
  description: string;
}[] = [
  {
    value: "all",
    label: "Все комплектации",
    description: "Показать все аккаунты",
  },
  {
    value: "knife-gloves",
    label: "Только нож и перчатки",
    description: "Комплект только из двух предметов",
  },
  {
    value: "additional-skins",
    label: "Дополнительные скины",
    description: "Доп. скины помимо ножа и перчаток",
  },
  {
    value: "full-inventory",
    label: "Готовый инвентарь",
    description: "Скины на всех основных оружиях",
  },
];

function getHourLabel(hours: number): string {
  if (hours === 1) return "1 час";
  if (hours >= 2 && hours <= 4) return `${hours} часа`;
  return `${hours} часов`;
}

function getPrice(account: Account, hours: number): number {
  return account.pricesByHour[hours - 1] ?? 0;
}

function getImageKey(accountId: number, index: number): string {
  return `${accountId}:${index}`;
}

export default function Home() {
  // Фильтры каталога
  const [eloFrom, setEloFrom] = useState("");
  const [eloTo, setEloTo] = useState("");

  const [skinFilter, setSkinFilter] =
    useState<SkinCategory | "all">("all");

  const [skinDropdownOpen, setSkinDropdownOpen] = useState(false);

  // Выбранная длительность аренды
  const [selectedHours, setSelectedHours] = useState<
    Record<number, number>
  >({
    1: 3,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3,
  });

  // Галерея фотографий
  const [photoIndexes, setPhotoIndexes] = useState<
    Record<number, number>
  >({});

  const [lightbox, setLightbox] =
    useState<LightboxState | null>(null);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  // Окно правил аренды
  const [selectedAccount, setSelectedAccount] =
    useState<Account | null>(null);

  const [rulesAccepted, setRulesAccepted] = useState(false);

  // ELO и комплектация работают одновременно
  const filteredAccounts = accounts.filter((account) => {
    const matchesEloFrom =
      eloFrom.trim() === "" || account.elo >= Number(eloFrom);

    const matchesEloTo =
      eloTo.trim() === "" || account.elo <= Number(eloTo);

    const matchesSkinCategory =
      skinFilter === "all" ||
      account.skinCategory === skinFilter;

    return (
      matchesEloFrom &&
      matchesEloTo &&
      matchesSkinCategory
    );
  });

  function changeHours(accountId: number, hours: number) {
    setSelectedHours((previous) => ({
      ...previous,
      [accountId]: hours,
    }));
  }

  function changePhoto(account: Account, nextIndex: number) {
    const total = account.images.length;
    if (total <= 1) return;

    const index = ((nextIndex % total) + total) % total;

    setPhotoIndexes((previous) => ({
      ...previous,
      [account.id]: index,
    }));
  }

  function openPhoto(account: Account, index: number) {
    const imageKey = getImageKey(account.id, index);

    if (imageErrors[imageKey]) return;

    setPhotoIndexes((previous) => ({
      ...previous,
      [account.id]: index,
    }));

    setLightbox({ account, index });
  }

  function navigateLightbox(direction: number) {
    if (!lightbox) return;

    const total = lightbox.account.images.length;
    if (total <= 1) return;

    const index =
      (lightbox.index + direction + total) % total;

    setPhotoIndexes((previous) => ({
      ...previous,
      [lightbox.account.id]: index,
    }));

    setLightbox({
      account: lightbox.account,
      index,
    });
  }

  function markImageError(accountId: number, index: number) {
    const imageKey = getImageKey(accountId, index);

    setImageErrors((previous) => ({
      ...previous,
      [imageKey]: true,
    }));
  }

  // Открываем правила вместо немедленного перехода в Telegram
  function openRental(account: Account) {
    if (account.isRented) return;

    setRulesAccepted(false);
    setSelectedAccount(account);
  }

  // Закрытие окна правил
  function closeRentalModal() {
    setSelectedAccount(null);
    setRulesAccepted(false);
  }

  // Переход в Telegram только после принятия правил
  function confirmRental() {
    if (!selectedAccount || selectedAccount.isRented || !rulesAccepted) {
      return;
    }

    const account = selectedAccount;
    const hours = selectedHours[account.id] ?? 3;
    const price = getPrice(account, hours);

    const message = [
      "Здравствуйте! Хочу арендовать аккаунт FACEIT.",
      `Аккаунт / сет: ${account.name}`,
      `Комплектация: ${account.inventoryType}`,
      `ELO: ${account.elo.toLocaleString("ru-RU")}`,
      `Срок аренды: ${getHourLabel(hours)}`,
      `Стоимость: ${price.toLocaleString("ru-RU")} ₽`,
      "С правилами аренды ознакомился(ась) и принимаю их.",
    ].join("\n");

    const telegramUrl = `https://t.me/sapfiofcl?text=${encodeURIComponent(
      message
    )}`;

    window.open(telegramUrl, "_blank", "noopener,noreferrer");

    closeRentalModal();
  }

  // Закрытие меню фильтра по Escape
  useEffect(() => {
    if (!skinDropdownOpen) return;

    function handleDropdownKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSkinDropdownOpen(false);
      }
    }

    window.addEventListener("keydown", handleDropdownKeyDown);

    return () => {
      window.removeEventListener("keydown", handleDropdownKeyDown);
    };
  }, [skinDropdownOpen]);

  // Блокируем прокрутку фона и закрываем окно правил по Escape
  useEffect(() => {
    if (!selectedAccount) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleRentalKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedAccount(null);
        setRulesAccepted(false);
      }
    }

    window.addEventListener("keydown", handleRentalKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleRentalKeyDown);
    };
  }, [selectedAccount]);

  // Управление полноэкранным просмотром фотографий
  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightbox(null);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateLightbox(1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateLightbox(-1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightbox]);

  return (
    <main>
      {/* HEADER */}
      <header className="header">
        <a
          className="brand"
          href="#"
          aria-label="FRAGRENT — главная"
        >
          <span className="brand-symbol">F</span>

          <span className="brand-name">
            <span>FRAG</span>
            <span className="orange">RENT</span>
          </span>
        </a>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            АРЕНДА FACEIT АККАУНТОВ СО СКИНАМИ
          </div>

          <h1 className="hero-title">
            <span>ПОД ЛЮБОЙ</span>

            <span className="hero-title-second">
              БЮДЖЕТ<span className="orange"></span>
            </span>
          </h1>

          <p className="hero-description">
            Аккаунты для игры на фейсите с готовыми сетами и скинами.
            Выбирай понравившийся аккаунт и начинай играть уже сегодня.
          </p>

          <div className="hero-actions">
            <a
              className="button button-primary hero-main-cta"
              href="#accounts"
            >
              <span className="hero-main-cta-label">
                Смотреть аккаунты
              </span>

              <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>

        {/* HERO GRAPHIC */}
        <div
          className="hero-art hero-art-raised"
          aria-label="Декоративная графика FRAGRENT"
        >
          <div className="art-grid" />
          <div className="art-circle art-circle-one" />
          <div className="art-circle art-circle-two" />
          <div className="art-slash" />
          <div className="art-cross">+</div>

          <div className="art-label art-label-top">
            FR / 001 — INVENTORY
          </div>

          <div className="art-emblem">
            <span className="emblem-top">ЧИСЛО АККАУНТОВ</span>

            <span className="emblem-number">
              {accounts.filter((account) => !account.isRented).length}
            </span>

            <span className="emblem-bottom">
              ГОТОВЫХ К АРЕНДЕ
            </span>
          </div>

          <div className="art-coordinates">
            <span>CS2 / FACEIT</span>
            <span>INVENTORY / READY</span>
          </div>

          <div className="art-side-label">
            FRAGRENT — YOUR LOADOUT
          </div>
        </div>

        {/* ADVANTAGES */}
        <div className="hero-bottom">
          <div className="hero-bottom-item">
            <span className="mini-icon">◇</span>

            <div>
              <strong>Ножи и перчатки</strong>
              <span>Выбирай комплект</span>
            </div>
          </div>

          <div className="hero-bottom-item">
            <span className="mini-icon">▧</span>

            <div>
              <strong>Готовые инвентари</strong>
              <span>Больше вариантов скинов</span>
            </div>
          </div>

          <div className="hero-bottom-item">
            <span className="mini-icon">↗</span>

            <div>
              <strong>Разный ELO</strong>
              <span>Подбирай рейтинг</span>
            </div>
          </div>

          <div className="hero-bottom-item">
            <span className="mini-icon">◷</span>

            <div>
              <strong>Понятные цены</strong>
              <span>Выбирай длительность</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG */}
      <section className="catalog section" id="accounts">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              ВЫБИРАЙ ПО СВОЕМУ ВКУСУ И БЮДЖЕТУ
            </div>

            <h2>
              АККАУНТЫ{" "}
              <span className="faceit-title">FACEIT</span> СО{" "}
              <span className="orange">СКИНАМИ</span>
            </h2>

            <p className="section-description">
              Ножи, перчатки и готовые инвентари.
              ELO — дополнительный параметр выбора.
            </p>
          </div>

          <div className="catalog-count">
            <span>
              {String(filteredAccounts.length).padStart(2, "0")}
            </span>

            <span>АККАУНТОВ В КАТАЛОГЕ</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="catalog-toolbar">
          <div className="catalog-filters">
            {/* ELO FILTER */}
            <div className="filter-group">
              <label
                className="filter-label"
                htmlFor="elo-from"
              >
                ELO
              </label>

              <div className="elo-range">
                <input
                  id="elo-from"
                  className="elo-input"
                  type="number"
                  min={0}
                  placeholder="От"
                  value={eloFrom}
                  onChange={(event) =>
                    setEloFrom(event.target.value)
                  }
                  aria-label="Минимальный ELO"
                />

                <span className="elo-separator">—</span>

                <input
                  id="elo-to"
                  className="elo-input"
                  type="number"
                  min={0}
                  placeholder="До"
                  value={eloTo}
                  onChange={(event) =>
                    setEloTo(event.target.value)
                  }
                  aria-label="Максимальный ELO"
                />
              </div>
            </div>

            {/* CUSTOM SKIN FILTER */}
            <div className="filter-group skin-filter-group">
              <label className="filter-label">
                СКИНЫ
              </label>

              <div
                className="skin-select-wrap"
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;

                  if (
                    !(nextTarget instanceof Node) ||
                    !event.currentTarget.contains(nextTarget)
                  ) {
                    setSkinDropdownOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  className={`skin-select-trigger ${
                    skinDropdownOpen ? "is-open" : ""
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={skinDropdownOpen}
                  onClick={() =>
                    setSkinDropdownOpen((previous) => !previous)
                  }
                >
                  <span>
                    {skinOptions.find(
                      (option) => option.value === skinFilter
                    )?.label ?? "Все комплектации"}
                  </span>

                  <span
                    className={`skin-select-chevron ${
                      skinDropdownOpen ? "rotated" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </button>

                {skinDropdownOpen && (
                  <div
                    className="skin-select-menu"
                    role="listbox"
                    aria-label="Категория скинов"
                  >
                    {skinOptions.map((option) => {
                      const isActive =
                        skinFilter === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          className={`skin-select-option ${
                            isActive ? "is-active" : ""
                          }`}
                          onClick={() => {
                            setSkinFilter(option.value);
                            setSkinDropdownOpen(false);
                          }}
                        >
                          <span className="skin-option-copy">
                            <strong>{option.label}</strong>
                            <span>{option.description}</span>
                          </span>

                          <span className="skin-option-check">
                            {isActive ? "✓" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <span className="demo-label">
            <span className="status-dot" />
            ДЕМО-КАТАЛОГ
          </span>
        </div>

        {/* ACCOUNT CARDS */}
        <div className="account-grid">
          {filteredAccounts.map((account) => {
            const hours = selectedHours[account.id] ?? 3;
            const price = getPrice(account, hours);
            const photoIndex = photoIndexes[account.id] ?? 0;
            const currentImage = account.images[photoIndex];
            const imageKey = getImageKey(account.id, photoIndex);
            const imageMissing = Boolean(imageErrors[imageKey]);

            return (
              <article
                className={`account-card ${
                  account.isRented ? "is-rented" : ""
                }`}
                key={account.id}
              >
                {account.isRented && (
                  <div
                    className="rented-overlay"
                    aria-label="Аккаунт в аренде"
                  >
                    <span className="rented-stamp">
                      В АРЕНДЕ
                    </span>
                  </div>
                )}

                {/* PHOTO CAROUSEL */}
                <div
                  className={`account-visual visual-${account.theme}`}
                >
                  <div className="account-photo-frame">
                    {imageMissing ? (
                      <div className="account-image-placeholder">
                        <span className="image-placeholder-icon">
                          ＋
                        </span>

                        <strong>ФОТО НЕ НАЙДЕНО</strong>
                        <span>{currentImage}</span>
                      </div>
                    ) : (
                      <img
                        key={currentImage}
                        className="account-skin-image"
                        src={currentImage}
                        alt={`${account.name} — фото ${
                          photoIndex + 1
                        }`}
                        loading="lazy"
                        onClick={() =>
                          openPhoto(account, photoIndex)
                        }
                        onError={() =>
                          markImageError(account.id, photoIndex)
                        }
                      />
                    )}

                    {account.images.length > 1 && (
                      <div className="photo-carousel-controls">
                        <button
                          type="button"
                          className="photo-arrow"
                          aria-label="Предыдущее фото"
                          onClick={() =>
                            changePhoto(account, photoIndex - 1)
                          }
                        >
                          ‹
                        </button>

                        <div className="photo-dots">
                          {account.images.map((image, index) => (
                            <button
                              key={image}
                              type="button"
                              className={`photo-dot ${
                                index === photoIndex
                                  ? "photo-dot-active"
                                  : ""
                              }`}
                              aria-label={`Фото ${index + 1}`}
                              aria-pressed={index === photoIndex}
                              onClick={() =>
                                changePhoto(account, index)
                              }
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          className="photo-arrow"
                          aria-label="Следующее фото"
                          onClick={() =>
                            changePhoto(account, photoIndex + 1)
                          }
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACCOUNT INFORMATION */}
                <div className="account-content">
                  <div className="account-title-row">
                    <div className="account-title-info">
                      <span className="account-id">
                        АККАУНТ / #
                        {String(account.id).padStart(3, "0")}
                      </span>

                      <h3>{account.name}</h3>
                    </div>

                    <div className="account-meta account-meta-inline">
                      <span>FACEIT LVL {account.level}</span>

                      <span>
                        {account.elo.toLocaleString("ru-RU")} ELO
                      </span>
                    </div>
                  </div>

                  {/* INVENTORY TAGS */}
                  <div className="account-tags">
                    {account.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  {/* RENTAL DURATION */}
                  <div className="rental-duration">
                    <div className="duration-heading">
                      <label htmlFor={`hours-${account.id}`}>
                        СРОК АРЕНДЫ
                      </label>

                      <strong>{getHourLabel(hours)}</strong>
                    </div>

                    <input
                      id={`hours-${account.id}`}
                      className="duration-slider"
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={hours}
                      style={
                        {
                          "--slider-progress": `${
                            ((hours - 1) / 7) * 100
                          }%`,
                        } as CSSProperties
                      }
                      onChange={(event) =>
                        changeHours(
                          account.id,
                          Number(event.target.value)
                        )
                      }
                      aria-label={`Продолжительность аренды ${account.name}`}
                    />

                    <div
                      className="duration-ticks"
                      aria-hidden="true"
                    >
                      {Array.from({ length: 8 }, (_, index) => (
                        <span
                          key={index + 1}
                          className={
                            hours === index + 1
                              ? "tick-active"
                              : ""
                          }
                        >
                          {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="account-divider" />

                  {/* PRICE AND RENT BUTTON */}
                  <div className="account-footer">
                    <div className="price">
                      <strong>
                        {price.toLocaleString("ru-RU")} ₽
                      </strong>

                      <span>
                        Итого за {getHourLabel(hours)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="rent-button"
                      disabled={account.isRented}
                      aria-disabled={account.isRented}
                      onClick={() => openRental(account)}
                    >
                      {account.isRented
                        ? "В аренде"
                        : "Арендовать"}

                      {!account.isRented && <span>↗</span>}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

      
      </section>

      {/* FAQ */}
      <section className="faq section" id="faq">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            FAQ
          </div>

          <h2>
            ЕСТЬ ВОПРОСЫ<span className="orange">?</span>
          </h2>
        </div>

        <div className="faq-items">
          <details>
            <summary>
              Нужно ли регистрироваться на сайте?
            </summary>

            <p>Нет. Каталог доступен без регистрации.</p>
          </details>

          <details>
            <summary>Чем отличаются комплектации?</summary>

            <p>
              Каждое предложение обязательно включает в себя нож и перчатки.
              При этом некоторые варианты дополнены отдельными скинами,
              а другие представляют собой полноценные инвентари, содержащие скины для всего основного оружия, с чем играют большинство игроков. 
            </p>
          </details>

          <details>
            <summary>Как рассчитывается цена?</summary>

            <p>
              Выбираешь длительность от одного до восьми часов.
              Итоговая стоимость зависит от от выбранного аккаунта и колличества часов.
            </p>
          </details>

          <details>
            <summary>Как оформить аренду?</summary>

            <p>
              Нажми «Арендовать», ознакомься с правилами и поставь
              галочку согласия. После этого откроется Telegram
              с уже заполненным сообщением о выбранном аккаунте,
              комплектации и сроке аренды.
            </p>
          </details>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contacts">
        <a
          href="#"
          className="brand"
          aria-label="FRAGRENT — главная"
        >
          <span className="brand-symbol">F</span>

          <span>
            FRAG<span className="orange">RENT</span>
          </span>
        </a>

        <span className="footer-copy">
          © 2026 FRAGRENT
        </span>

        <a href="#accounts" className="footer-link">
          К каталогу ↑
        </a>
      </footer>

      {/* RENTAL RULES MODAL */}
      {selectedAccount && (
        <div
          className="modal-backdrop"
          onClick={closeRentalModal}
        >
          <div
            className="rent-modal rental-rules-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-rules-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-top">
              <span className="eyebrow">
                <span className="eyebrow-line" />
                ПЕРЕД АРЕНДОЙ
              </span>

              <button
                type="button"
                className="modal-close"
                onClick={closeRentalModal}
                aria-label="Закрыть окно"
              >
                ×
              </button>
            </div>

            <h2 id="rental-rules-title">
              ПРАВИЛА <span className="orange">АРЕНДЫ</span>
            </h2>

            <p className="modal-description">
              Перед продолжением ознакомься с условиями использования
              аккаунта.
            </p>

            {/* SELECTED ACCOUNT SUMMARY */}
            <div className="modal-account">
              <div>
                <span>АККАУНТ / СЕТ</span>
                <strong>{selectedAccount.name}</strong>
              </div>

              <div>
                <span>КОМПЛЕКТАЦИЯ</span>
                <strong>{selectedAccount.inventoryType}</strong>
              </div>

              <div>
                <span>СРОК</span>
                <strong>
                  {getHourLabel(
                    selectedHours[selectedAccount.id] ?? 3
                  )}
                </strong>
              </div>

              <div>
                <span>СТОИМОСТЬ</span>
                <strong>
                  {getPrice(
                    selectedAccount,
                    selectedHours[selectedAccount.id] ?? 3
                  ).toLocaleString("ru-RU")}{" "}
                  ₽
                </strong>
              </div>
            </div>

            {/* RENTAL RULES */}
            <div className="rental-rules-list">
              <div className="rental-rule">
                <span className="rental-rule-number">01</span>

                <p>
                  <strong>Без читов.</strong> Запрещены читы
                  и любые средства, дающие нечестное преимущество.
                </p>
              </div>

              <div className="rental-rule">
                <span className="rental-rule-number">02</span>

                <p>
                  <strong>В одни руки.</strong> Пользоваться аккаунтом
                  может только арендатор. Передавать доступ другим нельзя.
                </p>
              </div>

              <div className="rental-rule">
                <span className="rental-rule-number">03</span>

                <p>
                  <strong>Только FACEIT.</strong> Запускать обычный
                  матчмейкинг CS2 запрещено.
                </p>
              </div>
            </div>

            <p className="rental-warning">
              При нарушении правил аренда прекращается, оплата не возвращается.
            </p>

            {/* ACCEPTANCE CHECKBOX */}
            <label className="rental-accept">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(event) =>
                  setRulesAccepted(event.target.checked)
                }
              />

              <span>
                Ознакомился с правилами и принимаю их
              </span>
            </label>

            {/* BUTTON IS DISABLED UNTIL CHECKED */}
            <button
              type="button"
              className="button button-primary modal-button"
              disabled={!rulesAccepted}
              onClick={confirmRental}
            >
              Арендовать <span>↗</span>
            </button>

            <p className="modal-footnote">
              После подтверждения откроется Telegram с готовым сообщением.
            </p>
          </div>
        </div>
      )}

      {/* FULL-SCREEN PHOTO VIEWER */}
      {lightbox && (
        <div
          className="photo-lightbox"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="photo-lightbox-close"
            aria-label="Закрыть просмотр"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>

          <div
            className="photo-lightbox-stage"
            role="dialog"
            aria-modal="true"
            aria-label={`Фотографии аккаунта ${lightbox.account.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            {lightbox.account.images.length > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-arrow-left"
                aria-label="Предыдущее фото"
                onClick={() => navigateLightbox(-1)}
              >
                ‹
              </button>
            )}

            {imageErrors[
              getImageKey(lightbox.account.id, lightbox.index)
            ] ? (
              <div className="lightbox-missing">
                Файл не найден:{" "}
                {lightbox.account.images[lightbox.index]}
              </div>
            ) : (
              <img
                key={lightbox.account.images[lightbox.index]}
                className="photo-lightbox-image"
                src={lightbox.account.images[lightbox.index]}
                alt={`${lightbox.account.name} — фото ${
                  lightbox.index + 1
                }`}
                onError={() =>
                  markImageError(
                    lightbox.account.id,
                    lightbox.index
                  )
                }
              />
            )}

            {lightbox.account.images.length > 1 && (
              <button
                type="button"
                className="lightbox-arrow lightbox-arrow-right"
                aria-label="Следующее фото"
                onClick={() => navigateLightbox(1)}
              >
                ›
              </button>
            )}

            <div className="photo-lightbox-caption">
              <span>{lightbox.account.name}</span>

              <span>
                {lightbox.index + 1} /{" "}
                {lightbox.account.images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}