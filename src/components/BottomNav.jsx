import { BiBook, BiCalculator, BiHome } from 'react-icons/bi';
import { FaComputer } from 'react-icons/fa6';
import { FiFileText } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        <NavLink to="/" className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
        }>
          <BiHome size={20} />
          <span className="text-xs mt-1">Resistors</span>
        </NavLink>

        <NavLink to="/ic-finder" className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
        }>
          <FaComputer size={20} />
          <span className="text-xs mt-1">ICs</span>
        </NavLink>

        <NavLink to="/calculators" className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
        }>
          <BiCalculator size={20} />
          <span className="text-xs mt-1">Calculators</span>
        </NavLink>

        <NavLink to="/datasheets" className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
        }>
          <FiFileText size={20} />
          <span className="text-xs mt-1">Datasheets</span>
        </NavLink>

        <NavLink to="/tutorials" className={({ isActive }) =>
          `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`
        }>
          <BiBook size={20} />
          <span className="text-xs mt-1">Tutorials</span>
        </NavLink>
      </div>
    </div>
  );
}

export default BottomNav;
