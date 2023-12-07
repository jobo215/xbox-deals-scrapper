const puppeteer = require('puppeteer');
const { BASE_DEAL_PAGE_URL,
        DEAL_PAGE_QUERY_URL,
        TOTAL_DEALS_NUMBER_SELECTOR,
        GAMES_NAMES_SELECTOR,
        GAMES_CURRENT_PRICE_SELECTOR,
        GAMES_FORMER_PRICE_SELECTOR,
        GAMES_IMAGES_SELECTOR
    } = require('./constants');
const allDeals = [];

async function getPage(url) {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.goto(url);
    return { browser, page };
}

async function getTotalDealsNumber() {
    const { browser, page } = await getPage(BASE_DEAL_PAGE_URL);
    let totalDealsArray = await page.evaluate(
        (TOTAL_DEALS_NUMBER_SELECTOR) =>
          [...document.querySelectorAll(TOTAL_DEALS_NUMBER_SELECTOR)].map(
            (totalDealsInnerText) => totalDealsInnerText.innerText 
          ),    
    TOTAL_DEALS_NUMBER_SELECTOR);
    browser.close();
    return parseInt(totalDealsArray[0].split('of ')[1].split(' ')[0]);
}

async function getGamesNameArray(page) {
    return await page.evaluate(
        GAMES_NAMES_SELECTOR =>
          [...document.querySelectorAll(GAMES_NAMES_SELECTOR)].map(
            (name) => name.innerText
          ),
        GAMES_NAMES_SELECTOR);
}

async function getGamesCurrentPrice(page) {
    return await page.evaluate(
        (GAMES_CURRENT_PRICE_SELECTOR) =>
          [...document.querySelectorAll(GAMES_CURRENT_PRICE_SELECTOR)].map(
            (price) => price.innerText
          ),
        GAMES_CURRENT_PRICE_SELECTOR);
}

async function getGamesFormerPrice(page) {
    return await page.evaluate(
        (GAMES_FORMER_PRICE_SELECTOR) => 
            [...document.querySelectorAll(GAMES_FORMER_PRICE_SELECTOR)].map(
                (price) => price.innerText
          ),
        GAMES_FORMER_PRICE_SELECTOR);
}

async function getGamesImages(page) {
    return await page.evaluate(
        (GAMES_IMAGES_SELECTOR) =>
          [...document.querySelectorAll(GAMES_IMAGES_SELECTOR)].map(
            (img) => img.getAttribute('src')
          ),
        GAMES_IMAGES_SELECTOR);
}

function deleteGamepassGames(names, currentPrices, images) {
    for (let i = currentPrices.length - 1; i >= 0; i--) {
        if (currentPrices[i].includes('with') || currentPrices[i].includes("Included+ with")) {
            names.splice(i, 1);
            currentPrices.splice(i, 1);
            images.splice(i, 1);
        }
    }
}

function createObjectsAndAddToArray(names, currentPrices, formerPrices, images) {
    deleteGamepassGames(names, currentPrices, images);
    for (let i = 0; i < names.length; i++) {
        allDeals.push(
            {
                name: names[i],
                currentPrice: currentPrices[i],
                formerPrice: formerPrices[i],
                image: images[i]
            }
        )
    }
}

async function getCurrentDealGames() {
    console.log("***** GETTING ALL GAMES ON SALE *****");
    let totalDeals = await getTotalDealsNumber();
    for (let i = 0; i < totalDeals; i += 90) {
        const { browser, page } = await getPage(DEAL_PAGE_QUERY_URL + i);
        const names = await getGamesNameArray(page);
        const currentPrices = await getGamesCurrentPrice(page);
        const formerPrices = await getGamesFormerPrice(page);
        const images = await getGamesImages(page);
        browser.close();
        createObjectsAndAddToArray(names, currentPrices, formerPrices, images);
    }
    console.log(allDeals);
}

getCurrentDealGames();