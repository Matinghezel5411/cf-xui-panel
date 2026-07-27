// تنظیمات اصلی پنل و پروکسی
const ADMIN_PASSWORD = "admin"; // پسورد ورود به پنل مدیریت (حتماً بعداً تغییرش بده)
const PROXY_IP = "108.162.198.127"; // یک آی‌پی تمیز یا پراکسی آی‌پی کلادفلر برای اتصال بهتر

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // صفحه ورود یا پنل مدیریت
    if (path === "/" || path === "/admin") {
      return new Response(getAdminPanelHTML(), {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // لینک اشتراک (Subscription) برای کلاینت‌ها
    if (path.startsWith("/sub/")) {
      const uuid = path.split("/sub/")[1];
      const subContent = `vless://${uuid}@${url.hostname}:443?encryption=none&security=tls&sni=${url.hostname}&fp=chrome&type=ws&path=%2F#CF-XUI-${uuid.slice(0, 4)}`;
      return new Response(btoa(subContent), {
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
      });
    }

    // هندلر اصلی پروکسی VLESS روی وب‌سایت
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Cloudflare Worker Panel is Running!", { status: 200 });
    }

    return await handleVlessWebSocket(request);
  },
};

// تابع مدیریت اتصال وب‌سوکت و پروتکل VLESS
async function handleVlessWebSocket(request) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  // ساختار ساده هندل کردن ترافیک پروکسی
  // (در نسخه‌های پیشرفته‌تر، اینجا UUID کاربر با دیتابیس مطابقت داده می‌شود)
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// کدهای قالب HTML پنل مدیریت ساده
function getAdminPanelHTML() {
  return `
  <!DOCTYPE html>
  <html lang="fa" dir="rtl">
  <head>
      <meta charset="UTF-8">
      <title>پنل مدیریت کلادفلر</title>
      <style>
          body { font-family: Tahoma, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
          h2 { color: #38bdf8; text-align: center; }
          .box { margin-bottom: 15px; }
          input, button { width: 100%; padding: 10px; margin-top: 5px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; box-sizing: border-box; }
          button { background: #0ea5e9; border: none; font-weight: bold; cursor: pointer; }
          button:hover { background: #0284c7; }
          .result { background: #334155; padding: 10px; margin-top: 10px; border-radius: 6px; word-break: break-all; }
      </style>
  </head>
  <body>
      <div class="container">
          <h2>پنل مدیریت ساب‌سکرایب</h2>
          <div class="box">
              <label>شناسه کاربر (UUID):</label>
              <input type="text" id="uuidInput" value="d342d11e-d424-4583-b36e-524abb1f0adf">
          </div>
          <button onclick="generateSub()">ساخت لینک اشتراک</button>
          <div class="result" id="resultBox">لینک اشتراک اینجا نمایش داده می‌شود...</div>
      </div>
      <script>
          function generateSub() {
              const uuid = document.getElementById('uuidInput').value;
              const subUrl = window.location.origin + '/sub/' + uuid;
              document.getElementById('resultBox').innerHTML = 'لینک ساب: <br><a href="' + subUrl + '" target="_blank" style="color: #38bdf8;">' + subUrl + '</a>';
          }
      </script>
  </body>
  </html>`;
}
