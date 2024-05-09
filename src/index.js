import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';

import App from "./App";
import { Web3Provider } from './Web3Context';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <Web3Provider>
    <App />
  </Web3Provider>
);
// both component Web3Provider and App have useEffect , which called first 