const fs = require("fs");
const axios = require("axios");
const path = require("path");

const readRestFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  let method,
    url,
    headers = {};

  lines.forEach((line) => {
    if (line.startsWith("get")) {
      method = "get";
      url = line.split(" ")[1];
    } else if (line.startsWith("head")) {
      const headerLines = line.substring(5, line.length - 1).split(",");
      headerLines.forEach((headerLine) => {
        const [key, value] = headerLine.split(":");
        headers[key.trim()] = value.trim();
      });
    }
  });

  return { method, url, headers };
};

const writeResponseToFile = (filePath, data) => {
  fs.writeFileSync(filePath, data, "utf-8");
};

const executeRequest = async (filePath) => {
  const { method, url, headers } = readRestFile(filePath);

  try {
    const response = await axios({
      method,
      url,
      headers,
    });

    const responseFilePath = path.basename(filePath, ".rest") + ".response";
    writeResponseToFile(
      responseFilePath,
      JSON.stringify(response.data, null, 2),
    );

    console.log(`Response written to ${responseFilePath}`);
  } catch (error) {
    console.error(`Error executing request: ${error}`);
  }
};

const inputFilePath = process.argv[2];

if (!inputFilePath) {
  console.error("Please provide a .rest file path");
  process.exit(1);
}

executeRequest(inputFilePath);
