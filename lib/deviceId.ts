export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem("chan_voca_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("chan_voca_device_id", deviceId);
  }
  return deviceId;
};
