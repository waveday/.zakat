const $ = (id) => document.getElementById(id);

const fields = {
  price18: $("price18"),
  price21: $("price21"),
  price22: $("price22"),
  price24: $("price24"),
  w18: $("w18"),
  w21: $("w21"),
  w22: $("w22"),
  w24: $("w24"),
  z18: $("z18"),
  z21: $("z21"),
  z22: $("z22"),
  z24: $("z24"),
  totalZakatMoney: $("totalZakatMoney"),
  pure24: $("pure24"),
  nisabValue: $("nisabValue"),
  zakatPure24: $("zakatPure24"),
  statusBox: $("statusBox"),
  calcBtn: $("calcBtn"),
  clearBtn: $("clearBtn"),
  installBanner: $("installBanner"),
  installBtn: $("installBtn"),
};

const NISAB_PURE_24 = 85; // 85 جرام ذهب خالص
const ZAKAT_RATE = 0.025;

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n) {
  return num(n).toFixed(3);
}

function saveData() {
  const data = {
    price18: fields.price18.value,
    price21: fields.price21.value,
    price22: fields.price22.value,
    price24: fields.price24.value,
    w18: fields.w18.value,
    w21: fields.w21.value,
    w22: fields.w22.value,
    w24: fields.w24.value,
  };
  localStorage.setItem("zakat-gold-data", JSON.stringify(data));
}

function loadData() {
  try {
    const raw = localStorage.getItem("zakat-gold-data");
    if (!raw) return;
    const data = JSON.parse(raw);

    fields.price18.value = data.price18 || "";
    fields.price21.value = data.price21 || "";
    fields.price22.value = data.price22 || "";
    fields.price24.value = data.price24 || "";
    fields.w18.value = data.w18 || "";
    fields.w21.value = data.w21 || "";
    fields.w22.value = data.w22 || "";
    fields.w24.value = data.w24 || "";
  } catch (_) {}
}

function calcLine(weight, price) {
  const zakatWeight = weight * ZAKAT_RATE;
  const zakatMoney = zakatWeight * price;
  return { zakatWeight, zakatMoney };
}

function pureEquivalent24(weight, karat) {
  return weight * (karat / 24);
}

function calculate() {
  const p18 = num(fields.price18.value);
  const p21 = num(fields.price21.value);
  const p22 = num(fields.price22.value);
  const p24 = num(fields.price24.value);

  const w18 = num(fields.w18.value);
  const w21 = num(fields.w21.value);
  const w22 = num(fields.w22.value);
  const w24 = num(fields.w24.value);

  const r18 = calcLine(w18, p18);
  const r21 = calcLine(w21, p21);
  const r22 = calcLine(w22, p22);
  const r24 = calcLine(w24, p24);

  fields.z18.value = fmt(r18.zakatMoney);
  fields.z21.value = fmt(r21.zakatMoney);
  fields.z22.value = fmt(r22.zakatMoney);
  fields.z24.value = fmt(r24.zakatMoney);

  const totalMoney =
    r18.zakatMoney + r21.zakatMoney + r22.zakatMoney + r24.zakatMoney;

  const pure24 =
    pureEquivalent24(w18, 18) +
    pureEquivalent24(w21, 21) +
    pureEquivalent24(w22, 22) +
    pureEquivalent24(w24, 24);

  const zakatPure24 = pure24 * ZAKAT_RATE;

  fields.totalZakatMoney.textContent = fmt(totalMoney);
  fields.pure24.textContent = `${fmt(pure24)} جم`;
  fields.nisabValue.textContent = `${fmt(NISAB_PURE_24)} جم`;
  fields.zakatPure24.textContent = `${fmt(zakatPure24)} جم`;

  if (pure24 >= NISAB_PURE_24) {
    fields.statusBox.textContent = "بلغ النصاب، الزكاة واجبة إذا حال الحول";
    fields.statusBox.className = "status yes";
  } else {
    fields.statusBox.textContent = "لم يبلغ النصاب بعد";
    fields.statusBox.className = "status no";
  }

  saveData();
}

function clearAll() {
  [
    "price18","price21","price22","price24",
    "w18","w21","w22","w24"
  ].forEach((key) => fields[key].value = "");

  fields.z18.value = "0.000";
  fields.z21.value = "0.000";
  fields.z22.value = "0.000";
  fields.z24.value = "0.000";
  fields.totalZakatMoney.textContent = "0.000";
  fields.pure24.textContent = "0.000 جم";
  fields.zakatPure24.textContent = "0.000 جم";
  fields.statusBox.textContent = "لم يبلغ النصاب بعد";
  fields.statusBox.className = "status no";

  localStorage.removeItem("zakat-gold-data");
}

[
  fields.price18, fields.price21, fields.price22, fields.price24,
  fields.w18, fields.w21, fields.w22, fields.w24
].forEach((el) => {
  el.addEventListener("input", () => {
    saveData();
    calculate();
  });
});

fields.calcBtn.addEventListener("click", calculate);
fields.clearBtn.addEventListener("click", clearAll);

loadData();
calculate();

// PWA install
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  fields.installBanner.classList.add("show");
});

fields.installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  fields.installBanner.classList.remove("show");
});

window.addEventListener("appinstalled", () => {
  fields.installBanner.classList.remove("show");
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}