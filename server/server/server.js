const { getAuthToken } = require('./auth.js');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const FormData = require('form-data');
const axios = require('axios');
const { performance } = require('perf_hooks');
const util = require('util');
const hana = require('@sap/hana-client');
const { throws } = require('assert');
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const doxApiUrl = 'https://aiservices-trial-dox.cfapps.us10.hana.ondemand.com/document-information-extraction/v1';

let token;

// hana data base connection 
const hanaUrl = process.env.HANA_DB_ENDPOINT_URL
const port = process.env.HANA_DB_PORT
const userId = process.env.HANA_DB_USER_ID
const pass = process.env.HANA_DB_PASS

let connOptions = {
  serverNode: `${hanaUrl}:${port}`,
  UID: userId,
  PWD: pass,
  encrypt: 'true',
  sslValidateCertificate: 'false'
};

let connection = hana.createConnection();

const extractDocData = (data) => {
  const documentDate = data.extraction.headerFields.find(field => field.name === 'documentDate')?.value;
  const grossAmount = data.extraction.headerFields.find(field => field.name === 'grossAmount')?.value;
  const receiverName = data.extraction.headerFields.find(field => field.name === 'receiverName')?.value;
  const docId = data.id;
  const documentType = data.documentType;
  const fileName = data.fileName;
  const finished = (data.finished).substring(0, 10);

  return {
    docId,
    receiverName,
    documentDate,
    documentType,
    fileName,
    grossAmount,
    finished
  };
};

const getJobData = async (jobId) => {
  try {
    const response = await axios.get(`${doxApiUrl}/document/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const status = response.data.status;
    const data = response.data;

    return { status, data };
  } catch (error) {
    console.error(`Error fetching job data for jobId ${jobId}:`, error.message);
    throw new Error(`${error.message}- error got from server`);
  }
}

app.get('/document/data', async (req, res) => {
  try {
    // get data from hana table 
    connection.connect(connOptions);
    let sql = "SELECT * FROM Document_s;";
    let result = connection.exec(sql);
    // console.log(result);
    connection.disconnect();
    res.status(200).json(result)
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      error: error.message,
      message: 'error got from HANA server'
    });
  }
})

app.post('/document/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.file;
  const options = req.body;

  const formData = new FormData();
  formData.append('file', file.buffer, file.originalname);
  formData.append('options', JSON.stringify(options));

  try {
    const response = await axios.post(`${doxApiUrl}/document/jobs`, formData, { headers: { 'Authorization': `Bearer ${token}`, ...formData.getHeaders() } })

    const id = response.data.id;
    // console.log(id)
    let data;

    let status = "PENDING";
    while (status === "PENDING") {
      await new Promise(resolve => setTimeout(resolve, 4000));
      const jobData = await getJobData(id);
      status = jobData.status;
      data = jobData.data;
    }

    if (data.status === "DONE") {
      const jobData = extractDocData(data);
      // console.log(jobData)
      try {
        // insert into hana table
        connection.connect(connOptions);
        let sql = `INSERT INTO Document_s(docId, receiverName, documentDate, documentType, fileName, grossAmount, finished)VALUES('${jobData.docId}', '${jobData.receiverName}', '${jobData.documentDate}', '${jobData.documentType}', '${jobData.fileName}',${jobData.grossAmount}, '${jobData.finished}');`;

        console.log(sql)
        let result = connection.exec(sql);
        console.log(result);
        connection.disconnect();

      } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: error.message });
      }
      // console.log(jobData)
      res.status(200).json({ status: "File uploaded successfully:" });
    }

    if (data.status === "FAILED") {
      res.status(400).json({ status: "document could not upload" });
    }

  } catch (error) {
    console.error('Error uploading the file:', error.response);
    res.status(500).json({ status: 'File upload failed' });
  }
})

const startServer = async () => {
  try {
    token = await getAuthToken();
    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to retrieve token', error);
  }
};

startServer();


// [
//   {
//     "docId": "1000af94-fc58-4bde-b925-56bd5484ac95",
//     "receiverName": "MANASI MAHESH PARAB",
//     "documentDate": "2023-05-15",
//     "documentType": "invoice",
//     "fileName": "IMG20230515154957.jpg",
//     "grossAmount": 885.94,
//     "finished": "2024-09-30"
//   }
// ]