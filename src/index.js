import app from './app.js';
import {nodeEnv, port} from "./config/config.js";

app.listen(port, 'localhost', () => {
    console.log(`Server started on port ${port} in ${nodeEnv} mode.`);
});