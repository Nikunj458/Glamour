import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, Search, User, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useFavourite } from '../../context/FavouriteContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [categories, setCategories] = useState([])

  const { user, logout } = useAuth()
  const { favourites } = useFavourite()

  const navigate = useNavigate()
  const searchRef = useRef(null)

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data.map(c => c.name)))
      .catch(() => setCategories(['Ethnic', 'Western', 'Bridal', 'Casual', 'Festive', 'Accessories']))
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [searchOpen])

  const handleSearch = e => {
    e.preventDefault()
    if (searchVal.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchVal.trim())}`)
      setSearchOpen(false)
      setSearchVal('')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
    setDrawerOpen(false)
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ivory/96 backdrop-blur-md shadow-sm' : 'bg-ivory/90 backdrop-blur-sm'
      }`}>

        {/* Top Bar */}
        <div className="px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display text-2xl italic text-charcoal">Glamour</span>
            <span className="text-[10px] tracking-[0.4em] text-rose uppercase ml-8">Boutique</span>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button onClick={() => setSearchOpen(s => !s)} className="w-10 h-10 flex items-center justify-center">
              {searchOpen ? <X size={20}/> : <Search size={20}/>}
            </button>

            {/* Favourites */}
            <Link to="/favourites" className="w-10 h-10 hidden md:flex items-center justify-center relative">
              <Heart size={20}/>
              {favourites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose text-white text-[9px] flex items-center justify-center rounded-full">
                  {favourites.length}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative group hidden md:block">
              <button className="w-10 h-10 flex items-center justify-center">
                <User size={20}/>
              </button>

              <div className="absolute right-0 top-full pt-1 w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                <div className="bg-ivory border border-gray-100 shadow-xl">

                  {user ? (
                    <>
                      <div className="px-3 py-2 border-b text-xs truncate">
                        {user.name}
                      </div>

                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-3 py-2 text-xs hover:bg-champagne">
                          Admin Panel
                        </Link>
                      )}

                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs hover:bg-champagne">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="block px-3 py-2 text-xs hover:bg-champagne">
                      Sign In
                    </Link>
                  )}

                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            <button onClick={() => setDrawerOpen(d => !d)} className="w-10 h-10 md:hidden">
              {drawerOpen ? <X size={22}/> : '☰'}
            </button>

          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-8 pb-3 border-b">
          <NavLink to="/" className="text-xs uppercase">Home</NavLink>
          <NavLink to="/contact" className="text-xs uppercase">Contact</NavLink>

          <div className="relative group">
            <button className="flex items-center gap-1 text-xs uppercase">
              Collections <ChevronDown size={11}/>
            </button>

            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[480px] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
              <div className="bg-ivory border shadow p-6">
                <div className="grid grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <Link key={cat} to={`/collections/${cat.toLowerCase()}`} className="p-2 hover:bg-champagne">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t px-4 py-2">
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                ref={searchRef}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="flex-1 border px-3 py-2"
                placeholder="Search products..."
              />
              <button type="submit" className="px-4 bg-charcoal text-white text-xs">
                Go
              </button>
            </form>
          </div>
        )}
      </nav>
    </>
  )
}
