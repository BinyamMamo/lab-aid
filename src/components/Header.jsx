import { FaMoon, FaSun, FaMicrochip } from 'react-icons/fa';

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src="/assets/logo.png" className='h-6' alt="" />
          {/* <FaMicrochip className="text-blue-600 dark:text-blue-400" size={24} /> */}
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">LabAId</h1>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
