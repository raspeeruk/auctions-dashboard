const express = require('express');
const router = express.Router();
const { protect, requireSubscription } = require('../middleware/auth');

// Sample auction data (in a real app, this would come from a database)
const sampleAuctions = [
  {
    id: "1",
    date: "22 September 2025",
    auctionHouse: "Allsops",
    lots: [
      {
        date: "22 September 2025",
        auctionHouse: "Allsops",
        lotNumber: "1",
        link: "https://www.allsop.co.uk/lot/123456",
        useClass: "",
        notesFeatures: "Freehold three-storey mid-terrace building\nCurrently arranged as ground floor retail unit with two self-contained flats above\nRetail unit let at £12,000 per annum\nFlats both vacant\nTotal area approximately 1,800 sq ft",
        postcode: "E1 6QL",
        guidePrice: "450000",
        startingBidPrice: "",
        finalBidPrice: "",
        soldPrice: "",
        status: "",
        incomePA: "12000",
        roStrikePrice: "",
        notes: "",
        numberOfBidders: "",
        availableAtPrice: ""
      },
      // More lots would be here
    ]
  },
  // More auctions would be here
];

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Private/Subscribed
router.get('/', protect, requireSubscription, (req, res) => {
  res.json(sampleAuctions);
});

// @desc    Get auction by ID
// @route   GET /api/auctions/:id
// @access  Private/Subscribed
router.get('/:id', protect, requireSubscription, (req, res) => {
  const auction = sampleAuctions.find(a => a.id === req.params.id);
  
  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }
  
  res.json(auction);
});

module.exports = router;