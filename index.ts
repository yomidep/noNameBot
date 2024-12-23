import { Telegraf, session } from 'telegraf';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';
import connectToDatabase from './models/dbconfig';
import { BotContext, getInitialSessionData } from './helper_functions/botContext';

dotenv.config();

const openBot = async () => { // Corrected function declaration
    const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN as string);

    // Initialize session middleware
    bot.use(session({
        defaultSession: () => getInitialSessionData()
    }));

    // Load and register all commands
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(join(commandsPath, file)).default;
        if (typeof command === 'function') {
            command(bot);
        }
    }

    bot.launch();
    await connectToDatabase();
    console.log('Bot launched successfully!');

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

openBot();
