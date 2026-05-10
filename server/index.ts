// server/index.ts
//
// Production entry point. Imports the configured Express app from app.ts
// and starts listening. Kept tiny so tests can import `app` directly
// without triggering `.listen()`.

import "dotenv/config";
import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
