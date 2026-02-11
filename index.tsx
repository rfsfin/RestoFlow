import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChefHat, 
  UtensilsCrossed, 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell, 
  LogOut, 
  QrCode, 
  Users, 
  ArrowRight,
  Menu as MenuIcon,
  X,
  Search,
  Filter,
  DollarSign,
  Smartphone,
  Check,
  Building,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Store,
  CreditCard,
  Calendar,
  Upload,
  Printer,
  Minus,
  Moon,
  Sun,
  Zap,
  Shield,
  SmartphoneNfc,
  PieChart,
  HelpCircle,
  RefreshCw,
  GraduationCap,
  PlayCircle,
  FileText
} from 'lucide-react';

// --- Types ---

type UserRole = 'super_admin' | 'restaurant_admin' | 'kitchen' | 'customer' | 'guest';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  type: 'veg' | 'non-veg';
  isAvailable: boolean;
  restaurantId: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurantId: string;
  tableId: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  timestamp: number;
  note?: string;
}

interface RestaurantFeatures {
  onlinePayment: boolean;
  tableBooking: boolean;
  emailNotifications: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  tables: number;
  address: string;
  phone: string;
  isActive: boolean;
  subscriptionPlan: 'trial' | 'pro' | 'enterprise';
  features: RestaurantFeatures;
  joinedDate: string;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'free' | 'occupied' | 'reserved';
  restaurantId: string;
}

// --- Mock Data ---

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Spice Garden',
    slug: 'spice-garden',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
    tables: 10,
    address: '123 Curry Lane, Mumbai',
    phone: '+91 98765 43210',
    isActive: true,
    subscriptionPlan: 'pro',
    features: { onlinePayment: true, tableBooking: true, emailNotifications: true },
    joinedDate: '2023-11-15',
  },
  {
    id: 'r2',
    name: 'Urban Burger Co.',
    slug: 'urban-burger',
    logo: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=100&h=100&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&h=400&fit=crop',
    tables: 8,
    address: '45 Food Street, Bangalore',
    phone: '+91 91234 56789',
    isActive: true,
    subscriptionPlan: 'trial',
    features: { onlinePayment: false, tableBooking: false, emailNotifications: true },
    joinedDate: '2024-01-10',
  }
];

const MOCK_MENU: MenuItem[] = [
  {
    id: 'm1',
    restaurantId: 'r1',
    name: 'Butter Chicken',
    description: 'Rich tomato gravy with tender chicken pieces',
    price: 350,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=500&fit=crop',
    type: 'non-veg',
    isAvailable: true,
  },
  {
    id: 'm2',
    restaurantId: 'r1',
    name: 'Paneer Tikka',
    description: 'Grilled cottage cheese with spices',
    price: 280,
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=500&h=500&fit=crop',
    type: 'veg',
    isAvailable: true,
  },
  {
    id: 'm3',
    restaurantId: 'r1',
    name: 'Garlic Naan',
    description: 'Indian bread topped with garlic and butter',
    price: 60,
    category: 'Breads',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&h=500&fit=crop',
    type: 'veg',
    isAvailable: true,
  },
  {
    id: 'm4',
    restaurantId: 'r2',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese',
    price: 250,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop',
    type: 'non-veg',
    isAvailable: true,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    restaurantId: 'r1',
    tableId: 'Table 5',
    customerName: 'Rahul',
    items: [
      { menuItemId: 'm1', name: 'Butter Chicken', price: 350, quantity: 1 },
      { menuItemId: 'm3', name: 'Garlic Naan', price: 60, quantity: 2 }
    ],
    status: 'pending',
    totalAmount: 470,
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
  },
  {
    id: 'o2',
    restaurantId: 'r1',
    tableId: 'Table 2',
    customerName: 'Priya',
    items: [
      { menuItemId: 'm2', name: 'Paneer Tikka', price: 280, quantity: 1 }
    ],
    status: 'preparing',
    totalAmount: 280,
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
  }
];

const generateMockTables = (): Table[] => {
  const tables: Table[] = [];
  // Restaurant 1
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: `r1-t${i}`,
      number: i,
      capacity: i % 2 === 0 ? 4 : 2,
      status: i === 2 || i === 5 ? 'occupied' : i === 8 ? 'reserved' : 'free',
      restaurantId: 'r1'
    });
  }
  // Restaurant 2
  for (let i = 1; i <= 8; i++) {
    tables.push({
      id: `r2-t${i}`,
      number: i,
      capacity: 4,
      status: i === 1 ? 'occupied' : 'free',
      restaurantId: 'r2'
    });
  }
  return tables;
};

const MOCK_TABLES = generateMockTables();

// --- Utility Components ---

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    preparing: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    ready: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    completed: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    veg: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    'non-veg': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    trial: 'bg-blue-50 text-blue-700 border-blue-200',
    pro: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const colorClass = colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
      {status === 'veg' ? 'VEG' : status === 'non-veg' ? 'NON-VEG' : label}
    </span>
  );
};

// --- Helper Functions for Persistence ---

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage`, error);
    return fallback;
  }
};

// --- App Component ---

const App = () => {
  // State with Persistence
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => loadFromStorage('restoflow_restaurants', MOCK_RESTAURANTS));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadFromStorage('restoflow_menu', MOCK_MENU));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('restoflow_orders', MOCK_ORDERS));
  const [tables, setTables] = useState<Table[]>(() => loadFromStorage('restoflow_tables', MOCK_TABLES));
  
  // Persist Data Effects
  useEffect(() => {
    localStorage.setItem('restoflow_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('restoflow_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('restoflow_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('restoflow_tables', JSON.stringify(tables));
  }, [tables]);
  
  // View State
  const [currentView, setCurrentView] = useState<'landing' | 'super_admin' | 'restaurant_admin' | 'customer' | 'solutions' | 'pricing'>('landing');
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [activeTableId, setActiveTableId] = useState<string>('Table 1');
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
     try {
       return localStorage.getItem('restoflow_theme') === 'dark';
     } catch { return false; }
  });

  // Apply dark mode class to body and persist
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('restoflow_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('restoflow_theme', 'light');
    }
  }, [darkMode]);
  
  // Navigation Helper
  const navigateTo = (view: 'landing' | 'super_admin' | 'restaurant_admin' | 'customer' | 'solutions' | 'pricing', restaurantId?: string) => {
    setCurrentView(view);
    if (restaurantId) setActiveRestaurantId(restaurantId);
  };

  // --- Sub-Components ---

  const PublicNavbar = () => (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button onClick={() => navigateTo('landing')} className="flex items-center gap-2 group">
            <ChefHat className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">RestoFlow SaaS</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigateTo('solutions')} className={`text-sm font-medium transition ${currentView === 'solutions' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}>Solutions</button>
            <button onClick={() => navigateTo('pricing')} className={`text-sm font-medium transition ${currentView === 'pricing' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}>Pricing</button>
            <div className="h-4 w-px bg-gray-200"></div>
            <button 
              onClick={() => navigateTo('super_admin')}
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              Owner Login
            </button>
            <button 
              onClick={() => navigateTo('restaurant_admin', 'r1')}
              className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-200"
            >
              Client Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const LandingPage = () => (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicNavbar />

      {/* Hero */}
      <div className="relative overflow-hidden pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-6">
              For Restaurants, Cafes & Hotels
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
              The Modern Operating System for <span className="text-orange-600">Your Restaurant</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Empower your restaurant with our all-in-one SaaS platform. QR Menus, Table Ordering, Kitchen Display, and Admin Dashboards - setup in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigateTo('super_admin')}
                className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200"
              >
                Start Selling
              </button>
              <button 
                onClick={() => navigateTo('customer', 'r1')}
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Smartphone size={20}/> Try QR Menu
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
             <div className="relative rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-900">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1200&q=80" 
                  alt="Dashboard"
                  className="w-full h-auto"
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SolutionsPage = () => (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicNavbar />
      
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Comprehensive Solutions</h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to run your restaurant efficiently, from front-of-house to back-of-house.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { icon: QrCode, title: "QR Code Ordering", desc: "Contactless ordering right from the table. Customers scan, order, and pay instantly." },
             { icon: ChefHat, title: "Kitchen Display System", desc: "Replace paper tickets with digital screens. Improve communication and reduce errors." },
             { icon: Users, title: "Table Management", desc: "Real-time view of your floor plan. Track occupancy, reservations, and turnover rates." },
             { icon: PieChart, title: "Analytics & Reports", desc: "Deep insights into sales, best-selling items, and peak hours to optimize operations." },
             { icon: SmartphoneNfc, title: "Online Payments", desc: "Integrated UPI and Card payments. Split bills and generate digital receipts seamlessly." },
             { icon: ShoppingBag, title: "Inventory Management", desc: "Track stock levels in real-time. Get alerts when supplies are running low." },
           ].map((feature, idx) => (
             <div key={idx} className="p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-gray-50 py-20 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
               <h2 className="text-3xl font-bold mb-6">Built for growth</h2>
               <p className="text-gray-600 mb-6 text-lg">Whether you run a small cafe or a large hotel chain, RestoFlow scales with you. Manage multiple locations from a single super-admin dashboard.</p>
               <button onClick={() => navigateTo('pricing')} className="text-orange-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                 View Pricing Plans <ArrowRight size={20}/>
               </button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80" className="w-full h-full object-cover" alt="Restaurant interior" />
            </div>
         </div>
      </div>
    </div>
  );

  const PricingPage = () => (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicNavbar />
      
      <div className="pt-20 pb-12 text-center px-4">
         <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Simple, Transparent Pricing</h1>
         <p className="text-xl text-gray-500">Choose the plan that fits your restaurant's needs.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Starter Plan */}
            <div className="border border-gray-200 rounded-3xl p-8 hover:border-orange-200 hover:shadow-xl transition duration-300 relative">
               <h3 className="text-xl font-bold text-gray-900">Starter</h3>
               <div className="mt-4 mb-6">
                 <span className="text-4xl font-extrabold">₹0</span>
                 <span className="text-gray-500">/month</span>
               </div>
               <p className="text-sm text-gray-500 mb-8">Perfect for small cafes and trial runs. Basic features to get you started.</p>
               <button onClick={() => navigateTo('super_admin')} className="w-full py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition">Start Free Trial</button>
               
               <ul className="mt-8 space-y-4">
                 {[
                   "Digital QR Menu",
                   "Up to 5 Tables",
                   "Basic Order Management",
                   "Email Support",
                   "1 Admin Account"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                     <CheckCircle size={18} className="text-green-500 flex-shrink-0" /> {item}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-orange-600 rounded-3xl p-8 shadow-2xl relative bg-white transform md:-translate-y-4">
               <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">Most Popular</div>
               <h3 className="text-xl font-bold text-gray-900">Pro</h3>
               <div className="mt-4 mb-6">
                 <span className="text-4xl font-extrabold">₹2,999</span>
                 <span className="text-gray-500">/month</span>
               </div>
               <p className="text-sm text-gray-500 mb-8">For growing restaurants that need advanced tools and analytics.</p>
               <button onClick={() => navigateTo('super_admin')} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-200">Get Started</button>
               
               <ul className="mt-8 space-y-4">
                 {[
                   "Everything in Starter",
                   "Up to 20 Tables",
                   "Kitchen Display System (KDS)",
                   "Inventory Management",
                   "Sales Analytics & Reports",
                   "Priority Support",
                   "5 Staff Accounts"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                     <CheckCircle size={18} className="text-orange-500 flex-shrink-0" /> {item}
                   </li>
                 ))}
               </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-gray-200 rounded-3xl p-8 hover:border-blue-200 hover:shadow-xl transition duration-300">
               <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
               <div className="mt-4 mb-6">
                 <span className="text-4xl font-extrabold">Custom</span>
               </div>
               <p className="text-sm text-gray-500 mb-8">For hotel chains and large franchises requiring dedicated solutions.</p>
               <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition">Contact Sales</button>
               
               <ul className="mt-8 space-y-4">
                 {[
                   "Unlimited Tables & Locations",
                   "Custom Integrations (API)",
                   "Dedicated Account Manager",
                   "White-label Mobile App",
                   "On-site Training",
                   "24/7 Phone Support"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                     <CheckCircle size={18} className="text-blue-500 flex-shrink-0" /> {item}
                   </li>
                 ))}
               </ul>
            </div>
         </div>

         {/* FAQ */}
         <div className="max-w-3xl mx-auto mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade or downgrade your plan at any time from your admin dashboard." },
                { q: "Is there a setup fee?", a: "No, there are no hidden setup fees. You only pay the monthly subscription cost." },
                { q: "Do you offer hardware?", a: "RestoFlow is software-only, but it works on any device with a browser (iPads, Android tablets, Laptops)." }
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                   <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                   <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );

  const CustomerApp = () => {
    const restaurant = restaurants.find(r => r.id === activeRestaurantId);
    const [cart, setCart] = useState<{item: MenuItem, quantity: number}[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'none' | 'placed'>('none');

    // Simulate real-time tracking from Order in DB
    const myLatestOrder = orders.find(o => o.restaurantId === restaurant?.id && o.customerName === 'Guest User'); 
    // In a real app, this would be by session ID or local storage ID

    const categories = ['All', ...Array.from(new Set(menuItems.filter(m => m.restaurantId === restaurant?.id).map(m => m.category)))];
    const filteredItems = menuItems.filter(m => 
      m.restaurantId === restaurant?.id && 
      (activeCategory === 'All' || m.category === activeCategory)
    );

    const addToCart = (item: MenuItem) => {
      setCart(prev => {
        const existing = prev.find(i => i.item.id === item.id);
        if (existing) {
          return prev.map(i => i.item.id === item.id ? {...i, quantity: i.quantity + 1} : i);
        }
        return [...prev, { item, quantity: 1 }];
      });
    };

    const updateQuantity = (itemId: string, delta: number) => {
      setCart(prev => prev.map(i => {
        if (i.item.id === itemId) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : i;
        }
        return i;
      }).filter(i => i.quantity > 0)); // Remove if 0
    };

    const placeOrder = () => {
      const newOrder: Order = {
        id: `o${Date.now()}`,
        restaurantId: restaurant!.id,
        tableId: activeTableId,
        customerName: 'Guest User',
        items: cart.map(c => ({
          menuItemId: c.item.id,
          name: c.item.name,
          price: c.item.price,
          quantity: c.quantity
        })),
        status: 'pending',
        totalAmount: cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0),
        timestamp: Date.now(),
      };
      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsCartOpen(false);
      setOrderStatus('placed');
      setTimeout(() => setOrderStatus('none'), 3000);
    };

    if (!restaurant) return <div>Restaurant not found</div>;

    return (
      <div className="bg-gray-100 min-h-screen pb-24 max-w-md mx-auto shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
           <div>
             <h1 className="font-bold text-lg leading-tight text-gray-900">{restaurant.name}</h1>
             <p className="text-xs text-gray-500 flex items-center gap-1"><Store size={12}/> {activeTableId}</p>
           </div>
           <button onClick={() => navigateTo('landing')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
             <LogOut size={16}/>
           </button>
        </div>

        {/* Order Status Banner if Active Order Exists */}
        {myLatestOrder && myLatestOrder.status !== 'completed' && myLatestOrder.status !== 'cancelled' && (
           <div className="bg-blue-600 text-white p-3 m-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-sm">Order #{myLatestOrder.id.slice(-4)}</h3>
                 <Badge status={myLatestOrder.status} />
              </div>
              <div className="w-full bg-blue-800 h-1.5 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-white transition-all duration-1000"
                   style={{
                     width: myLatestOrder.status === 'pending' ? '10%' :
                            myLatestOrder.status === 'confirmed' ? '30%' :
                            myLatestOrder.status === 'preparing' ? '60%' :
                            myLatestOrder.status === 'ready' ? '90%' : '100%'
                   }}
                 />
              </div>
              <p className="text-xs mt-2 opacity-90">
                {myLatestOrder.status === 'pending' ? 'Waiting for confirmation...' :
                 myLatestOrder.status === 'confirmed' ? 'Chef has seen your order' :
                 myLatestOrder.status === 'preparing' ? 'Cooking delicious food...' :
                 'Food is Ready!'}
              </p>
           </div>
        )}

        {/* Categories */}
        <div className="bg-white border-b sticky top-[60px] z-10">
          <div className="flex overflow-x-auto p-3 gap-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                 <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                 {!item.isAvailable && <div className="absolute inset-0 bg-white/80 flex items-center justify-center font-bold text-xs text-red-600">UNAVAILABLE</div>}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                 <div>
                    <div className="flex justify-between">
                       <h3 className="font-bold text-gray-800">{item.name}</h3>
                       <div className={`w-3 h-3 rounded-full border flex items-center justify-center mt-1 ${item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}/>
                       </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                 </div>
                 <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                    {item.isAvailable ? (
                       cart.find(c => c.item.id === item.id) ? (
                         <div className="flex items-center gap-3 bg-orange-50 rounded-lg px-2 py-1 border border-orange-100">
                           <button onClick={() => updateQuantity(item.id, -1)} className="text-orange-700 font-bold px-1">-</button>
                           <span className="text-sm font-bold text-orange-700">{cart.find(c => c.item.id === item.id)?.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="text-orange-700 font-bold px-1">+</button>
                         </div>
                       ) : (
                         <button onClick={() => addToCart(item)} className="px-6 py-1.5 bg-white border border-orange-200 text-orange-600 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-50 uppercase">
                           ADD
                         </button>
                       )
                    ) : (
                      <span className="text-xs text-gray-400 font-medium italic">Sold Out</span>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-orange-600 text-white p-4 rounded-xl shadow-xl flex items-center justify-between"
            >
              <div className="flex flex-col items-start leading-tight">
                <span className="font-bold text-sm uppercase">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
                <span className="text-xs opacity-80">Total ₹{cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0)}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-lg">
                View Cart <ArrowRight size={20} />
              </div>
            </button>
          </div>
        )}

        {/* Cart Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md h-[85vh] sm:h-auto sm:rounded-2xl rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.map(({item, quantity}) => (
                   <div key={item.id} className="flex justify-between items-center">
                      <div>
                         <div className="flex items-center gap-2">
                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${item.type === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'veg' ? 'bg-green-600' : 'bg-red-600'}`}/>
                           </div>
                           <p className="font-medium text-gray-900">{item.name}</p>
                         </div>
                         <p className="text-sm text-gray-500 pl-5">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-orange-50 rounded-lg px-2 py-1 border border-orange-100">
                           <button onClick={() => updateQuantity(item.id, -1)} className="text-orange-700 font-bold px-2 text-lg">-</button>
                           <span className="text-sm font-bold text-orange-700 w-4 text-center">{quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="text-orange-700 font-bold px-2 text-lg">+</button>
                       </div>
                   </div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between mb-2 text-sm">
                   <span className="text-gray-500">Item Total</span>
                   <span className="text-gray-900">₹{cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0)}</span>
                </div>
                <div className="flex justify-between mb-4 text-xl font-bold text-gray-900">
                   <span>To Pay</span>
                   <span>₹{cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0)}</span>
                </div>
                <button 
                  onClick={placeOrder}
                  className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}

        {orderStatus === 'placed' && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle className="text-green-400" size={24} /> 
            <div>
               <p className="font-bold">Order Placed!</p>
               <p className="text-xs text-green-200">Kitchen will confirm shortly.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SuperAdmin = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRestaurantForm, setNewRestaurantForm] = useState<Partial<Restaurant>>({
      subscriptionPlan: 'trial',
      tables: 5,
      isActive: true,
      features: { onlinePayment: false, tableBooking: false, emailNotifications: true }
    });

    const handleAddRestaurant = () => {
       if (!newRestaurantForm.name) return;
       
       const newRest: Restaurant = {
         id: `r${Date.now()}`,
         name: newRestaurantForm.name,
         slug: newRestaurantForm.name.toLowerCase().replace(/\s+/g, '-'),
         logo: newRestaurantForm.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
         coverImage: newRestaurantForm.coverImage || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=400&fit=crop',
         tables: newRestaurantForm.tables || 5,
         address: newRestaurantForm.address || 'Address pending',
         phone: newRestaurantForm.phone || '',
         isActive: true,
         subscriptionPlan: newRestaurantForm.subscriptionPlan as 'trial' | 'pro' | 'enterprise',
         features: newRestaurantForm.features || { onlinePayment: false, tableBooking: false, emailNotifications: true },
         joinedDate: new Date().toISOString().split('T')[0],
       };

       setRestaurants(prev => [...prev, newRest]);
       setIsAddModalOpen(false);
       setNewRestaurantForm({
          subscriptionPlan: 'trial',
          tables: 5,
          isActive: true,
          features: { onlinePayment: false, tableBooking: false, emailNotifications: true }
       });
    };

    // Reset Data Helper
    const handleReset = () => {
      if(confirm("Are you sure? This will delete all your local changes and reset to default mock data.")) {
         localStorage.clear();
         window.location.reload();
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
         <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-2">
               <div className="bg-orange-600 text-white p-2 rounded-lg"><LayoutDashboard size={20}/></div>
               <span className="font-bold text-xl text-gray-900 dark:text-white">Super Admin</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Reset to default data"
               >
                  <RefreshCw size={16}/> Reset Data
               </button>
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
               >
                 {darkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
               <button onClick={() => navigateTo('landing')} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Logout</button>
            </div>
         </nav>

         <main className="max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurants</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all registered restaurants</p>
               </div>
               <button 
                 onClick={() => setIsAddModalOpen(true)}
                 className="bg-gray-900 dark:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-orange-700 shadow-lg flex items-center gap-2"
               >
                 <Plus size={20} /> Add Restaurant
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {restaurants.map(rest => (
                 <div key={rest.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition">
                    <div className="h-32 bg-gray-200 relative">
                       <img src={rest.coverImage} className="w-full h-full object-cover" alt={rest.name}/>
                       <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-lg border-2 border-white dark:border-gray-800 overflow-hidden bg-white">
                          <img src={rest.logo} className="w-full h-full object-cover" alt="logo"/>
                       </div>
                       <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md bg-white/90 text-gray-800 shadow-sm border`}>
                          {rest.subscriptionPlan}
                       </div>
                    </div>
                    <div className="pt-8 p-6">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{rest.name}</h3>
                          <div className={`w-3 h-3 rounded-full ${rest.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={rest.isActive ? 'Active' : 'Inactive'}/>
                       </div>
                       <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center gap-1">
                          <Building size={14}/> {rest.address}
                       </p>
                       
                       <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                             <span className="block text-gray-400 text-xs uppercase font-bold">Tables</span>
                             <span className="font-bold text-lg dark:text-gray-200">{rest.tables}</span>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                             <span className="block text-gray-400 text-xs uppercase font-bold">Revenue</span>
                             <span className="font-bold text-lg dark:text-gray-200">₹{orders.filter(o => o.restaurantId === rest.id && o.status === 'completed').reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}</span>
                          </div>
                       </div>

                       <div className="flex gap-3">
                          <button 
                             onClick={() => navigateTo('restaurant_admin', rest.id)}
                             className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
                          >
                             <LayoutDashboard size={16}/> Admin View
                          </button>
                          <button 
                             onClick={() => navigateTo('customer', rest.id)}
                             className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center justify-center gap-2 text-sm"
                          >
                             <Smartphone size={16}/> App View
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </main>

         {/* Add Restaurant Modal */}
         {isAddModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Restaurant</h2>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Restaurant Name</label>
                        <input 
                           type="text" 
                           className="w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                           value={newRestaurantForm.name || ''}
                           onChange={e => setNewRestaurantForm({...newRestaurantForm, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                        <input 
                           type="text" 
                           className="w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                           value={newRestaurantForm.address || ''}
                           onChange={e => setNewRestaurantForm({...newRestaurantForm, address: e.target.value})}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Plan</label>
                           <select 
                              className="w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={newRestaurantForm.subscriptionPlan}
                              onChange={e => setNewRestaurantForm({...newRestaurantForm, subscriptionPlan: e.target.value as any})}
                           >
                              <option value="trial">Trial</option>
                              <option value="pro">Pro</option>
                              <option value="enterprise">Enterprise</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tables</label>
                           <input 
                              type="number" 
                              className="w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              value={newRestaurantForm.tables}
                              onChange={e => setNewRestaurantForm({...newRestaurantForm, tables: Number(e.target.value)})}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                     <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Cancel</button>
                     <button onClick={handleAddRestaurant} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700">Create Restaurant</button>
                  </div>
               </div>
            </div>
         )}
      </div>
    );
  };

  const RestaurantAdmin = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'settings' | 'training'>('dashboard');
    const restaurant = restaurants.find(r => r.id === activeRestaurantId);

    if (!restaurant) return <div className="p-8 text-center">Restaurant not found. <button onClick={() => navigateTo('landing')} className="text-orange-600 underline">Go Home</button></div>;

    const myOrders = orders.filter(o => o.restaurantId === restaurant.id).sort((a, b) => b.timestamp - a.timestamp);
    const myMenu = menuItems.filter(m => m.restaurantId === restaurant.id);
    const myTables = tables.filter(t => t.restaurantId === restaurant.id).sort((a, b) => a.number - b.number);

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const toggleItemAvailability = (itemId: string) => {
      setMenuItems(prev => prev.map(m => m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m));
    };

    const updateTableStatus = (tableId: string, status: Table['status']) => {
        setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    };
    
    const deleteItem = (itemId: string) => {
        if(confirm('Delete this item?')) {
            setMenuItems(prev => prev.filter(m => m.id !== itemId));
        }
    };

    // Dashboard View
    const DashboardView = () => {
        const todayRevenue = myOrders.reduce((acc, o) => acc + o.totalAmount, 0); // Simplified: all time for now
        const pendingOrders = myOrders.filter(o => o.status === 'pending').length;
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Revenue</h3>
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{todayRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Active Orders</h3>
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Clock size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{myOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Pending Actions</h3>
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Bell size={20}/></div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingOrders}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Floor Plan</h3>
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><div className="w-3 h-3 rounded-full bg-green-500"></div>Free</div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><div className="w-3 h-3 rounded-full bg-red-500"></div>Occupied</div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Reserved</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {myTables.map(table => (
                            <button 
                                key={table.id}
                                onClick={() => {
                                   const nextStatus = table.status === 'free' ? 'occupied' : table.status === 'occupied' ? 'reserved' : 'free';
                                   updateTableStatus(table.id, nextStatus);
                                }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                                    table.status === 'free' ? 'border-green-100 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
                                    table.status === 'occupied' ? 'border-red-100 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                                    'border-orange-100 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400'
                                }`}
                            >
                                <div className="text-xl font-bold">T-{table.number}</div>
                                <div className="flex items-center gap-1 text-xs opacity-80">
                                    <Users size={12} /> {table.capacity}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="border-b dark:border-gray-700">
                                <tr>
                                    <th className="py-3 font-semibold">Order ID</th>
                                    <th className="py-3 font-semibold">Table</th>
                                    <th className="py-3 font-semibold">Status</th>
                                    <th className="py-3 font-semibold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.slice(0, 5).map(order => (
                                    <tr key={order.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3">#{order.id.slice(-4)}</td>
                                        <td className="py-3">{order.tableId}</td>
                                        <td className="py-3"><Badge status={order.status} /></td>
                                        <td className="py-3 text-right font-medium">₹{order.totalAmount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Orders View
    const OrdersView = () => (
        <div className="grid grid-cols-1 gap-4">
            {myOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order #{order.id.slice(-4)}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-xl text-gray-900 dark:text-white">₹{order.totalAmount}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{order.tableId}</span>
                            </div>
                        </div>
                        <div className="space-y-1 mt-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l dark:border-gray-700 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                        <div className="mb-2"><Badge status={order.status} /></div>
                        {order.status === 'pending' && (
                            <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Confirm Order</button>
                        )}
                        {order.status === 'confirmed' && (
                            <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition">Start Preparing</button>
                        )}
                        {order.status === 'preparing' && (
                            <button onClick={() => updateOrderStatus(order.id, 'ready')} className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition">Mark Ready</button>
                        )}
                        {order.status === 'ready' && (
                            <button onClick={() => updateOrderStatus(order.id, 'completed')} className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition">Complete</button>
                        )}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="w-full py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition">Cancel Order</button>
                        )}
                    </div>
                </div>
            ))}
            {myOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No orders yet.</p>
                </div>
            )}
        </div>
    );

    // Menu View
    const MenuView = () => {
        const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
        const [newItem, setNewItem] = useState<Partial<MenuItem>>({ type: 'veg', isAvailable: true, category: 'Main Course' });

        const handleAddItem = () => {
            if (!newItem.name || !newItem.price) return;
            const item: MenuItem = {
                id: `m${Date.now()}`,
                restaurantId: restaurant.id,
                name: newItem.name,
                description: newItem.description || '',
                price: Number(newItem.price),
                category: newItem.category || 'Main Course',
                image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop',
                type: newItem.type as 'veg' | 'non-veg',
                isAvailable: true
            };
            setMenuItems(prev => [...prev, item]);
            setIsAddMenuOpen(false);
            setNewItem({ type: 'veg', isAvailable: true, category: 'Main Course' });
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu Items</h2>
                    <button onClick={() => setIsAddMenuOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 flex items-center gap-2">
                        <Plus size={18}/> Add Item
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMenu.map(item => (
                        <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden flex flex-col ${item.isAvailable ? 'border-gray-100 dark:border-gray-700' : 'border-red-100 dark:border-red-900/50 opacity-75'}`}>
                            <div className="h-40 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                                <div className="absolute top-2 right-2">
                                     <button onClick={() => toggleItemAvailability(item.id)} className={`px-2 py-1 rounded-md text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                     </button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                                    <span className="font-bold text-orange-600">₹{item.price}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{item.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                                    <Badge status={item.type} />
                                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isAddMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
                             <h3 className="text-lg font-bold mb-4 dark:text-white">Add Menu Item</h3>
                             <div className="space-y-3">
                                 <input placeholder="Item Name" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                 <input placeholder="Description" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                                 <div className="flex gap-2">
                                     <input type="number" placeholder="Price" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} />
                                     <select className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})}>
                                         <option value="veg">Veg</option>
                                         <option value="non-veg">Non-Veg</option>
                                     </select>
                                 </div>
                                 <input placeholder="Category" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newItem.category || ''} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                             </div>
                             <div className="mt-6 flex justify-end gap-2">
                                 <button onClick={() => setIsAddMenuOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                                 <button onClick={handleAddItem} className="px-4 py-2 bg-orange-600 text-white rounded font-bold">Add Item</button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Training View
    const TrainingView = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3"><GraduationCap size={32}/> RestoFlow Academy</h2>
                <p className="opacity-90 max-w-2xl text-lg">Master the platform with our video tutorials and step-by-step guides. Boost your restaurant's efficiency today.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Videos */}
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <PlayCircle className="text-orange-600"/> Video Tutorials
                  </h3>
                  {[
                      { title: 'Getting Started with RestoFlow', duration: '5:20', level: 'Beginner' },
                      { title: 'Managing your Digital Menu', duration: '3:45', level: 'Intermediate' },
                      { title: 'Processing Live Orders (KDS)', duration: '4:10', level: 'Intermediate' },
                      { title: 'Analyzing Sales Reports', duration: '6:30', level: 'Advanced' }
                  ].map((video, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition cursor-pointer group">
                           <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition">
                                   <PlayCircle size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-white transition"/>
                               </div>
                               <div>
                                   <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">{video.title}</h4>
                                   <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      <span className="flex items-center gap-1"><Clock size={10}/> {video.duration}</span>
                                      <span>•</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        video.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                        video.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                        'bg-purple-100 text-purple-700'
                                      }`}>{video.level}</span>
                                   </div>
                               </div>
                           </div>
                           <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-orange-600 transition -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100"/>
                      </div>
                  ))}
              </div>

              {/* Guides */}
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="text-orange-600"/> User Guides
                  </h3>
                  {[
                      { title: 'Connecting Thermal Printers', desc: 'Setup hardware printers for KOT tickets.' },
                      { title: 'Staff Accounts & Permissions', desc: 'Manage waiter, kitchen, and admin access roles.' },
                      { title: 'Table QR Code Best Practices', desc: 'Where to place QR codes for the best scan rates.' },
                      { title: 'Refunds & Cancellations', desc: 'Handling customer disputes and voiding orders.' }
                  ].map((guide, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition cursor-pointer group">
                           <div className="flex justify-between items-start">
                             <div>
                               <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 transition">{guide.title}</h4>
                               <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{guide.desc}</p>
                             </div>
                             <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-orange-600 transition -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1"/>
                           </div>
                      </div>
                  ))}
                  
                   <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800 flex items-start gap-4 mt-8">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg flex-shrink-0">
                          <HelpCircle size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-1">Need personalized training?</h3>
                          <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">Enterprise plans include dedicated on-site training for your entire staff.</p>
                          <button onClick={() => navigateTo('pricing')} className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none">View Enterprise Plan</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-xl">
                        <ChefHat /> RestoFlow
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{restaurant.name}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <LayoutDashboard size={20}/> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'orders' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <ShoppingBag size={20}/> Orders
                    </button>
                    <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'menu' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <UtensilsCrossed size={20}/> Menu
                    </button>
                    <button onClick={() => setActiveTab('training')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'training' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <GraduationCap size={20}/> Training
                    </button>
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <button onClick={() => navigateTo('landing')} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition w-full px-4 py-2">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 z-40 flex justify-around p-2">
                 <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-orange-600' : 'text-gray-400'}`}><LayoutDashboard/></button>
                 <button onClick={() => setActiveTab('orders')} className={`p-2 rounded-lg ${activeTab === 'orders' ? 'text-orange-600' : 'text-gray-400'}`}><ShoppingBag/></button>
                 <button onClick={() => setActiveTab('menu')} className={`p-2 rounded-lg ${activeTab === 'menu' ? 'text-orange-600' : 'text-gray-400'}`}><UtensilsCrossed/></button>
                 <button onClick={() => setActiveTab('training')} className={`p-2 rounded-lg ${activeTab === 'training' ? 'text-orange-600' : 'text-gray-400'}`}><GraduationCap/></button>
                 <button onClick={() => navigateTo('landing')} className={`p-2 rounded-lg text-gray-400`}><LogOut/></button>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                             {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                            <img src={restaurant.logo} alt="logo" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'orders' && <OrdersView />}
                {activeTab === 'menu' && <MenuView />}
                {activeTab === 'training' && <TrainingView />}
            </main>
        </div>
    );
  };

  // --- Router ---
  switch (currentView) {
    case 'landing': return <LandingPage />;
    case 'solutions': return <SolutionsPage />;
    case 'pricing': return <PricingPage />;
    case 'restaurant_admin': return <RestaurantAdmin />;
    case 'customer': return <CustomerApp />;
    case 'super_admin': return <SuperAdmin />;
    default: return <LandingPage />;
  }
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);