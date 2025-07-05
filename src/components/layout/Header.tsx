import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3 bg-white">
      <div className="flex items-center gap-4 text-[#0d141c]">
        <Link to="/dashboard" className="flex items-center gap-4">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
          </div>
          <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">CryptoFolio</h2>
        </Link>
      </div>
      <div className="flex flex-1 justify-center items-center gap-9">
        <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-medium leading-normal ${isActive ? 'text-[#0d141c]' : 'text-gray-500'}`}>Dashboard</NavLink>
        <NavLink to="/wallets" className={({ isActive }) => `text-sm font-medium leading-normal ${isActive ? 'text-[#0d141c]' : 'text-gray-500'}`}>Wallets</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `text-sm font-medium leading-normal ${isActive ? 'text-[#0d141c]' : 'text-gray-500'}`}>Settings</NavLink>
      </div>
      <div className="flex items-center gap-8">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <div className="text-[#0d141c]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
            </svg>
          </div>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzjlZvoGtqI_syF3sMQjPjSXPR_vKXcV2HYjcLypW0S_Hi5k1tkvyYtg2FkmDuK4mhUTKrN6ntUK5Ao__v2zRIHn8wOR_uoqqVLEnnDWBnDO-1JQDF51vzhyMF8xm1P-zVdpizidKpcQrUU44jJcEEUuSVE83r6IVE6tGCf0be_45t3qKNulFJrzbvgtX5EDJSrLb5-5a3hrA2S78eBpyhdV5bfhz5NpXgpBeU5JsJi0yK8K4qvsY94bZDdqS_yITUPL0QTJIGVkc")' }}
        ></div>
      </div>
    </header>
  );
};

export default Header;
