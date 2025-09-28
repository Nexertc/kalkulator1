

  const display = document.getElementById("display");
  let expression = "0";

  function updateDisplay() {
    display.innerText = expression;
    display.scrollTop = display.scrollHeight;
  }

  function appendValue(val) {
    if (expression === "0" || expression === "Error") {
      expression = val;
    } else {
      expression += val;
    }
    updateDisplay();
  }

  function clearDisplay() {
    expression = "0";
    updateDisplay();
  }

  function backspace() {
    expression = expression.slice(0, -1) || "0";
    updateDisplay();
  }

  function calculateResult() {
    try {
      let exp = expression.replace(/×/g, "*").replace(/÷/g, "/");
      expression = String(eval(exp));
    } catch {
      expression = "Error";
    }
    updateDisplay();
  }

  function percent() {
    try {
      expression = String(eval(expression.replace(/×/g, "*").replace(/÷/g, "/")) / 100);
    } catch {
      expression = "Error";
    }
    updateDisplay();
  }

  function sqrt() {
    try {
      let val = eval(expression.replace(/×/g, "*").replace(/÷/g, "/"));
      expression = String(Math.sqrt(val));
    } catch {
      expression = "Error";
    }
    updateDisplay();
  }

  function power() {
    try {
      let val = eval(expression.replace(/×/g, "*").replace(/÷/g, "/"));
      expression = String(val ** 2);
    } catch {
      expression = "Error";
    }
    updateDisplay();
  }

  function toggleSign() {
    try {
      let val = eval(expression.replace(/×/g, "*").replace(/÷/g, "/"));
      expression = String(-val);
    } catch {
      expression = "Error";
    }
    updateDisplay();
  }

  


if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('Service Worker terdaftar:', reg);

      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed') {
            if (navigator.serviceWorker.controller) {
           
              console.log('Update tersedia — muat ulang untuk mengaktifkan.');
            } else {
              console.log('Aplikasi siap untuk digunakan offline.');
            }
          }
        });
      });

      setInterval(() => {
        reg.update().catch(() => {});
      }, 60 * 60 * 1000);

    } catch (e) {
      console.error('Pendaftaran service worker gagal:', e);
    }
  });
} else {
  console.log('Service Worker tidak didukung di browser ini.');
}

 let deferredPrompt;
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block'; 
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA berhasil diinstall');
        installBtn.style.display = 'none'; 
        deferredPrompt = null;
      }
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA sudah diinstall');
    installBtn.style.display = 'none';
    deferredPrompt = null;
  });

  function isInStandaloneMode() {
  return (window.matchMedia('(display-mode: standalone)').matches) ||
         (window.navigator.standalone === true);
}

window.addEventListener('load', () => {
  const installBtn = document.getElementById('installBtn');
  if (isInStandaloneMode()) {
    installBtn.style.display = 'none';
  }
});
