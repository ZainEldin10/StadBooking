const slots = [
  { time: "5:00 م" },
  { time: "6:00 م" },
  { time: "7:00 م" },
  { time: "8:00 م" },
  { time: "9:00 م" },
  { time: "10:00 م" },
  { time: "11:00 م" },
  { time: "12:00 ص" },
];

const durationPrices = {
  60: 200,
  90: 250,
  120: 300,
};

const products = [
  { name: "كرة تدريب احترافية", price: 85, icon: "circle-dot" },
  { name: "طقم فريق كامل", price: 240, icon: "shirt" },
  { name: "قفازات حارس", price: 120, icon: "hand" },
  { name: "جوارب رياضية", price: 35, icon: "footprints" },
  { name: "زجاجة ماء", price: 25, icon: "droplets" },
  { name: "حقيبة معدات", price: 160, icon: "briefcase" },
];

let selectedSlot = null;
let selectedDuration = 60;
let selectedDateIndex = 0;
const cart = [];
const bookedSlotsByDate = {
  0: new Set([2, 4]),
  1: new Set([3]),
  3: new Set([1, 5]),
};

const slotsGrid = document.querySelector("#slotsGrid");
const selectedSlotText = document.querySelector("#selectedSlotText");
const selectedPriceText = document.querySelector("#selectedPriceText");
const confirmBooking = document.querySelector("#confirmBooking");
const upcomingBookings = document.querySelector("#upcomingBookings");
const productsGrid = document.querySelector("#productsGrid");
const cartList = document.querySelector("#cartList");
const cartTotal = document.querySelector("#cartTotal");
const toast = document.querySelector("#toast");
let weekDates = document.querySelector("#weekDates");

if (!weekDates) {
  weekDates = document.createElement("div");
  weekDates.className = "week-dates";
  weekDates.id = "weekDates";
  weekDates.setAttribute("aria-label", "اختيار تاريخ الحجز");
  slotsGrid.before(weekDates);
}

const weekDateStyles = document.createElement("style");
weekDateStyles.textContent = `
  .week-dates {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 14px;
  }
  .date-chip {
    display: grid;
    gap: 5px;
    min-height: 70px;
    padding: 10px 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--muted);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    transition: 0.2s ease;
  }
  .date-chip strong {
    color: var(--text);
    font-size: 17px;
  }
  .date-chip span {
    font-size: 12px;
  }
  .date-chip:hover,
  .date-chip.is-active {
    border-color: rgba(25, 212, 123, 0.62);
    color: var(--text);
    background: rgba(25, 212, 123, 0.1);
  }
  .date-chip.is-active strong,
  .date-chip.is-active span {
    color: var(--green);
  }
  @media (max-width: 760px) {
    .week-dates {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;
document.head.appendChild(weekDateStyles);

function formatCurrency(value) {
  return `${value} ش.ج`;
}

function currentBookingPrice() {
  return durationPrices[selectedDuration];
}

function getWeekDays() {
  const formatter = new Intl.DateTimeFormat("ar", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const days = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date();
    date.setDate(date.getDate() + index);
    days.push({
      label: index === 0 ? "اليوم" : index === 1 ? "غدًا" : formatter.format(date),
      fullDate: date.toLocaleDateString("ar"),
    });
  }

  return days;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function renderSlots() {
  slotsGrid.innerHTML = "";
  const bookedSlots = bookedSlotsByDate[selectedDateIndex] || new Set();

  slots.forEach((slot, index) => {
    const isBooked = bookedSlots.has(index);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot";
    button.classList.toggle("is-booked", isBooked);
    button.classList.toggle("is-selected", selectedSlot === index);
    button.disabled = isBooked;
    button.innerHTML = `
      <strong>${slot.time}</strong>
      <span>${isBooked ? "محجوز" : formatCurrency(currentBookingPrice())}</span>
    `;

    button.addEventListener("click", () => {
      selectedSlot = index;
      updateBookingSummary();
      renderSlots();
    });

    slotsGrid.appendChild(button);
  });
}

function renderWeekDates() {
  weekDates.innerHTML = "";

  getWeekDays().forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-chip";
    button.classList.toggle("is-active", selectedDateIndex === index);
    button.innerHTML = `<span>${day.label}</span><strong>${day.fullDate}</strong>`;

    button.addEventListener("click", () => {
      selectedDateIndex = index;
      selectedSlot = null;
      updateBookingSummary();
      renderWeekDates();
      renderSlots();
    });

    weekDates.appendChild(button);
  });
}

function updateBookingSummary() {
  if (selectedSlot === null) {
    selectedSlotText.textContent = "اختر وقتًا";
    selectedPriceText.textContent = "--";
    return;
  }

  const slot = slots[selectedSlot];
  const day = getWeekDays()[selectedDateIndex];
  selectedSlotText.textContent = `${day.label} ${slot.time} لمدة ${selectedDuration} دقيقة`;
  selectedPriceText.textContent = formatCurrency(currentBookingPrice());
}

function confirmSelectedBooking() {
  if (selectedSlot === null) {
    showToast("اختر موعدًا متاحًا قبل تأكيد الحجز");
    return;
  }

  const slot = slots[selectedSlot];
  if (!bookedSlotsByDate[selectedDateIndex]) {
    bookedSlotsByDate[selectedDateIndex] = new Set();
  }
  bookedSlotsByDate[selectedDateIndex].add(selectedSlot);
  const day = getWeekDays()[selectedDateIndex];

  const item = document.createElement("li");
  item.innerHTML = `<span>حجز جديد</span><strong>${day.label} ${slot.time}</strong>`;
  upcomingBookings.prepend(item);

  showToast(`تم تأكيد حجز الملعب ${day.label} الساعة ${slot.time}`);
  selectedSlot = null;
  updateBookingSummary();
  renderSlots();
}

function renderProducts() {
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card reveal";
    card.innerHTML = `
      <div class="product-image"><i data-lucide="${product.icon}"></i></div>
      <div class="product-body">
        <h3>${product.name}</h3>
        <div class="product-footer">
          <strong>${formatCurrency(product.price)}</strong>
          <button type="button" aria-label="إضافة ${product.name} للسلة">
            <i data-lucide="plus"></i>
          </button>
        </div>
      </div>
    `;

    card.querySelector("button").addEventListener("click", () => {
      cart.push(product);
      renderCart();
      showToast(`تمت إضافة ${product.name} للسلة`);
    });

    productsGrid.appendChild(card);
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="muted">لم تتم إضافة منتجات بعد</li>';
    cartTotal.textContent = formatCurrency(0);
    return;
  }

  cartList.innerHTML = "";
  cart.forEach((item) => {
    const row = document.createElement("li");
    row.innerHTML = `<span>${item.name}</span><strong>${formatCurrency(item.price)}</strong>`;
    cartList.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatCurrency(total);
}

document.querySelectorAll(".duration-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".duration-option").forEach((option) => {
      option.classList.remove("is-active");
    });

    button.classList.add("is-active");
    selectedDuration = Number(button.dataset.duration);
    updateBookingSummary();
    renderSlots();
  });
});

document.querySelectorAll(".request-row").forEach((button) => {
  button.addEventListener("click", () => {
    showToast("تم إرسال طلب الانضمام للمباراة");
  });
});

document.querySelectorAll(".challenge-actions button").forEach((button) => {
  button.addEventListener("click", () => {
    const isAccept = button.classList.contains("accept");
    showToast(isAccept ? "تم قبول التحدي" : "تم رفض التحدي");
  });
});

confirmBooking.addEventListener("click", confirmSelectedBooking);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

renderSlots();
renderWeekDates();
renderProducts();
renderCart();
updateBookingSummary();
initIcons();

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
