// src/app/device.ts
export const deviceId =
  localStorage.getItem("deviceId") ??
  (() => {
    const id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
    return id;
  })();
