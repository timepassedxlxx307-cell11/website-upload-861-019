import { H as Hls } from "./hls-core.js";

window.Hls = Hls;
window.dispatchEvent(new Event("hls-ready"));
