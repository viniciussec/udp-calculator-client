const udp = require("dgram");
const express = require("express");
const bodyParser = require("body-parser");

const client = udp.createSocket("udp4");
const app = express();
let answer;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

client.on("message", function (msg, info) {
  answer = msg.toString();
  console.log("Data received from server : " + msg.toString());
  console.log(
    "Received %d bytes from %s:%d\n",
    msg.length,
    info.address,
    info.port
  );
});

app.post(
  "/calculate",
  bodyParser.urlencoded({ extended: false }),
  function (request, response) {
    const string = request.body.string;
    const data = Buffer.from(string);

    client.send(data, 1500, "localhost", function (error) {
      if (error) {
        client.close();
      } else {
        console.log("String enviada ao socket: " + data);
      }
    });

    return response.status(200).json({ string });
  }
);

app.get(
  "/result",
  bodyParser.urlencoded({ extended: false }),
  function (request, response) {
    while (!answer);

    return response.status(200).json({ string: answer });
  }
);

app.post("/clear", function (req, res) {
  answer = undefined;
});

app.listen(process.env.PORT || 3000, function () {});
