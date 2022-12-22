import { registerAs } from '@nestjs/config';

export default registerAs('telegram', () => ({
  key: process.env.TELEGRAM_APP_KEY,
  chat: process.env.TELEGRAM_CHAT_KEY,
}));
