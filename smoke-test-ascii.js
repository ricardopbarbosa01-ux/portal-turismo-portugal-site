const page = await browser.getPage("main");
await page.goto("https://example.com");
console.log(await page.title());
