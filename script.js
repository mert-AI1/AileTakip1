
const $ = (id) => document.getElementById(id);

let gpsWatchId = null;
let toastTimeout = null;

function toast(message) {
  const element = $("toast");

  if (!element) {
    alert(message);
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    element.classList.remove("show");
  }, 3200);
}

function showPage(name) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  const target = $("page-" + name);

  if (target) {
    target.classList.add("active");
  } else {
    toast("Bu sayfa henüz hazırlanmadı.");
    return;
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const action = link.getAttribute("onclick") || "";
    link.classList.toggle("active", action.includes("'" + name + "'") ||
      action.includes('"' + name + '"'));
  });

  const nav = $("nav");
  if (nav) nav.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMenu() {
  const nav = $("nav");
  if (nav) nav.classList.toggle("open");
}

function openLogin() {
  const modal = $("loginModal");
  if (modal) modal.classList.add("show");
}

function closeLogin() {
  const modal = $("loginModal");
  if (modal) modal.classList.remove("show");
}

function setLoginMode(mode) {
  const emailTab = $("emailTab");
  const codeTab = $("codeTab");
  const emailInput = $("emailInput");
  const passwordInput = $("passwordInput");
  const emailLabel = $("emailLabel");
  const passwordLabel = $("passwordLabel");

  if (emailTab) emailTab.classList.toggle("active", mode === "email");
  if (codeTab) codeTab.classList.toggle("active", mode === "code");

  if (emailLabel) {
    emailLabel.textContent = mode === "email"
      ? "Gmail adresi"
      : "Bağlantı kodu";
  }

  if (emailInput) {
    emailInput.placeholder = mode === "email"
      ? "ornek@gmail.com"
      : "Aile bağlantı kodunu girin";
    emailInput.type = "text";
    emailInput.value = "";
  }

  if (passwordLabel) {
    passwordLabel.style.display = mode === "email" ? "" : "none";
  }

  if (passwordInput) {
    passwordInput.style.display = mode === "email" ? "" : "none";
    passwordInput.required = mode === "email";
    passwordInput.value = "";
  }

  const form = $("loginForm");
  if (form) form.dataset.mode = mode;
}

function submitLogin(event) {
  event.preventDefault();

  const form = $("loginForm");
  const mode = form?.dataset.mode || "email";
  const identifier = $("emailInput")?.value.trim() || "";
  const password = $("passwordInput")?.value || "";

  if (!identifier) {
    toast(mode === "email"
      ? "E-posta adresini gir."
      : "Bağlantı kodunu gir.");
    return;
  }

  if (mode === "email") {
    if (!password) {
      toast("Şifreni gir.");
      return;
    }

    toast("Giriş sistemi henüz bir kimlik doğrulama hizmetine bağlanmadı.");
  } else {
    toast("Bağlantı kodu doğrulaması henüz kurulmadı.");
  }
}

function startLiveGPS() {
  if (!("geolocation" in navigator)) {
    toast("Bu tarayıcı konum özelliğini desteklemiyor.");
    return;
  }

  if (!window.isSecureContext) {
    toast("Konum için HTTPS bağlantısı gerekiyor.");
    return;
  }

  if (gpsWatchId !== null) {
    toast("Konum güncellemesi zaten açık.");
    return;
  }

  const status = $("gpsStatus");
  const dot = $("gpsStatusDot");

  if (status) status.textContent = "Konum izni bekleniyor...";
  if (dot) dot.classList.remove("offline");

  gpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      const coordinates = $("gpsCoordinates");
      const gpsAccuracy = $("gpsAccuracy");

      if (coordinates) {
        coordinates.textContent =
          lat.toFixed(5) + ", " + lon.toFixed(5);
      }

      if (gpsAccuracy) {
        gpsAccuracy.textContent = "±" + Math.round(accuracy) + " m";
      }

      if (status) status.textContent = "Konum alındı";
      if (dot) dot.classList.remove("offline");

      const pin = document.querySelector(".map-pin");
      if (pin) {
        pin.title = "Cihazın konum izniyle alınan konum";
      }
    },
    (error) => {
      stopLiveGPS();

      if (status) status.textContent = "Konum alınamadı";
      if (dot) dot.classList.add("offline");

      const messages = {
        1: "Konum izni verilmedi. Tarayıcı ayarlarından izin verebilirsin.",
        2: "Cihazın konumu belirlenemedi.",
        3: "Konum isteği zaman aşımına uğradı."
      };

      toast(messages[error.code] || "Konum alınırken bir hata oluştu.");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );

  toast("Konum isteği başlatıldı. Tarayıcı iznini onayla.");
}

function stopLiveGPS() {
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }

  const status = $("gpsStatus");
  const dot = $("gpsStatusDot");

  if (status) status.textContent = "Konum durduruldu";
  if (dot) dot.classList.add("offline");
}

document.addEventListener("DOMContentLoaded", () => {
  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  const form = $("loginForm");
  if (form) {
    form.addEventListener("submit", submitLogin);
  }

  const modal = $("loginModal");
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeLogin();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLogin();
  });
});
