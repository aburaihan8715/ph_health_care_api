import app from './app';
import config from './config';

// MAIN FUNCTION
async function main() {
  app.listen(config.PORT, () => {
    console.log(`App is listening at http://localhost:${config.PORT}`);
  });
}

// CALL MAIN FUNCTION
main();
