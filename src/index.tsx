import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./styles/styles.scss";
import Modal from "react-modal";
import App from "./app";

const container = document.getElementById("root");
Modal.setAppElement(container);

const root = createRoot(container);

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
