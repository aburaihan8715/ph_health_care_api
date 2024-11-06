import { Server } from "http";
import app from "./app";

const port = 3000;

// MAIN FUNCTION
async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
  });
}

// CALL MAIN FUNCTION
main();