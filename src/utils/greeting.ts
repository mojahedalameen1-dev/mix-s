export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let message = "";

  if (hour >= 5 && hour < 12) {
    message = "صباح الخير";
  } else if (hour >= 12 && hour < 17) {
    message = "مرحباً";
  } else if (hour >= 17 && hour < 21) {
    message = "مساء النور";
  } else {
    message = "مساء الخير";
  }

  return `${message}، ${name.split(' ')[0]} ${message === 'مرحباً' ? '👋' : (message === 'صباح الخير' ? '☀️' : (message === 'مساء النور' ? '🌆' : '🌙'))}`;
}
