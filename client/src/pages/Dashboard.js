import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import auctionService from '../services/auctionService';

const Dashboard = () => {
  const { user, logout, subscriptionStatus } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect if not subscribed
    if (!subscriptionStatus.isSubscribed) {
      navigate('/subscription');
      return;
    }

    // Fetch auctions
    const fetchAuctions = async () => {
      try {
        const data = await auctionService.getAuctions();
        setAuctions(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch auctions. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [user, navigate, subscriptionStatus.isSubscribed]);

  // Function to export auction data to Excel
  const exportAuctionExcel = (auction) => {
    // Create worksheet from auction lots
    const worksheet = window.XLSX.utils.json_to_sheet(auction.lots.map(lot => ({
      "Date": lot.date,
      "Auction House": lot.auctionHouse,
      "Lot Number": lot.lotNumber,
      "Link": lot.link,
      "UseClass": lot.useClass,
      "Notes/Features": lot.notesFeatures,
      "Postcode": lot.postcode,
      "GuidePrice": lot.guidePrice,
      "Starting Bid Price": lot.startingBidPrice,
      "Final Bid Price": lot.finalBidPrice,
      "Sold Price": lot.soldPrice,
      "Status": lot.status,
      "Income (p/a)": lot.incomePA,
      "RO StrikePrice": lot.roStrikePrice,
      "Notes": lot.notes,
      "Number of Bidders": lot.numberOfBidders,
      "Available At Price": lot.availableAtPrice
    })));

    // Create workbook and add the worksheet
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Auction Lots");

    // Generate Excel file and trigger download
    window.XLSX.writeFile(workbook, `${auction.auctionHouse}_${auction.date.replace(/\s/g, "_")}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading auctions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Auction Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-medium">
              {subscriptionStatus.isSubscribed ? 'Subscription Active' : 'No Subscription'}
            </span>
            <span className="text-gray-600">{user?.email}</span>
            <button 
              className="bg-gray-200 px-3 py-1 rounded text-sm"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-4 gap-6">
        <section className="col-span-3">
          <h2 className="text-xl font-semibold mb-4">Upcoming Auctions</h2>
          <div className="space-y-4">
            {auctions.map(a => (
              <div key={a.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{a.auctionHouse}</h3>
                  <p className="text-gray-600">{a.date}</p>
                  <p className="text-sm text-gray-500">{a.lots.length} lots</p>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white border rounded" onClick={() => setSelected(a)}>View</button>
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded" 
                    onClick={() => exportAuctionExcel(a)}
                  >
                    Export Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="col-span-1 border rounded p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Auction Day Checklist</h3>
          <ol className="list-decimal list-inside text-sm space-y-2">
            <li>Open auction link in browser and confirm livestream is playing.</li>
            <li>Log in to Loom.com &rarr; New Video &rarr; Record a new video.</li>
            <li>Select <strong>Chrome Tab</strong>, choose auction tab, share with audio, start recording.</li>
            <li>Every 2 hours dismiss Loom keep-alive pop-up to avoid stopping.</li>
            <li>After auction, review recording at 1.5–2x and fill final prices in the Excel file.</li>
          </ol>

          <div className="mt-4">
            <h4 className="text-sm font-semibold">Post-auction steps</h4>
            <ul className="text-sm list-disc ml-5 mt-2 space-y-1">
              <li>Open SharePoint → Rare Developments → ... → 003 Auction Data and update the auction file.</li>
              <li>Fill Final Bid Price, Sold Price, Status, Number of Bidders and Available At Price where applicable.</li>
              <li>Notify Papa when complete.</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Modal for viewing auction lots */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selected.auctionHouse} — {selected.date}</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setSelected(null)}>Close</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => exportAuctionExcel(selected)}>Export Excel</button>
              </div>
            </div>

            <table className="w-full table-auto text-sm border-collapse">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 border">Lot</th>
                  <th className="p-2 border">Address / Notes</th>
                  <th className="p-2 border">Postcode</th>
                  <th className="p-2 border">Guide £</th>
                  <th className="p-2 border">Income (p/a)</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selected.lots.map(l => (
                  <tr key={l.lotNumber} className="odd:bg-white even:bg-gray-50">
                    <td className="p-2 border align-top">{l.lotNumber}</td>
                    <td className="p-2 border align-top">
                      <div className="font-medium"><a target="_blank" rel="noreferrer" href={l.link} className="text-blue-600">Open lot</a></div>
                      <div className="text-xs text-gray-700 mt-1 whitespace-pre-line">{l.notesFeatures}</div>
                    </td>
                    <td className="p-2 border align-top">{l.postcode}</td>
                    <td className="p-2 border align-top">{l.guidePrice ? `£${Number(l.guidePrice).toLocaleString()}` : ''}</td>
                    <td className="p-2 border align-top">{l.incomePA ? `£${Number(l.incomePA).toLocaleString()}` : ''}</td>
                    <td className="p-2 border align-top">
                      <button className="px-2 py-1 bg-yellow-200 rounded mr-2" onClick={() => { navigator.clipboard.writeText(JSON.stringify(l)); alert('Copied lot JSON to clipboard (for dev)')}}>Copy</button>
                      <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => { alert('Open manual entry form (not implemented in mock)') }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;