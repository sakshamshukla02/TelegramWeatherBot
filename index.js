import express from "express";
import axios from "axios";
import env from "dotenv";
import moment from "moment-timezone";
import TelegramBot from "node-telegram-bot-api";
env.config();
const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Hello! This bot can show you the weather for any city.Please enter the city"
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  let city = msg.text;
  if (city[0] !== "/") {
    bot.sendMessage(chatId, "The Weather Report");
    let output = await getWeatherData(city);
    bot.sendMessage(chatId, output);
  }
});

async function getWeatherData(city) {
  try {
    let result = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}`
    );
    let temp = result.data.main.temp;
    temp = Math.round(temp * 100 + Number.EPSILON) / 100 - 273;
    temp = temp.toFixed(2);
    let feelLikeTemp = Math.round(result.data.main.feels_like) - 273;
    let minTemp = Math.round(result.data.main.temp_min) - 273;
    let maxTemp = Math.round(result.data.main.temp_max) - 273;
    let humidity = result.data.main.humidity;
    let weather = result.data.weather[0].description;
    let currentData = `The weather of ${city} is ${weather}.The temperature is ${temp}C but it's feel like ${feelLikeTemp}.Maximum temperature is ${maxTemp}C.Minimum temperature is ${minTemp}C.Humidity is ${humidity}%. `;

    return currentData;
  } catch (err) {
    console.log(err);
    return "City does not exists";
  }
}
