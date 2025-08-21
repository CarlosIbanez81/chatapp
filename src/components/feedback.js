let toastHost;

function ensureToastHost() {
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.style.position = "fixed";
    toastHost.style.top = "12px";
    toastHost.style.right = "12px";
    toastHost.style.zIndex = "9999";
    toastHost.style.display = "flex";
    toastHost.style.flexDirection = "column";
    toastHost.style.gap = "8px";
    document.body.appendChild(toastHost);
  }
}

const colors = {
  info: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
  error: "#dc2626"
};

export function showToast(message, type = "info", timeout = 3000) {
  ensureToastHost();
  const box = document.createElement("div");
  box.textContent = message;
  box.style.padding = "10px 14px";
  box.style.borderRadius = "6px";
  box.style.fontFamily = "system-ui, sans-serif";
  box.style.fontSize = "14px";
  box.style.color = "#fff";
  box.style.background = colors[type] || colors.info;
  box.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  box.style.opacity = "0";
  box.style.transform = "translateY(-4px)";
  box.style.transition = "opacity .25s, transform .25s";
  toastHost.appendChild(box);
  requestAnimationFrame(() => {
    box.style.opacity = "1";
    box.style.transform = "translateY(0)";
  });
  const remove = () => {
    box.style.opacity = "0";
    box.style.transform = "translateY(-4px)";
    setTimeout(() => box.remove(), 250);
  };
  box.addEventListener("click", remove);
  setTimeout(remove, timeout);
}

export function showConfirm({ title = "Confirm", message = "Are you sure?", okText = "OK", cancelText = "Cancel" } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "10000";
    const panel = document.createElement("div");
    panel.style.background = "#fff";
    panel.style.minWidth = "300px";
    panel.style.maxWidth = "420px";
    panel.style.padding = "18px 20px";
    panel.style.borderRadius = "8px";
    panel.style.boxShadow = "0 8px 28px rgba(0,0,0,0.18)";
    panel.style.fontFamily = "system-ui, sans-serif";
    panel.innerHTML = `
      <h3 style="margin:0 0 10px;font-size:17px;font-weight:600;color:#111;">${title}</h3>
      <div style="font-size:14px;line-height:1.4;color:#333;margin-bottom:16px;">${message}</div>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button data-action="cancel" style="padding:6px 14px;border:1px solid #d1d5db;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;">${cancelText}</button>
        <button data-action="ok" style="padding:6px 14px;border:1px solid #2563eb;background:#2563eb;color:#fff;border-radius:4px;cursor:pointer;font-size:14px;">${okText}</button>
      </div>`;
    overlay.appendChild(panel);
    const done = (val) => {
      overlay.remove();
      resolve(val);
    };
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) done(false);
    });
    panel.querySelector('[data-action="cancel"]').addEventListener("click", () => done(false));
    panel.querySelector('[data-action="ok"]').addEventListener("click", () => done(true));
    document.body.appendChild(overlay);
  });
}
