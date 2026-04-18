import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

export default function LocationAutocomplete({
  label,
  placeholder,
  onSelect,
  onChange,
  value = '',
  className = ''
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (val) => {
    if (val.length < 3) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await api.get('/rides/maps/autocomplete/', {
        params: { q: val }
      })
      setSuggestions(res.data)
      setShowDropdown(true)
    } catch (err) {
      console.error('Autocomplete fetch failed', err)
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    if (onChange) onChange(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  const handleSelect = async (suggestion) => {
    if (onChange) onChange(suggestion.description)
    setSuggestions([])
    setShowDropdown(false)
    setLoading(true)
    try {
      const res = await api.get('/rides/maps/place-details/', {
        params: { place_id: suggestion.place_id }
      })
      onSelect(res.data)
    } catch (err) {
      console.error('Place details fetch failed', err)
    }
    setLoading(false)
  }

  return (
    <div className={`relative flex-1 w-full ${className}`}>
      {label && <label className="label-premium">{label}</label>}
      <div className="relative group glass-input rounded-2xl overflow-hidden transition-all duration-300">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)] group-focus-within:scale-125 transition-transform" />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className="w-full h-14 pl-12 pr-12 bg-transparent border-none text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none"
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-3 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up py-4"
        >
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="px-8 py-4 hover:bg-emerald-50 cursor-pointer transition-all border-b border-slate-50 last:border-0 group flex items-start gap-4"
            >
              <div className="mt-1 w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] group-hover:bg-primary/10 transition-colors">📍</div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-900 text-sm group-hover:text-primary transition-colors truncate">{s.main_text}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate mt-0.5">{s.secondary_text}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
