const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

// JSON middleware. Use it to automatiocally parse json in the req.body
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// GET dynamic path (path parameter)
// Needs the format ":param_name"
app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  //PARAMS
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  console.log("Returning: " + resource.id);
  res.send(resource);
});

// PATCH
app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    return res.status(422).send("Cannot update because resource is completed.");
  }

  resources[index] = req.body;

  //active resource related functionality
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is an active resource already!");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }
  //active resource related functionality

  // Write to file
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been updated!");
  });
});

app.get("/api/active-resource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
  console.log("Sent back resources");
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.id = Date.now().toString();
  resources.unshift(resource);

  // Write to file
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      console.log("Error - POST to resources.");
      console.log(error);
      return res.status(422).send("Cannot store data in the file!");
    }

    console.log("Successfull POST to resources.");
    return res.send("Data has been saved!");
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port:" + PORT);
});
