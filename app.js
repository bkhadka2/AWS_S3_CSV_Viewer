import express from "express";
import path from "path";
import csv from "fast-csv";
import AWS from "aws-sdk";
import "dotenv/config";

const app = express();
const port = 3000;

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

const s3 = new AWS.S3({
  accessKeyId: process.env.AccessKeyId,
  secretAccessKey: process.env.SecretAccessKey,
});

const params = {
  Bucket: "csv-bishal",
  Key: "data.csv",
};

app.use("/", async (req, res, next) => {
  let finalData = [];
  const readStream = s3.getObject(params).createReadStream();
  csv
    .parseStream(readStream)
    .on("data", (data) => {
      finalData.push(data);
    })

    .on("end", () => {
      res.render("DisplayFileContent", {
        data: finalData,
      });
      console.log("End of stream");
    })

    .on("error", (err) => {
      console.error("Error in stream: ", err);
    });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
