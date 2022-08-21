import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./app"

const ROOT_ID = "root" as const;
const rootElement = document.getElementById(ROOT_ID);
if (!rootElement) throw new Error(`${ROOT_ID}の要素が見つかりません。`);
const root = createRoot(rootElement);
root.render(<App/>);