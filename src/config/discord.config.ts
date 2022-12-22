import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  key: process.env.DISCORD_APP_KEY,
  login: process.env.DISCORD_USER_LOGIN,
  link: process.env.DISCORD_CHANNEL_LINK,
  password: process.env.DISCORD_USER_PASSWORD,
}));
