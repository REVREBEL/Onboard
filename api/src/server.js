import app from "./app.js";

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
