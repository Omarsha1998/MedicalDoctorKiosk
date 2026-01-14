const calculateMillisecondsUntilUTC8 = function (hour, minute) {
  const now = new Date();

  // Convert current time to UTC+8
  const nowUTC = new Date(now.toISOString()); // UTC
  const offset = 8 * 60 * 60 * 1000; // +8 hours
  const nowUTC8 = new Date(nowUTC.getTime() + offset);

  // Target time today in UTC+8
  const targetUTC8 = new Date(
    nowUTC8.getFullYear(),
    nowUTC8.getMonth(),
    nowUTC8.getDate(),
    hour,
    minute,
    0,
  );

  let delay = targetUTC8.getTime() - nowUTC8.getTime();

  // If target time is in the past, schedule for the next day
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000;
  }

  return delay;
};

const scheduleDailyTask = function (hour, minute, task) {
  const initialDelay = calculateMillisecondsUntilUTC8(hour, minute);
  setTimeout(function () {
    task();
    setInterval(task, 24 * 60 * 60 * 1000);
  }, initialDelay);
};

module.exports = {
  scheduleDailyTask,
};
