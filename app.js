const slots = [
  { time: "5:00 م", price: 220, booked: false },
  { time: "6:00 م", price: 260, booked: false },
  { time: "7:00 م", price: 320, booked: true },
  { time: "8:00 م", price: 380, booked: false },
  { time: "9:00 م", price: 380, booked: true },
  { time: "10:00 م", price: 320, booked: false },
  { time: "11:00 م", price: 260, booked: false },
  { time: "12:00 ص", price: 220, booked: false },
];

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
const cart = [];

const slotsGrid = document.querySelector("#slotsGrid");
const selectedSlotText = document.querySelector("#selectedSlotText");
const selectedPriceText = document.querySelector("#selectedPriceText");
const confirmBooking = document.querySelector("#confirmBooking");
const upcomingBookings = document.querySelector("#upcomingBookings");
const productsGrid = document.querySelector("#productsGrid");
const cartList = document.querySelector("#cartList");
const cartTotal = document.querySelector("#cartTotal");
const toast = document.querySelector("#toast");

function formatCurrency(value) {
  return `${value} ش.ج`;
}

function durationMultiplier() {
  return selectedDuration / 60;
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

  slots.forEach((slot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slot";
    button.classList.toggle("is-booked", slot.booked);
    button.classList.toggle("is-selected", selectedSlot === index);
    button.disabled = slot.booked;
    button.innerHTML = `
      <strong>${slot.time}</strong>
      <span>${slot.booked ? "محجوز" : formatCurrency(slot.price * durationMultiplier())}</span>
    `;

    button.addEventListener("click", () => {
      selectedSlot = index;
      updateBookingSummary();
      renderSlots();
    });

    slotsGrid.appendChild(button);
  });
}

function updateBookingSummary() {
  if (selectedSlot === null) {
    selectedSlotText.textContent = "اختر وقتًا";
    selectedPriceText.textContent = "--";
    return;
  }

  const slot = slots[selectedSlot];
  selectedSlotText.textContent = `${slot.time} لمدة ${selectedDuration} دقيقة`;
  selectedPriceText.textContent = formatCurrency(slot.price * durationMultiplier());
}

function confirmSelectedBooking() {
  if (selectedSlot === null) {
    showToast("اختر موعدًا متاحًا قبل تأكيد الحجز");
    return;
  }

  const slot = slots[selectedSlot];
  slot.booked = true;

  const item = document.createElement("li");
  item.innerHTML = `<span>حجز جديد</span><strong>اليوم ${slot.time}</strong>`;
  upcomingBookings.prepend(item);

  showToast(`تم تأكيد حجز الملعب الساعة ${slot.time}`);
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
renderProducts();
renderCart();
updateBookingSummary();
initIcons();

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
