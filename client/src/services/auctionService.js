const API_URL = 'http://localhost:5000/api/auctions';

// Get all auctions
const getAuctions = async () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch auctions');
  }

  return data;
};

// Get auction by ID
const getAuctionById = async (id) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${user.token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch auction');
  }

  return data;
};

const auctionService = {
  getAuctions,
  getAuctionById,
};

export default auctionService;