import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  key: process.env.DISCORD_APP_KEY,
}));
