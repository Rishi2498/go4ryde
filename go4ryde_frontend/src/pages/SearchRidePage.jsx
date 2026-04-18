import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Filter, Info } from 'lucide-react';
import { searchRides } from '../services/rideService';
import RideCard from '../components/RideCard';

export default function SearchRidePage() {
  const [params, setParams] = useState({
    source_name: '',
    destination_name: '',
    date_time: '',
    women_only: false,
    ride_type: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParams((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const query = {
        source_name: params.source_name,
        destination_name: params.destination_name,
        source_lat: 28.6139, // New Delhi
        source_lng: 77.2090, 
        dest_lat: 28.7041,   // Delhi NCR
        dest_lng: 77.1025,
        date_time: params.date_time ? new Date(params.date_time).toISOString() : undefined,
      };
      if (params.women_only) query.women_only = 'true';
      if (params.ride_type) query.ride_type = params.ride_type;

      const res = await searchRides(query);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Intelligence Failure: Search parameters returned null or error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">
              Find your <span className="text-primary italic">next journey.</span>
            </h1>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                <input
                  name="source_name"
                  value={params.source_name}
                  onChange={handleChange}
                  className="w-full h-14 bg-transparent pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Leaving from..."
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
                <input
                  name="destination_name"
                  value={params.destination_name}
                  onChange={handleChange}
                  className="w-full h-14 bg-transparent pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Going to..."
                  required
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="date_time"
                  type="datetime-local"
                  value={params.date_time}
                  onChange={handleChange}
                  className="w-full h-14 bg-transparent pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-14 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : <><Search size={18} /> Search</>}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-6">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    name="women_only"
                    type="checkbox"
                    checked={params.women_only}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-md accent-primary"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Women Only</span>
               </label>
               <div className="h-4 w-[1px] bg-slate-200" />
               <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <select
                    name="ride_type"
                    value={params.ride_type}
                    onChange={handleChange}
                    className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest focus:outline-none cursor-pointer hover:text-primary transition-colors"
                  >
                    <option value="">All Sectors</option>
                    <option value="local">Local Engagement</option>
                    <option value="intercity">Inter-City Deployment</option>
                  </select>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-3">
             <Info size={16} /> {error}
          </div>
        )}

        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {results.length > 0 ? `${results.length} Deployment(s) Found` : 'No Match Found In Registry'}
               </h2>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((ride, index) => (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RideCard ride={ride} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Search size={32} />
                 </div>
                 <h3 className="text-xl font-black text-slate-400 italic">No available rides match your coordinates.</h3>
                 <p className="text-sm text-slate-400 mt-2 font-medium">Try adjusting your temporal schedule or location filters.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
