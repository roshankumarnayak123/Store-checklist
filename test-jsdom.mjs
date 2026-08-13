import { JSDOM, VirtualConsole } from 'jsdom';

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", (...args) => {
  console.error("JSDOM Error:", ...args);
});
virtualConsole.on("warn", (...args) => {
  console.warn("JSDOM Warn:", ...args);
});
virtualConsole.on("info", (...args) => {
  console.info("JSDOM Info:", ...args);
});
virtualConsole.on("log", (...args) => {
  console.log("JSDOM Log:", ...args);
});

JSDOM.fromURL("http://localhost:5174/", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  console.log("Page loaded successfully.");
  setTimeout(() => {
    console.log("DOM body length:", dom.window.document.body.innerHTML.length);
  }, 2000);
}).catch(err => {
  console.error("Failed to load page:", err);
});
