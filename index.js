import { chromium } from "playwright";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
require("dotenv").config();

const PAGE = "https://dolarhoy.com/";

let cache = "";
let timestamp = new Date();

// Web scraping logic
async function main() {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: false,
  });
  const browser = await chromium.launch();
  cron.schedule("*/5 * * * * *", async () => {
    console.log(
      `Running turnitos scraper on:${new Date().toLocaleString("es-AR", {
        timeZone: "America/Buenos_Aires",
      })}`
    );

    const page = await browser.newPage();
    await page.goto(PAGE);

    const valorDelDolar = await page.$eval(
      "#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val",
      (el) => el.textContent
    );
    const nextValorDelDolar = await page.$eval(
      "#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val",
      (el) => el.textContent
    );

    if (cache === valorDelDolar) {
      cache = nextValorDelDolar;
      timestamp = new Date();
      console.log("no hay novedades");
    } else {
      if (cache) {
        bot.sendMessage("@tur_nos", `El dolar subio. está a ${valorDelDolar}`, {
          parse_mode: "Markdown",
        });
      }
      cache = nextValorDelDolar;
      timestamp = new Date();
      console.log("No hay novedades");
    }
    await page.close();
  });
}

main();
