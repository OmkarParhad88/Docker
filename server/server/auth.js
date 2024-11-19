const axios = require('axios');

require('dotenv').config();
const tokenUrl = process.env.DIE_TOKEN_URL
const clientId = process.env.DIE_CLIENT_ID
const clientSecret = process.env.DIE_ClIENT_SECRET

const getAuthToken = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // console.log(response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Failed to fetch access token');
  }
};
module.exports = { getAuthToken };